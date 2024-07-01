// src/App.tsx
import { useState } from 'react';
import { ethers } from 'ethers';
import { getNftContract, getMarketplaceContract } from './services/contractService';
import Navigation from './components/Navbar';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import Home from './components/Home';

import './App.css';
import Create from './components/Create';
import MyListedItems from './components/MyListedItems';

const App: React.FC = () => {
  const [nft, setNft] = useState<ethers.Contract | null>(null);
  const [marketplace, setMarketplace] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadContracts = async () => {
    const nftContract = await getNftContract();
    const marketplaceContract = await getMarketplaceContract();
    setNft(nftContract);
    setMarketplace(marketplaceContract);

    setLoading(false);
  };

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);

    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    })

    window.ethereum.on('accountsChanged', async function (accounts: Array<any>) {
      setAccount(accounts[0])
      await web3Handler()
    })

    loadContracts();
  }

  return (
    <BrowserRouter>
      <div className="App">
        <>
          <Navigation web3Handler={web3Handler} account={account} />
        </>
        {
          loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Home marketplace={marketplace} nft={nft} />
              } />
              {
                <>
                  <Route path="/create" element={<Create marketplace={marketplace} nft={nft} />} />
                  <Route path="/my-listed-items" element={<MyListedItems marketplace={marketplace} nft={nft} account={account} />} />
                </>
              /* <Route path="/my-purchases" element={
                <MyPurchases marketplace={marketplace} nft={nft} account={account} />
              } /> */}
            </Routes>
          )
        }
      </div>
    </BrowserRouter>
  );
};

export default App;
