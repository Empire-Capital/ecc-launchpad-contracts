const hre = require("hardhat");

async function main() {

  const token = "0x5A0FdF1f13Eb51A291669cE1C515630a4F6B0281";
  
  //Deploy Mocks
  const Launchpad = await ethers.getContractFactory("Launchpad");
  const launchpad = await Launchpad.deploy(  
      token
  )
  await launchpad.deployed();
  console.log('Launchpad deployed to:', launchpad.address);

  await launchpad.startPresale();
  console.log('started');

  await launchpad.addWhitelistedAddressesWithAmount(["0xafda0b875cf59c462e726652896e8a77262397d9"], 100000000000000);

  await hre.run("verify:verify", {
    address: launchpad.address,
    constructorArguments: [
      token
    ],
  });
}

// We recommend this pattern to be able to use async/await everywhere and properly handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
