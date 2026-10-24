let userBalance = 150.0;
let userDrops = 100; //water
let userPoints = 10; // assume 10 point
let treeProgress = 40; // tree process
let totalDropsEarned = 120;
let totalPointsEarned = 10;
let totalPointsSpent = 0;
let redeemedVouchers = [];
let hasDigitalSwitchDiscount = false;
let hasClaimedMixuePromo = false; 

const quizData = [
  {
    question:
      "You receive a WhatsApp message claiming to be UUM Bursary asking you to transfer RM 50 via an unverified personal bank account to avoid account suspension. Is this scam?",
    isScam: true,
    explanation:
      "Scam! Official UUM payments are only processed through certified portals or verified DuitNow QR merchants.",
  },
  {
    question:
      "Scanning a DuitNow QR code at the Library Cafe shows the merchant name 'UUM Library Cafe Sdn Bhd' on your bank app screen before entering PIN. Safe or Scam?",
    isScam: false,
    explanation:
      "Safe! DuitNow QR dynamically displays certified merchant names on your screen to prevent spoofing.",
  },
  {
    question:
      "A printed DuitNow QR paper at a canteen stall looks pasted over another QR sticker. Should you report this as suspicious?",
    isScam: true,
    explanation:
      "Correct! Fraudsters sometimes paste fake QR stickers over real ones (QR Phishing).",
  },
  {
    question:
      "You get an SMS with a link claiming you won RM 200 UUM Digital Cashback, asking you to log in with your online banking password. Safe or Scam?",
    isScam: true,
    explanation:
      "Scam! Neither UUM nor banks will ever ask for your online banking password via SMS links.",
  },
  {
    question:
      "An official merchant displays a laminated DuitNow QR with a verified PayNet hologram seal at Varsity Mall. Safe or Scam?",
    isScam: false,
    explanation:
      "Safe! Certified merchants use official PayNet DuitNow QR displays with security seals.",
  },
];

let currentQuizIndex = 0;

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  updateHeaderDisplays();
  loadQuizQuestion();
  updateTreeVisuals();
});

