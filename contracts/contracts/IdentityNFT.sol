// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract IdentityNFT is ERC721, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    uint256 private _nextTokenId;

    constructor(address defaultAdmin) ERC721("ArgusIdentity", "AID") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    function mintIdentity(address to) public onlyRole(ISSUER_ROLE) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    function revokeIdentity(uint256 tokenId) public onlyRole(ISSUER_ROLE) {
        _burn(tokenId);
    }

    // Soulbound logic: disable transfers by overriding _update
    function _update(address to, uint256 tokenId, address auth)
        internal
        virtual
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        // If it's not a mint (from == 0) and not a burn (to == 0), revert
        if (from != address(0) && to != address(0)) {
            revert("IdentityNFT: Identity is non-transferable");
        }
        return super._update(to, tokenId, auth);
    }

    // Required override for AccessControl and ERC721
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
