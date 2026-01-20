async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with", deployer.address);

  const GamePayments = await ethers.getContractFactory("GamePayments");
  const gp = await GamePayments.deploy();
  await gp.deployed();
  console.log("GamePayments deployed to:", gp.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
