import React from 'react'
import { useState } from 'react'
import { ethers } from 'ethers'
import abi from './abi.json'

function App() {
  const contractAddress = '0x8bdC49446391D8D6ee54C82fE625553017A89805'

  async function requestAccounts() {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
  }

  

  return (
    <>
      <h1>Vite + React</h1>
    </>
  )
}

export default App
