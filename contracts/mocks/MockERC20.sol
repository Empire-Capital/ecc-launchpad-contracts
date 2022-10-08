//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "../libraries/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("STK", "Some Token") {
        uint8 decimals = 18;
        _setupDecimals(decimals);
        _mint(msg.sender, 1000000 * (10**uint256(decimals)));
    }
}
