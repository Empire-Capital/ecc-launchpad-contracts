import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { LGE, MockFactory, MockRouter, MockWETH, MockEscrow, MockERC20, EmpireERC20, IERC20 } from "../typechain";
import { Signer, Wallet, BigNumber, providers} from "ethers";

let lge: LGE;
let mockWETH: MockWETH;
let mockFactory: MockFactory;
let mockEscrow: MockEscrow;

let owner: SignerWithAddress;
let user: SignerWithAddress;

const feeToSetterAddress = '0x488874e8b9C7999a853b2b2f4c1Dd8b952B3c2dB';

// LGE Setup Variables
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
let mockRouter: MockRouter;

let projectTeamAddress = "0x488874e8b9C7999a853b2b2f4c1Dd8b952B3c2dB";
let projectAdminAddress = "0x488874e8b9C7999a853b2b2f4c1Dd8b952B3c2dB";

let lpLockStatus = false;
let lpLockDuration;
let lpLockContract;

let raisedLiqPercent = 10000;     // 100%
let raisedTeamPercent = 0;        // 0%
let raisedAdminPercent = 0;       // 0%

let tokenLiqPercent;
let tokenBonusPercent;
let tokenTeamPercent;

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
    lge = (await (await ethers.getContractFactory("LGE")).deploy()) as LGE;
    await lge.deployed();

    // Setup LGE
    await lge.setupPresale(
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
        mockRouter.address,
        projectTeamAddress,
        projectAdminAddress,
        lpLockStatus,
        lpLockDuration,
        lpLockContract,
        raisedLiqPercent,
        raisedTeamPercent,
        raisedAdminPercent,
        tokenLiqPercent,
        tokenBonusPercent,
        tokenTeamPercent
    );

});

