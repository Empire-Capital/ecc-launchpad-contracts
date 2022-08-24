pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT
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
    mapping(address => uint256) public accounting_contribution;
    mapping(address => uint256) public presale_contribution;
    mapping(address => uint256) public totalPurchased;

    bool public claimEnabled = false;
    bool public refundEnabled = false;
    uint256 public currentPoolAmount = 0;
    uint256 public currentPoolParticipants = 0;

    address public idoToken;
    uint256 public start;
    uint256 public end;
    address public depositToken = 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56; //BUSD 18 DECIMALS

    uint256 public presaleMin = 2000 * 10**18; //2K
    uint256 public presaleMax = 125000 * 10**18; //125K

    uint256 public hardCapAmount = 125000 * 10**18; //125K

    uint256 public poolRate = 31; //31 Tokens per $1 BUSD
    uint256 public poolDecimals = 9; //If REKT token is 9 decimals

    function updateCrossChainBalances(
        address[] calldata _address,
        uint256[] calldata _amount
    ) external onlyOwner {
        //Transfer USDC to contract manually from BSC
        for (uint256 i = 0; i < _address.length; i++) {
            if (presale_contribution[_address[i]] == 0) {
                currentPoolParticipants = currentPoolParticipants.add(1);
            }

            accounting_contribution[_address[i]] = accounting_contribution[
                _address[i]
            ].add(_amount[i]);
            presale_contribution[_address[i]] = presale_contribution[
                _address[i]
            ].add(_amount[i]);
            totalPurchased[_address[i]] = presale_contribution[_address[i]];
            currentPoolAmount = currentPoolAmount.add(_amount[i]);
        }
    }

    function deposit(uint256 amount) external nonReentrant {
        uint256 value = amount;
        // require(msg.value <= whitelistedAddressesAmount[msg.sender] || !onlyWhitelistedAddressesAllowed, "Must deposit the amount bid.");
        require(
            value.add(presale_contribution[msg.sender]) >= presaleMin,
            "Per user limit min"
        );
        require(
            value.add(presale_contribution[msg.sender]) <= presaleMax,
            "Per user limit max"
        );

        require(
            value.add(currentPoolAmount) <= hardCapAmount,
            "No more deposit allowed. Presale is full"
        );
        require(start < block.timestamp, "Must meet requirements");
        require(end > block.timestamp, "Presale Ended");

        //Transfer USDC from the participant to the contract
        IERC20(depositToken).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );

        if (presale_contribution[msg.sender] == 0) {
            currentPoolParticipants = currentPoolParticipants.add(1);
        }

        //Record and account the USDC entered into presale
        accounting_contribution[msg.sender] = accounting_contribution[
            msg.sender
        ].add(value);
        presale_contribution[msg.sender] = presale_contribution[msg.sender].add(
            value
        );
        totalPurchased[msg.sender] = presale_contribution[msg.sender];
        currentPoolAmount = currentPoolAmount.add(value);
    }

    function getStakers(address _user) external view returns (uint256) {
        uint256 amount = presale_contribution[_user];
        return amount;
    }

    function getPendingToken(address _user) external view returns (uint256) {
        uint256 token = presale_contribution[_user].mul(poolRate).div(
            poolDecimals
        );
        return token;
    }

    function getCanClaimUI() external view returns (bool) {
        return claimEnabled;
    }

    function getCanRefundUI() external view returns (bool) {
        return refundEnabled;
    }

    function claim() external nonReentrant {
        require(claimEnabled == true, "Claim not enabled");
        require(refundEnabled == false, "Refund must not be enabled");

        address _user = msg.sender;
        uint256 currentAmount = presale_contribution[_user];
        require(currentAmount > 0, "Invalid amount");
        uint256 token = currentAmount.mul(poolRate).div(poolDecimals);
        IERC20(idoToken).safeTransfer(_user, token);
        presale_contribution[_user] = 0;
    }

    function refund() public nonReentrant {
        require(refundEnabled == true, "Not Allowed. Refund not enabled");
        require(claimEnabled == false, "Claim must not be enabled");

        //Refund BUSD
        address _user = msg.sender;
        uint256 currentAmount = presale_contribution[_user];
        require(currentAmount > 0, "Invalid amount");
        IERC20(depositToken).safeTransfer(msg.sender, currentAmount);
        presale_contribution[_user] = 0;
    }

    function setupPresale() external onlyOwner {
        start = block.timestamp;
        end = block.timestamp + 1 days;
    }

    function newRound(uint256 duration) external onlyOwner {
        start = block.timestamp;
        end = block.timestamp + duration;
    }

    function updateHardCapRate(uint256 _hardCapAmount) external onlyOwner {
        hardCapAmount = _hardCapAmount;
    }

    function updateIdoToken(address _idoAddress) external onlyOwner {
        idoToken = _idoAddress;
    }

    function updateDepositToken(address _depositToken) external onlyOwner {
        depositToken = _depositToken;
    }

    function updatePoolRate(uint256 _poolRate) external onlyOwner {
        poolRate = _poolRate;
    }

    function updatePoolDecimals(uint256 _poolDecimals) external onlyOwner {
        poolDecimals = _poolDecimals;
    }

    function updateMin(uint256 _poolmin) external onlyOwner {
        presaleMin = _poolmin;
    }

    function updateMax(uint256 _poolmax) external onlyOwner {
        presaleMax = _poolmax;
    }

    function updateStart(uint256 _start) external onlyOwner {
        start = _start;
    }

    function updateEnd(uint256 _end) external onlyOwner {
        end = _end;
    }

    function updateCanClaim(bool _claim) external onlyOwner {
        claimEnabled = _claim;
    }

    function updateRefund(bool _refund) external onlyOwner {
        refundEnabled = _refund;
    }

    function completePresale(
        address _tokenAddr,
        address _to,
        uint256 _amount
    ) external onlyOwner {
        IERC20(_tokenAddr).safeTransfer(_to, _amount);
    }

    function recoverNative() external onlyOwner {
        payable(msg.sender).sendValue(address(this).balance);
    }
}
