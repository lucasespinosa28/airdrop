// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IZora1155, ICreatorRoyaltiesControl} from "./IZora1155.sol";

contract MintMaster is AccessControl, ERC1155Holder {
    IERC1155 private _tokenContract;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(address defaultAdmin, address minter) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);
    }

    function giveway(address from, address to) public {
        ERC1155(from).safeTransferFrom(address(this), to, 1, 1, "");
    }

    function withdraw(
        address from,
        address to,
        uint256 id,
        uint256 amount
    ) public {
        if (Ownable(from).owner() == msg.sender) {
            ERC1155(from).safeTransferFrom(address(this), to, id, amount, "");
        }
    }

    function depositBalance(
        address token,
        uint256 tokenId
    ) external view returns (uint256) {
        return ERC1155(token).balanceOf(address(this), tokenId);
    }

    function createContractDeterministic(
        address factory,
        string calldata contractURI,
        string calldata name,
        ICreatorRoyaltiesControl.RoyaltyConfiguration
            calldata defaultRoyaltyConfiguration,
        address payable defaultAdmin,
        bytes[] calldata setupActions
    ) external returns (address) {
        return
            IZora1155(factory).createContractDeterministic(
                contractURI,
                name,
                defaultRoyaltyConfiguration,
                defaultAdmin,
                setupActions
            );
    }

    function adminMint(
        address token,
        uint256 tokenId,
        uint256 quantity,
        bytes memory data
    ) external {
        IZora1155(token).adminMint(address(this), tokenId, quantity, data);
    }

    function updateTokenURI(
        address token,
        uint256 tokenId,
        string memory _newURI
    ) external {
        IZora1155(token).updateTokenURI(tokenId, _newURI);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(AccessControl, ERC1155Holder)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
