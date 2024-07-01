import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { useState } from "react"
import { createNftMetadata, uploadImageToIPFS } from "../services/ipfsService"

interface CreateProps {
  marketplace: ethers.Contract | null;
  nft: ethers.Contract | null;
}

const Create: React.FC<CreateProps> = ({ marketplace, nft }) => {
  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [price, setPrice] = useState<string>('');
  const [imageFile, setImageFile] = useState<string>('');
  const [ipfsHash, setIpfsHash] = useState<string>('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await uploadImageToIPFS(file);

      if (result) {
        setImageFile(result);
      }
    }
  };

  const createNFT = async () => {
    if (!imageFile || !price || !name || !description) return
    try {
      const result = createNftMetadata(imageFile, price, name, description);

      console.log(await result);
      mintThenList(result)
    } catch (error) {
      console.log("ipfs uri upload error: ", error)
    }
  }

  const mintThenList = async (result: any) => {
    if (!nft) return;
    if (!marketplace) return;

    const uri = `https://ipfs.infura.io/ipfs/${result.path}`
    await (await nft.mint(uri)).wait()

    const id = await nft.tokenCount()
    await (await nft.setApprovalForAll(marketplace.address, true)).wait()

    const listingPrice = ethers.utils.parseEther(price);
    await (await marketplace.makeItem(nft.address, id, listingPrice)).wait()
  }

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={handleFileChange}
              />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create;