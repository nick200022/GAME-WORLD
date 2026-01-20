// Integración BSC (ethers.js)
// REEMPLAZAR: coloca la dirección del contrato desplegado
const CONTRACT_ADDRESS = "REPLACE_WITH_DEPLOYED_CONTRACT_ADDRESS";
const CONTRACT_ABI = [
  "function payBNB(string note) external payable",
  "function payToken(address token, uint256 amount, string note) external",
  "function contractBNBBalance() external view returns (uint256)"
];

let provider, signer, contract;
const btnConnectWallet = document.getElementById('btnConnectWallet');
const walletAddressEl = document.getElementById('walletAddress');

btnConnectWallet.addEventListener('click', async () => {
  if (!window.ethereum) return alert('Instala MetaMask u otra wallet');
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  signer = provider.getSigner();
  const addr = await signer.getAddress();
  walletAddressEl.textContent = addr;
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
});

// Pagar BNB
document.getElementById('btnPayBNB').addEventListener('click', async () => {
  if (!contract) return alert('Conecta wallet');
  try {
    const value = ethers.utils.parseEther('0.01');
    const tx = await contract.payBNB('Payment from GAME WORLD', { value });
    alert('Tx enviada: ' + tx.hash);
    await tx.wait();
    alert('Pago confirmado');
    // opcional: registrar en backend
  } catch (err) {
    console.error(err);
    alert('Error: ' + (err.message || err));
  }
});

// Pagar token BEP-20: approve -> payToken
document.getElementById('btnPayToken').addEventListener('click', async () => {
  const tokenAddr = document.getElementById('tokenAddress').value.trim();
  const amt = document.getElementById('tokenAmount').value.trim();
  if (!contract || !tokenAddr || !amt) return alert('Completa los campos y conecta wallet');
  try {
    const erc20 = new ethers.Contract(tokenAddr, ["function approve(address spender,uint256 amount) external returns(bool)"], signer);
    const txA = await erc20.approve(CONTRACT_ADDRESS, ethers.BigNumber.from(amt));
    await txA.wait();
    const tx = await contract.payToken(tokenAddr, ethers.BigNumber.from(amt), "Token payment GAME WORLD");
    await tx.wait();
    alert('Pago con token confirmado');
  } catch (err) {
    console.error(err);
    alert('Error token: ' + (err.message || err));
  }
});
