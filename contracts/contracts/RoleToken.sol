// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title RoleToken
 * @dev Soulbound ERC1155 tokens representing different access control roles.
 */
contract RoleToken is ERC1155, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    uint256 public constant ADMIN = 1;
    uint256 public constant MANAGER = 2;
    uint256 public constant AUDITOR = 3;
    uint256 public constant USER = 4;

    error NonTransferable();

    event RoleGranted(address indexed account, uint256 indexed roleId);
    event RoleRevoked(address indexed account, uint256 indexed roleId);

    constructor(address defaultAdmin) ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    function setURI(string calldata newuri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newuri);
    }

    /**
     * @dev Mints a role token to a specific account.
     */
    function mintRole(address account, uint256 id) external onlyRole(ISSUER_ROLE) {
        _mint(account, id, 1, "");
        emit RoleGranted(account, id);
    }
    
    /**
     * @dev Batch mints multiple roles to a specific account.
     */
    function mintBatchRole(address account, uint256[] calldata ids) external onlyRole(ISSUER_ROLE) {
        uint256[] memory amounts = new uint256[](ids.length);
        for(uint256 i = 0; i < ids.length; i++) {
            amounts[i] = 1;
            emit RoleGranted(account, ids[i]);
        }
        _mintBatch(account, ids, amounts, "");
    }

    /**
     * @dev Revokes a role token from a specific account.
     */
    function revokeRole(address account, uint256 id) external onlyRole(ISSUER_ROLE) {
        _burn(account, id, 1);
        emit RoleRevoked(account, id);
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
