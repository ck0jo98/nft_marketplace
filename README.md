# Marketplace Smart Contract

This Solidity smart contract is designed to create a marketplace for buying and selling ERC721 tokens. The contract uses the OpenZeppelin library for security and reentrancy protection.

## Contract Structure

The contract has the following main components:

1. `makeItem`: Allows users to list their ERC721 tokens for sale.
2. `purchaseItem`: Allows users to buy listed ERC721 tokens.
3. `getTotalPrice`: Calculates the total price including the fee.

## Dependencies

This contract depends on the following OpenZeppelin libraries:

1. `@openzeppelin/contracts/token/ERC721/IERC721.sol`: Interface for ERC721 tokens.
2. `@openzeppelin/contracts/security/ReentrancyGuard.sol`: Reentrancy guard to prevent reentrancy attacks.

## Setting Up the Contract on Local Environment

To set up this contract on a local environment, follow these steps:

1. Install Solidity compiler: Download and install the latest version of the Solidity compiler from the official website (https://solidity.readthedocs.io/en/latest/installing-solidity.html).

2. Install Hardhat: Hardhat is a development environment for Ethereum. Install it using npm:

```bash
npm install -g hardhat
```

3. Deploy smart contracts locally
```bash
npx hardhat run ./src/backend/scripts/deploy.js --network localhost
```

4. Run the environment
```bash
npx hardhat node
```