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
let weth: MockWETH;

let owner: SignerWithAddress;
let user: SignerWithAddress;

// Variebls Setup

beforeEach(async () => {

    [owner, user] = await ethers.getSigners();

    // Deploy DepositToken
    depositToken = (await (await ethers.getContractFactory("MockERC20")).deploy()) as MockERC20;
    await depositToken.deployed();

    // Deploy SellToken
    sellToken = (await (await ethers.getContractFactory("MockERC20")).deploy()) as MockERC20;
    await sellToken.deployed();

    // Deploy LGE
    presaleToken = (await (await ethers.getContractFactory("PresaleToken")).deploy(depositToken.address, sellToken.address)) as PresaleToken;
    await presaleToken.deployed();

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

    it("Should set requireTokenAmount correctly", async () => {

    });

    it("Should set requireToken correctly", async () => {

    });

    it("Should set requireTokenStatus correctly", async () => {

    });

    it("Should set crossChainPresale correctly", async () => {

    });

});

describe("Should perform presale correctly for user functions", async () => {

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

describe("Should perform presale correctly for admin functions", async () => {

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

    describe("function: updateVestingInfo works correctly", async () => {

        it("Should ###", async () => {

        });

    });

});

describe("Should perform function: recoverNative correctly", async () => {

    it("Should ###", async () => {

    });
    
});