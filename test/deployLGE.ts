import { ethers } from "hardhat";
const hre = require("hardhat");

const sellToken = "0x"

async function main() {

    // Deploy contract
    const LGE = await ethers.getContractFactory("LGE");
    const lge = await LGE.deploy(sellToken);
    await lge.deployed();
    console.log('LGE deployed at:', lge.address);

    // Verify contract
    await hre.run("verify:verify", {
        address: lge.address,
        constructorArguments: [sellToken],
    });
    console.log('LGE contract verified');
}

main().catch((error) => {
    console.error(error);
  });