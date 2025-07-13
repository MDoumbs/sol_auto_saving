// This file is intentionally left blank.

use anchor_lang::prelude::*;

declare_id!("BKJ552hX7xU4KXYDaduug9mHLdSDiPX7xCcUtUSGJhL4");

#[program]
pub mod sol_saving_app {
    use super::*;

    /// Initialise un compte utilisateur avec un nom et l'adresse de l'autorité (wallet)
    pub fn initialize_user(ctx: Context<InitializeUser>, name: String) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        user_account.name = name.clone();
        user_account.authority = *ctx.accounts.user.key;
        user_account.total_deposits = 0;
        msg!("Utilisateur créé : {}", name);
        Ok(())
    }

    /// Crée un compte d’épargne avec un objectif et une date de déblocage (1 an plus tard)
    pub fn create_saving_account(ctx: Context<CreateSavingAccount>, goal: u64) -> Result<()> {
        let saving_account = &mut ctx.accounts.saving_account;
        let clock = Clock::get()?;
        saving_account.goal = goal;
        saving_account.owner = ctx.accounts.authority.key();
        saving_account.amount_locked = 0;
        saving_account.release_date = clock.unix_timestamp + (365 * 24 * 60 * 60); // 1 an
        msg!("Compte d'épargne créé avec objectif : {} SOL. Déblocage prévu le : {}", goal, saving_account.release_date);
        Ok(())
    }

    /// Dépose des SOLs (10% sont automatiquement verrouillés dans le compte d’épargne)
    pub fn deposit_sol(ctx: Context<DepositSol>, amount: u64) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let savings_account = &mut ctx.accounts.savings_account;
        let user = &ctx.accounts.user;

        let locked_amount = amount / 10; // 10% seulement est verrouillé

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &user.key(),
            &savings_account.key(),
            locked_amount,
        );

        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                user.to_account_info(),
                savings_account.to_account_info(),
            ],
        )?;

        user_account.total_deposits += locked_amount;
        savings_account.amount_locked += locked_amount;

        msg!(
            "10% du dépôt ({} SOL) a été verrouillé. Nouveau solde verrouillé : {} SOL",
            locked_amount,
            savings_account.amount_locked
        );
        Ok(())
    }

    /// Permet de retirer des fonds manuellement (hors déblocage annuel)
    pub fn withdraw_sol(ctx: Context<WithdrawSol>, amount: u64) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let saving_account = &mut ctx.accounts.saving_account;

        require!(saving_account.amount_locked >= amount, CustomError::InsufficientFunds);

        **saving_account.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += amount;

        saving_account.amount_locked -= amount;
        user_account.total_deposits -= amount;

        msg!("{} SOL retirés par l'utilisateur {:?}", amount, ctx.accounts.user.key());
        Ok(())
    }

    /// Vérifie le solde (aucune écriture, juste une lecture possible côté client)
    pub fn check_balance(_ctx: Context<CheckBalance>) -> Result<()> {
        msg!("Vérification du solde : consulter les données du compte côté client.");
        Ok(())
    }

    /// Débloque l’épargne automatiquement après la date prévue (1 an)
    pub fn withdraw_saving(ctx: Context<WithdrawSaving>) -> Result<()> {
        let clock = Clock::get()?;
        let savings_account = &mut ctx.accounts.savings_account;

        require!(clock.unix_timestamp >= savings_account.release_date, CustomError::TooEarly);

        let amount = savings_account.amount_locked;

        **savings_account.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += amount;

        savings_account.amount_locked = 0;

        msg!("Compte débloqué après échéance. {} SOL transférés à l'utilisateur.", amount);
        Ok(())
    }
}

// --------------------- STRUCTURES DE CONTEXTE ---------------------

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(init, payer = user, space = 8 + 32 + 4 + 64 + 8, seeds = [b"user", user.key().as_ref()], bump)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateSavingAccount<'info> {
    #[account(init, payer = authority, space = 8 + 8 + 32 + 8 + 8, seeds = [b"savings", authority.key().as_ref()], bump)]
    pub saving_account: Account<'info, SavingAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub user_account: Account<'info, UserAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositSol<'info> {
    #[account(mut, seeds = [b"user", user.key().as_ref()], bump)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut, seeds = [b"savings", user.key().as_ref()], bump)]
    pub savings_account: Account<'info, SavingAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawSol<'info> {
    #[account(mut, seeds = [b"user", user.key().as_ref()], bump)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut, seeds = [b"savings", user.key().as_ref()], bump)]
    pub saving_account: Account<'info, SavingAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct CheckBalance<'info> {
    #[account(seeds = [b"user", user.key().as_ref()], bump)]
    pub user_account: Account<'info, UserAccount>,
    #[account(seeds = [b"savings", user.key().as_ref()], bump)]
    pub saving_account: Account<'info, SavingAccount>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawSaving<'info> {
    #[account(mut, seeds = [b"savings", user.key().as_ref()], bump)]
    pub savings_account: Account<'info, SavingAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
}

// --------------------- STRUCTURES DE DONNÉES ---------------------

#[account]
pub struct UserAccount {
    pub authority: Pubkey,
    pub name: String,
    pub total_deposits: u64,
}

#[account]
pub struct SavingAccount {
    pub goal: u64,
    pub owner: Pubkey,
    pub amount_locked: u64,
    pub release_date: i64,
}

// --------------------- GESTION D’ERREURS ---------------------

#[error_code]
pub enum CustomError {
    #[msg("Fonds insuffisants dans le compte d'épargne.")]
    InsufficientFunds,
    #[msg("Trop tôt pour débloquer les fonds. Patientez jusqu'à la date prévue.")]
    TooEarly,
}