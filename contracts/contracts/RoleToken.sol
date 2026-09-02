// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract RoleToken is ERC1155, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    uint256 public constant ADMIN = 1;
    uint256 public constant MANAGER = 2;
    uint256 public constant AUDITOR = 3;
    uint256 public constant USER = 4;

    constructor(address defaultAdmin) ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    function setURI(string memory newuri) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newuri);
    }

    function mintRole(address account, uint256 id) public onlyRole(ISSUER_ROLE) {
        _mint(account, id, 1, "");
    }
    
    function mintBatchRole(address account, uint256[] memory ids) public onlyRole(ISSUER_ROLE) {
        uint256[] memory amounts = new uint256[](ids.length);
        for(uint256 i = 0; i < ids.length; i++) {
            amounts[i] = 1;
        }
        _mintBatch(account, ids, amounts, "");
    }

    function revokeRole(address account, uint256 id) public onlyRole(ISSUER_ROLE) {
        _burn(account, id, 1);
    }

    // Soulbound logic: prevent user-to-user transfers
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override {
        if (from != address(0) && to != address(0)) {
            revert("RoleToken: Roles are non-transferable");
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
