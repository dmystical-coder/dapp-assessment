import React from 'react'
import toast, { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import abi from './abi.json'



const App = () => {
  const contractAddress = '0x8bdC49446391D8D6ee54C82fE625553017A89805'
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
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
        toast.success("Wallet Connected Successfully!");
      } catch (error) {
        toast.error("Error connecting Wallet")
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask to connect.");
    }
  }

  // const provider = new ethers.BrowserProvider(window.ethereum)
  // const myContract = new ethers.Contract(contractAddress, abi, provider)
  // myContract.on("Deposit", (amount, event) => {
  //   toast.success(`${ethers.formatEther(amount)} ETH successfully deposited!`);
  //   event.removeListener;
  // });



  const fetchBalance = async () => {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccounts()

      const provider = new ethers.BrowserProvider(window.ethereum)
      const myContract = new ethers.Contract(contractAddress, abi, provider)
      const balance = await myContract.getBalance();
      setBalance(ethers.formatEther(balance));
      toast.success("Balance updated!")
    }
  };

  const handleDeposit = async () => {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccounts()

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const myContract = new ethers.Contract(contractAddress, abi, signer)
      try {
        const tx = await myContract.deposit(ethers.parseEther(amount), {
          value: ethers.parseEther(amount)
        });
        await tx.wait();
        toast.success(`${ethers.formatEther(amount)} ETH successfully deposited!`);
        fetchBalance();
      } catch (error) {
        console.error("Error during deposit:", error);
        toast.error("Error during deposit");
      }
      setAmount("")
    }
  };

  const handleWithdraw = async () => {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccounts()

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const myContract = new ethers.Contract(contractAddress, abi, signer)
      try {
        const tx = await myContract.withdraw(ethers.parseEther(amount));
        await tx.wait();
        toast(`${ethers.formatEther(amount)} ETH successfully withdrawn!`);
        fetchBalance();
      } catch (error) {
        if (error.reason === "execution reverted: InsufficientBalance") {
          toast.error("Insufficient balance.");
        } else {
          console.error("Error during withdrawal:", error);
          toast.error("Withdrawal failed. See console for details.");
        }
        setAmount("")
      }
    }
  };

  useEffect(() => {
    if (address) {
      fetchBalance();
    }
  }, [address]);


  return (
    <>
      <Toaster position="top-center"
        reverseOrder={false} />
      <div className="app">
        <h1>Wallet DApp</h1>
        {!address ? (
          <button className="connect-button" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <p className="wallet-address">Connected Wallet: {address}</p>
        )}

        <p>Contract Balance: {balance} ETH</p>


        <div>
          <input
            type="number"
            placeholder="Enter amount in ETH"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className='btn-group'>
          <button role="button" onClick={handleDeposit}>Deposit</button>
          <button role="button" onClick={handleWithdraw}>Withdraw</button>
        </div>
      </div>
    </>
  )
}

export default App;
