// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AccessBadge
 * @dev Soulbound ERC1155 tokens mapped to Asset IDs granting read/write access.
 */
contract AccessBadge is ERC1155, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    
    error NonTransferable();

    event BadgeIssued(address indexed to, uint256 indexed assetId);
    event BadgeRevoked(address indexed from, uint256 indexed assetId);

    constructor(address defaultAdmin) ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    function setURI(string calldata newuri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newuri);
    }

    /**
     * @dev Issues an access badge for a specific assetId to an address.
     */
    function issueBadge(address to, uint256 assetId) external onlyRole(ISSUER_ROLE) {
        _mint(to, assetId, 1, "");
        emit BadgeIssued(to, assetId);
    }

    /**
     * @dev Revokes an access badge for a specific assetId from an address.
     */
    function revokeBadge(address from, uint256 assetId) external onlyRole(ISSUER_ROLE) {
        _burn(from, assetId, 1);
        emit BadgeRevoked(from, assetId);
    }

    /**
     * @dev Soulbound logic: disables user-to-user transfers.
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override {
        if (from != address(0) && to != address(0)) {
            revert NonTransferable();
        }
        super._update(from, to, ids, values);
    }

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
