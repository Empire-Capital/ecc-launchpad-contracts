import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { LGE, MockFactory, MockRouter, MockWETH, MockEscrow, MockERC20, EmpireERC20 } from "../typechain";
import { Signer, Wallet, BigNumber} from "ethers";

// Typechain Setup
let lge: LGE;
let sellToken: MockERC20;
let requireToken: MockERC20;
let mockWETH: MockWETH;
let mockFactory: MockFactory;
let mockEscrow: MockEscrow;
let mockRouter: MockRouter;

let owner: SignerWithAddress;
let user: SignerWithAddress;

// Variables Setup
const feeToSetterAddress = '0x54CF8930796e1e0c7366c6F04D1Ea6Ad6FA5B708';

const sellRate = 1;
const presaleMin = ethers.utils.parseEther("1000");
const softCapAmount = ethers.utils.parseEther("100000");
const hardCapAmount = ethers.utils.parseEther("125000");
const projectTeamAddress = "0x0000000000000000000000000000000000000000";
const projectAdminAddress = "0x0000000000000000000000000000000000000000";

const requireTokenAmount = ethers.utils.parseEther("150000");
const requireTokenAddress = "0xC84D8d03aA41EF941721A4D77b24bB44D7C7Ac55";
const requireTokenStatus = false;

const raisedLiqPercent = 10000;     // 100%
const raisedTeamPercent = 0;        // 0%
const raisedAdminPercent = 0;       // 0%

const crossChainPresale = false;

const router = "0xCfAA4334ec6d5bBCB597e227c28D84bC52d5B5A4";

beforeEach(async () => {

    [owner, user] = await ethers.getSigners();

    // Deploy MockEscrow
    mockEscrow = (await (await ethers.getContractFactory("MockEscrow")).deploy()) as MockEscrow;
    await mockEscrow.deployed();

    // Deploy MockFactory
    mockFactory = (await (await ethers.getContractFactory("MockFactory")).deploy(feeToSetterAddress)) as MockFactory;
    await mockFactory.deployed();

    // Deploy MockWETH
    mockWETH = (await (await ethers.getContractFactory("MockWETH")).deploy()) as MockWETH;
    await mockWETH.deployed();

    // Deploy MockRouter
    mockRouter = (await (await ethers.getContractFactory("MockRouter")).deploy(mockFactory.address, mockWETH.address, mockEscrow.address)) as MockRouter;
    await mockRouter.deployed();

    // Deploy SellToken
    sellToken = (await (await ethers.getContractFactory("MockERC20")).deploy()) as MockERC20;
    await sellToken.deployed();

    // Deploy RequireToken
    requireToken = (await (await ethers.getContractFactory("MockERC20")).deploy()) as MockERC20;
    await requireToken.deployed();

    // Deploy LGE
    lge = (await (await ethers.getContractFactory("LGE")).deploy(sellToken.address)) as LGE;
    await lge.deployed();

});

describe("Should deploy contract correctly", async () => {

    it("Should set sellToken correctly", async () => {
        expect(await lge.sellToken()).to.be.equal(sellToken.address);
    });

    it("Should set sellTokenDecimals correctly", async () => {
        expect(await lge.sellTokenDecimals()).to.be.equal(await sellToken.decimals());
    });

    it("Should set sellRate correctly", async () => {
        expect(await lge.sellRate()).to.be.equal(sellRate);
    });

    it("Should set presaleMin correctly", async () => {
        expect(await lge.presaleMin()).to.be.equal(presaleMin);
    });

    it("Should set softCapAmount correctly", async () => {
        expect(await lge.softCapAmount()).to.be.equal(softCapAmount);
    });

    it("Should set hardCapAmount correctly", async () => {
        expect(await lge.hardCapAmount()).to.be.equal(hardCapAmount);
    });

    it("Should set projectTeamAddress correctly", async () => {
        expect(await lge.projectTeamAddress()).to.be.equal(projectTeamAddress);
    });

    it("Should set projectAdminAddress to Empire Capital", async () => {
        expect(await lge.projectAdminAddress()).to.be.equal(projectAdminAddress);
    });

    it("Should set requireTokenAmount correctly", async () => {
        expect(await lge.requireTokenAmount()).to.be.equal(requireTokenAmount);
    });

    it("Should set requireToken correctly", async () => {
        expect(await lge.requireToken()).to.be.equal(requireTokenAddress);
    });

    it("Should set requireTokenStatus correctly", async () => {
        expect(await lge.requireTokenStatus()).to.be.equal(requireTokenStatus);
    });

    it("Should set crossChainPresale correctly", async () => {
        expect(await lge.crossChainPresale()).to.be.equal(crossChainPresale);
    });
   
    it("Should set raisedLiqPercent correctly", async () => {
        expect(await lge.raisedLiqPercent()).to.be.equal(raisedLiqPercent);
    });

    it("Should set raisedTeamPercent correctly", async () => {
        expect(await lge.raisedTeamPercent()).to.be.equal(raisedTeamPercent);
    });

    it("Should set raisedAdminPercent correctly", async () => {
        expect(await lge.raisedAdminPercent()).to.be.equal(raisedAdminPercent);
    });

    it("Should set router correctly", async () => {
        expect(await lge.router()).to.be.equal(router);
    });

});

