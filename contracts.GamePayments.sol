// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @notice Interfaz mínima ERC20 / BEP20
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract GamePayments {
    address public owner;
    event PaidBNB(address indexed payer, uint256 amount, string note);
    event PaidToken(address indexed payer, address indexed token, uint256 amount, string note);
    event Withdrawn(address indexed to, uint256 amount);
    event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    // Accept native BNB transfers (receive)
    receive() external payable {
        emit PaidBNB(msg.sender, msg.value, "receive");
    }

    // Pay with native BNB and a note
    function payBNB(string calldata note) external payable {
        require(msg.value > 0, "Send BNB");
        emit PaidBNB(msg.sender, msg.value, note);
    }

    // Pay with any BEP-20 token: user must approve this contract first
    function payToken(address token, uint256 amount, string calldata note) external {
        require(amount > 0, "amount>0");
        bool ok = IERC20(token).transferFrom(msg.sender, address(this), amount);
        require(ok, "transferFrom failed");
        emit PaidToken(msg.sender, token, amount, note);
    }

    // Owner withdraw native BNB
    function withdrawBNB(address payable to, uint256 amount) external {
        require(msg.sender == owner, "only owner");
        require(address(this).balance >= amount, "insufficient");
        to.transfer(amount);
        emit Withdrawn(to, amount);
    }

    // Owner withdraw tokens by calling token.transfer(to, amount)
    function withdrawToken(address token, address to, uint256 amount) external {
        require(msg.sender == owner, "only owner");
        bool ok = IERC20(token).transfer(to, amount);
        require(ok, "token transfer failed");
        emit TokenWithdrawn(token, to, amount);
    }

    // Change owner
    function setOwner(address newOwner) external {
        require(msg.sender == owner, "only owner");
        owner = newOwner;
    }

    // View helpers
    function contractBNBBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function tokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}
