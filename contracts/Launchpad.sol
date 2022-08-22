pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT
import "./libraries/Ownable.sol";
import "./libraries/SafeMath.sol";
import "./libraries/IERC20.sol";
import "./libraries/Address.sol";
import "./libraries/ReentrancyGuard.sol";

contract Launchpad is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using Address for address payable;

    /* Defining Initial Parameters */
    mapping(address => uint256) public accounting_contribution;
    mapping(address => uint256) public presale_contribution;
    mapping(address => uint256) public totalPurchased;
    mapping(address => bool) public whitelistedAddresses;
    mapping(address => uint256) public whitelistedAddressesAmount;

    bool public onlyWhitelistedAddressesAllowed = true;
    bool public claimEnabled = false;
    bool public refundEnabled = false;
    uint256 public currentPoolAmount = 0;
    uint256 public currentPoolParticipants = 0;

    address public presaleToken;
    uint256 public start;
    uint256 public end;

    uint256 public minEccHold = 150000 * 10**9;
    address public minTokenHold;

    uint256 public presaleMin = 1 * 10**15;
    uint256 public presaleMax = 1 * 10**18;

    uint256 public hardCapAmount = 1 * 10**18; //300 ETH

    uint256 public poolRate = 10000; //10 per 0.001

    modifier whitelistedAddressOnly() {
        require(
            !onlyWhitelistedAddressesAllowed ||
                whitelistedAddresses[msg.sender],
            "Address not whitelisted"
        );
        _;
    }

    constructor(address token) { 
        presaleToken = token;
    }

    function addWhitelistedAddressesWithAmount(
        address[] calldata _whitelistedAddresses,
        uint256 amount
    ) external onlyOwner {
        onlyWhitelistedAddressesAllowed = _whitelistedAddresses.length > 0;
        for (uint256 i = 0; i < _whitelistedAddresses.length; i++) {
            whitelistedAddresses[_whitelistedAddresses[i]] = true;
            whitelistedAddressesAmount[_whitelistedAddresses[i]] = amount;
        }
    }

    function addWhitelistedAddresses(address[] calldata _whitelistedAddresses)
        external
        onlyOwner
    {
        onlyWhitelistedAddressesAllowed = _whitelistedAddresses.length > 0;
        for (uint256 i = 0; i < _whitelistedAddresses.length; i++) {
            whitelistedAddresses[_whitelistedAddresses[i]] = true;
        }
    }

    function deposit() public payable whitelistedAddressOnly nonReentrant {
        uint256 value = msg.value;
        address user = msg.sender;
        // require(msg.value <= whitelistedAddressesAmount[msg.sender] || !onlyWhitelistedAddressesAllowed, "Must deposit the amount bid.");
        require(
            value.add(presale_contribution[user]) <=
                whitelistedAddressesAmount[user] ||
                !onlyWhitelistedAddressesAllowed,
            "Per user limit reached"
        );

        require(
            onlyWhitelistedAddressesAllowed ||
                value.add(presale_contribution[user]) >= presaleMin,
            "Per user limit min"
        );
        require(
            onlyWhitelistedAddressesAllowed ||
                value.add(presale_contribution[user]) <= presaleMax,
            "Per user limit max"
        );

        require(
            value.add(currentPoolAmount) <= hardCapAmount,
            "No more deposit allowed. Presale is full"
        );
        require(start < block.timestamp, "Must meet requirements");
        require(end > block.timestamp, "Presale Ended");

        if (presale_contribution[user] == 0) {
            currentPoolParticipants = currentPoolParticipants.add(1);
        }

        accounting_contribution[user] = accounting_contribution[user].add(
            value
        );
        presale_contribution[user] = presale_contribution[user].add(value);
        totalPurchased[user] = presale_contribution[user];
        currentPoolAmount = currentPoolAmount.add(value);
    }

    function getStakers(address _user) public view returns (uint256) {
        uint256 amount = presale_contribution[_user];
        return amount;
    }

    function getPendingToken(address _user) public view returns (uint256) {
        uint256 token = presale_contribution[_user].mul(poolRate);
        return token;
    }

    function getCanClaimUI() public view returns (bool) {
        return claimEnabled;
    }

    function getCanRefundUI() public view returns (bool) {
        return refundEnabled;
    }

    function claim() public nonReentrant {
        require(claimEnabled == true, "Claim not enabled");
        require(refundEnabled == false, "Refund must not be enabled");

        address _user = msg.sender;
        uint256 currentAmount = presale_contribution[_user];
        uint256 token = currentAmount.mul(poolRate);
        presale_contribution[_user] = presale_contribution[_user].sub(
            currentAmount
        );

        IERC20(presaleToken).transfer(_user, token);
    }

    function refund() external nonReentrant {
        require(refundEnabled == true, "Not Allowed. Refund not enabled");
        require(claimEnabled == false, "Claim must not be enabled");
        require(presale_contribution[msg.sender] > 0, "Can not claim zero");
        address _user = msg.sender;
        uint256 currentAmount = presale_contribution[_user];
        payable(_user).sendValue(currentAmount);

        presale_contribution[_user] = 0;
    }

    function startPresale() public onlyOwner {
        start = block.timestamp;
        end = block.timestamp + 1 days;
    }

    function newRound(uint256 duration) public onlyOwner {
        start = block.timestamp;
        end = block.timestamp + duration;
    }

    function updateHardCapRate(uint256 _hardCapAmount) public onlyOwner {
        hardCapAmount = _hardCapAmount;
    }

    function updateIdoToken(address _idoAddress) public onlyOwner {
        presaleToken = _idoAddress;
    }

    function updatePoolRate(uint256 _poolRate) public onlyOwner {
        poolRate = _poolRate;
    }

    function updateMin(uint256 _poolmin) public onlyOwner {
        presaleMin = _poolmin;
    }

    function updateMax(uint256 _poolmax) public onlyOwner {
        presaleMax = _poolmax;
    }

    function updateStart(uint256 _start) public onlyOwner {
        start = _start;
    }

    function updateEnd(uint256 _end) public onlyOwner {
        end = _end;
    }

    function updateCanClaim(bool _claim) public onlyOwner {
        claimEnabled = _claim;
    }

    function updateRefund(bool _refund) public onlyOwner {
        refundEnabled = _refund;
    }

    function updateWhitelistOnly(bool _onlyWhitelistedAddressesAllowed)
        public
        onlyOwner
    {
        onlyWhitelistedAddressesAllowed = _onlyWhitelistedAddressesAllowed;
    }

    function recoverPresale(
        address _tokenAddr,
        address _to,
        uint256 _amount
    ) public onlyOwner {
        IERC20(_tokenAddr).transfer(_to, _amount);
    }

    function completePresale() public onlyOwner {
        payable(msg.sender).sendValue(address(this).balance);
    }
}