// describe("Should perform LGE correctly for user functions", async () => {

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

// describe("Should perform LGE correctly for admin functions", async () => {

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
//             console.log(await lge.getSaleStatus());
//             await expect(lge.updateSoftCapAmount(10)).to.not.be.reverted;
//             await lge.startPresale(100);
//             console.log(await lge.getSaleStatus());
//             await expect(await lge.status()).to.be.equal(1);
//             await expect(lge.updateSoftCapAmount(10)).to.be.reverted;
//         });

//         it("Should update softCapAmount correctly", async () => {
//             await lge.updateSoftCapAmount(1);
//             expect (await lge.softCapAmount()).to.be.equal(1);
//         });

//     });

//     describe("function: updateHardCapAmount works correctly", async () => {

//         it("Should only be callable when Status.beforeSale", async () => {
//             console.log(await lge.getSaleStatus());
//             await expect(lge.updateSoftCapAmount(10)).to.not.be.reverted;
//             await lge.startPresale(100);
//             console.log(await lge.getSaleStatus());
//             await expect(await lge.status()).to.be.equal(1);
//             await expect(lge.updateSoftCapAmount(10)).to.be.reverted;
//         });

//         it("Should update hardCapAmount correctly", async () => {
//             await lge.updateHardCapAmount(1);
//             expect (await lge.hardCapAmount()).to.be.equal(1);
//         });

//     });
   
//     describe("function: updateSellToken works correctly", async () => {

//         it("Should only be callable when Status.beforeSale", async () => {
//             console.log(await lge.getSaleStatus());
//             await expect(lge.updateSoftCapAmount(10)).to.not.be.reverted;
//             await lge.startPresale(100);
//             console.log(await lge.getSaleStatus());
//             await expect(await lge.status()).to.be.equal(1);
//             await expect(lge.updateSoftCapAmount(10)).to.be.reverted;
//         });

//         it("Should update sellToken correctly", async () => {
//             await lge.updateSellToken("0x0000000000000000000000000000000000000000", 1);
//             expect (await lge.sellToken()).to.be.equal("0x0000000000000000000000000000000000000000");
//             expect (await lge.sellTokenDecimals()).to.be.equal(1);
//         });

//     });

//     describe("function: updateSellRate works correctly", async () => {

//         it("Should only be callable when Status.beforeSale", async () => {
//             console.log(await lge.getSaleStatus());
//             await expect(lge.updateSoftCapAmount(10)).to.not.be.reverted;
//             await lge.startPresale(100);
//             console.log(await lge.getSaleStatus());
//             await expect(await lge.status()).to.be.equal(1);
//             await expect(lge.updateSoftCapAmount(10)).to.be.reverted;
//         });

//         it("Should update sellRate correctly", async () => {
//             await lge.updateSellRate(1);
//             expect (await lge.sellRate()).to.be.equal(1);
//         });

//     });

//     describe("function: updateMin works correctly", async () => {

//         it("Should only be callable when Status.beforeSale", async () => {
//             console.log(await lge.getSaleStatus());
//             await expect(lge.updateSoftCapAmount(10)).to.not.be.reverted;
//             await lge.startPresale(100);
//             console.log(await lge.getSaleStatus());
//             await expect(await lge.status()).to.be.equal(1);
//             await expect(lge.updateSoftCapAmount(10)).to.be.reverted;
//         });

