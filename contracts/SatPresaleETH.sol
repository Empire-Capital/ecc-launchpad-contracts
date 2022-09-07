// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.4;

import "./libraries/Ownable.sol";
import "./libraries/Address.sol";
import "./libraries/ReentrancyGuard.sol";
import "./libraries/SafeERC20.sol";
import "./interfaces/IERC20.sol";

/// @title Satellite PresaleETH
/// @author Empire Capital (Tranquil Flow, Splnty)
/// @dev A contract for presales that accepts native coins, for the non-launch chain
contract SatPresaleETH is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Address for address payable;

    enum Status {
        beforeSale,
        duringSale,
        afterSaleSuccess,
        afterSaleFailure
    }

    Status public status;

    address public projectAdminAddress;
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

    mapping(address => uint256) public presaleContribution;
    mapping(uint256 => address) public userContributionAddress;

    /// @param _sellToken The address of the token being sold in the presale
    constructor(address _sellToken) {
        sellToken = _sellToken;
        sellTokenDecimals = IERC20(sellToken).decimals();

        sellRate = 1; // X sellToken per 1 depositToken
        presaleMin = 1000 * 10**18; // 1K
        softCapAmount = 100000 * 10**18; // 100K
        hardCapAmount = 125000 * 10**18; // 125K
        projectAdminAddress = 0x0000000000000000000000000000000000000000; // admin of presale project

        requireTokenAmount = 150000 * 10**18; // 150K
        requireToken = 0xC84D8d03aA41EF941721A4D77b24bB44D7C7Ac55; // ECC
        requireTokenStatus = false; // false = no requirements, true = holding token required to join
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

        if (presaleContribution[user] == 0) {currentPresaleParticipants++;}

        //Record and account the native coin entered into presale
        presaleContribution[user] += value;
        userContributionAddress[currentPresaleParticipants] = msg.sender;
        currentDepositAmount += value;
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
    }

    /// @notice Raised amount < softcap = refunds enabled, otherwise claims enabled + raised funds transferred to team
    /// @dev Ends the presale, preventing new deposits and allowing claims/refunds based on soft cap being met
    function completePresale() external {
        require(status == Status.duringSale, "Presale is not active");

        // If presale does not hit their soft cap
        if (currentDepositAmount < softCapAmount) {
            status = Status.afterSaleFailure;

        // If presale hits their soft cap
        } else {
            status = Status.afterSaleSuccess;
           
            // Transfer deposited native coin from presale to admin
            payable(projectAdminAddress).sendValue(address(this).balance);
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
        end = block.timestamp + (presaleHours * 1 days);
    }

    /// @dev Extends the presale
    /// @param _end The new end time for the presale
    function extendPresale(uint256 _end) external onlyOwner {
        require(_end > end, "New end time must be after current end");
        require(status == Status.duringSale, "Presale must be active");
        end = _end;
    }

    /// @dev Returns the amount of tokens all addresses contributed in the presale on this chain
    /// @return The array of addresses
    /// @return The array of contribution amount the addresses
    function returnUserContributions() external onlyOwner view returns (address[] memory, uint256[] memory) {

        address[] memory userAddresses;
        uint256[] memory userContributions;

        for (uint256 i = 0; i < currentPresaleParticipants; i++) {
            userAddresses[i] = userContributionAddress[i];
            userContributions[i] = presaleContribution[userAddresses[i]];
        }

        return (userAddresses, userContributions);
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

    /// @dev Updates the token decimals that is sold in the presale
    /// @param _sellTokenDecimals The address of the new token to be sold
    function updateSellToken(uint256 _sellTokenDecimals) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        sellTokenDecimals = _sellTokenDecimals;
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

}