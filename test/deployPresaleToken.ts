import { ethers } from "hardhat";
const hre = require("hardhat");

const depositToken = "0x"
const sellToken = "0x"

async function main() {

    // Deploy contract
    const PresaleToken = await ethers.getContractFactory("PresaleToken");
    const presaleToken = await PresaleToken.deploy(depositToken, sellToken);
    await presaleToken.deployed();
    console.log('Presale Token deployed at:', presaleToken.address);

    // Verify contract
    await hre.run("verify:verify", {
        address: presaleToken.address,
        constructorArguments: [depositToken, sellToken],
    });
    console.log('Presale Token contract verified');
}

main().catch((error) => {
    console.error(error);
  });