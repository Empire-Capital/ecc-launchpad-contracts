import { ethers } from "hardhat";
const hre = require("hardhat");

const depositToken = "0x"
const sellToken = "0x"

async function main() {

    // Deploy contract
    const SatPresaleToken = await ethers.getContractFactory("PresaleToken");
    const satpresaleToken = await SatPresaleToken.deploy(depositToken, sellToken);
    await satpresaleToken.deployed();
    console.log('Satellite Presale Token deployed at:', satpresaleToken.address);

    // Verify contract
    await hre.run("verify:verify", {
        address: satpresaleToken.address,
        constructorArguments: [depositToken, sellToken],
    });
    console.log('Satellite Presale Token contract verified');
}

main().catch((error) => {
    console.error(error);
  });