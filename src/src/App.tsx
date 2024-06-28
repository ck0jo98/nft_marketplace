// src/App.tsx
import { useState } from 'react';
import { ethers } from 'ethers';
import { getNftContract, getMarketplaceContract } from './services/contractService';

const App: React.FC = () => {
  const [nftContract, setNftContract] = useState<ethers.Contract | null>(null);
  const [marketplaceContract, setMarketplaceContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadContracts = async () => {
    const nft = await getNftContract();
    const marketplace = await getMarketplaceContract();
    setNftContract(nft);
    setMarketplaceContract(marketplace);

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
    <>
      <h1>Hello world</h1>
    </>
  );
};

export default App;
