let web3;
let userAccount;
let contract;
let usdt;

async function connectWallet() {
  if (window.ethereum || window.bitkeep?.ethereum) {
    web3 = new Web3(window.ethereum || window.bitkeep.ethereum);
    const accounts = await web3.eth.requestAccounts();
    userAccount = accounts[0];
    document.getElementById("walletStatus").innerText = "✅ " + userAccount;

    contract = new web3.eth.Contract(contractABI, contractAddress);
    usdt = new web3.eth.Contract(usdtABI, usdtAddress);

    const link = window.location.origin + window.location.pathname + "?ref=" + userAccount;
    document.getElementById("refLink").value = link;

    switchNetwork();
  } else {
    alert("กรุณาติดตั้ง MetaMask หรือ Bitget Wallet");
  }
}

async function switchNetwork() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x38" }],
    });
  } catch (err) {
    console.warn("Network switch failed", err);
  }
}

async function registerReferrer() {
  const ref = document.getElementById("refAddress").value;
  if (!web3.utils.isAddress(ref)) return alert("Referrer address ไม่ถูกต้อง");

  try {
    await contract.methods.registerReferrer(ref).send({ from: userAccount });
    alert("✅ สมัครสำเร็จ");
  } catch (err) {
    alert("❌ สมัครล้มเหลว: " + err.message);
  }
}

async function buyToken() {
  const value = document.getElementById("usdtAmount").value;
  const amount = web3.utils.toWei(value, "ether");

  try {
    await usdt.methods.approve(contractAddress, amount).send({ from: userAccount });
    await contract.methods.buyWithReferralAndStake(amount).send({ from: userAccount });
    alert("✅ ซื้อ KJC และ stake สำเร็จ");
  } catch (err) {
    alert("❌ ล้มเหลว: " + err.message);
  }
}

function copyReferralLink() {
  const copyText = document.getElementById("refLink");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(copyText.value);
  alert("✅ คัดลอกลิงก์แล้ว");
}
