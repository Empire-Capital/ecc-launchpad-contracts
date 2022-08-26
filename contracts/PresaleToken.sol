// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./libraries/Ownable.sol";
import "./libraries/SafeMath.sol";
import "./libraries/Address.sol";
import "./libraries/ReentrancyGuard.sol";
import "./libraries/SafeERC20.sol";
import "./interfaces/IERC20.sol";

contract PresaleBUSD is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    /* Defining Initial Parameters */
    mapping(address => uint256) public presaleContribution;

    enum Status {
        beforeSale,
        duringSale,
        afterSaleSuccess,
        afterSaleFailure
    }

    Status public status;

    address public projectAdminAddress;
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

    constructor(address _depositToken, address _sellToken) {
        depositToken = _depositToken;
        sellToken = _sellToken;
        sellTokenDecimals = IERC20(sellToken).decimals();

        uint256 depositTokenDecimals = IERC20(depositToken).decimals();
        presaleMin = 2000 * 10**depositTokenDecimals; // 2K
        hardCapAmount = 125000 * 10**depositTokenDecimals; // 125K

        sellRate = 1; // X Tokens per 1 depositToken
        projectAdminAddress = 0x0000000000000000000000000000000000000000; // admin of presale project

        requireTokenAmount = 150000 * 10**18; // 150K
        requireToken = 0xC84D8d03aA41EF941721A4D77b24bB44D7C7Ac55; // ECC
        requireTokenStatus = false; // false = no requirements, true = holding token required to join

        crossChainPresale = false; // false = presale on one chain, true = presale on multiple chains
    }

    receive() external payable {}

    // User Functions

    function deposit(uint256 _amount) external nonReentrant {
        uint256 value = _amount;
        require(
            value + presaleContribution[msg.sender] >= presaleMin,
            "Must deposit more than presale minimum"
        );
        require(
            value + currentDepositAmount <= hardCapAmount,
            "No more deposit allowed. Presale is full"
        );
        require(status == Status.duringSale, "Presale is not active");

        if (requireTokenStatus) {
            require(IERC20(requireToken).balanceOf(msg.sender) > requireTokenAmount,
            "User does not hold enough required tokens");
        }

        //Transfer depositToken from the participant to the contract
        IERC20(depositToken).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );

        if (presaleContribution[msg.sender] == 0) {
            currentPresaleParticipants++;
        }

        //Record and account the depositToken entered into presale
        presaleContribution[msg.sender] += value;
        currentDepositAmount += value;
    }

    function claim() external nonReentrant {
        require(status == Status.afterSaleSuccess, "Presale is still active");

        address user = msg.sender;
        uint256 currentAmount = presaleContribution[user];
        require(currentAmount > 0, "Have not contributed to presale");
        uint256 amount = currentAmount * sellRate / sellTokenDecimals;
        IERC20(sellToken).safeTransfer(user, amount);
        presaleContribution[user] = 0;
    }

    function refund() public nonReentrant {
        require(status == Status.duringSale ||
                status == Status.afterSaleFailure, "Presale finished successfully");

        //Refund BUSD
        address user = msg.sender;
        uint256 currentAmount = presaleContribution[user];
        require(currentAmount > 0, "Invalid amount");
        IERC20(depositToken).safeTransfer(msg.sender, currentAmount);
        presaleContribution[user] = 0;
        currentPresaleParticipants--;
    }

    // Admin: Presale Functions

    function startPresale(uint256 presaleHours) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        start = block.timestamp;
        end = block.timestamp + (presaleHours * 1 days);
    }

    function completePresale() external onlyOwner {
        require(status == Status.duringSale, "Presale is not active");

        // If presale does not hit their soft cap
        if (currentDepositAmount < softCapAmount) {
            status = Status.afterSaleFailure;

            uint256 unsoldTokens = IERC20(sellToken).balanceOf(address(this));
            IERC20(sellToken).safeTransfer(projectAdminAddress, unsoldTokens);

        // If presale hits their soft cap
        } else {
            status = Status.afterSaleSuccess;
           
            // Transfer deposited tokens from presale to projects admin address
            IERC20(depositToken).safeTransfer(projectAdminAddress, currentDepositAmount);

            // Transfer tokens not sold in presale to projects admin address
            uint256 unsoldTokens = currentDepositAmount * sellRate / sellTokenDecimals;
            IERC20(sellToken).safeTransfer(projectAdminAddress, unsoldTokens);
        }
    }

    function extendPresale(uint256 _end) external onlyOwner {
        require(_end > end, "New end time must be after current end");
        require(status == Status.duringSale, "Presale must be active");
        end = _end;
    }

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

    // View Functions

    function getSaleStatus() external view returns (Status) {
        return status;
    }

    function getUserContribution(address _user) external view returns (uint256) {
        return presaleContribution[_user];
    }

    function getPendingToken(address _user) external view returns (uint256) {
        return presaleContribution[_user] * sellRate / sellTokenDecimals;
    }

    // Admin: Update Functions

    function updateSoftCapAmount(uint256 _softCapAmount) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        softCapAmount = _softCapAmount;
    }

    function updateHardCapAmount(uint256 _hardCapAmount) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        hardCapAmount = _hardCapAmount;
    }

    function updateSellToken(
        address _sellTokenAddress,
        uint256 _sellTokenDecimals)
        external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        sellToken = _sellTokenAddress;
        sellTokenDecimals = _sellTokenDecimals;
    }

    function updateDepositToken(address _depositToken) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        depositToken = _depositToken;
    }

    function updateSellRate(uint256 _sellRate) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        sellRate = _sellRate;
    }

    function updateMin(uint256 _poolmin) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        presaleMin = _poolmin;
    }

    function updateRequiredToken(uint256 _amount, address _token, bool _status) external onlyOwner {
        require(status == Status.beforeSale, "Presale is already active");
        requireTokenAmount = _amount;
        requireToken = _token;
        requireTokenStatus = _status;
    }

    function recoverNative() external onlyOwner {
        payable(msg.sender).sendValue(address(this).balance);
    }
}