// Navigation Switcher
function switchTab(tabId) {
  const pages = ["home", "discover", "payment", "educator", "rewards", "trust"];
  pages.forEach((p) => {
    document.getElementById(`page-${p}`).classList.add("hidden");
    const btn = document.getElementById(`tab-${p}`);
    if (btn) btn.classList.remove("active", "bg-blue-600", "text-white");
  });

  document.getElementById(`page-${tabId}`).classList.remove("hidden");
  const activeBtn = document.getElementById(`tab-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.add("active");
  }
}

// Update Header & UI Value Displays
function updateHeaderDisplays() {
  document.getElementById("header-balance").innerText =
    `RM ${userBalance.toFixed(2)}`;
  document.getElementById("header-drops").innerText = `${userDrops} Drops`;
  document.getElementById("header-points").innerText = `${userPoints} PTS`;

  document.getElementById("modal-balance-val").innerText =
    `RM ${userBalance.toFixed(2)}`;
  document.getElementById("modal-points-avail").innerText =
    `${userPoints} PTS`;
  document.getElementById("modal-points-earned").innerText =
    `${totalPointsEarned} PTS`;
  document.getElementById("modal-points-spent").innerText =
    `${totalPointsSpent} PTS`;

  if (document.getElementById("tree-water-drops")) {
    document.getElementById("tree-water-drops").innerText =
      `${userDrops} Drops`;
  }
}

// Tree Game Logic
function waterTree() {
  if (userDrops < 10) {
    showToast(
      "Need at least 10 Drops to water the tree! Earn more by making payments or taking quizzes.",
      "error"
    );
    return;
  }

  userDrops -= 10;
  treeProgress += 10;

  if (treeProgress >= 100) {
    treeProgress = 100;
    updateTreeVisuals();
    updateHeaderDisplays();

    setTimeout(() => {
      openTreeCompleteModal();
    }, 300);
  } else {
    showToast("💧 Watered tree! (+10% Growth)");
    updateTreeVisuals();
    updateHeaderDisplays();
  }
}

function updateTreeVisuals() {
  const progressBar = document.getElementById("tree-progress-bar");
  const progressText = document.getElementById("tree-progress-text");
  const treeIcon = document.getElementById("tree-icon");

  if (progressBar) progressBar.style.width = `${treeProgress}%`;
  if (progressText) progressText.innerText = `${treeProgress}% GROWN`;

  if (treeIcon) {
    const scaleFactor = 0.8 + (treeProgress / 100) * 1.0;
    treeIcon.style.transform = `scale(${scaleFactor})`;
    treeIcon.style.transition = "transform 0.4s ease, color 0.4s ease";

    if (treeProgress < 30) {
      treeIcon.className =
        "fa-solid fa-seedling text-3xl text-emerald-500 animate-bounce";
    } else if (treeProgress < 70) {
      treeIcon.className =
        "fa-solid fa-plant-wilt text-4xl text-emerald-600 animate-pulse";
    } else {
      treeIcon.className =
        "fa-solid fa-tree text-5xl text-emerald-700 animate-pulse";
    }
  }
}

function openTreeCompleteModal() {
  const modal = document.getElementById("modal-tree-complete");
  const content = document.getElementById("tree-complete-content");

  modal.classList.remove("hidden");
  setTimeout(() => {
    content.classList.remove("scale-95", "opacity-0");
    content.classList.add("scale-100", "opacity-100");
  }, 10);
}

function collectTreeReward() {
  userPoints += 1;
  totalPointsEarned += 1;
  treeProgress = 0;

  updateTreeVisuals();
  updateHeaderDisplays();

  const modal = document.getElementById("modal-tree-complete");
  const content = document.getElementById("tree-complete-content");

  content.classList.remove("scale-100", "opacity-100");
  content.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    modal.classList.add("hidden");
    showToast("🎉 Claimed 1 Point! New sapling planted.");
  }, 300);
}

// 独有的一次性免费 MIXUE 优惠券领取逻辑
function redeemMixuePromo() {
  if (hasClaimedMixuePromo) {
    showToast("You have already claimed this promo!", "error");
    return;
  }

  hasClaimedMixuePromo = true;
  const voucherCode = "MIXUE-UUM-" + Math.floor(1000 + Math.random() * 9000);
  redeemedVouchers.push({
    title: "RM 5.00 OFF @ MIXUE Varsity Mall",
    code: voucherCode,
    used: false,
  });

  showToast("🎉 Free MIXUE Promo Claimed! View code in Points Ledger.");

  // 加上淡出隐藏动画并从 DOM 中移除卡片
  const mixueCard = document.getElementById("card-mixue-promo");
  if (mixueCard) {
    mixueCard.style.transition = "all 0.5s ease";
    mixueCard.style.opacity = "0";
    mixueCard.style.transform = "scale(0.9)";
    setTimeout(() => {
      mixueCard.remove();
    }, 500);
  }
}

// 常规优惠券兑换
function redeemVoucher(title, cost) {
  if (userPoints < cost) {
    showToast(
      `Not enough Points! You need ${cost} PTS for this voucher. Water your tree to earn points!`,
      "error"
    );
    return;
  }

  userPoints -= cost;
  totalPointsSpent += cost;
  updateHeaderDisplays();

  const voucherCode = "UUM-" + Math.floor(1000 + Math.random() * 9000);
  redeemedVouchers.push({ title, code: voucherCode, used: false });

  showToast(`Redeemed "${title}"! View code in Points ledger.`);
}

function filterRewards(category) {
  const cards = document.querySelectorAll("#page-rewards .glass-card");
  cards.forEach((card) => {
    const cardCategory = card.getAttribute("data-category");
    if (category === "all" || cardCategory === category) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

function redeemDigitalSwitch() {
  if (hasDigitalSwitchDiscount) {
    showToast("You have already claimed this promo!", "error");
    return;
  }
  hasDigitalSwitchDiscount = true;
  const voucherCode = "DIGITAL-UUM-" + Math.floor(1000 + Math.random() * 9000);
  redeemedVouchers.push({
    title: "RM 2.00 Off Canteen (Digital Switch)",
    code: voucherCode,
    used: false,
  });

  showToast("Promo Claimed! Your Inasis Canteen meal is now discounted.");
  updateSimAmount();
}

// Toast Notification Banner
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `p-4 rounded-xl text-xs font-bold shadow-xl border flex items-center space-x-2 transform transition-all duration-300 pointer-events-auto ${
    type === "success"
      ? "bg-emerald-600 text-white border-emerald-500"
      : "bg-red-600 text-white border-red-500"
  }`;
  toast.innerHTML = `<i class="fa-solid ${
    type === "success" ? "fa-circle-check" : "fa-circle-xmark"
  }"></i> <span>${message}</span>`;

  const container = document.getElementById("toast-container");
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Balance Modal Controls
function openBalanceModal() {
  document.getElementById("modal-balance").classList.remove("hidden");
}
function closeBalanceModal() {
  document.getElementById("modal-balance").classList.add("hidden");
}
function quickAddMoney(amt) {
  document.getElementById("input-add-money").value = amt;
}
function confirmAddMoney() {
  const input = document.getElementById("input-add-money");
  const val = parseFloat(input.value);
  if (!isNaN(val) && val > 0) {
    userBalance += val;
    updateHeaderDisplays();
    showToast(`Successfully added RM ${val.toFixed(2)} to your balance!`);
    input.value = "";
    closeBalanceModal();
  } else {
    showToast("Please enter a valid amount to add.", "error");
  }
}

// Points Modal Controls
function openPointsModal() {
  renderRedeemedVouchers();
  document.getElementById("modal-points").classList.remove("hidden");
}
function closePointsModal() {
  document.getElementById("modal-points").classList.add("hidden");
}

function renderRedeemedVouchers() {
  const container = document.getElementById("redeemed-vouchers-list");
  if (redeemedVouchers.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No vouchers redeemed yet. Earn points and redeem above!</p>`;
    return;
  }

  container.innerHTML = redeemedVouchers
    .map(
      (v, i) => `
    <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
      <div>
        <p class="font-bold text-slate-800">${v.title}</p>
        <span class="text-[10px] text-slate-400">Code: ${v.code}</span>
      </div>
      <button onclick="toggleVoucherStatus(${i})" class="px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all ${
        v.used
          ? "bg-slate-200 text-slate-600"
          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
      }">
        ${v.used ? "Used" : "Mark as Used"}
      </button>
    </div>
  `
    )
    .join("");
}

function toggleVoucherStatus(index) {
  redeemedVouchers[index].used = !redeemedVouchers[index].used;
  renderRedeemedVouchers();
}

// Payment Simulator Logic
function setPayMode(mode) {
  if (mode === "qr") {
    document.getElementById("sim-qr-box").classList.remove("hidden");
    document.getElementById("sim-acc-box").classList.add("hidden");
    document.getElementById("btn-mode-qr").className =
      "flex-1 py-2 text-xs font-bold rounded-lg bg-white text-blue-600 shadow-sm transition-all";
    document.getElementById("btn-mode-acc").className =
      "flex-1 py-2 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 transition-all";
  } else {
    document.getElementById("sim-qr-box").classList.add("hidden");
    document.getElementById("sim-acc-box").classList.remove("hidden");
    document.getElementById("btn-mode-acc").className =
      "flex-1 py-2 text-xs font-bold rounded-lg bg-white text-blue-600 shadow-sm transition-all";
    document.getElementById("btn-mode-qr").className =
      "flex-1 py-2 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 transition-all";
  }
}

function updateSimAmount() {
  const select = document.getElementById("sim-merchant");
  const selectedOpt = select.options[select.selectedIndex];
  let price = parseFloat(selectedOpt.getAttribute("data-price"));

  if (price) {
    if (select.value.includes("Inasis Canteen") && hasDigitalSwitchDiscount) {
      price -= 2.0;
      document.getElementById("sim-amount").value = price.toFixed(2);
      showToast("Digital Switch Promo (-RM 2.00) automatically applied!");
    } else {
      document.getElementById("sim-amount").value = price.toFixed(2);
    }
  }
}

function executePayment() {
  const amount = parseFloat(document.getElementById("sim-amount").value);
  const merchant = document.getElementById("sim-merchant").value;

  if (isNaN(amount) || amount <= 0) {
    showToast("Please enter a valid amount.", "error");
    return;
  }

  if (userBalance < amount) {
    showToast("Insufficient balance! Please top up first.", "error");
    openBalanceModal();
    return;
  }

  if (merchant.includes("Inasis Canteen") && hasDigitalSwitchDiscount) {
    hasDigitalSwitchDiscount = false;
    const voucher = redeemedVouchers.find((v) =>
      v.title.includes("Digital Switch")
    );
    if (voucher) voucher.used = true;
  }

  userBalance -= amount;
  userDrops += 20;
  totalDropsEarned += 20;
  updateHeaderDisplays();

  const historyList = document.getElementById("tx-history-list");
  const item = document.createElement("div");
  item.className =
    "flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs animate-fade-in";
  item.innerHTML = `
    <div class="flex items-center space-x-3">
      <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
        <i class="fa-solid fa-store"></i>
      </div>
      <div>
        <p class="font-bold text-slate-800">${merchant}</p>
        <p class="text-[10px] text-slate-400">Digital Payment Verified</p>
      </div>
    </div>
    <div class="text-right">
      <p class="font-extrabold text-slate-800">- RM ${amount.toFixed(2)}</p>
      <span class="text-[9px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-100">+20 Drops 💧</span>
    </div>
  `;
  historyList.prepend(item);

  openPaymentSuccessModal(amount, merchant);
  updateSimAmount();
}

function openPaymentSuccessModal(amount, merchant) {
  const modal = document.getElementById("modal-payment-success");
  const content = document.getElementById("payment-success-content");
  const desc = document.getElementById("payment-success-desc");

  desc.innerHTML = `You paid <span class="font-bold text-slate-800">RM ${amount.toFixed(
    2
  )}</span> to ${merchant}.`;

  modal.classList.remove("hidden");
  setTimeout(() => {
    content.classList.remove("scale-95", "opacity-0");
    content.classList.add("scale-100", "opacity-100");
  }, 10);
}

function closePaymentSuccessModal() {
  const modal = document.getElementById("modal-payment-success");
  const content = document.getElementById("payment-success-content");

  content.classList.remove("scale-100", "opacity-100");
  content.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

// Quiz Educator Logic (5 Questions)
function loadQuizQuestion() {
  const q = quizData[currentQuizIndex];
  document.getElementById("quiz-question").innerText = q.question;
  document.getElementById(
    "quiz-progress-text"
  ).innerText = `Question ${currentQuizIndex + 1} of ${quizData.length}`;
  document.getElementById("quiz-feedback").classList.add("hidden");
}

function answerQuiz(userThinksScam) {
  const q = quizData[currentQuizIndex];
  const isCorrect = userThinksScam === q.isScam;
  const feedback = document.getElementById("quiz-feedback");

  if (isCorrect) {
    userDrops += 10;
    totalDropsEarned += 10;
    updateHeaderDisplays();
    feedback.className =
      "mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1";
    feedback.innerHTML = `<strong><i class="fa-solid fa-circle-check"></i> Correct! (+10 Water Drops 💧)</strong><p>${q.explanation}</p>`;
  } else {
    feedback.className =
      "mt-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-1";
    feedback.innerHTML = `<strong><i class="fa-solid fa-circle-xmark"></i> Incorrect</strong><p>${q.explanation}</p>`;
  }

  feedback.classList.remove("hidden");

  setTimeout(() => {
    currentQuizIndex = (currentQuizIndex + 1) % quizData.length;
    loadQuizQuestion();
  }, 3500);
}

// Modal Controls
function openLoginModal() {
  document.getElementById("modal-login").classList.remove("hidden");
  setTimeout(() => {
    document
      .getElementById("login-content")
      .classList.remove("scale-95", "opacity-0");
    document
      .getElementById("login-content")
      .classList.add("scale-100", "opacity-100");
  }, 10);
}

function closeLoginModal() {
  document
    .getElementById("login-content")
    .classList.remove("scale-100", "opacity-100");
  document
    .getElementById("login-content")
    .classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    document.getElementById("modal-login").classList.add("hidden");
  }, 300);
}

function openFpxModal() {
  document.getElementById("modal-fpx").classList.remove("hidden");
}
function closeFpxModal() {
  document.getElementById("modal-fpx").classList.add("hidden");
}
