import { ethers } from "hardhat";
const hre = require("hardhat");

const sellToken = "0x"

async function main() {

    // Deploy contract
    const SatPresaleETH = await ethers.getContractFactory("SatPresaleETH");
    const satpresaleETH = await SatPresaleETH.deploy(sellToken);
    await satpresaleETH.deployed();
    console.log('Satellite Presale ETH deployed at:', satpresaleETH.address);

    // Verify contract
    await hre.run("verify:verify", {
        address: satpresaleETH.address,
        constructorArguments: [sellToken],
    });
    console.log('Satellite Presale ETH contract verified');
}

main().catch((error) => {
    console.error(error);
  });