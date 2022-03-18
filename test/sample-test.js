const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Whitelist", function () {
  let WhitelistContract;
  let accounts;
  beforeEach(async () => {
    const Whitelist = await ethers.getContractFactory("Whitelist");
    WhitelistContract = await Whitelist.deploy(5);
    [...accounts] = await ethers.getSigners();
  });
  it("get maxWhitelistedAddresses", async function () {
    expect(await WhitelistContract.maxWhitelistedAddresses()).to.equal(5);
    console.log(accounts.length);
  });
  it("checks addAddressToWhitelist", async function () {
    expect(await WhitelistContract.numAddressesWhitelisted()).to.equal(0);
    let txn = await WhitelistContract.addAddressToWhitelist();
    let res = await txn.wait();
    console.log(res.events[0].args);
    console.log(accounts[0].address);
    expect(await WhitelistContract.numAddressesWhitelisted()).to.equal(1);
  });
});
