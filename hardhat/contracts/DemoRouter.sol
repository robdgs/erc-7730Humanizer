// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DemoRouter is Ownable {
    event TokenSwap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    event LiquidityAdded(
        address indexed user,
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountA,
        uint256 amountB
    );
    
    event LiquidityRemoved(
        address indexed user,
        address indexed tokenA,
        address indexed tokenB,
        uint256 liquidity
    );

    struct SwapParams {
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        address recipient;
        uint256 deadline;
    }

    struct LiquidityParams {
        address tokenA;
        address tokenB;
        uint256 amountA;
        uint256 amountB;
        address recipient;
        uint256 deadline;
    }

    constructor() Ownable(msg.sender) {}

    function swapExactTokensForTokens(
        SwapParams calldata params
    ) external returns (uint256 amountOut) {
        require(block.timestamp <= params.deadline, "DemoRouter: EXPIRED");
        require(params.amountIn > 0, "DemoRouter: INSUFFICIENT_INPUT_AMOUNT");
        
        IERC20(params.tokenIn).transferFrom(
            msg.sender,
            address(this),
            params.amountIn
        );
        
        amountOut = params.amountIn * 99 / 100;
        require(amountOut >= params.minAmountOut, "DemoRouter: INSUFFICIENT_OUTPUT_AMOUNT");
        
        IERC20(params.tokenOut).transfer(params.recipient, amountOut);
        
        emit TokenSwap(
            msg.sender,
            params.tokenIn,
            params.tokenOut,
            params.amountIn,
            amountOut
        );
        
        return amountOut;
    }

    function addLiquidity(
        LiquidityParams calldata params
    ) external returns (uint256 liquidityTokens) {
        require(block.timestamp <= params.deadline, "DemoRouter: EXPIRED");
        require(params.amountA > 0 && params.amountB > 0, "DemoRouter: INSUFFICIENT_AMOUNTS");
        
        IERC20(params.tokenA).transferFrom(msg.sender, address(this), params.amountA);
        IERC20(params.tokenB).transferFrom(msg.sender, address(this), params.amountB);
        
        liquidityTokens = (params.amountA + params.amountB) / 2;
        
        emit LiquidityAdded(
            msg.sender,
            params.tokenA,
            params.tokenB,
            params.amountA,
            params.amountB
        );
        
        return liquidityTokens;
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 minAmountA,
        uint256 minAmountB,
        address recipient,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB) {
        require(block.timestamp <= deadline, "DemoRouter: EXPIRED");
        require(liquidity > 0, "DemoRouter: INSUFFICIENT_LIQUIDITY");
        
        amountA = liquidity / 2;
        amountB = liquidity / 2;
        
        require(amountA >= minAmountA && amountB >= minAmountB, "DemoRouter: INSUFFICIENT_AMOUNTS");
        
        IERC20(tokenA).transfer(recipient, amountA);
        IERC20(tokenB).transfer(recipient, amountB);
        
        emit LiquidityRemoved(msg.sender, tokenA, tokenB, liquidity);
        
        return (amountA, amountB);
    }

    function simpleTransfer(
        address token,
        address recipient,
        uint256 amount
    ) external {
        require(amount > 0, "DemoRouter: ZERO_AMOUNT");
        IERC20(token).transferFrom(msg.sender, recipient, amount);
    }
}
