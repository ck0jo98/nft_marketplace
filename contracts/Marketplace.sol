// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    address payable public immutable feeAccount;
    uint public immutable feePercent;
    uint public itemCount;

    struct Item {
        uint id;
        IERC721 nft;
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
    }

    event Offered(
        uint idx,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );

    event Bought(
        uint idx,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    mapping(uint => Item) public items;

    constructor(uint _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    function makeItem(
        IERC721 _nft,
        uint _tokenId,
        uint _price
    ) external nonReentrant {
        require(_price > 0, "Price must be greater than  zero");
        itemCount++;
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        items[itemCount] = Item(
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );
        emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
    }

    function purchaseItem(uint _idx) external payable nonReentrant {
        uint _totalPrice = getTotalPrice(_idx);
        Item storage item = items[_idx];
        require(_idx > 0 && _idx <= itemCount, "Item doesn't exist");
        require(!item.sold, "Item is already sold");
        require(msg.value >= item.price, "Insufficient value sent");

        (bool success, ) = item.seller.call{value: item.price}("");
        require(success, "Transfer to seller failed");

        uint feeAmount = (_totalPrice - item.price);
        (bool feeSuccess, ) = feeAccount.call{value: feeAmount}("");
        require(feeSuccess, "Transfer to fee account failed");

        item.sold = true;
        item.nft.safeTransferFrom(address(this), msg.sender, item.id);

        emit Bought(
            _idx,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

    function getTotalPrice(uint _idx) public view returns (uint) {
        return ((items[_idx].price * (100 + feePercent)) / 100);
    }
}
