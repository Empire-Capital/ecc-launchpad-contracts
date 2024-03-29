// SPDX-License-Identifier: AGPL-3.0

pragma solidity =0.6.8;

import "./mockLibraries/SafeMath.sol";
import "./mockLibraries/SafeERC20.sol";
import "./mockInterfaces/IEmpireEscrow.sol";
import "./mockInterfaces/IEmpirePair.sol";

contract MockEscrow is IEmpireEscrow {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    mapping(IERC20 => mapping(address => Escrow)) public locks;

    function lockLiquidity(IERC20 token, address user, uint256 amount, uint256 duration) external override {
        Escrow storage escrow = locks[token][user];
        if (escrow.release == 0) {
            escrow.release = block.timestamp.add(duration);
        }
        escrow.amount = escrow.amount.add(amount);

        token.safeTransferFrom(msg.sender, address(this), amount);
    }

    function releaseLiquidity(IERC20 token) external override {
        Escrow memory escrow = locks[token][msg.sender];

        require(escrow.release != 0 && escrow.release <= block.timestamp, "EmpireEscrow::releaseLiquidity: Insufficient Time");

        uint256 amount = escrow.amount;

        delete locks[token][msg.sender];

        token.safeTransfer(address(token), amount);

        IEmpirePair(address(token)).burn(msg.sender);
    }
}