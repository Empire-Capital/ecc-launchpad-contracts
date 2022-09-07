import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { PresaleToken, MockWETH, MockERC20 } from "../typechain";
import { Signer, Wallet, BigNumber} from "ethers";

// Typechain Setup
let presaleToken: PresaleToken;
let depositToken: MockERC20;
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
const projectTeamAddress = "0x0000000000000000000000000000000000000000";

const requireTokenAmount = ethers.utils.parseEther("150000");
const requireTokenAddress = "0xC84D8d03aA41EF941721A4D77b24bB44D7C7Ac55";
const requireTokenStatus = false;

const crossChainPresale = false;

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

    // Deploy LGE
    presaleToken = (await (await ethers.getContractFactory("PresaleToken")).deploy(depositToken.address, sellToken.address)) as PresaleToken;
    await presaleToken.deployed();

});

describe("Should deploy contract correctly", async () => {

    it("Should set depositToken correctly", async () => {
        expect(await presaleToken.sellToken()).to.be.equal(sellToken.address);
    });

    it("Should set sellToken correctly", async () => {
        expect(await presaleToken.sellToken()).to.be.equal(sellToken.address);
    });

    it("Should set sellTokenDecimals correctly", async () => {
        expect(await presaleToken.sellTokenDecimals()).to.be.equal(await sellToken.decimals());
    });

    it("Should set sellRate correctly", async () => {
        expect(await presaleToken.sellRate()).to.be.equal(sellRate);
    });

    it("Should set presaleMin correctly", async () => {
        expect(await presaleToken.presaleMin()).to.be.equal(presaleMin);
    });

    it("Should set softCapAmount correctly", async () => {
        expect(await presaleToken.softCapAmount()).to.be.equal(softCapAmount);
    });

    it("Should set hardCapAmount correctly", async () => {
        expect(await presaleToken.hardCapAmount()).to.be.equal(hardCapAmount);
    });

    it("Should set projectTeamAddress correctly", async () => {
        expect(await presaleToken.projectTeamAddress()).to.be.equal(projectTeamAddress);
    });

    it("Should set requireTokenAmount correctly", async () => {
        expect(await presaleToken.requireTokenAmount()).to.be.equal(requireTokenAmount);
    });

    it("Should set requireToken correctly", async () => {
        expect(await presaleToken.requireToken()).to.be.equal(requireTokenAddress);
    });

    it("Should set requireTokenStatus correctly", async () => {
        expect(await presaleToken.requireTokenStatus()).to.be.equal(requireTokenStatus);
    });

    it("Should set crossChainPresale correctly", async () => {
        expect(await presaleToken.crossChainPresale()).to.be.equal(crossChainPresale);
    });

});

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

//         it("Should ###", async () => {

//         });

//     });

//     describe("function: updateHardCapAmount works correctly", async () => {

//         it("Should ###", async () => {

//         });

//     });
   
//     describe("function: updateSellToken works correctly", async () => {

//         it("Should ###", async () => {

//         });

//     });

//     describe("function: updateSellRate works correctly", async () => {

//         it("Should ###", async () => {

//         });

//     });

//     describe("function: updateMin works correctly", async () => {

//         it("Should ###", async () => {

//         });

//     });
   
//     describe("function: updateRequiredToken works correctly", async () => {

//         it("Should ###", async () => {

//         });

//     });

//     describe("function: updateVestingInfo works correctly", async () => {

//         it("Should ###", async () => {

//         });

//     });

// });

// describe("Should perform function: recoverNative correctly", async () => {

//     it("Should ###", async () => {

//     });
    
// });