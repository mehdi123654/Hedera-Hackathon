// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @title TokenTimelock
 * @dev A token holder contract that can release its token balance gradually like a
 * typical vesting scheme, with a cliff and linear release period.
 */
contract TokenTimelock is Context {
    using SafeMath for uint256;

    event TokensReleased(uint256 amount);
    event TokensLockedAndTransferred(address indexed beneficiary, uint256 lockedAmount, address indexed loanGetter, uint256 unlockedAmount);

    // ERC20 basic token contract being held
    IERC20 private _lockedToken;
    IERC20 private _unlockedToken;

    // beneficiary of locked tokens after they are released
    address private _beneficiary;

    // timestamp when token release is enabled
    uint256 private _releaseTime;

    // amount of tokens locked
    uint256 private _lockedAmount;

    /**
     * @dev Creates a token timelock contract that will release the given amount of
     * the token to the beneficiary after the given release time.
     * @param lockedToken The address of the ERC20 token to be locked
     * @param unlockedToken The address of the ERC20 token to be sent without locking
     * @param beneficiary Address to which locked tokens will be released
     * @param releaseTime The timestamp when token release is enabled
     * @param lockedAmount The amount of tokens to be locked
     */
    constructor(
        IERC20 lockedToken,
        IERC20 unlockedToken,
        address beneficiary,
        uint256 releaseTime,
        uint256 lockedAmount
    ) {
        require(releaseTime > block.timestamp, "TokenTimelock: Release time must be in the future");
        require(lockedAmount > 0, "TokenTimelock: Locked amount must be greater than 0");

        _lockedToken = lockedToken;
        _unlockedToken = unlockedToken;
        _beneficiary = beneficiary;
        _releaseTime = releaseTime;
        _lockedAmount = lockedAmount;
    }

    /**
     * @notice Transfers locked tokens held by timelock to the beneficiary.
     */
    function release() public virtual {
        require(block.timestamp >= _releaseTime, "TokenTimelock: Release time not reached");
        
        uint256 amount = Math.min(_lockedAmount, _lockedToken.balanceOf(address(this)));
        require(amount > 0, "TokenTimelock: No tokens to release");

        _lockedToken.transfer(_beneficiary, amount);

        emit TokensReleased(amount);
    }

    /**
     * @notice Locks locked tokens instantly and transfers them to the loan provider,
     * while sending unlocked tokens to the loan getter without locking them.
     * @param loanProvider Address of the loan provider
     * @param lockedAmount Amount of tokens to be locked and transferred
     * @param unlockedAmount Amount of tokens to be sent without locking
     */
    function instantLockAndTransfer(
        address loanProvider,
        uint256 lockedAmount,
        uint256 unlockedAmount
    ) public {
        require(lockedAmount > 0, "TokenTimelock: Locked amount must be greater than 0");
        require(unlockedAmount > 0, "TokenTimelock: Unlocked amount must be greater than 0");
        require(_lockedToken.balanceOf(address(this)) >= lockedAmount, "TokenTimelock: Not enough tokens to lock");

        // Transfer locked tokens to the loan provider
        _lockedToken.transfer(loanProvider, lockedAmount);

        // Transfer unlocked tokens to the loan getter without locking
        _unlockedToken.transfer(msg.sender, unlockedAmount);

        // Adjust the locked amount
        _lockedAmount = _lockedAmount.add(lockedAmount);

        emit TokensLockedAndTransferred(loanProvider, lockedAmount, msg.sender, unlockedAmount);
    }
}
