import { ethers } from "ethers";
import { useEffect, useState } from "react";

interface HomeProps {
  marketplace: ethers.Contract | null;
  nft: ethers.Contract | null;
}

const Home: React.FC<HomeProps> = ({ marketplace, nft }) => {
  const [items, setItems] = useState<number>(0);

  /**
   * @description A React hook that fetches the number of items in the marketplace.
   * @returns {Promise<void>} A promise that resolves when the number of items is fetched.
   */
  const loadMarketplaceItems = async (): Promise<void> => {
    if (!marketplace) return;

    /**
     * @description A method that retrieves the number of items in the marketplace.
     * @returns {Promise<number>} A promise that resolves with the number of items in the marketplace.
     */
    const items = await marketplace.itemCount();

    /**
     * @description A React hook that updates the state with the number of items in the marketplace.
     * @param {number} items - The number of items in the marketplace.
     */
    setItems(items);
  }

  /**
   * @description A React hook that triggers the `loadMarketplaceItems` function when the component mounts.
   */
  useEffect(() => {
    loadMarketplaceItems();
  }, []);

  /**
   * @description A React component that displays the number of items in the marketplace.
   * @returns {JSX.Element} A React element that displays the number of items in the marketplace.
   */
  return <div>{items}</div>
}

export default Home;