//         it("Should update presaleMin correctly", async () => {
//             await lge.updateMin(1);
//             expect (await lge.presaleMin()).to.be.equal(1);
//         });

//     });
   
//     describe("function: updateRequiredToken works correctly", async () => {

//         it("Should only be callable when Status.beforeSale", async () => {
//             console.log(await lge.getSaleStatus());
//             await expect(lge.updateSoftCapAmount(10)).to.not.be.reverted;
//             await lge.startPresale(100);
//             console.log(await lge.getSaleStatus());
//             await expect(await lge.status()).to.be.equal(1);
//             await expect(lge.updateSoftCapAmount(10)).to.be.reverted;
//         });

//         it("Should update requireToken, requireTokenAmount & requireTokenStatus correctly", async () => {
//             await lge.updateRequiredToken(1, "0x0000000000000000000000000000000000000000", true);
//             expect (await lge.requireTokenAmount()).to.be.equal(1);
//             expect (await lge.requireToken()).to.be.equal("0x0000000000000000000000000000000000000000");
//             expect (await lge.requireTokenStatus()).to.be.equal(true);
//         });

//     });

//     describe("function: updateTokenSplitPercents works correctly", async () => {

//         it("Should only be callable when Status.beforeSale", async () => {
//             console.log(await lge.getSaleStatus());
//             await expect(lge.updateSoftCapAmount(10)).to.not.be.reverted;
//             await lge.startPresale(100);
//             console.log(await lge.getSaleStatus());
//             await expect(await lge.status()).to.be.equal(1);
//             await expect(lge.updateSoftCapAmount(10)).to.be.reverted;
//         });

//         it("Should update ", async () => {
//             await lge.updateTokenSplitPercents(4000, 4000, 2000);
//             expect (await lge.liquidityPercent()).to.be.equal(4000);
//             expect (await lge.bonusTokenPercent()).to.be.equal(4000);
//             expect (await lge.teamPercent()).to.be.equal(2000);
//         });

//     });

//     describe("function: updateRaisedSplitPercents works correctly", async () => {

//         it("Should only be callable when Status.beforeSale", async () => {
//             console.log(await lge.getSaleStatus());
//             await expect(lge.updateSoftCapAmount(10)).to.not.be.reverted;
//             await lge.startPresale(100);
//             console.log(await lge.getSaleStatus());
//             await expect(await lge.status()).to.be.equal(1);
//             await expect(lge.updateSoftCapAmount(10)).to.be.reverted;
//         });

//         it("Should update raisedLiqPercent, raisedTeamPercent, raisedAdminPercent correctly", async () => {
//             await lge.updateRaisedSplitPercents(4000, 4000, 2000);
//             expect (await lge.raisedLiqPercent()).to.be.equal(4000);
//             expect (await lge.raisedTeamPercent()).to.be.equal(4000);
//             expect (await lge.raisedAdminPercent()).to.be.equal(2000);
//         });

//     });
   
//     describe("function: updateLpLock works correctly", async () => {

//         it("Should only be callable when Status.beforeSale", async () => {
//             console.log(await lge.getSaleStatus());
//             await expect(lge.updateSoftCapAmount(10)).to.not.be.reverted;
//             await lge.startPresale(100);
//             console.log(await lge.getSaleStatus());
//             await expect(await lge.status()).to.be.equal(1);
//             await expect(lge.updateSoftCapAmount(10)).to.be.reverted;
//         });

//         it("Should update lpLockStatus, lpLockDuration & lpLockContract correctly", async () => {
//             await lge.updateLpLock(true, 1, "0x0000000000000000000000000000000000000000");
//             expect (await lge.lpLockStatus()).to.be.equal(true);
//             expect (await lge.lpLockDuration()).to.be.equal(1);
//             expect (await lge.lpLockContract()).to.be.equal("0x0000000000000000000000000000000000000000");
//         });

//     });

// });

// describe("Should restrict access to onlyOwner functions to owner", async () => {

//     it("Should allow owner to call onlyOwner function", async () => {
//         await expect(lge.updateSoftCapAmount(1)).to.not.be.reverted;
//     });

//     it("Should restrict non-owner to call onlyOwner function", async () => {
//         await expect(lge.connect(user).updateSoftCapAmount(1)).to.be.reverted;
//     });

// });