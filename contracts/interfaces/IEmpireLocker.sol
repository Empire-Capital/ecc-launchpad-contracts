// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.4;

import "./IERC20.sol";

interface IEmpireLocker {
    struct Escrow {
        uint256 amount;
        uint256 release;
    }

    function lockLiquidity(IERC20 token, address user, uint256 amount, uint256 duration) external;

    function releaseLiquidity(IERC20 token) external;
}