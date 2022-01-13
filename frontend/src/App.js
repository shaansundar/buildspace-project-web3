import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import { useEffect } from "react";
import jsonABI from './AdvWavePortalABI.json'
export default function App() {
  const { ethereum } = window;
  const [currentAccount, setCurrentAccount] = React.useState("");
  const [msg, setMsg] = React.useState("");
  const [allWaves, setAllWaves] = React.useState([]);
  const [waves, setWaves] = React.useState(null)
  const contractABI = jsonABI.abi;
  const contract = "0x55Ae519ec2c27275a35955ab490d59f9091af0fA"
  const AdvContract = "0x243d0F080c24b12712CEAd9e242e2a4BDC9F5F50";

  async function connect(){
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
    } else {
      console.log("No authorized account found")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  
  const checkIfWalletIsConnected = async() => {
    /*
    * First make sure we have access to window.ethereum
    */

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      // connect();
      
    } else {
      console.log("We have the ethereum object", ethereum);
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      return true;
    }
    
  }

  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    if (checkIfWalletIsConnected()) {
      getWave();
      getAllWaves();
    }
  }, [])
  
  const getWave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(AdvContract, contractABI, signer);
        
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setWaves(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(AdvContract, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(AdvContract, contractABI, signer);
        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(msg, { gasLimit: 300000 })
        
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setWaves(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am farza and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <input type="text" onChange={(event)=>(setMsg(event.target.value))}/>
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        <h3>Total Waves: {waves}</h3>
        <h3>Current Account: {currentAccount}</h3>

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
