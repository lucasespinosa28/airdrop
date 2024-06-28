// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {MyToken} from "../src/Token.sol";
import {MintMaster} from "../src/MintMaster.sol";

contract MintMasterTest is Test {
    MyToken public myToken;
    MintMaster public mintMaster;

    address public owner = address(1);
    address public minter = address(2);
    address public admin = address(3);

    function setUp() public {
        myToken = new MyToken(owner);
        mintMaster = new MintMaster(address(myToken), admin, minter);
    }

    function test_mint() public {
        vm.startPrank(owner);
        myToken.mint(address(mintMaster), 1, 1, "");
        uint256 balance = myToken.balanceOf(address(mintMaster), 1);
        assertEq(balance, 1);
    }

    function test_giveway() public {
        vm.startPrank(owner);
        myToken.mint(address(mintMaster), 1, 1, "");
        vm.stopPrank();

        vm.startPrank(minter);
        mintMaster.giveway(address(myToken), admin, 1);
        vm.stopPrank();

        uint256 balance = myToken.balanceOf(admin, 1);
        assertEq(balance, 1);
    }

    function test_withdraw() public {
        vm.startPrank(owner);
        myToken.mint(address(mintMaster), 1, 1, "");
        vm.stopPrank();

        vm.startPrank(owner);
        mintMaster.withdraw(address(myToken), owner, 1,1);
        vm.stopPrank();

        uint256 balance = myToken.balanceOf(owner, 1);
        assertEq(balance, 1);
    }
}
