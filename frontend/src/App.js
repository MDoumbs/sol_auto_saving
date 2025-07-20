import React, { useState, useEffect } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import idl from "./idl/sol_auto_saving.json";

const network = clusterApiUrl("devnet");
const preflightCommitment = "processed";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [program, setProgram] = useState(null);
  const [userName, setUserName] = useState("");
  const [amount, setAmount] = useState(10);
  const [statusMessage, setStatusMessage] = useState("");
  const [releaseDate, setReleaseDate] = useState(null);

  const getProvider = () => {
    const connection = new Connection(network, preflightCommitment);
    return new AnchorProvider(connection, window.solana, { preflightCommitment });
  };

  useEffect(() => {
    if (walletAddress) {
      const provider = getProvider();
      const prog = new Program(idl, idl.metadata.address, provider);
      setProgram(prog);
    }
  }, [walletAddress]);

  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect();
        setWalletAddress(response.publicKey.toString());
        setStatusMessage("✅ Wallet connecté : " + response.publicKey.toString());
      } catch (err) {
        setStatusMessage("❌ Connexion échouée : " + err.message);
      }
    } else {
      setStatusMessage("⚠️ Phantom wallet non détecté");
    }
  };

  const getUserAccount = async () => {
    const user = new PublicKey(walletAddress);
    const [userAccount] = await PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user.toBuffer()],
      program.programId
    );
    return userAccount;
  };

  const getSavingsAccount = async () => {
    const user = new PublicKey(walletAddress);
    const [savingsAccount] = await PublicKey.findProgramAddressSync(
      [Buffer.from("savings"), user.toBuffer()],
      program.programId
    );
    return savingsAccount;
  };

  const initializeUser = async () => {
    try {
      const provider = getProvider();
      const userAccount = await getUserAccount();
      await program.methods
        .initializeUser(userName)
        .accounts({
          user: provider.wallet.publicKey,
          userAccount,
        })
        .rpc();
      setStatusMessage("✅ Utilisateur initialisé !");
    } catch (err) {
      setStatusMessage("❌ Erreur initializeUser : " + err.message);
    }
  };

  const createSavingAccount = async () => {
    try {
      const provider = getProvider();
      const savingsAccount = await getSavingsAccount();
      const goal = 1000000000; // Exemple : 1 SOL
      await program.methods
        .createSavingAccount(new anchor.BN(goal))
        .accounts({
          authority: provider.wallet.publicKey,
          userAccount: await getUserAccount(),
          savingAccount: savingsAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const now = Math.floor(Date.now() / 1000);
      const oneYearLater = now + 365 * 24 * 60 * 60;
      setReleaseDate(new Date(oneYearLater * 1000).toLocaleDateString());

      setStatusMessage("✅ Compte d’épargne créé. Verrouillé jusqu’au " + releaseDate);
    } catch (err) {
      setStatusMessage("❌ Erreur création épargne : " + err.message);
    }
  };

  const deposit = async () => {
    try {
      const provider = getProvider();
      const userAccount = await getUserAccount();
      const savingsAccount = await getSavingsAccount();
      const lockedAmount = amount / 10;

      await program.methods
        .depositSol(new anchor.BN(amount))
        .accounts({
          user: provider.wallet.publicKey,
          userAccount,
          savingsAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      setStatusMessage(`✅ Dépôt effectué ! 🔒 10% (${lockedAmount} SOL) mis en épargne jusqu’au ${releaseDate || "dans 1 an"}`);
    } catch (err) {
      setStatusMessage("❌ Erreur dépôt : " + err.message);
    }
  };

  const withdraw = async () => {
    try {
      const provider = getProvider();
      const userAccount = await getUserAccount();
      const savingsAccount = await getSavingsAccount();
      await program.methods
        .withdrawSol(new anchor.BN(amount))
        .accounts({
          user: provider.wallet.publicKey,
          userAccount,
          savingAccount: savingsAccount,
        })
        .rpc();
      setStatusMessage(`✅ Retrait manuel effectué de ${amount} SOL`);
    } catch (err) {
      setStatusMessage("❌ Erreur retrait : " + err.message);
    }
  };

  const withdrawSavings = async () => {
    try {
      const provider = getProvider();
      const savingsAccount = await getSavingsAccount();
      await program.methods
        .withdrawSaving()
        .accounts({
          user: provider.wallet.publicKey,
          savingsAccount,
        })
        .rpc();
      setStatusMessage("✅ Épargne débloquée après échéance !");
    } catch (err) {
      setStatusMessage("❌ Erreur retrait épargne : " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-3xl font-bold text-indigo-400 mb-4">Solana Saving DApp</h1>
      <p className="italic mb-6 text-sm text-gray-400">
        📌 Chaque dépôt entraîne automatiquement 10% d’épargne bloquée pendant 1 an.
      </p>

      {!walletAddress ? (
        <button onClick={connectWallet} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded mb-4 transition">
          Connecter Phantom Wallet
        </button>
      ) : (
        <p className="text-sm mb-4">🔐 Wallet : {walletAddress}</p>
      )}

      <div className="space-y-4 max-w-md w-full">
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            placeholder="Nom utilisateur"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-500"
          />
          <button onClick={initializeUser} className="bg-indigo-600 hover:bg-indigo-700 py-2 px-4 rounded font-medium transition">
            Initialize User
          </button>
        </div>

        <button onClick={createSavingAccount} className="w-full bg-purple-600 hover:bg-purple-700 py-2 px-4 rounded font-medium transition">
          Créer Compte Épargne
        </button>

        <div className="flex flex-col space-y-2">
          <input
            type="number"
            placeholder="Montant à déposer"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-500"
          />
          <button onClick={deposit} className="bg-green-600 hover:bg-green-700 py-2 px-4 rounded font-medium transition">
            Déposer (auto-épargne 10%)
          </button>
          <button onClick={withdraw} className="bg-yellow-600 hover:bg-yellow-700 py-2 px-4 rounded font-medium transition">
            Retirer Manuellement
          </button>
          <button onClick={withdrawSavings} className="bg-red-600 hover:bg-red-700 py-2 px-4 rounded font-medium transition">
            🔓 Retirer Épargne (après 1 an)
          </button>
        </div>
      </div>

      {statusMessage && (
        <p className="mt-6 text-sm text-green-400 font-medium">{statusMessage}</p>
      )}
    </div>
  );
}

export default App;
