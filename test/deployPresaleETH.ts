import { ethers } from "hardhat";
const hre = require("hardhat");

const sellToken = "0x"

async function main() {

    // Deploy contract
    const PresaleETH = await ethers.getContractFactory("PresaleETH");
    const presaleETH = await PresaleETH.deploy(sellToken);
    await presaleETH.deployed();
    console.log('Presale ETH deployed at:', presaleETH.address);

    // Verify contract
    await hre.run("verify:verify", {
        address: presaleETH.address,
        constructorArguments: [sellToken],
    });
    console.log('Presale ETH contract verified');
}

main().catch((error) => {
    console.error(error);
  });