// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script} from "forge-std/Script.sol";
import {HealthcareRegistry} from "../src/HealthcareRegistry.sol";
import {ConsentRegistry} from "../src/ConsentRegistry.sol";

contract DeployScript is Script {
    function run() external returns (HealthcareRegistry healthcare, ConsentRegistry consent) {
        // 1. Lấy private key và xác định địa chỉ admin
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        address systemAdmin = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // 2. Gán trực tiếp vào biến trả về (không khai báo lại kiểu)
        healthcare = new HealthcareRegistry();
        healthcare.initialize(systemAdmin);

        consent = new ConsentRegistry();
        consent.initialize(address(healthcare), systemAdmin);

        vm.stopBroadcast();
    }
}
