// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.17;

import "./libraries/Ownable.sol";
import "./libraries/Address.sol";
import "./libraries/ReentrancyGuard.sol";
import "./libraries/SafeERC20.sol";
import "./interfaces/IERC20.sol";

import "./interfaces/IEmpireFactory.sol";
import "./interfaces/IEmpirePair.sol";
import "./interfaces/IEmpireRouter.sol";
import "./interfaces/IEmpireLocker.sol";
import "./interfaces/IWETH.sol";

/**
 * @title Liquidity Generation Event ETH
 * @author Empire Capital (Tranquil Flow, Splnty)
 * @dev A contract for liquidity Generation Events that accepts native coins
 *
 * Credit to CORE Vault for original LGE contract. https://github.com/cVault-finance
 * We stand on the shoulders of giants.
 */
contract LGE is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Address for address payable;

    enum Status {
        beforeSale,
        duringSale,
        afterSaleSuccess,
        afterSaleFailure
    }

    Status public status;
    address public empireRouter = 0xCfAA4334ec6d5bBCB597e227c28D84bC52d5B5A4;

    // LGE Setup Variables
    address public sellToken;
    uint256 public sellTokenDecimals;
    uint256 public sellRate;

    uint256 public presaleMin;
    uint256 public softCapAmount;
    uint256 public hardCapAmount;

    uint256 public requireTokenAmount;
    address public requireToken;
    bool    public requireTokenStatus;

    bool    public crossChainPresale;
    IEmpireRouter public router;

    address public projectTeamAddress;
    address public projectAdminAddress;

    bool    public lpLockStatus;
    uint256 public lpLockDuration;  // 0 = infinite
    address public lpLockContract;

    uint256 public raisedLiqPercent;    // 1000 = 10%
    uint256 public raisedTeamPercent;   // 1000 = 10%
    uint256 public raisedAdminPercent;  // 1000 = 10%

    uint256 public tokenLiqPercent;     // 1000 = 10%
    uint256 public tokenBonusPercent;   // 1000 = 10%
    uint256 public tokenTeamPercent;    // 1000 = 10%

    // LGE Process Variables
    uint256 public start;
    uint256 public end;
    address public pair;
    uint256 public lpCreated;
    uint256 public bonusTokens;
    uint256 public currentDepositAmount;
    uint256 public currentPresaleParticipants;

    // LGE User Variables
    mapping(address => uint256) public presaleContribution;

    /// @dev Can define 'Setup Variables' in constructor OR through setupPresale()
    constructor() {
        // sellToken = 0x0000000000000000000000000000000000000000;
        // sellTokenDecimals = 18;
        // sellRate = 1;

        // presaleMin = 1 * 10**18; // 1 ETH
        // softCapAmount = 100 * 10**18; // 100 ETH
        // hardCapAmount = 125 * 10**18; // 125 ETH

        // requireTokenAmount = 150000 * 10**18; // 150K
        // requireToken = 0xC84D8d03aA41EF941721A4D77b24bB44D7C7Ac55; // ECC
        // requireTokenStatus = false;

        // crossChainPresale = false;
        // router = IEmpireRouter(0xCfAA4334ec6d5bBCB597e227c28D84bC52d5B5A4);

        // projectTeamAddress = 0x54CF8930796e1e0c7366c6F04D1Ea6Ad6FA5B708;
        // projectAdminAddress = 0x54CF8930796e1e0c7366c6F04D1Ea6Ad6FA5B708;

        // lpLockStatus;
        // lpLockDuration;
        // lpLockContract;

        // raisedLiqPercent = 10000; // 1000 = 10%
        // raisedTeamPercent;
        // raisedAdminPercent;

        // tokenLiqPercent;  // 1000 = 10%
        // tokenBonusPercent;
        // tokenTeamPercent;
    }

    receive() external payable {
        deposit();
    }

    /*//////////////////////////////////////////////////////////////
                            USER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Deposits `msg.value` into the presale
    /// @dev Enters the presale
    function deposit() public payable nonReentrant {
        uint256 value = msg.value;
        address user = msg.sender;
        require(
            value >= presaleMin,
            "Must deposit more than presale minimum"
        );
        require(
            value + currentDepositAmount <= hardCapAmount,
            "No more deposit allowed. Presale is full"
        );
        require(status == Status.duringSale, "Presale is not active");

        if (requireTokenStatus) {
            require(IERC20(requireToken).balanceOf(user) > requireTokenAmount,
            "User does not hold enough required tokens");
        }

        if (presaleContribution[user] == 0) {currentPresaleParticipants++;}

        //Record and account the native coin entered into presale
        presaleContribution[user] += value;
        currentDepositAmount += value;
    }

    /// @dev Claims tokens after the presale is finished
    function claim() external nonReentrant {
        require(status == Status.afterSaleSuccess, "Presale is still active");

        address user = msg.sender;
        uint256 currentAmount = presaleContribution[user];
        require(currentAmount > 0, "Have not contributed to presale");

        // Transfer LP to user
        uint256 lpAmount = lpCreated * 100 / presaleContribution[msg.sender];
        IERC20(pair).safeTransfer(msg.sender, lpAmount);

        if(tokenBonusPercent != 0) {
            // Transfer bonus tokens to user
            uint256 tokenAmount = bonusTokens * 100 / presaleContribution[msg.sender];
            IERC20(sellToken).safeTransfer(msg.sender, tokenAmount);
        }

        presaleContribution[user] = 0;
    }

    /// @dev Claims a refund if presale soft cap was not reached
    function refund() public nonReentrant {
        require(status == Status.afterSaleFailure, "Presale finished successfully");

        // Refund deposit tokens
        address user = msg.sender;
        uint256 currentAmount = presaleContribution[user];
        require(currentAmount > 0, "Invalid amount");
        payable(user).sendValue(currentAmount);
        presaleContribution[user] = 0;
        currentPresaleParticipants--;
    }

    /// @notice Raised amount < softcap = refunds enabled, otherwise claims enabled + raised funds transferred to team
    /// @dev Ends the presale, preventing new deposits and allowing claims/refunds based on soft cap being met
    function completePresale() external nonReentrant {
        require(status == Status.duringSale, "Presale is not active");

        // If presale does not hit their soft cap
        if (currentDepositAmount < softCapAmount) {
            status = Status.afterSaleFailure;

            uint256 unsoldTokens = IERC20(sellToken).balanceOf(address(this));
            IERC20(sellToken).safeTransfer(projectTeamAddress, unsoldTokens);

        // If presale hits their soft cap
        } else {
            status = Status.afterSaleSuccess;

            uint256 totalETH = currentDepositAmount;
            uint256 liquidtyETH = totalETH * raisedLiqPercent / 10000;
            uint256 teamETH = totalETH * raisedTeamPercent / 10000;
            uint256 adminETH = totalETH * raisedAdminPercent / 10000;

            uint256 totalSellTokens = IERC20(sellToken).balanceOf(address(this));
            uint256 liquidityTokens = totalSellTokens * tokenLiqPercent / 10000;
            uint256 teamTokens = totalSellTokens * tokenTeamPercent / 10000;
            bonusTokens = totalSellTokens * tokenBonusPercent / 10000;

            // create liquidity
            // internalApprove(address(this), address(router), _totalSupply); REMOVE?
            IERC20(sellToken).approve(address(router), IERC20(sellToken).totalSupply());

            pair = IEmpireFactory(router.factory()).createPair(
                sellToken,
                router.WETH()
            );

            lpCreated = addLiquidity(liquidityTokens, liquidtyETH);

            // if router = empireDEX & lpLockStatus = true
            if(lpLockStatus && empireRouter == address(router)) {
                IEmpireLocker(lpLockContract).lockLiquidity(IERC20(pair), projectTeamAddress, lpCreated, lpLockDuration);
            }

            // Transfer tokens allocated to team
            IERC20(sellToken).safeTransfer(projectTeamAddress, teamTokens);

            // Transfer ETH allocated to team + admin
            payable(projectTeamAddress).sendValue(teamETH);
            payable(projectAdminAddress).sendValue(adminETH);
        }
    }

    /*//////////////////////////////////////////////////////////////
                           INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    //  function internalApprove(address owner, address spender, uint256 amount) internal {
    //     require(owner != address(0), "ERC20: Can not approve from zero address");
    //     require(spender != address(0), "ERC20: Can not approve to zero address");
    //     _allowances[owner][spender] = amount;
    //     emit Approval(owner, spender, amount);
    // }

    /// @dev Adds liquidity on the sellToken/ETH pair
    /// @param tokenAmount The amount of sellToken to add
    /// @param amount The amount of ETH to add
    /// @return The amount of LP tokens created
    function addLiquidity(uint256 tokenAmount, uint256 amount) internal virtual returns (uint256) {
        // IERC20(sellToken).approve(router, tokenAmount); REMOVE?
        uint256 liquidity;
        (,, liquidity) = router.addLiquidityETH{value: amount}(address(this), tokenAmount, 0, 0, address(this), block.timestamp);
        return liquidity;
    }

    /*//////////////////////////////////////////////////////////////
                        ADMIN: PRESALE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @dev Starts the presale
    /// @param presaleHours The amount of hours the presale will last for
    function startPresale(uint256 presaleHours) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        start = block.timestamp;
        end = block.timestamp + (presaleHours * 1 hours);
        status = Status.duringSale;
    }

    /// @dev Extends the presale
    /// @param _end The new end time for the presale
    function extendPresale(uint256 _end) external onlyOwner {
        require(status == Status.duringSale, "Presale must be active");
        end += _end;
    }

    /// @dev Updates the amount of tokens an address contributed in the presale on another chain
    /// @param _address The array of addresses
    /// @param _amount The array of contribution amount the addresses
    function updateCrossChainBalances(
        address[] calldata _address,
        uint256[] calldata _amount
    ) external onlyOwner {
        require(crossChainPresale, "Presale not cross chain");
        require(status == Status.beforeSale ||
                status == Status.duringSale, "Presale finished already");
        //Transfer native coin to contract manually from other chain
        for (uint256 i = 0; i < _address.length; i++) {
            if (presaleContribution[_address[i]] == 0) {
                currentPresaleParticipants++;
            }

            presaleContribution[_address[i]] += _amount[i];
            currentDepositAmount += _amount[i];
        }
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @dev Returns the current status of the presale
    /// @return The enum status of the presale
    function getSaleStatus() external view returns (Status) {
        return status;
    }

    /// @dev Returns the amount of native coin a user has entered into the presale
    /// @param _user The user to check
    /// @return The amount of native coin deposited
    function getUserContribution(address _user) external view returns (uint256) {
        return presaleContribution[_user];
    }

    /// @dev Returns the amount of sellTokens a user can claim after presale finishes
    /// @param _user The user to check
    /// @return The amount of sellTokens the user can claim
    function getPendingToken(address _user) external view returns (uint256) {
        return presaleContribution[_user] * sellRate / sellTokenDecimals;
    }

    /// @dev Returns the total amount of native coin deposited
    /// @return The amount of native coin
    function getDepositedETH() external view returns (uint256) {
        return currentDepositAmount;
    }

    /// @dev Returns the requirements to join the presale
    /// @return The amount of requireToken a user has to hold to join the presale
    /// @return The address of the requireToken that needs to be held
    /// @return True if requirements in place, else false
    function getRequireTokenDetails() external view returns (uint256, address, bool) {
        return (requireTokenAmount, requireToken, requireTokenStatus);
    }

    /// @dev Returns details about the presale
    /// @return The UNIX start time of the presale
    /// @return The UNIX end time of the presale
    /// @return The soft cap amount of the presale
    /// @return The hard cap amount of the presale
    /// @return The minimum amount required to join the presale
    function getPresaleDetails() external view returns (uint256, uint256, uint256, uint256, uint256) {
        return (start, end, softCapAmount, hardCapAmount, presaleMin);
    }

    /// @dev Returns the sellRate of the contract
    /// @return The sell rate
    function getSellRate() external view returns (uint256) {
        return sellRate;
    }

    /*//////////////////////////////////////////////////////////////
                        ADMIN: UPDATE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @dev Initializes the variables for the LGE
    function setupPresale(
        address _sellTokenAddress,
        uint256 _sellTokenDecimals,
        uint256 _sellRate,
        uint256 _presaleMin,
        uint256 _softCapAmount,
        uint256 _hardCapAmount,
        uint256 _requireAmount,
        address _requireToken,
        bool _requireStatus,
        bool _crossChainPresale,
        address _router,
        address _teamAddress,
        address _adminAddress,
        bool _lpLockStatus,
        uint256 _lpLockDuration,
        address _lpLockContract,
        uint256 _raisedLiqPercent,
        uint256 _raisedTeamPercent,
        uint256 _raisedAdminPercent,
        uint256 _tokenLiqPercent,
        uint256 _tokenBonusPercent,
        uint256 _tokenTeamPercent
    ) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        updateSellToken(_sellTokenAddress, _sellTokenDecimals);
        updateSellRate(_sellRate);
        updateMinimum(_presaleMin);
        updateSoftCapAmount(_softCapAmount);
        updateHardCapAmount(_hardCapAmount);
        updateRequiredToken(_requireAmount, _requireToken, _requireStatus);
        updateCrossChainPresale(_crossChainPresale);
        updateRouter(_router);
        updateProjectTeamAddress(_teamAddress);
        updateProjectAdminAddress(_adminAddress);
        updateLpLock(_lpLockStatus, _lpLockDuration, _lpLockContract);
        updateRaisedSplitPercents(_raisedLiqPercent, _raisedTeamPercent, _raisedAdminPercent);
        updateTokenSplitPercents(_tokenLiqPercent, _tokenBonusPercent, _tokenTeamPercent);
    }

    /// @dev Updates the token that is sold in the presale
    /// @param _sellTokenAddress The address of the new token to be sold
    /// @param _sellTokenDecimals The amount of decimals for the sellToken
    function updateSellToken(address _sellTokenAddress, uint256 _sellTokenDecimals) public onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        sellToken = _sellTokenAddress;
        sellTokenDecimals = _sellTokenDecimals;
    }

    /// @notice At sellRate = 10, then 1 depositToken returns 10 sellToken
    /// @dev Updates the sell rate between depositToken and sellToken
    /// @param _sellRate The new sellRate
    function updateSellRate(uint256 _sellRate) public onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        sellRate = _sellRate;
    }

    /// @dev Updates the minimum amount of tokens needed to join the presale
    /// @param _presaleMin The new minimum amount of tokens
    function updateMinimum(uint256 _presaleMin) public onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        presaleMin = _presaleMin;
    }

    /// @dev Updates the soft cap for the presale
    /// @param _softCapAmount The new soft cap for the presale
    function updateSoftCapAmount(uint256 _softCapAmount) public onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        softCapAmount = _softCapAmount;
    }

    /// @dev Updates the hard cap for the presale
    /// @param _hardCapAmount The new hard cap for the presale
    function updateHardCapAmount(uint256 _hardCapAmount) public onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        hardCapAmount = _hardCapAmount;
    }

    /// @dev Updates the variables for the require token to be held to join the presale
    /// @param _amount New amount of tokens required to be held
    /// @param _token The new token that needs to be held
    /// @param _status Toggles if there is a required token to be held
    function updateRequiredToken(uint256 _amount, address _token, bool _status) public onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        requireTokenAmount = _amount;
        requireToken = _token;
        requireTokenStatus = _status;
    }

    /// @dev Updates if the presale is crosschain
    /// @param _crossChainPresale True = presale is crosschain, else is false
    function updateCrossChainPresale(bool _crossChainPresale) public onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        crossChainPresale = _crossChainPresale;
    }

    /// @dev Updates the router
    /// @param _router The address of the router
    function updateRouter(address _router) public onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        router = IEmpireRouter(_router);
    }

    /// @dev Updates the address of the project's team
    /// @param _projectTeamAddress The team address of the token being sold in LGE
    function updateProjectTeamAddress(address _projectTeamAddress) public onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        projectTeamAddress = _projectTeamAddress;
    }

    /// @dev Updates the address of the admin running the presale
    /// @param _projectAdminAddress The address of the admin
    function updateProjectAdminAddress(address _projectAdminAddress) public onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        projectAdminAddress = _projectAdminAddress;
    }

    /// @dev Updates the values for LP locking
    /// @param _lpLockStatus True = LP created in LGE is locked, else is false
    /// @param _lpLockDuration The duration to lock the LP in seconds. 0 = infinite lock
    /// @param _lpLockContract The address of the Empire Locker contract
    function updateLpLock(
        bool _lpLockStatus,
        uint256 _lpLockDuration,
        address _lpLockContract
        ) public onlyOwner {
        require(status == Status.beforeSale, "Presale is active");
        lpLockStatus = _lpLockStatus;
        lpLockDuration = _lpLockDuration;
        lpLockContract = _lpLockContract;
    }

    /// @dev Updates the percent values to determine how raised ETH is split
    /// @param _raisedLiqPercent The new percent of ETH to use to make liquidity
    /// @param _raisedTeamPercent The new percent of ETH to transfer to projects team
    /// @param _raisedAdminPercent The new percent of ETH to transfer to Empire Capital
    function updateRaisedSplitPercents(
        uint256 _raisedLiqPercent,
        uint256 _raisedTeamPercent,
        uint256 _raisedAdminPercent
        ) public onlyOwner {
        require(status == Status.beforeSale, "Presale is active");
        require(_raisedLiqPercent + _raisedTeamPercent + _raisedAdminPercent == 10000, "Must total to 100%");
        raisedLiqPercent = _raisedLiqPercent;
        raisedTeamPercent = _raisedTeamPercent;
        raisedAdminPercent = _raisedAdminPercent;
    }

    /// @notice value of 100 = 1%
    /// @dev Updates the percent values to determine how sellTokens are used in afterSaleSuccess
    /// @param _tokenLiqPercent The new percent of tokens to pair with raised ETH to create liquidity
    /// @param _tokenBonusPercent The new percent of tokens to transfer to contributors
    /// @param _tokenTeamPercent The new percent of tokens to transfer to the team address
    function updateTokenSplitPercents(
        uint256 _tokenLiqPercent,
        uint256 _tokenBonusPercent,
        uint256 _tokenTeamPercent
        ) public onlyOwner {
        require(status == Status.beforeSale, "Presale is active");
        require(_tokenLiqPercent + _tokenBonusPercent + _tokenTeamPercent == 10000, "Must total to 100%");
        tokenLiqPercent = _tokenLiqPercent;
        tokenBonusPercent = _tokenBonusPercent;
        tokenTeamPercent = _tokenTeamPercent;
    }

}