// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.4;

import "./IEmpirePair.sol";

interface IEmpireFactory {
    event PairCreated(
        address indexed token0,
        address indexed token1,
        address pair,
        uint256
    );

    function feeTo() external view returns (address);

    function feeToSetter() external view returns (address);

    function getPair(address tokenA, address tokenB)
        external
        view
        returns (address pair);

    function allPairs(uint256) external view returns (address pair);

    function allPairsLength() external view returns (uint256);

    function createPair(address tokenA, address tokenB)
        external
        returns (address pair);

    function createPair(
        address tokenA,
        address tokenB,
        PairType pairType,
        uint256 unlockTime
    ) external returns (address pair);

    function createEmpirePair(
        address tokenA,
        address tokenB,
        PairType pairType,
        uint256 unlockTime
    ) external returns (address pair);

    function setFeeTo(address) external;

    function setFeeToSetter(address) external;
    
}