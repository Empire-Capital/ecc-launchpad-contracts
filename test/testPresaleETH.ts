import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { PresaleETH, MockWETH, MockERC20 } from "../typechain";
import { Signer, Wallet, BigNumber} from "ethers";

// Typechain Setup
let presaleETH: PresaleETH;
let sellToken: MockERC20;
let requireToken: MockERC20;
let weth: MockWETH;

let owner: SignerWithAddress;
let user: SignerWithAddress;

// Variables Setup
const sellRate = 1;
const presaleMin = ethers.utils.parseEther("1000");
const softCapAmount = ethers.utils.parseEther("100000");
const hardCapAmount = ethers.utils.parseEther("125000");
const projectTeamAddress = "0x54CF8930796e1e0c7366c6F04D1Ea6Ad6FA5B708";

const requireTokenAmount = ethers.utils.parseEther("150000");
const requireTokenAddress = "0xC84D8d03aA41EF941721A4D77b24bB44D7C7Ac55";
const requireTokenStatus = false;

const crossChainPresale = false;

beforeEach(async () => {

    [owner, user] = await ethers.getSigners();

    // Deploy SellToken
    sellToken = (await (await ethers.getContractFactory("MockERC20")).deploy()) as MockERC20;
    await sellToken.deployed();

    // Deploy RequireToken
    requireToken = (await (await ethers.getContractFactory("MockERC20")).deploy()) as MockERC20;
    await requireToken.deployed();

    // Deploy LGE
    presaleETH = (await (await ethers.getContractFactory("PresaleETH")).deploy(sellToken.address)) as PresaleETH;
    await presaleETH.deployed();

});

// describe("Should deploy Presale ETH contract correctly", async () => {

//     it("Should set sellToken correctly", async () => {
//         expect(await presaleETH.sellToken()).to.be.equal(sellToken.address);
//     });

//     it("Should set sellTokenDecimals correctly", async () => {
//         expect(await presaleETH.sellTokenDecimals()).to.be.equal(await sellToken.decimals());
//     });

//     it("Should set sellRate correctly", async () => {
//         expect(await presaleETH.sellRate()).to.be.equal(sellRate);
//     });

//     it("Should set presaleMin correctly", async () => {
//         expect(await presaleETH.presaleMin()).to.be.equal(presaleMin);
//     });

//     it("Should set softCapAmount correctly", async () => {
//         expect(await presaleETH.softCapAmount()).to.be.equal(softCapAmount);
//     });

//     it("Should set hardCapAmount correctly", async () => {
//         expect(await presaleETH.hardCapAmount()).to.be.equal(hardCapAmount);
//     });

//     it("Should set projectTeamAddress correctly", async () => {
//         expect(await presaleETH.projectTeamAddress()).to.be.equal(projectTeamAddress);
//     });

//     it("Should set requireTokenAmount correctly", async () => {
//         expect(await presaleETH.requireTokenAmount()).to.be.equal(requireTokenAmount);
//     });

//     it("Should set requireToken correctly", async () => {
//         expect(await presaleETH.requireToken()).to.be.equal(requireTokenAddress);
//     });

//     it("Should set requireTokenStatus correctly", async () => {
//         expect(await presaleETH.requireTokenStatus()).to.be.equal(requireTokenStatus);
//     });

//     it("Should set crossChainPresale correctly", async () => {
//         expect(await presaleETH.crossChainPresale()).to.be.equal(crossChainPresale);
//     });
    
// });

// describe("Should perform presale correctly for user functions", async () => {

//     describe("function: deposit works correctly", async () => {

//         it("Should ###", async () => {

//         });

//     });

//     describe("function: claim works correctly", async () => {

//         it("Should ###", async () => {

//         });

//     });
   
//     describe("function: claim works correctly", async () => {

//         it("Should ###", async () => {

//         });

//     });

//     describe("function: completePresale works correctly", async () => {

//         it("Should ###", async () => {

//         });

//     });
    
// });

// describe("Should perform presale correctly for admin functions", async () => {

//     describe("function: startPresale works correctly", async () => {

//         it("Should ###", async () => {

//         });

//     });

//     describe("function: extendPresale works correctly", async () => {

//         it("Should ###", async () => {

//         });

//     });
   
//     describe("function: updateCrossChainBalances works correctly", async () => {

//         it("Should ###", async () => {

//         });

//     });

// });

// describe("Should perform admin update variable functions correctly", async () => {

//     describe("function: updateSoftCapAmount works correctly", async () => {

//         it("Should only be callable when Status.beforeSale", async () => {
//             await expect(presaleETH.updateSoftCapAmount(10)).to.not.be.reverted;
//             await presaleETH.startPresale(100);
//             await expect(await presaleETH.status()).to.be.equal(1);
//             await expect(presaleETH.updateSoftCapAmount(10)).to.be.reverted;
//         });

//         it("Should update softCapAmount correctly", async () => {
//             await presaleETH.updateSoftCapAmount(1);
//             expect (await presaleETH.softCapAmount()).to.be.equal(1);
//         });

