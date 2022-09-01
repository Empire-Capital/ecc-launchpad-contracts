// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.4;

import "./libraries/Ownable.sol";
import "./libraries/Address.sol";
import "./libraries/ReentrancyGuard.sol";
import "./libraries/SafeERC20.sol";
import "./interfaces/IERC20.sol";

interface IPresale {
    function getUserContribution(address _user) external view returns (uint256);

    function getSellRate() external view returns (uint256);
}

/// @title Token Vesting
/// @author Empire Capital
/// @dev A vesting contract for locking up tokens to be distributed over time
contract TokenVesting is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public startTime;
    uint256 public endTime;
    uint256 public sellRate; // token amount per ETH
    uint256 public totalVestingPercent; // div to 10000, so if 10% -> 1000, 67% -> 6700
    uint256 public cliff = 1 days;
    mapping(address => uint256) public userClaimedAmount;

    IERC20 private immutable token;
    address private presale;

    event Claimed(address user, uint256 amount);

    /// @param _token The address of the token that is being vested
    /// @param _presale The address of the presale contract
    /// @param _totalVestingPercent The percent of tokens bought in presale that are vested
    constructor(
        address _token,
        address _presale,
        uint256 _totalVestingPercent
    ) {
        require(_token != address(0));
        require(_presale != address(0));
        token = IERC20(_token);
        presale = _presale;
        sellRate = IPresale(_token).getSellRate();
        totalVestingPercent = _totalVestingPercent;
    }

    /// @dev Sets when the rewards will start and end distribution
    /// @param start The UNIX time for distributions to begin
    /// @param end The UNIX time for distributions to end
    function adminSetTime(uint256 start, uint256 end) external onlyOwner {
        startTime = start;
        endTime = end;
    }

    /// @dev Returns the address of the ERC20 token managed by the vesting contract.
    /// @return The address of the token
    function getToken() external view returns (address) {
        return address(token);
    }

    /// @dev Calculates the amount of tokens the user can claim at current time
    /// @param user The address of the user to check claimable rewards
    /// @return The amount of claimable rewards
    function calculateClaimableAmount(address user) public view returns (uint256) {
        uint256 totalPendingAmount = IPresale(presale)
            .getUserContribution(user)
            * sellRate
            / totalVestingPercent
            / 10000;
        if (totalPendingAmount == 0) {
            return 0;
        }
        if (block.timestamp < startTime) {
            return 0;
        }
        uint256 totalDayPassed = block.timestamp - startTime / cliff;
        uint256 totalDayDistributed = endTime - startTime / cliff;
        if (totalDayPassed >= totalDayDistributed) {
            return totalPendingAmount - userClaimedAmount[user];
        }
        uint256 claimableAmount = totalPendingAmount
            * totalDayPassed
            / totalDayDistributed
            - userClaimedAmount[user];
        return claimableAmount;
    }

    /// @dev Claims the users claimable rewards
    function claim() external nonReentrant {
        uint256 amount = calculateClaimableAmount(msg.sender);
        require(amount > 0, "Can-not-claim-zero");
        token.safeTransfer(msg.sender, amount);
        userClaimedAmount[msg.sender] +=  amount;
        emit Claimed(msg.sender, amount);
    }

    function emergencyWithdraw(address _token) external onlyOwner {
        if (_token == address(0)) {
            payable(msg.sender).transfer(address(this).balance);
        } else {
            uint256 tokenBalance = IERC20(_token).balanceOf(address(this));
            IERC20(_token).safeTransfer(msg.sender, tokenBalance);
        }
    }

}