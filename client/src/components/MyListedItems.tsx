import { ethers } from "ethers";
import React from "react";

interface MyListedItemsProps {
  marketplace: ethers.Contract | null;
  nft: ethers.Contract | null;
  account: ethers.Contract | null;
}

const MyListedItems: React.FC<MyListedItemsProps> = ({ marketplace, nft, account }) => {
  if (!marketplace || !nft || !account) return null;

  return <h1>My Listem Items</h1>
}

export default MyListedItems;