import React from 'react'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import abi from './abi.json'


const App = () => {
  const contractAddress = '0x8bdC49446391D8D6ee54C82fE625553017A89805'
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [myContract, setMyContract] = useState(null);
  const [address, setAddress] = useState(null);

  const requestAccounts = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
  }

  const connectWallet = async () => {

    if (typeof window.ethereum !== 'undefined') {
      await requestAccounts()
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAddress(accounts[0]); // Set the first account connected
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask to connect.");
    }
  }


  useEffect(() => {
    const initProvider = async () => {
      if (typeof window.ethereum !== 'undefined') {

        await requestAccounts()

        const _provider = new ethers.BrowserProvider(window.ethereum)
        const _signer = await provider.getSigner()
        const _myContract = new ethers.Contract(contractAddress, abi, signer)

        setProvider(_provider);
        setSigner(_signer);
        setMyContract(_myContract);
      }
    };
    initProvider();
  }, []);


  const fetchBalance = async () => {
    if (myContract) {
      const _balance = await myContract.getBalance();
      setBalance(ethers.utils.formatEther(_balance));
    }
  };

  const handleDeposit = async () => {
    if (myContract) {
      try {
        const tx = await myContract.deposit({ value: ethers.utils.parseEther(amount) });
        await tx.wait();
        fetchBalance();
        alert("Deposit successful!");
      } catch (error) {
        console.error("Error during deposit:", error);
        alert("Deposit failed. See console for details.");
      }
    }
  };

  const handleWithdraw = async () => {
    if (myContract) {
      try {
        const tx = await myContract.withdraw(ethers.utils.parseEther(amount));
        await tx.wait();
        fetchBalance();
        alert("Withdrawal successful!");
      } catch (error) {
        if (error.reason === "execution reverted: InsufficientBalance") {
          alert("Insufficient balance.");
        } else {
          console.error("Error during withdrawal:", error);
          alert("Withdrawal failed. See console for details.");
        }
      }
    }
  };

  useEffect(() => {
    if (myContract) fetchBalance();
  }, [myContract]);


  return (
    <>
      <div className="app">
        <h1>DApp Interface</h1>

        {!address ? (
          <button className="connect-button" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <p className="wallet-address">Connected Wallet: {address}</p>
        )}

        <p>Connected Address Balance: {balance} ETH</p>


        <div>
          <input
            type="text"
            placeholder="Enter amount in ETH"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <button onClick={handleDeposit}>Deposit</button>
          <button onClick={handleWithdraw}>Withdraw</button>
        </div>
      </div>
    </>
  )
}

export default App;
