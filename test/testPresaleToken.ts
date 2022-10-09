import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { PresaleToken, MockWETH, MockERC20 } from "../typechain";
import { Signer, Wallet, BigNumber} from "ethers";

let presaleToken: PresaleToken;
let weth: MockWETH;

let owner: SignerWithAddress;
let user: SignerWithAddress;

// Presale Setup Variables
let depositToken: MockERC20;
let depositTokenDecimals;

let sellToken: MockERC20;
let sellTokenDecimals;
let sellRate = 1;

let presaleMin = ethers.utils.parseEther("1000");
let softCapAmount = ethers.utils.parseEther("100000");
let hardCapAmount = ethers.utils.parseEther("125000");

let requireAmount = ethers.utils.parseEther("150000");
let requireToken: MockERC20;
let requireTokenStatus = false;

let crossChainPresale = false;

let projectTeamAddress = "0x488874e8b9C7999a853b2b2f4c1Dd8b952B3c2dB";

let vestingStatus;
let vestingPercent;
let vestingContract;

beforeEach(async () => {

    [owner, user] = await ethers.getSigners();

    // Deploy DepositToken
    depositToken = (await (await ethers.getContractFactory("MockERC20")).deploy()) as MockERC20;
    await depositToken.deployed();

    // Deploy SellToken
    sellToken = (await (await ethers.getContractFactory("MockERC20")).deploy()) as MockERC20;
    await sellToken.deployed();

    // Deploy RequireToken
    requireToken = (await (await ethers.getContractFactory("MockERC20")).deploy()) as MockERC20;
    await requireToken.deployed();

    // Deploy PresaleToken
    presaleToken = (await (await ethers.getContractFactory("PresaleToken")).deploy()) as PresaleToken;
    await presaleToken.deployed();

    // Setup Presale
    await presaleToken.setupPresale(
        sellToken.address,
        sellTokenDecimals,
        sellRate,
        presaleMin,
        softCapAmount,
        hardCapAmount,
        requireAmount,
        requireToken,
        requireTokenStatus,
        crossChainPresale,
        projectTeamAddress,
        vestingStatus,
        vestingPercent,
        vestingContract
    )
});

// describe("Should deploy Presale Token contract correctly", async () => {

//     it("Should set depositToken correctly", async () => {
//         expect(await presaleToken.sellToken()).to.be.equal(sellToken.address);
//     });

//     it("Should set sellToken correctly", async () => {
//         expect(await presaleToken.sellToken()).to.be.equal(sellToken.address);
//     });

//     it("Should set sellTokenDecimals correctly", async () => {
//         expect(await presaleToken.sellTokenDecimals()).to.be.equal(await sellToken.decimals());
//     });

//     it("Should set sellRate correctly", async () => {
//         expect(await presaleToken.sellRate()).to.be.equal(sellRate);
//     });

//     it("Should set presaleMin correctly", async () => {
//         expect(await presaleToken.presaleMin()).to.be.equal(presaleMin);
//     });

//     it("Should set softCapAmount correctly", async () => {
//         expect(await presaleToken.softCapAmount()).to.be.equal(softCapAmount);
//     });

//     it("Should set hardCapAmount correctly", async () => {
//         expect(await presaleToken.hardCapAmount()).to.be.equal(hardCapAmount);
//     });

//     it("Should set projectTeamAddress correctly", async () => {
//         expect(await presaleToken.projectTeamAddress()).to.be.equal(projectTeamAddress);
//     });

//     it("Should set requireAmount correctly", async () => {
//         expect(await presaleToken.requireAmount()).to.be.equal(requireAmount);
//     });

//     it("Should set requireToken correctly", async () => {
//         expect(await presaleToken.requireToken()).to.be.equal(requireTokenAddress);
//     });

//     it("Should set requireTokenStatus correctly", async () => {
//         expect(await presaleToken.requireTokenStatus()).to.be.equal(requireTokenStatus);
//     });

