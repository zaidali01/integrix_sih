// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AssetNFT
 * @dev On-chain representation of an encrypted asset stored in the Vault.
 */
contract AssetNFT is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 private _nextTokenId;

    struct AssetMetadata {
        string fileHash;
        string name;
        address uploader;
        uint256 timestamp;
    }

    mapping(uint256 => AssetMetadata) private _assets;

    event AssetMinted(uint256 indexed tokenId, address indexed uploader, string fileHash, string name);

    constructor(address defaultAdmin) ERC721("ArgusAsset", "AAS") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    /**
     * @dev Mints a new Asset NFT and stores its metadata.
     */
    function mintAsset(
        address to, 
        string calldata fileHash, 
        string calldata name
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        _assets[tokenId] = AssetMetadata({
            fileHash: fileHash,
            name: name,
            uploader: to,
            timestamp: block.timestamp
        });

        _safeMint(to, tokenId);
        
        emit AssetMinted(tokenId, to, fileHash, name);
        
        return tokenId;
    }

    /**
     * @dev Retrieves the complete metadata for a given asset token.
     */
    function getAssetMetadata(uint256 tokenId) external view returns (AssetMetadata memory) {
        _requireOwned(tokenId);
        return _assets[tokenId];
    }
    
    /**
     * @dev Backwards compatibility for the original getAssetHash function.
     */
    function getAssetHash(uint256 tokenId) external view returns (string memory) {
        _requireOwned(tokenId);
        return _assets[tokenId].fileHash;
    }

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
