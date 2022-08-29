// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.4;

import "./libraries/Ownable.sol";
import "./libraries/Address.sol";
import "./libraries/ReentrancyGuard.sol";
import "./libraries/SafeERC20.sol";
import "./interfaces/IERC20.sol";

interface IPresale {
    function totalPurchased(address _user) external view returns (uint256);
}

/// @title Token Vesting
/// @author Empire Capital
/// @dev A vesting contract for locking up tokens to be distributed over time
contract TokenVesting is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public startTime;
    uint256 public endTime;
    uint256 public poolRate; // token amount per ETH
    uint256 public totalVestingPercent; // div to 10000, so if 10% -> 1000, 67% -> 6700
    uint256 public cliff = 1 days;
    mapping(address => uint256) public userClaimedAmount;

    // address of the ERC20 token
    IERC20 private immutable _token;
    address private presale;

    event Claimed(address user, uint256 amount);

    constructor(
        address token_,
        address presale_,
        uint256 poolRate_,
        uint256 totalVestingPercent_
    ) {
        require(token_ != address(0));
        require(presale_ != address(0));
        _token = IERC20(token_);
        presale = presale_;
        poolRate = poolRate_;
        totalVestingPercent = totalVestingPercent_;
    }

    function adminSetTime(uint256 start, uint256 end) external onlyOwner {
        startTime = start;
        endTime = end;
    }

    /// @dev Returns the address of the ERC20 token managed by the vesting contract.
    /// @return The address of the token
    function getToken() external view returns (address) {
        return address(_token);
    }

    function calculateClaimableAmount(address user) public view returns (uint256) {
        uint256 totalPendingAmount = IPresale(presale)
            .totalPurchased(user)
            * poolRate
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

    function claim() external nonReentrant {
        uint256 amount = calculateClaimableAmount(msg.sender);
        require(amount > 0, "Can-not-claim-zero");
        _token.safeTransfer(msg.sender, amount);
        userClaimedAmount[msg.sender] +=  amount;
        emit Claimed(msg.sender, amount);
    }

    function emergencyWithdraw(address token) external onlyOwner {
        if (token == address(0)) {
            payable(msg.sender).transfer(address(this).balance);
        } else {
            uint256 tokenBalance = IERC20(token).balanceOf(address(this));
            IERC20(token).safeTransfer(msg.sender, tokenBalance);
        }
    }

}