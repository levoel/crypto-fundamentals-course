// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title CourseNFT
/// @notice ERC-721 non-fungible token with per-token URI storage and owner-only minting.
///         Used in ETH-09 lesson to demonstrate the ERC-721 standard.
contract CourseNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("CourseNFT", "CNFT") Ownable(msg.sender) {}

    /// @notice Mint a new NFT with metadata URI. Only the contract owner can mint.
    /// @param to Recipient address.
    /// @param uri Metadata URI for the token.
    /// @return tokenId The newly minted token ID.
    function mint(address to, string memory uri) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    // ---------------------------------------------------------------
    //  Required overrides for ERC721URIStorage
    // ---------------------------------------------------------------

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
