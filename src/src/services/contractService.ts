import { ethers } from "ethers";
import MarketplaceAbi from "../../contractsData/Marketplace.json";
import MarketplaceAddress from "../../contractsData/Marketplace-address.json";
import NFTAbi from "../../contractsData/NFT.json";
import NFTAddress from "../../contractsData/NFT-address.json";

export const getNftContract = async (): Promise<ethers.Contract> => {
  return await getContract(NFTAddress.address, NFTAbi.abi);
};

export const getMarketplaceContract = async (): Promise<ethers.Contract> => {
  return await getContract(MarketplaceAddress.address, MarketplaceAbi.abi);
};

export const getContract = async (
  contractAddress: string,
  artifact: ethers.ContractInterface
): Promise<ethers.Contract> => {
  if (!window.ethereum) {
    throw new Error("Metamask not detected.");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, artifact, signer);

  return contract;
};
