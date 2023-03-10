import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { PresaleETH, MockWETH, MockERC20 } from "../typechain";
import { Signer, Wallet, BigNumber} from "ethers";

let presaleETH: PresaleETH;
let weth: MockWETH;

let owner: SignerWithAddress;
let user: SignerWithAddress;

// Presale Setup Variables
let sellToken: MockERC20;
let sellTokenDecimals;
let sellRate = 1;

let presaleMin = ethers.utils.parseEther("1");
let softCapAmount = ethers.utils.parseEther("100");
let hardCapAmount = ethers.utils.parseEther("125");

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

    // Deploy SellToken
    sellToken = (await (await ethers.getContractFactory("MockERC20")).deploy()) as MockERC20;
    await sellToken.deployed();

    // Deploy RequireToken
    requireToken = (await (await ethers.getContractFactory("MockERC20")).deploy()) as MockERC20;
    await requireToken.deployed();

    // Deploy PresaleETH
    presaleETH = (await (await ethers.getContractFactory("PresaleETH")).deploy()) as PresaleETH;
    await presaleETH.deployed();

    // Setup Presale
    await presaleETH.setupPresale(
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
    );
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

//     it("Should set requireAmount correctly", async () => {
//         expect(await presaleETH.requireAmount()).to.be.equal(requireAmount);
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

it("Should ###", async () => {
            
});


describe("Should perform presale correctly for user functions", async () => {

    describe("function: deposit works correctly", async () => {

        it("Should check deposit amount is more than presale minimum", async () => {
            
        });

        it("Should ensure that the deposit will not put currentDepositAmount above hardCapAmount", async () => {
            
        });

        it("Should only be callable when Status.duringSale", async () => {
            await expect(presaleETH.deposit({msg.value: 1})).to.be.reverted;
            await presaleETH.startPresale(100);
            await expect(await presaleETH.status()).to.be.equal(1);
            await expect(presaleETH.deposit({msg.value: 1})).to.not.be.reverted;
        });

        it("Should check user holds minimum reqireTokens if requireTokenStatus = true", async () => {

        });

        it("Should update currentPresaleParticipants", async () => {
            
        });

        it("Should update presaleContribution of user", async () => {
            
        });

        it("Should update currentDepositAmount", async () => {
            
        });
        
    });

    describe("function: claim works correctly", async () => {

        it("Should only be callable when Status.afterSaleSuccess", async () => {
            
        });

    });
   
    describe("function: refund works correctly", async () => {

        it("Should only be callable when Status.afterSaleFailure", async () => {
            
        });

    });

    describe("function: completePresale works correctly", async () => {

        it("Should only be callable when Status.duringSale", async () => {
            
        });

        it("Should ###", async () => {

        });

    });
    
});

describe("Should perform presale correctly for admin functions", async () => {

    describe("function: startPresale works correctly", async () => {

        it("Should only be callable when Status.beforeSale", async () => {
            
        });

        it("Should ###", async () => {

        });

    });

    describe("function: extendPresale works correctly", async () => {

        it("Should only be callable when Status.duringSale", async () => {
            
        });

        it("Should ###", async () => {

        });

    });
   
    describe("function: updateCrossChainBalances works correctly", async () => {

        it("Should only be callable when Status.beforeSale or Status.afterSale", async () => {
            
        });

        it("Should ###", async () => {

        });

    });

});

