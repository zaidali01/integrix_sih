// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract AssetNFT is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 private _nextTokenId;

    // Mapping from tokenId to asset SHA-256 hash
    mapping(uint256 => string) private _assetHashes;

    constructor(address defaultAdmin) ERC721("ArgusAsset", "AAS") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    function mintAsset(address to, string memory assetHash) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _assetHashes[tokenId] = assetHash;
        _safeMint(to, tokenId);
        return tokenId;
    }

    function getAssetHash(uint256 tokenId) public view returns (string memory) {
        // In OZ 5.x, you use _requireOwned(tokenId) to ensure it exists
        _requireOwned(tokenId);
        return _assetHashes[tokenId];
    }

    // Required override
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
