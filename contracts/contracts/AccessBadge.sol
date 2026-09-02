// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract AccessBadge is ERC1155, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    
    constructor(address defaultAdmin) ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    function setURI(string memory newuri) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newuri);
    }

    // tokenId = assetId, amount is always 1 for access
    function issueBadge(address to, uint256 assetId) public onlyRole(ISSUER_ROLE) {
        _mint(to, assetId, 1, "");
    }

    function revokeBadge(address from, uint256 assetId) public onlyRole(ISSUER_ROLE) {
        _burn(from, assetId, 1);
    }

    // Soulbound logic: prevent user-to-user transfers
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override {
        if (from != address(0) && to != address(0)) {
            revert("AccessBadge: Badges are non-transferable");
        }
        super._update(from, to, ids, values);
    }

    // Required override
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
