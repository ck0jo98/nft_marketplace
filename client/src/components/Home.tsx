import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Row, Col, Card, Button } from "react-bootstrap";

interface HomeProps {
  marketplace: ethers.Contract | null;
  nft: ethers.Contract | null;
}

const Home: React.FC<HomeProps> = ({ marketplace, nft }) => {
  const [items, setItems] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * @description A React hook that fetches the number of items in the marketplace.
   * @returns {Promise<void>} A promise that resolves when the number of items is fetched.
   */
  const loadMarketplaceItems = async (): Promise<void> => {
    if (!marketplace) return;
    if (!nft) return;

    const itemCount = await marketplace.itemCount();
    let items = [];

    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.items(i)
      if (!item.sold) {
        const uri = await nft.tokenURI(item.tokenId)
        const response = await fetch(uri)
        const metadata = await response.json()
        const totalPrice = await marketplace.getTotalPrice(item.itemId)

        items.push({
          totalPrice,
          itemId: item.itemId,
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image
        })
      }
    }
    setLoading(false)
    setItems(items)
  }

  const buyMarketItem = async (item: any) => {
    if (!marketplace) return;

    await (await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })).wait()
    loadMarketplaceItems()
  }

  /**
   * @description A React hook that triggers the `loadMarketplaceItems` function when the component mounts.
   */
  useEffect(() => {
    loadMarketplaceItems();
  }, []);

  if (loading) {
    <main>
      <h2>Loading....</h2>
    </main>
  }
  /**
   * @description A React component that displays the number of items in the marketplace.
   * @returns {JSX.Element} A React element that displays the number of items in the marketplace.
   */
  return (
    <div className="flex justify-center">
      {items && items.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item: any, idx: number) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>
                      {item.description}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className='d-grid'>
                      <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                        Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        )}
    </div>
  );

}

export default Home;
