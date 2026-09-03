// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title IdentityNFT
 * @dev Soulbound token representing a verified user identity.
 */
contract IdentityNFT is ERC721, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    uint256 private _nextTokenId;

    error NonTransferable();

    event IdentityIssued(address indexed to, uint256 indexed tokenId);
    event IdentityRevoked(uint256 indexed tokenId);

    constructor(address defaultAdmin) ERC721("ArgusIdentity", "AID") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    /**
     * @dev Mints a soulbound identity token to a user.
     */
    function mintIdentity(address to) external onlyRole(ISSUER_ROLE) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        emit IdentityIssued(to, tokenId);
    }

    /**
     * @dev Revokes (burns) an identity token.
     */
    function revokeIdentity(uint256 tokenId) external onlyRole(ISSUER_ROLE) {
        _burn(tokenId);
        emit IdentityRevoked(tokenId);
    }

    /**
     * @dev Soulbound logic: disables transfers by reverting on any transfer attempt.
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        virtual
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert NonTransferable();
        }
        return super._update(to, tokenId, auth);
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
