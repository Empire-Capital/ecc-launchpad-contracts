// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.4;

import "./libraries/Ownable.sol";
import "./libraries/Address.sol";
import "./libraries/ReentrancyGuard.sol";
import "./libraries/SafeERC20.sol";
import "./interfaces/IERC20.sol";

/// @title PresaleToken
/// @author Empire Capital
/// @dev A contract for presales that accepts tokens
contract PresaleBUSD is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Address for address payable;

    enum Status {
        beforeSale,
        duringSale,
        afterSaleSuccess,
        afterSaleFailure
    }

    Status public status;

    address public projectTeamAddress;
    address public depositToken;
    address public sellToken;
    uint256 public sellTokenDecimals;
    uint256 public currentDepositAmount;
    uint256 public currentPresaleParticipants;
    uint256 public start;
    uint256 public end;
    uint256 public presaleMin;
    uint256 public softCapAmount;
    uint256 public hardCapAmount;
    uint256 public sellRate;
    uint256 public requireTokenAmount;
    address public requireToken;
    bool public requireTokenStatus;
    bool public crossChainPresale;
    bool public vestingStatus;
    uint256 public vestingPercent;
    address public vestingContract;

    mapping(address => uint256) public presaleContribution;

    /// @param _depositToken The address of the token required to enter the presale
    /// @param _sellToken The address of the token being sold in the presale
    constructor(address _depositToken, address _sellToken) {
        depositToken = _depositToken;
        uint256 depositTokenDecimals = IERC20(depositToken).decimals();
        sellToken = _sellToken;
        sellTokenDecimals = IERC20(sellToken).decimals();

        sellRate = 1; // X sellToken per 1 depositToken
        presaleMin = 1000 * 10**depositTokenDecimals; // 1K
        softCapAmount = 100000 * 10*depositTokenDecimals; // 100K
        hardCapAmount = 125000 * 10**depositTokenDecimals; // 125K
        projectTeamAddress = 0x0000000000000000000000000000000000000000; // team address of presale project

        requireTokenAmount = 150000 * 10**18; // 150K
        requireToken = 0xC84D8d03aA41EF941721A4D77b24bB44D7C7Ac55; // ECC
        requireTokenStatus = false; // false = no requirements, true = holding token required to join

        crossChainPresale = false; // false = presale on one chain, true = presale on multiple chains
    }



    /*//////////////////////////////////////////////////////////////
                            USER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Deposits `_amount` into the presale
    /// @dev Enters the presale
    /// @param _amount The amount of tokens to be deposited into the presale
    function deposit(uint256 _amount) external nonReentrant {
        uint256 value = _amount;
        address user = msg.sender;
        require(
            value + presaleContribution[user] >= presaleMin,
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

        //Transfer depositToken from the participant to the contract
        IERC20(depositToken).safeTransferFrom(
            user,
            address(this),
            _amount
        );

        if (presaleContribution[user] == 0) {currentPresaleParticipants++;}

        //Record and account the depositToken entered into presale
        presaleContribution[user] += value;
        currentDepositAmount += value;
    }

    /// @dev Claims tokens after the presale is finished
    function claim() external nonReentrant {
        require(status == Status.afterSaleSuccess, "Presale is still active");

        address user = msg.sender;
        uint256 currentAmount = presaleContribution[user];
        require(currentAmount > 0, "Have not contributed to presale");
        uint256 amount = currentAmount * sellRate / sellTokenDecimals;
        IERC20(sellToken).safeTransfer(user, amount);
        presaleContribution[user] = 0;
    }

    /// @dev Claims a refund if presale soft cap was not reached
    function refund() public nonReentrant {
        require(status == Status.afterSaleFailure, "Presale finished successfully");

        // Refund deposited tokens
        address user = msg.sender;
        uint256 currentAmount = presaleContribution[user];
        require(currentAmount > 0, "Invalid amount");
        IERC20(depositToken).safeTransfer(user, currentAmount);
        presaleContribution[user] = 0;
    }

    /// @notice Raised amount < softcap = refunds enabled, otherwise claims enabled + raised funds transferred to team
    /// @dev Ends the presale, preventing new deposits and allowing claims/refunds based on soft cap being met
    function completePresale() external {
        require(status == Status.duringSale, "Presale is not active");

        // If presale does not hit their soft cap
        if (currentDepositAmount < softCapAmount) {
            status = Status.afterSaleFailure;

            uint256 unsoldTokens = IERC20(sellToken).balanceOf(address(this));
            IERC20(sellToken).safeTransfer(projectTeamAddress, unsoldTokens);

        // If presale hits their soft cap
        } else {
            status = Status.afterSaleSuccess;
           
            // Transfer deposited tokens from presale to projects team address
            IERC20(depositToken).safeTransfer(projectTeamAddress, currentDepositAmount);

            // Transfer tokens not sold in presale to projects team address
            uint256 unsoldTokens = currentDepositAmount * sellRate / sellTokenDecimals;
            IERC20(sellToken).safeTransfer(projectTeamAddress, unsoldTokens);

            // If vesting of tokens is selected, transfer tokens to vesting contract
            if (vestingStatus) {
                uint256 tokensVesting = soldTokens * vestingPercent / 10000;
                IERC20(sellToken).safeTransfer(vestingContract, tokensVesting);
            }
        }
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
    }

    /// @dev Extends the presale
    /// @param _end The new end time for the presale
    function extendPresale(uint256 _end) external onlyOwner {
        require(_end > end, "New end time must be after current end");
        require(status == Status.duringSale, "Presale must be active");
        end = _end;
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
        //Transfer depositToken to contract manually from other chain
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

    /// @dev Returns the amount of depositToken a user has entered into the presale
    /// @param _user The user to check
    /// @return The amount of depositToken deposited
    function getUserContribution(address _user) external view returns (uint256) {
        return presaleContribution[_user];
    }

    /// @dev Returns the amount of sellTokens a user can claim after presale finishes
    /// @param _user The user to check
    /// @return The amount of sellTokens the user can claim
    function getPendingToken(address _user) external view returns (uint256) {
        return presaleContribution[_user] * sellRate / sellTokenDecimals;
    }

    /// @dev Returns the total amount of depositToken deposited
    /// @return The amount of depositToken
    function getDepositedTokens() external view returns (uint256) {
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

    /// @dev Returns information about the vesting of presale tokens
    /// @return True if tokens are vested after presale ends, else false
    /// @return The percent of tokens vested, remaining percent is claimable on successful presale finish
    function getVestinInfo() external view returns (bool, uint256) {
        return (vestingStatus, vestingPercent);
    }

    /*//////////////////////////////////////////////////////////////
                        ADMIN: UPDATE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @dev Updates the soft cap for the presale
    /// @param _softCapAmount The new soft cap for the presale
    function updateSoftCapAmount(uint256 _softCapAmount) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        softCapAmount = _softCapAmount;
    }

    /// @dev Updates the hard cap for the presale
    /// @param _hardCapAmount The new hard cap for the presale
    function updateHardCapAmount(uint256 _hardCapAmount) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        hardCapAmount = _hardCapAmount;
    }

    /// @dev Updates the token that is sold in the presale
    /// @param _sellTokenAddress The address of the new token to be sold
    function updateSellToken(address _sellTokenAddress) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        sellToken = _sellTokenAddress;
        sellTokenDecimals = IERC20(sellToken).decimals();
    }

    /// @dev Updates the token to be deposited into the presale
    /// @param _depositToken The address of the new token to be deposited
    function updateDepositToken(address _depositToken) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        depositToken = _depositToken;
    }

    /// @notice At sellRate = 10, then 1 depositToken returns 10 sellToken
    /// @dev Updates the sell rate between depositToken and sellToken
    /// @param _sellRate The new sellRate
    function updateSellRate(uint256 _sellRate) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        sellRate = _sellRate;
    }

    /// @dev Updates the minimum amount of tokens needed to join the presale
    /// @param _poolmin Thew new minimum amount of tokens
    function updateMin(uint256 _poolmin) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        presaleMin = _poolmin;
    }

    /// @dev Changes The variables for the require token to be held to join the presale
    /// @param _amount New amount of tokens required to be held
    /// @param _token The new token that needs to be held
    /// @param _status Toggles if there is a required token to be held
    function updateRequiredToken(uint256 _amount, address _token, bool _status) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        requireTokenAmount = _amount;
        requireToken = _token;
        requireTokenStatus = _status;
    }

    /// @dev Updates the information for vesting after a successful presale
    /// @param _vestingStatus Toggles if tokens are vested
    /// @param _vestingPercent The percent of tokens to be vested (1000 = 10%)
    /// @param _vestingContract The address of the vesting contract
    function updateVestingInfo(
        bool _vestingStatus,
        uint256 _vestingPercent,
        address _vestingContract) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        require(_vestingPercent <= 10000, "Must be <= 100 percent");
        vestingStatus = _vestingStatus;
        vestingPercent = _vestingPercent;
    }

    /// @dev Transfers any native coin stuck on the contract
    function recoverNative() external onlyOwner {
        payable(msg.sender).sendValue(address(this).balance);
    }

}