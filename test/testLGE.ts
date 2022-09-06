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
const projectTeamAddress = "0x";
const projectAdminAddress = "0x";

const requireTokenAmount = ethers.utils.parseEther("150000");
const requireTokenAddress = "0x";
const requireTokenStatus = false;

const raisedLiqPercent = 10000;     // 100%
const raisedTeamPercent = 0;        // 0%
const raisedAdminPercent = 0;       // 0%

const crossChainPresale = false;

const router = "0x";

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

    describe("function: deposit works correctly", async () => {

        it("Should ###", async () => {

        });

    });

    describe("function: claim works correctly", async () => {

        it("Should ###", async () => {

        });

    });
   
    describe("function: claim works correctly", async () => {

        it("Should ###", async () => {

        });

    });

    describe("function: completePresale works correctly", async () => {

        it("Should ###", async () => {

        });

    });

});

describe("Should perform LGE correctly for admin functions", async () => {

    describe("function: startPresale works correctly", async () => {

        it("Should ###", async () => {

        });

    });

    describe("function: extendPresale works correctly", async () => {

        it("Should ###", async () => {

        });

    });
   
    describe("function: updateCrossChainBalances works correctly", async () => {

        it("Should ###", async () => {

        });

    });

});

describe("Should perform admin update variable functions correctly", async () => {

    describe("function: updateSoftCapAmount works correctly", async () => {

        it("Should ###", async () => {

        });

    });

    describe("function: updateHardCapAmount works correctly", async () => {

        it("Should ###", async () => {

        });

    });
   
    describe("function: updateSellToken works correctly", async () => {

        it("Should ###", async () => {

        });

    });

    describe("function: updateSellRate works correctly", async () => {

        it("Should ###", async () => {

        });

    });

    describe("function: updateMin works correctly", async () => {

        it("Should ###", async () => {

        });

    });
   
    describe("function: updateRequiredToken works correctly", async () => {

        it("Should ###", async () => {

        });

    });

    describe("function: updateTokenSplitPercents works correctly", async () => {

        it("Should ###", async () => {

        });

    });

    describe("function: updateRaisedSplitPercents works correctly", async () => {

        it("Should ###", async () => {

        });

    });
   
    describe("function: updateLpLock works correctly", async () => {

        it("Should ###", async () => {

        });

    });

});