//     });

//     describe("function: updateHardCapAmount works correctly", async () => {

//         it("Should only be callable when Status.beforeSale", async () => {
//             await expect(presaleETH.updateSoftCapAmount(10)).to.not.be.reverted;
//             await presaleETH.startPresale(100);
//             await expect(await presaleETH.status()).to.be.equal(1);
//             await expect(presaleETH.updateSoftCapAmount(10)).to.be.reverted;
//         });

//         it("Should update hardCapAmount correctly", async () => {
//             await presaleETH.updateHardCapAmount(1);
//             expect (await presaleETH.hardCapAmount()).to.be.equal(1);
//         });

//     });
   
//     describe("function: updateSellToken works correctly", async () => {

//         it("Should only be callable when Status.beforeSale", async () => {
//             await expect(presaleETH.updateSoftCapAmount(10)).to.not.be.reverted;
//             await presaleETH.startPresale(100);
//             await expect(await presaleETH.status()).to.be.equal(1);
//             await expect(presaleETH.updateSoftCapAmount(10)).to.be.reverted;
//         });

//         it("Should update sellToken correctly", async () => {
//             await presaleETH.updateSellToken("0x0000000000000000000000000000000000000000", 1);
//             expect (await presaleETH.sellToken()).to.be.equal("0x0000000000000000000000000000000000000000");
//             expect (await presaleETH.sellTokenDecimals()).to.be.equal(1);
//         });

//     });

//     describe("function: updateSellRate works correctly", async () => {

//         it("Should only be callable when Status.beforeSale", async () => {
//             await expect(presaleETH.updateSoftCapAmount(10)).to.not.be.reverted;
//             await presaleETH.startPresale(100);
//             await expect(await presaleETH.status()).to.be.equal(1);
//             await expect(presaleETH.updateSoftCapAmount(10)).to.be.reverted;
//         });

//         it("Should update sellRate correctly", async () => {
//             await presaleETH.updateSellRate(1);
//             expect (await presaleETH.sellRate()).to.be.equal(1);
//         });

//     });

//     describe("function: updateMin works correctly", async () => {

//         it("Should only be callable when Status.beforeSale", async () => {
//             await expect(presaleETH.updateSoftCapAmount(10)).to.not.be.reverted;
//             await presaleETH.startPresale(100);
//             await expect(await presaleETH.status()).to.be.equal(1);
//             await expect(presaleETH.updateSoftCapAmount(10)).to.be.reverted;
//         });

//         it("Should update presaleMin correctly", async () => {
//             await presaleETH.updateMin(1);
//             expect (await presaleETH.presaleMin()).to.be.equal(1);
//         });

//     });
   
//     describe("function: updateRequiredToken works correctly", async () => {

//         it("Should only be callable when Status.beforeSale", async () => {
//             await expect(presaleETH.updateSoftCapAmount(10)).to.not.be.reverted;
//             await presaleETH.startPresale(100);
//             await expect(await presaleETH.status()).to.be.equal(1);
//             await expect(presaleETH.updateSoftCapAmount(10)).to.be.reverted;
//         });

//         it("Should update requireToken, requireTokenAmount & requireTokenStatus correctly", async () => {
//             await presaleETH.updateRequiredToken(1, "0x0000000000000000000000000000000000000000", true);
//             expect (await presaleETH.requireTokenAmount()).to.be.equal(1);
//             expect (await presaleETH.requireToken()).to.be.equal("0x0000000000000000000000000000000000000000");
//             expect (await presaleETH.requireTokenStatus()).to.be.equal(true);
//         });

//     });

//     describe("function: updateVestingInfo works correctly", async () => {

//         it("Should only be callable when Status.beforeSale", async () => {
//             await expect(presaleETH.updateSoftCapAmount(10)).to.not.be.reverted;
//             await presaleETH.startPresale(100);
//             await expect(await presaleETH.status()).to.be.equal(1);
//             await expect(presaleETH.updateSoftCapAmount(10)).to.be.reverted;
//         });

//         it("Should should update vestingStatus, vestingPercent & vestingContract correctly", async () => {
//             await presaleETH.updateVestingInfo(true, 1, "0x0000000000000000000000000000000000000000");
//             expect(await presaleETH.vestingStatus()).to.be.equal(true);
//             expect(await presaleETH.vestingPercent()).to.be.equal(1);
//             expect(await presaleETH.vestingContract()).to.be.equal("0x0000000000000000000000000000000000000000");
//         });

//     });

// });

// describe("Should restrict access to onlyOwner functions to owner", async () => {

//     it("Should allow owner to call onlyOwner function", async () => {
//         await expect(presaleETH.updateSoftCapAmount(1)).to.not.be.reverted;
//     });

//     it("Should restrict non-owner to call onlyOwner function", async () => {
//         await expect(presaleETH.connect(user).updateSoftCapAmount(1)).to.be.reverted;
//     });

// });