describe("Should deploy LGE contract correctly", async () => {

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

    it("Should set requireAmount correctly", async () => {
        expect(await lge.requireAmount()).to.be.equal(requireAmount);
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

describe("Should perform LGE correctly for user functions", async () => {

    describe("function: deposit works correctly", async () => {

        it("Should only allow deposits >= presaleMin", async () => {
            await lge.startPresale(100);
            await expect(lge.deposit({value: 1})).to.be.reverted;
            await expect(lge.deposit({value: presaleMin})).to.not.be.reverted;
        });

        it("Should not allow deposits if value will make currentDepositAmount >= hardCapAmount", async () => {
            await lge.startPresale(100);
            await expect(lge.deposit({value: hardCapAmount})).to.not.be.reverted;
            await expect(lge.deposit({value: 1})).to.be.reverted;
        });

        it("Should only allow deposits duringSale", async () => {
            await expect(lge.deposit({value: presaleMin})).to.be.reverted;
            await lge.startPresale(100);
            await expect(lge.deposit({value: presaleMin})).to.not.be.reverted;
            await expect(await lge.status()).to.be.equal(1);
            await lge.completePresale();
            await expect(lge.deposit({value: presaleMin})).to.be.reverted;
        });

        it("Should ensure user has requireTokens if enabled", async () => {
            await lge.updateRequiredToken(requireAmount, requireTokenAddress, true);
            await lge.startPresale(100);
            await expect(lge.deposit({value: presaleMin})).to.not.be.reverted;
            await expect(lge.connect(user).deposit({value: presaleMin})).to.be.reverted;
            await requireToken.transfer(user.address, requireAmount);
            await expect(lge.connect(user).deposit({value: presaleMin})).to.not.be.reverted;
        });

        it("Should add to the currentPresaleParticipants counter if first deposit", async () => {
            await lge.startPresale(100);
            await lge.deposit({value: presaleMin});
            expect(await lge.currentPresaleParticipants()).to.be.equal(1);
        });

        it("Should not add to the currentPresaleParticipants counter if already deposited", async () => {
            await lge.startPresale(100);
            await lge.deposit({value: presaleMin});
            expect(await lge.currentPresaleParticipants()).to.be.equal(1);
            await lge.deposit({value: presaleMin});
            expect(await lge.currentPresaleParticipants()).to.be.equal(1);
        });

        it("Should update presaleContribution for user", async () => {
            await lge.startPresale(100);
            await lge.deposit({value: presaleMin});
            expect(await lge.presaleContribution(owner.address)).to.be.equal(presaleMin);

        });
        
        it("Should update currentDepositAmount for total deposits", async () => {
            await lge.startPresale(100);
            await lge.deposit({value: presaleMin});
            expect(await lge.currentDepositAmount()).to.be.equal(presaleMin);
        });

    });

    describe("function: claim works correctly", async () => {

        it("Should only allow claims if afterSaleSuccess", async () => {
            await lge.startPresale(100);
            await lge.deposit({value: softCapAmount});
            await lge.completePresale();
            expect(await lge.claim()).to.not.be.reverted;
        });

        it("Should only allow claims if presaleContribution[user] > 0", async () => {
            await lge.startPresale(100);
            await lge.connect(user).deposit({value: softCapAmount});
            await lge.completePresale();
            expect(await lge.claim()).to.be.reverted;
            expect(await lge.connect(user).claim()).to.not.be.reverted;
        });

        it("Should transfer correct amount of LP to user", async () => {
            await lge.startPresale(100);
            await lge.deposit({value: softCapAmount});
            await lge.completePresale();
            let lpToken: MockERC20;
            expect(await lge.lpCreated()).to.be.equal(await lpToken.balanceOf(owner.address));
        });

        it("Should transfer correct amount of bonus tokens if enabled", async () => {
            await lge.startPresale(100);
            await lge.connect(user).deposit({value: softCapAmount});
            await lge.completePresale();
            expect(await lge.bonusTokens()).to.be.equal(await sellToken.balanceOf(user.address));
        });

    });
   
    describe("function: refund works correctly", async () => {

        it("Should only allow refunds if afterSaleFailure", async () => {
            expect(await lge.refund()).to.be.reverted;
            await lge.startPresale(100);
            expect(await lge.refund()).to.be.reverted;
            await lge.completePresale();
            expect(await lge.refund()).to.not.be.reverted;
        });

        it("Should only allow refunds if presaleContribution[user] > 0", async () => {
            await lge.startPresale(100);
            await lge.deposit({value: presaleMin});
            await lge.completePresale();
            expect(await lge.refund()).to.not.be.reverted;
            expect(await lge.connect(user).refund()).to.be.reverted;
        });
        
        it("Should refund the same amount that the user has deposited", async () => {
            const ethBefore = await ethers.provider.getBalance(owner.address);
            await lge.startPresale(100);
            await lge.deposit({value: presaleMin});
            await lge.completePresale();
            await lge.refund();
            const ethAfter = await ethers.provider.getBalance(owner.address);
            expect(ethBefore).to.be.closeTo(ethAfter, 1);
        });

        it("Should remove from the currentPresaleParticipants counter", async () => {
            await lge.startPresale(100);
            await lge.deposit({value: presaleMin});
            expect(await lge.currentPresaleParticipants).to.be.equal(1);
            await lge.completePresale()
            await lge.refund();
            expect(await lge.currentPresaleParticipants).to.be.equal(0);
        });
    });

    describe("function: completePresale works correctly", async () => {

        it("Should only allow completePresale if duringSale", async () => {
            expect(await lge.completePresale()).to.be.reverted;
            await lge.startPresale(100);
            expect(await lge.completePresale()).to.not.be.reverted;
            await lge.completePresale();
            expect(await lge.completePresale()).to.be.reverted;
        });

        it("Should set afterSaleFailure if currentDepositAmount < softCapAmount", async () => {
            await lge.startPresale(100);
            await lge.deposit({value: presaleMin});
            expect(await lge.status()).to.equal(3);
        });

        it("Should return all sellToken back to projectTeamAddress if presale failure", async () => {
            await lge.startPresale(100);
            const sellTokenBefore = await sellToken.balanceOf(lge.address);
            await lge.completePresale();
            const sellTokenAfter = await sellToken.balanceOf(projectTeamAddress);
            expect(sellTokenBefore).to.be.equal(sellTokenAfter);
        });

        it("Should set afterSaleSuccess if currentDepositAmount >= softCapAmount", async () => {
            await lge.startPresale(100);
            await lge.deposit({value: softCapAmount});
            expect(await lge.status()).to.equal(2);
        });

        // it("Should create liquidity with tokenLiqPercent + raisedLiqPercent", async () => {

        // });

        // it("Should lock LP if router = empireDEX & lpLockStatus = true", async () => {

        // });

        // it("Should transfer tokenTeamPercent to projectTeamAddress if presale success", async () => {

        // });

        // it("Should transfer raisedTeamPercent allocated to projectTeamAddress", async () => {

        // });

        // it("Should transfer raisedAdminPercent allocated to projectAdminAddress", async () => {

        // });

    });

});

describe("Should perform LGE correctly for admin functions", async () => {

    describe("function: startPresale works correctly", async () => {

        it("Should only allow startPresale if beforeSale", async () => {
            await lge.startPresale(100);
            await expect(lge.startPresale(1000)).to.be.reverted;
            await lge.completePresale();
            await expect(lge.startPresale(1000)).to.be.reverted;
        });

        it("Should set start time as block.timestamp when function called", async () => {
            const _startTime = await lge.startPresale(100);
            expect (await lge.start()).to.be.equal(_startTime);
        });

        it("Should set end time as start + the input argument of presaleHours", async () => {
            await lge.startPresale(100);
            expect (Number(await lge.end())).to.be.equal(Number(await lge.start()) + 100)
        });

        it("Should set status as duringSale", async () => {
            await lge.startPresale(100);
            expect (await lge.status()).to.equal(1);
        });

    });

    describe("function: extendPresale works correctly", async () => {

        it("Should only allow completePresale if duringSale", async () => {
            await expect(lge.extendPresale(1000)).to.be.reverted;
            await lge.startPresale(100);
            await expect(await lge.status()).to.be.equal(1);
            await expect(lge.extendPresale(1000)).to.not.be.reverted;
            await lge.completePresale();
            await expect(await lge.status()).to.be.equal(3);
            await expect(lge.extendPresale(1000)).to.be.reverted;
        });

        it("Should update end time correctly", async () => {
            await lge.startPresale(100);
            const beforeEndTime = await lge.end();
            await lge.extendPresale(1000);
            expect (beforeEndTime).to.be.equal(Number(await lge.end()) + 1000);
        });

    });
   
    describe("function: updateCrossChainBalances works correctly", async () => {

        it("Should only allow completePresale if beforeSale or duringSale", async () => {
            await expect(lge.updateCrossChainBalances([user.address], [1])).to.not.be.reverted;
            await lge.startPresale(100);
            await expect(await lge.status()).to.be.equal(1);
            await expect(lge.updateCrossChainBalances([user.address], [1])).to.not.be.reverted;
            await lge.completePresale();
            await expect(await lge.status()).to.be.equal(3);
            await expect(lge.updateCrossChainBalances([user.address], [1])).to.be.reverted;
        });

        it("Should add to the currentPresaleParticipants counter if first deposit", async () => {
            await lge.startPresale(100);
            expect(await lge.currentPresaleParticipants()).to.be.equal(0);
            await lge.deposit({value: presaleMin});
            expect(await lge.currentPresaleParticipants()).to.be.equal(1);
        });

        it("Should not add to the currentPresaleParticipants counter if already deposited", async () => {
            await lge.startPresale(100);
            expect(await lge.currentPresaleParticipants()).to.be.equal(0);
            await lge.deposit({value: presaleMin});
            expect(await lge.currentPresaleParticipants()).to.be.equal(1);
            await lge.deposit({value: presaleMin});
            expect(await lge.currentPresaleParticipants()).to.be.equal(1);
        });

        it("Should update presaleContribution for user", async () => {
            await lge.startPresale(100);
            await lge.deposit({value: presaleMin});
            expect(await lge.presaleContribution(owner.address)).to.be.equal(presaleMin);
        });
        
        it("Should update currentDepositAmount for total deposits", async () => {
            await lge.startPresale(100);
            await lge.deposit({value: presaleMin});
            expect(await lge.currentDepositAmount()).to.be.equal(presaleMin);
        });

    });

});

describe("Should perform admin update variable functions correctly", async () => {

    describe("function: updateSellToken works correctly", async () => {

        it("Should only be callable when Status.beforeSale", async () => {
            await expect(lge.updateSoftCapAmount(10)).to.not.be.reverted;
            await lge.startPresale(100);
            await expect(await lge.status()).to.be.equal(1);
            await expect(lge.updateSoftCapAmount(10)).to.be.reverted;
        });

        it("Should update sellToken correctly", async () => {
            await lge.updateSellToken("0x0000000000000000000000000000000000000000", 1);
            expect (await lge.sellToken()).to.be.equal("0x0000000000000000000000000000000000000000");
            expect (await lge.sellTokenDecimals()).to.be.equal(1);
        });

    });

    describe("function: updateSellRate works correctly", async () => {

        it("Should only be callable when Status.beforeSale", async () => {
            await expect(lge.updateSoftCapAmount(10)).to.not.be.reverted;
            await lge.startPresale(100);
            await expect(await lge.status()).to.be.equal(1);
            await expect(lge.updateSoftCapAmount(10)).to.be.reverted;
        });

        it("Should update sellRate correctly", async () => {
            await lge.updateSellRate(1);
            expect (await lge.sellRate()).to.be.equal(1);
        });

    });

    describe("function: updateMininmum works correctly", async () => {

        it("Should only be callable when Status.beforeSale", async () => {
            await expect(lge.updateSoftCapAmount(10)).to.not.be.reverted;
            await lge.startPresale(100);
            await expect(await lge.status()).to.be.equal(1);
            await expect(lge.updateSoftCapAmount(10)).to.be.reverted;
        });

        it("Should update presaleMinimum correctly", async () => {
            await lge.updateMinimum(1);
            expect (await lge.presaleMin()).to.be.equal(1);
        });

    });

    describe("function: updateSoftCapAmount works correctly", async () => {

        it("Should only be callable when Status.beforeSale", async () => {
            await expect(lge.updateSoftCapAmount(10)).to.not.be.reverted;
            await lge.startPresale(100);
            await expect(await lge.status()).to.be.equal(1);
            await expect(lge.updateSoftCapAmount(10)).to.be.reverted;
        });

        it("Should update softCapAmount correctly", async () => {
            await lge.updateSoftCapAmount(1);
            expect (await lge.softCapAmount()).to.be.equal(1);
        });

    });

    describe("function: updateHardCapAmount works correctly", async () => {

        it("Should only be callable when Status.beforeSale", async () => {
            await expect(lge.updateSoftCapAmount(10)).to.not.be.reverted;
            await lge.startPresale(100);
            await expect(await lge.status()).to.be.equal(1);
            await expect(lge.updateSoftCapAmount(10)).to.be.reverted;
        });

        it("Should update hardCapAmount correctly", async () => {
            await lge.updateHardCapAmount(1);
            expect (await lge.hardCapAmount()).to.be.equal(1);
        });

    });
   
    describe("function: updateRequiredToken works correctly", async () => {

        it("Should only be callable when Status.beforeSale", async () => {
            await expect(lge.updateRequiredToken(1, "0x0000000000000000000000000000000000000000", true)).to.not.be.reverted;
            await lge.startPresale(100);
            await expect(await lge.status()).to.be.equal(1);
            await expect(lge.updateRequiredToken(1, "0x0000000000000000000000000000000000000000", true)).to.be.reverted;
        });

        it("Should update requireToken, requireAmount & requireTokenStatus correctly", async () => {
            await lge.updateRequiredToken(1, "0x0000000000000000000000000000000000000000", true);
            expect (await lge.requireTokenAmount()).to.be.equal(1);
            expect (await lge.requireToken()).to.be.equal("0x0000000000000000000000000000000000000000");
            expect (await lge.requireTokenStatus()).to.be.equal(true);
        });

    });

    describe("function: updateCrossChainPresale", async () => {
        it("Should only be callable when Status.beforeSale", async () => {
            await expect(lge.updateCrossChainPresale(true)).to.not.be.reverted;
            await lge.startPresale(100);
            await expect(lge.status()).to.be.equal(1);
            await expect(lge.updateCrossChainPresale(true)).to.be.reverted;
        });

        it("Should update crossChainPresale correctly", async () => {
            await lge.updateCrossChainPresale(true);
            expect (await lge.crossChainPresale()).to.be.equal(true);
        });
    });

    describe("function: updateRouter", async () => {
        it("Should only be callable when Status.beforeSale", async () => {
            await expect(lge.updateRouter(0x0)).to.not.be.reverted;
            await lge.startPresale(100);
            await expect(lge.status()).to.be.equal(1);
            await expect(lge.router(0x0)).to.be.reverted;
        });

        it("Should update presaleTeamAddress correctly", async () => {
            await lge.updateRouter(0x0);
            expect (await lge.router()).to.be.equal(0x0);
        });
    });

    describe("function: updatePresaleTeamAddress", async () => {
        it("Should only be callable when Status.beforeSale", async () => {
            await expect(lge.updatePresaleTeamAddress(0x0)).to.not.be.reverted;
            await lge.startPresale(100);
            await expect(lge.status()).to.be.equal(1);
            await expect(lge.updatePresaleTeamAddress(0x0)).to.be.reverted;
        });

        it("Should update presaleTeamAddress correctly", async () => {
            await lge.updatePresaleTeamAddress(0x0);
            expect (await lge.presaleTeamAddress()).to.be.equal(0x0);
        });
    });

    describe("function: updatePresaleAdminAddress", async () => {
        it("Should only be callable when Status.beforeSale", async () => {
            await expect(lge.updatePresaleAdminAddress(0x0)).to.not.be.reverted;
            await lge.startPresale(100);
            await expect(lge.status()).to.be.equal(1);
            await expect(lge.updatePresaleAdminAddress(0x0)).to.be.reverted;
        });

        it("Should update presaleAdminAddress correctly", async () => {
            await lge.updatePresaleAdminAddress(0x0);
            expect (await lge.presaleAdminAddress()).to.be.equal(0x0);
        });
    });

    describe("function: updateLpLock works correctly", async () => {

        it("Should only be callable when Status.beforeSale", async () => {
            await expect(lge.updateSoftCapAmount(10)).to.not.be.reverted;
            await lge.startPresale(100);
            await expect(await lge.status()).to.be.equal(1);
            await expect(lge.updateSoftCapAmount(10)).to.be.reverted;
        });

        it("Should update lpLockStatus, lpLockDuration & lpLockContract correctly", async () => {
            await lge.updateLpLock(true, 1, "0x0000000000000000000000000000000000000000");
            expect (await lge.lpLockStatus()).to.be.equal(true);
            expect (await lge.lpLockDuration()).to.be.equal(1);
            expect (await lge.lpLockContract()).to.be.equal("0x0000000000000000000000000000000000000000");
        });

    });

    describe("function: updateRaisedSplitPercents works correctly", async () => {

        it("Should only be callable when Status.beforeSale", async () => {
            await expect(lge.updateSoftCapAmount(10)).to.not.be.reverted;
            await lge.startPresale(100);
            await expect(await lge.status()).to.be.equal(1);
            await expect(lge.updateSoftCapAmount(10)).to.be.reverted;
        });

        it("Should update raisedLiqPercent, raisedTeamPercent, raisedAdminPercent correctly", async () => {
            await lge.updateRaisedSplitPercents(4000, 4000, 2000);
            expect (await lge.raisedLiqPercent()).to.be.equal(4000);
            expect (await lge.raisedTeamPercent()).to.be.equal(4000);
            expect (await lge.raisedAdminPercent()).to.be.equal(2000);
        });

    });

    describe("function: updateTokenSplitPercents works correctly", async () => {

        it("Should only be callable when Status.beforeSale", async () => {
            await expect(lge.updateSoftCapAmount(10)).to.not.be.reverted;
            await lge.startPresale(100);
            await expect(await lge.status()).to.be.equal(1);
            await expect(lge.updateSoftCapAmount(10)).to.be.reverted;
        });

        it("Should update ", async () => {
            await lge.updateTokenSplitPercents(4000, 4000, 2000);
            expect (await lge.liquidityPercent()).to.be.equal(4000);
            expect (await lge.bonusTokenPercent()).to.be.equal(4000);
            expect (await lge.teamPercent()).to.be.equal(2000);
        });

    });

});

describe("Should restrict access to onlyOwner functions to owner", async () => {

    it("Should allow owner to call onlyOwner function", async () => {
        await expect(lge.updateSoftCapAmount(1)).to.not.be.reverted;
    });

    it("Should restrict non-owner to call onlyOwner function", async () => {
        await expect(lge.connect(user).updateSoftCapAmount(1)).to.be.reverted;
    });

});