//     it("Should set crossChainPresale correctly", async () => {
//         expect(await presaleToken.crossChainPresale()).to.be.equal(crossChainPresale);
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

    // describe("function: updateSoftCapAmount works correctly", async () => {

    //     it("Should only be callable when Status.beforeSale", async () => {
    //         await expect(presaleToken.updateSoftCapAmount(10)).to.not.be.reverted;
    //         await presaleToken.startPresale(100);
    //         await expect(await presaleToken.status()).to.be.equal(1);
    //         await expect(presaleToken.updateSoftCapAmount(10)).to.be.reverted;
    //     });

    //     it("Should update softCapAmount correctly", async () => {
    //         await presaleToken.updateSoftCapAmount(1);
    //         expect (await presaleToken.softCapAmount()).to.be.equal(1);
    //     });

    // });

    // describe("function: updateHardCapAmount works correctly", async () => {

    //     it("Should only be callable when Status.beforeSale", async () => {
    //         await expect(presaleToken.updateSoftCapAmount(10)).to.not.be.reverted;
    //         await presaleToken.startPresale(100);
    //         await expect(await presaleToken.status()).to.be.equal(1);
    //         await expect(presaleToken.updateSoftCapAmount(10)).to.be.reverted;
    //     });

    //     it("Should update hardCapAmount correctly", async () => {
    //         await presaleToken.updateHardCapAmount(1);
    //         expect (await presaleToken.hardCapAmount()).to.be.equal(1);
    //     });

    // });
   
    // describe("function: updateSellToken works correctly", async () => {

    //     it("Should only be callable when Status.beforeSale", async () => {
    //         await expect(presaleToken.updateSoftCapAmount(10)).to.not.be.reverted;
    //         await presaleToken.startPresale(100);
    //         await expect(await presaleToken.status()).to.be.equal(1);
    //         await expect(presaleToken.updateSoftCapAmount(10)).to.be.reverted;
    //     });

    //     it("Should update sellToken correctly", async () => {
    //         await presaleToken.updateSellToken("0x0000000000000000000000000000000000000000", 1);
    //         expect (await presaleToken.sellToken()).to.be.equal("0x0000000000000000000000000000000000000000");
    //         expect (await presaleToken.sellTokenDecimals()).to.be.equal(1);
    //     });

    // });

    // describe("function: updateSellRate works correctly", async () => {

    //     it("Should only be callable when Status.beforeSale", async () => {
    //         await expect(presaleToken.updateSoftCapAmount(10)).to.not.be.reverted;
    //         await presaleToken.startPresale(100);
    //         await expect(await presaleToken.status()).to.be.equal(1);
    //         await expect(presaleToken.updateSoftCapAmount(10)).to.be.reverted;
    //     });

    //     it("Should update sellRate correctly", async () => {
    //         await presaleToken.updateSellRate(1);
    //         expect (await presaleToken.sellRate()).to.be.equal(1);
    //     });

    // });

    // describe("function: updateMin works correctly", async () => {

    //     it("Should only be callable when Status.beforeSale", async () => {
    //         await expect(presaleToken.updateSoftCapAmount(10)).to.not.be.reverted;
    //         await presaleToken.startPresale(100);
    //         await expect(await presaleToken.status()).to.be.equal(1);
    //         await expect(presaleToken.updateSoftCapAmount(10)).to.be.reverted;
    //     });

    //     it("Should update presaleMin correctly", async () => {
    //         await presaleToken.updateMin(1);
    //         expect (await presaleToken.presaleMin()).to.be.equal(1);
    //     });

    // });
   
    // describe("function: updateRequiredToken works correctly", async () => {

    //     it("Should only be callable when Status.beforeSale", async () => {
    //         await expect(presaleToken.updateSoftCapAmount(10)).to.not.be.reverted;
    //         await presaleToken.startPresale(100);
    //         await expect(await presaleToken.status()).to.be.equal(1);
    //         await expect(presaleToken.updateSoftCapAmount(10)).to.be.reverted;
    //     });

    //     it("Should update requireToken, requireAmount & requireTokenStatus correctly", async () => {
    //         await presaleToken.updateRequiredToken(1, "0x0000000000000000000000000000000000000000", true);
    //         expect (await presaleToken.requireAmount()).to.be.equal(1);
    //         expect (await presaleToken.requireToken()).to.be.equal("0x0000000000000000000000000000000000000000");
    //         expect (await presaleToken.requireTokenStatus()).to.be.equal(true);
    //     });

    // });

    // describe("function: updateVestingInfo works correctly", async () => {

    //     it("Should only be callable when Status.beforeSale", async () => {
    //         await expect(presaleToken.updateSoftCapAmount(10)).to.not.be.reverted;
    //         await presaleToken.startPresale(100);
    //         await expect(await presaleToken.status()).to.be.equal(1);
    //         await expect(presaleToken.updateSoftCapAmount(10)).to.be.reverted;
    //     });

    //     it("Should should update vestingStatus, vestingPercent & vestingContract correctly", async () => {
    //         await presaleToken.updateVestingInfo(true, 1, "0x0000000000000000000000000000000000000000");
    //         expect(await presaleToken.vestingStatus()).to.be.equal(true);
    //         expect(await presaleToken.vestingPercent()).to.be.equal(1);
    //         expect(await presaleToken.vestingContract()).to.be.equal("0x0000000000000000000000000000000000000000");
    //     });

    // });

// });

// describe("Should perform function: recoverNative correctly", async () => {

//     it("Should withdraw native coin on the contract", async () => {
//         expect(await ethers.provider.getBalance(presaleToken.address)).to.equal(0);  
//         const ethForContract = ethers.utils.parseEther("1");
//         await owner.sendTransaction({
//           to: presaleToken.address,
//           value: ethForContract
//         });
//         expect(await ethers.provider.getBalance(presaleToken.address)).to.equal(ethForContract);
//         await presaleToken.recoverNative();
//         expect(await ethers.provider.getBalance(presaleToken.address)).to.equal(0);  
//     });
    
// });

// describe("Should restrict access to onlyOwner functions to owner", async () => {

//     it("Should allow owner to call onlyOwner function", async () => {
//         await expect(presaleToken.updateSoftCapAmount(1)).to.not.be.reverted;
//     });

//     it("Should restrict non-owner to call onlyOwner function", async () => {
//         await expect(presaleToken.connect(user).updateSoftCapAmount(1)).to.be.reverted;
//     });

// });