describe("Should perform admin update variable functions correctly", async () => {

    describe("function: updateSellToken works correctly", async () => {

        it("Should only be callable when Status.beforeSale", async () => {
            await expect(presaleETH.updateSoftCapAmount(10)).to.not.be.reverted;
            await presaleETH.startPresale(100);
            await expect(await presaleETH.status()).to.be.equal(1);
            await expect(presaleETH.updateSoftCapAmount(10)).to.be.reverted;
        });

        it("Should update sellToken correctly", async () => {
            await presaleETH.updateSellToken("0x0000000000000000000000000000000000000000", 1);
            expect (await presaleETH.sellToken()).to.be.equal("0x0000000000000000000000000000000000000000");
            expect (await presaleETH.sellTokenDecimals()).to.be.equal(1);
        });

    });

    describe("function: updateSellRate works correctly", async () => {

        it("Should only be callable when Status.beforeSale", async () => {
            await expect(presaleETH.updateSoftCapAmount(10)).to.not.be.reverted;
            await presaleETH.startPresale(100);
            await expect(await presaleETH.status()).to.be.equal(1);
            await expect(presaleETH.updateSoftCapAmount(10)).to.be.reverted;
        });

        it("Should update sellRate correctly", async () => {
            await presaleETH.updateSellRate(1);
            expect (await presaleETH.sellRate()).to.be.equal(1);
        });

    });

    describe("function: updateMinimum works correctly", async () => {

        it("Should only be callable when Status.beforeSale", async () => {
            await expect(presaleETH.updateSoftCapAmount(10)).to.not.be.reverted;
            await presaleETH.startPresale(100);
            await expect(await presaleETH.status()).to.be.equal(1);
            await expect(presaleETH.updateSoftCapAmount(10)).to.be.reverted;
        });

        it("Should update updateMinimum correctly", async () => {
            await presaleETH.updateMin(1);
            expect (await presaleETH.updateMinimum()).to.be.equal(1);
        });

    });

    describe("function: updateSoftCapAmount works correctly", async () => {

        it("Should only be callable when Status.beforeSale", async () => {
            await expect(presaleETH.updateSoftCapAmount(10)).to.not.be.reverted;
            await presaleETH.startPresale(100);
            await expect(await presaleETH.status()).to.be.equal(1);
            await expect(presaleETH.updateSoftCapAmount(10)).to.be.reverted;
        });

        it("Should update softCapAmount correctly", async () => {
            await presaleETH.updateSoftCapAmount(1);
            expect (await presaleETH.softCapAmount()).to.be.equal(1);
        });

    });

    describe("function: updateHardCapAmount works correctly", async () => {

        it("Should only be callable when Status.beforeSale", async () => {
            await expect(presaleETH.updateSoftCapAmount(10)).to.not.be.reverted;
            await presaleETH.startPresale(100);
            await expect(await presaleETH.status()).to.be.equal(1);
            await expect(presaleETH.updateSoftCapAmount(10)).to.be.reverted;
        });

        it("Should update hardCapAmount correctly", async () => {
            await presaleETH.updateHardCapAmount(1);
            expect (await presaleETH.hardCapAmount()).to.be.equal(1);
        });

    });
   
    describe("function: updateRequiredToken works correctly", async () => {

        it("Should only be callable when Status.beforeSale", async () => {
            await expect(presaleETH.updateSoftCapAmount(10)).to.not.be.reverted;
            await presaleETH.startPresale(100);
            await expect(await presaleETH.status()).to.be.equal(1);
            await expect(presaleETH.updateSoftCapAmount(10)).to.be.reverted;
        });

        it("Should update requireToken, requireAmount & requireTokenStatus correctly", async () => {
            await presaleETH.updateRequiredToken(1, "0x0000000000000000000000000000000000000000", true);
            expect (await presaleETH.requireAmount()).to.be.equal(1);
            expect (await presaleETH.requireToken()).to.be.equal("0x0000000000000000000000000000000000000000");
            expect (await presaleETH.requireTokenStatus()).to.be.equal(true);
        });

    });

    describe("function: updatePresaleTeamAddress", async () => {
        it("Should only be callable when Status.beforeSale", async () => {
            await expect(presaleETH.updatePresaleTeamAddress(0x0)).to.not.be.reverted;
            await presaleETH.startPresale(100);
            await expect(presaleETH.status()).to.be.equal(1);
            await expect(presaleETH.updatePresaleTeamAddress(0x0)).to.be.reverted;
        });

        it("Should update presaleTeamAddress correctly", async () => {
            await presaleETH.updatePresaleTeamAddress(0x0);
            expect (await presaleETH.presaleTeamAddress()).to.be.equal(0x0);
        });
    });

    describe("function: updatePresaleAdminAddress", async () => {
        it("Should only be callable when Status.beforeSale", async () => {
            await expect(presaleETH.updatePresaleAdminAddress(0x0)).to.not.be.reverted;
            await presaleETH.startPresale(100);
            await expect(presaleETH.status()).to.be.equal(1);
            await expect(presaleETH.updatePresaleAdminAddress(0x0)).to.be.reverted;
        });

        it("Should update presaleAdminAddress correctly", async () => {
            await presaleETH.updatePresaleAdminAddress(0x0);
            expect (await presaleETH.presaleAdminAddress()).to.be.equal(0x0);
        });
    });

    describe("function: updateVestingInfo works correctly", async () => {

        it("Should only be callable when Status.beforeSale", async () => {
            await expect(presaleETH.updateSoftCapAmount(10)).to.not.be.reverted;
            await presaleETH.startPresale(100);
            await expect(await presaleETH.status()).to.be.equal(1);
            await expect(presaleETH.updateSoftCapAmount(10)).to.be.reverted;
        });

        it("Should should update vestingStatus, vestingPercent & vestingContract correctly", async () => {
            await presaleETH.updateVestingInfo(true, 1, "0x0000000000000000000000000000000000000000");
            expect(await presaleETH.vestingStatus()).to.be.equal(true);
            expect(await presaleETH.vestingPercent()).to.be.equal(1);
            expect(await presaleETH.vestingContract()).to.be.equal("0x0000000000000000000000000000000000000000");
        });

    });

});

describe("Should restrict access to onlyOwner functions to owner", async () => {

    it("Should allow owner to call onlyOwner function", async () => {
        await expect(presaleETH.updateSoftCapAmount(1)).to.not.be.reverted;
    });

    it("Should restrict non-owner to call onlyOwner function", async () => {
        await expect(presaleETH.connect(user).updateSoftCapAmount(1)).to.be.reverted;
    });

});