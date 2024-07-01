import { create } from "ipfs-http-client";

// Initialize IPFS client
const ipfs = create({ url: "http://localhost:5001/api/v0" });

interface NftMetadata {
  cid: object;
  path: string;
  size: number;
}

export const uploadImageToIPFS = async (file: File): Promise<string> => {
  if (typeof file !== "undefined") {
    try {
      const result = await ipfs.add(file);
      return `https://ipfs.infura.io/ipfs/${result.path}`;
    } catch (error) {
      console.log("ipfs image upload error: " + error);
      return "";
    }
  }

  return "";
};

export const createNftMetadata = async (
  imageFile: string,
  price: string,
  name: string,
  description: string
): Promise<NftMetadata | void> => {
  try {
    const result = await ipfs.add(
      JSON.stringify({ imageFile, price, name, description })
    );

    return result as NftMetadata;
  } catch (error) {
    console.log("ipfs uri upload error: ", error)
  }
};
