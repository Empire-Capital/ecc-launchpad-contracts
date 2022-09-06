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

describe("Should deploy contract correctly", async () => {

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