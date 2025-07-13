const anchor = require('@project-serum/anchor');

async function main() {
    const provider = anchor.Provider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.SolAutoSaving;

    const tx = await program.rpc.initialize({
        accounts: {
            // Add your accounts here
            // e.g. payer: provider.wallet.publicKey,
        },
    });

    console.log("Transaction signature", tx);
}

main().catch(err => {
    console.error(err);
});