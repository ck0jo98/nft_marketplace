import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { NFT, Marketplace } from "../typechain-types";

const toWei = (num: number | string) => hre.ethers.parseEther(num.toString());
const fromWei = (num: number | string) =>
  hre.ethers.formatEther(num.toString());

describe("NFTMarketplace", function () {
  const FEE_PERCENT = 1_000_000_000_000;
  const URI = "Sample URI";
  let nft: NFT;
  let marketplace: Marketplace;
  let deployer: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    const NFTContract = await hre.ethers.getContractFactory("NFT");
    const MarketplaceContract = await hre.ethers.getContractFactory(
      "Marketplace"
    );

    [deployer, addr1, addr2] = await hre.ethers.getSigners();

    nft = await NFTContract.deploy();
    marketplace = await MarketplaceContract.deploy(FEE_PERCENT);
  });

  describe("Deployment", function () {
    it("Should track name and symbol of the NFT contract", async function () {
      expect(await nft.name()).to.equal("Dapp NFT");
      expect(await nft.symbol()).to.equal("DNFT");
    });

    it("Should have feeAccount equal to the deployer address", async function () {
      expect(await marketplace.feeAccount()).to.equal(deployer.address);
      expect(await marketplace.feePercent()).to.equal(FEE_PERCENT);
    });
  });

  describe("Minting NFTs", function () {
    it("Should track each minted NFT", async function () {
      // addr1 mints an NFT
      await nft.connect(addr1).mint(URI);
      expect(await nft.tokenCount()).to.equal(1);
      expect(await nft.ownerOf(1)).to.equal(addr1.address);
      expect(await nft.balanceOf(addr1.address)).to.equal(1);
      expect(await nft.tokenURI(1)).to.equal(URI);

      // addr2 mints an NFT
      await nft.connect(addr2).mint(URI);
      expect(await nft.tokenCount()).to.equal(2);
      expect(await nft.ownerOf(2)).to.equal(addr2.address);
      expect(await nft.balanceOf(addr2.address)).to.equal(1);
      expect(await nft.tokenURI(2)).to.equal(URI);
    });
  });

  describe("Making marketplace items", function () {
    beforeEach(async function () {
      await nft.connect(addr1).mint(URI);
      await nft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);
    });

    it("should track newly created item", async function () {
      await expect(
        marketplace.connect(addr1).makeItem(nft.getAddress(), 1, toWei(1))
      )
        .to.emit(marketplace, "Offered")
        .withArgs(1, nft.getAddress(), 1, toWei(1), addr1.getAddress());

      expect(await nft.ownerOf(1)).to.equal(await marketplace.getAddress());
      expect(await marketplace.itemCount()).to.equal(1);

      const item = await marketplace.items(1);
      expect(item.id).to.equal(1);
      expect(item.nft).to.equal(await nft.getAddress());
      expect(item.tokenId).to.equal(1);
      expect(item.price).to.equal(toWei(1));
      expect(item.seller).to.equal(addr1.address);
      expect(item.sold).to.equal(false);
    });

    it("should fail when price is 0", async function () {
      await expect(
        marketplace.connect(addr1).makeItem(nft.getAddress(), 1, 0)
      ).to.be.revertedWith("Price must be greater than  zero");
    });
  });

  describe("Purchasing item", function () {
    const price = hre.ethers.parseEther("0.1");
    const tokenId = 1;
    const idx = 1;
    let totalPriceInWei: bigint;

    beforeEach(async function () {
      await nft.connect(addr1).mint(URI);
      await nft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);
      await marketplace.connect(addr1).makeItem(nft.getAddress(), 1, price);
    });

    it("should revert if trying to purchase a non-existing item", async function () {
      await expect(
        marketplace.connect(addr1).purchaseItem(54)
      ).to.be.revertedWith("Item doesn't exist");
    });

    it("should fail if trying to purchase with insufficient amount", async function () {
      await expect(
        marketplace.connect(addr1).purchaseItem(idx, { value: 1 })
      ).to.be.revertedWith("Insufficient value sent");
    });

    it("should transfer nft to the buyer, update the NFT sold state, transfer funds to the seller, and fee amount to the contract owner", async function () {
      totalPriceInWei = await marketplace.getTotalPrice(idx);

      const sellerInitialBalance = await hre.ethers.provider.getBalance(
        addr1.getAddress()
      );

      console.log(`Total price in ETH: ${fromWei(totalPriceInWei.toString())}`);

      console.log(
        `Seller's initial balance: ${fromWei(sellerInitialBalance.toString())}`
      );

      const ownerInitialBalance = await hre.ethers.provider.getBalance(
        deployer.getAddress()
      );

      await expect(
        marketplace.connect(addr2).purchaseItem(idx, { value: totalPriceInWei })
      )
        .to.emit(marketplace, "Bought")
        .withArgs(
          idx,
          nft.getAddress(),
          tokenId,
          price,
          addr1.address,
          addr2.address
        );

      expect((await marketplace.items(idx)).sold).to.equal(true);

      // Checking if the seller received the price of the token
      const sellerFinalBalance = await hre.ethers.provider.getBalance(
        addr1.address
      );

      const balanceDifference = sellerFinalBalance - sellerInitialBalance;
      const balanceDifferenceInEth = fromWei(balanceDifference.toString());

      expect(parseFloat(balanceDifferenceInEth)).to.equal(price);

      // Checking if the contract owner received the fee of the transaction
      const ownerFinalBalance = await hre.ethers.provider.getBalance(
        deployer.getAddress()
      );
      const feeAmount = totalPriceInWei - toWei(price.toString());
      const ownerBalanceDifference = ownerFinalBalance - ownerInitialBalance;

      expect(fromWei(ownerBalanceDifference.toString())).to.equal(
        fromWei(feeAmount.toString())
      );
    });

    it("should fail if trying to buy an already sold item", async function () {
      totalPriceInWei = await marketplace.getTotalPrice(idx);

      expect(
        await marketplace
          .connect(addr2)
          .purchaseItem(idx, { value: totalPriceInWei })
      ).to.emit(marketplace, "Bought");

      // Trying to buy the same item
      await expect(
        marketplace.connect(addr2).purchaseItem(idx, { value: totalPriceInWei })
      ).to.be.revertedWith("Item is already sold");
    });
  });
});
