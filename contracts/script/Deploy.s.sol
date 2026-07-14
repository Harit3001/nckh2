// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Counter.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey;

        // Use Anvil's first default account if no private key is provided
        // Anvil account #0: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
        if (vm.envOr("PRIVATE_KEY", uint256(0)) == 0) {
            deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
            console.log("Using Anvil default account");
        } else {
            deployerPrivateKey = vm.envUint("PRIVATE_KEY");
            console.log("Using provided private key");
        }

        vm.startBroadcast(deployerPrivateKey);

        Counter counter = new Counter();

        console.log("Counter deployed at:", address(counter));
        console.log("Deployed by:", vm.addr(deployerPrivateKey));

        vm.stopBroadcast();
    }
}
