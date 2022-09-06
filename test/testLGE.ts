import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { LGE, MockFactory, MockRouter, MockWETH, MockEscrow, MockERC20 } from "../typechain";
import { Signer, Wallet, BigNumber} from "ethers";

// Typechain Setup
let lge: LGE;
let sellToken: MockERC20;
let mockWETH: MockWETH;
let mockFactory: MockFactory;
let mockEscrow: MockEscrow;
let mockRouter: MockRouter;

let owner: SignerWithAddress;
let user: SignerWithAddress;

// Variables Setup
const feeToSetterAddress = '0x54CF8930796e1e0c7366c6F04D1Ea6Ad6FA5B708';

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

    // Deploy LGE
    lge = (await (await ethers.getContractFactory("LGE")).deploy(sellToken.address)) as LGE;
    await lge.deployed();

});

describe("Should deploy contract correctly", async () => {

    it("Should set depositToken correctly", async () => {

    });

    it("Should set sellToken correctly", async () => {

    });

    it("Should set sellTokenDecimals correctly", async () => {

    });

    it("Should set sellRate correctly", async () => {

    });

    it("Should set presaleMin correctly", async () => {

    });

    it("Should set softCapAmount correctly", async () => {

    });

    it("Should set hardCapAmount correctly", async () => {

    });

    it("Should set projectTeamAddress correctly", async () => {

    });

    it("Should set projectAdminAddress to Empire Capital", async () => {

    });

    it("Should set requireTokenAmount correctly", async () => {

    });

    it("Should set requireToken correctly", async () => {

    });

    it("Should set requireTokenStatus correctly", async () => {

    });

    it("Should set crossChainPresale correctly", async () => {

    });
   
    it("Should set raisedLiqPercent correctly", async () => {

    });

    it("Should set raisedTeamPercent correctly", async () => {

    });

    it("Should set raisedAdminPercent correctly", async () => {

    });

    it("Should set router correctly", async () => {

    });

});

describe("Should perform LGE correctly for user functions", async () => {

    it("Should ###", async () => {

    });
    
});

describe("Should perform LGE correctly for admin functions", async () => {

    it("Should ###", async () => {

    });

});

describe("Should perform admin update variable functions correctly", async () => {

    it("Should ###", async () => {

    });

});