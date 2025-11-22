import hre from "hardhat";
import "@nomicfoundation/hardhat-ethers";

console.log("HRE keys after import:", Object.keys(hre));
console.log("Has ethers?", "ethers" in hre);
