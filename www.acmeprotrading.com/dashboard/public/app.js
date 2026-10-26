// ==================== USER DATA MANAGEMENT ====================
function apiLog(action, data) {
  const logs = JSON.parse(localStorage.getItem('apiLogs') || '[]');
  logs.push({
    timestamp: new Date().toISOString(),
    action,
    data
  });
  localStorage.setItem('apiLogs', JSON.stringify(logs));
  console.log('API Call:', action, data);
}
// Initialize user data structure — requires a logged-in user (set by login.html)
function initUserData() {
  const existingUser = localStorage.getItem('userData');
  if (!existingUser) {
    // Login redirect disabled for the prototype: seed a default demo user so the
    // dashboard loads without signing in. Re-enable the redirect for production.
    const demoUser = {
      _id: 'demo',
      firstName: 'New',
      lastName: 'Port',
      email: 'demo@example.com',
      country: 'Andorra',
      kyc: 'unverified',
      verified: false,
      balance: 0,
      profit: 0,
      referalBonus: '0',
      referralCode: 'DEMO01',
      referredUsers: [],
      transactions: [],
      withdrawals: [],
      copyTradingActive: [],
      plan: [],
      rewards: [],
      dateJoined: new Date().toISOString()
    };
    localStorage.setItem('userData', JSON.stringify(demoUser));
    return demoUser;
  }
  return JSON.parse(existingUser);
}

// Investment Plans Definition
function getInvestmentPlans() {
  const plans = localStorage.getItem('investmentPlans');
  if (!plans) {
    const defaultPlans = [
     {
        id: 'basic',
        name: 'Basic Package',
        minInvestment: 3000,
        maxInvestment: 25000,
        dailyProfitRate: 0.004, // 2% daily
        duration: 30, // days
        durationn: 24, // days
        description: 'Perfect for beginners looking to start their investment journey',
        color: 'hsl(30, 60%, 50%)'
      },
      {
        id: 'silver',
        name: 'Silver Plan',
        minInvestment: 25000,
        maxInvestment: 50000,
        dailyProfitRate: 0.005, // 3.5% daily
        duration: 30,
         durationn: 720, // days
        description: 'Balanced plan for steady, diversified growth',
        color: 'hsl(0, 0%, 70%)'
      },
      {
        id: 'gold',
        name: 'Gold Plan',
        minInvestment: 100000,
        maxInvestment: 300000,
        dailyProfitRate: 0.006, // 5% daily
        duration: 30,
        monthly:0.40,
         durationn: 720, // days
        description: 'Premium plan for serious investors',
        color: 'hsl(45, 100%, 50%)'
      },
      {
        id: 'diamond',
        name: 'Diamond Plan',
        minInvestment: 300000,
        maxInvestment: 500000,
        dailyProfitRate: 0.013, // 7.5% daily
        duration: 1095,
         durationn: 26280,
           monthly:0.40, // days
        description: 'Elite plan with exclusive benefits',
        color: 'hsl(195, 70%, 60%)'
      },
       {
        id: 'ultimate',
        name: 'Ultimate Plan',
        minInvestment: 1000000,
        maxInvestment: 3000000,
        dailyProfitRate: 0.013, // 7.5% daily
        duration: 1095,
         durationn: 26280, // hours
         monthly:0.40,
        description: 'Elite plan with exclusive benefits',
        color: 'hsl(195, 70%, 60%)'
      },
       {
        id: 'inner',
        name: 'inner circle Plan',
        minInvestment: 5000000,
        maxInvestment: "unlimited",
        dailyProfitRate: 0.064, // 7.5% daily
        duration: 7,
         durationn: 120, // days
        description: 'Elite plan with exclusive benefits',
        color: 'hsl(195, 70%, 60%)'
      }
      
    ];

    localStorage.removeItem('investmentPlans');
    localStorage.setItem('investmentPlans', JSON.stringify(defaultPlans));
    return defaultPlans;
  }
  return JSON.parse(plans);
}

// Update investment plans
function updateInvestmentPlans(plans) {
  localStorage.setItem('investmentPlans', JSON.stringify(plans));
  apiLog('INVESTMENT_PLANS_UPDATED', { count: plans.length });
}

// Load the admin-managed plan catalog from the backend into the local cache,
// so users see whatever the admin set in the admin panel. Falls back silently
// to the cached/default plans if the server can't be reached.
async function fxLoadPlans() {
  try {
    const r = await $.ajax({ type: 'GET', url: 'https://vantage-render.onrender.com/settings/plans', dataType: 'json', timeout: 30000 });
    if (r && Array.isArray(r.data) && r.data.length) {
      localStorage.setItem('investmentPlans', JSON.stringify(r.data));
      return true;
    }
  } catch (e) { /* offline: keep cached/default plans */ }
  return false;
}

// ----- Investment plans (separate product from staking) -----
const DEFAULT_INVESTMENT_PRODUCTS = [
  { id: 'starter_fund', name: 'Starter Fund', minInvestment: 500,   maxInvestment: 5000,       dailyProfitRate: 0.003, capMultiple: 1.5, duration: 60,  description: 'Entry-level managed fund for first-time investors', color: 'hsl(210, 70%, 55%)' },
  { id: 'growth_fund',  name: 'Growth Fund',  minInvestment: 5000,  maxInvestment: 50000,      dailyProfitRate: 0.005, capMultiple: 2,   duration: 90,  description: 'Balanced growth across a diversified portfolio',     color: 'hsl(160, 60%, 45%)' },
  { id: 'premium_fund', name: 'Premium Fund', minInvestment: 50000, maxInvestment: 'unlimited', dailyProfitRate: 0.007, capMultiple: 2.5, duration: 120, description: 'Actively managed fund for high-net-worth investors',  color: 'hsl(45, 90%, 55%)' },
];

function getInvestmentProducts() {
  try {
    const cached = localStorage.getItem('investmentProducts');
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  localStorage.setItem('investmentProducts', JSON.stringify(DEFAULT_INVESTMENT_PRODUCTS));
  return DEFAULT_INVESTMENT_PRODUCTS;
}

async function fxLoadInvestmentPlans() {
  try {
    const r = await $.ajax({ type: 'GET', url: 'https://vantage-render.onrender.com/settings/investment-plans', dataType: 'json', timeout: 30000 });
    if (r && Array.isArray(r.data) && r.data.length) {
      localStorage.setItem('investmentProducts', JSON.stringify(r.data));
      return true;
    }
  } catch (e) { /* offline: keep cached/default */ }
  return false;
}

// Get user data
// Fetch fresh user from backend (async)
async function getUser() {
  const parsedData = localStorage.getItem("userData");
  if (!parsedData) return null;

  const userFromLS = JSON.parse(parsedData);

  try {
    const response = await $.ajax({
      type: "GET",
      url: `https://vantage-render.onrender.com/users/${userFromLS.email}`,
      dataType: "json",
      timeout: 30000,
    });

    // update local storage with latest data
    localStorage.setItem("userData", JSON.stringify(response.data));
    console.log("✅ User refreshed from server");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    // Return null (not the stale local copy) so the background refresh below
    // does NOT overwrite local changes — e.g. accrued rewards — when offline
    // or when the account isn't on the server yet (demo).
    return null;
  }
}

// Return cached user data immediately (not async)
function getUserData() {
  const parsedData = localStorage.getItem("userData");
  if (!parsedData) return null;

  const user = JSON.parse(parsedData);

  // 🔹 silently refresh user info in background (non-blocking).
  // Only overwrite when the server actually returned fresh data.
  getUser().then((updatedUser) => {
    if (updatedUser) {
      localStorage.setItem("userData", JSON.stringify(updatedUser));
    }
  });

  // 🔹 return current cached user immediately
  return user;
}

function updateUserData(updates) {
  const user = getUserData();
  const updatedUser = { ...user, ...updates };
  localStorage.setItem('userData', JSON.stringify(updatedUser));
  return updatedUser;
}
// Add transaction
// function addTransaction(transaction) {
//   const user = getUserData();
//   const newTransaction = {
//     id: Date.now().toString(),
//     timestamp: new Date().toISOString(),
//     ...transaction
//   };
//   user.transactions.push(newTransaction);
//   updateUserData(user);
//   apiLog('TRANSACTION_ADDED', newTransaction);
//   return newTransaction;
// }


async function addTransaction(dataObj) {
  
    const user = getUserData();
    console.log(user);
    
  const newTransaction = {
    userId: user._id,
    to:user.email,
    from:user.firstName + " "+user.lastName,
    timestamp: new Date().toISOString(),
    ...dataObj
  };
  
console.log(newTransaction);

    try {
      const data = await $.ajax({
        type: "POST",
        url: `https://vantage-render.onrender.com/transactions/${newTransaction.userId}/deposit`,
        dataType: "json",
        data: { ...newTransaction },
        timeout: 30000,
      });

      localStorage.removeItem("ct");
      // await commandTrade(data.tradeId, "true");

      console.log(data.tradeId);
      Swal.fire({
        title: "Deposit",
        text: "Deposit was successfully sent. Please wait a few minutes for account update",
        icon: "success",
        timer: 3000,
        showConfirmButton: false
      });
   renderInvestmentPage();
      // setTimeout(() => {
      //   window.location.href = "./transactions.html";
      // }, 3000);

    } catch (error) {
      console.error("Error Submitting Payment Data:", error);
      alert("Error Submitting Payment Data");
      setReady();
    }
  }


/// Add withdrawal (vanilla JS API version)
async function addWithdrawal(withdrawal) {
  const user = getUserData(); // assumes user data stored locally

  // Build the data object exactly as React expects
  const dataObj = {
    amount: withdrawal.amount,
    method: withdrawal.method,
    address: withdrawal.address,
    source:withdrawal.source,
    _id: user._id,
     to:user.email,
    from: user.firstName +" "+user.lastName,
    timestamp: new Date().toISOString(),
    balance: user.balance
  };

  try {
    apiLog("WITHDRAWAL_REQUEST", dataObj);

    // 🔹 Send POST request to backend API
    const response = await fetch(`https://vantage-render.onrender.com/transactions/${dataObj._id}/withdrawal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dataObj)
    });

    // 🔹 Parse response
    const result = await response.json();

    if (response.ok) {
      apiLog("WITHDRAWAL_SUCCESS", result);
      Swal.fire({
        icon: "success",
        title: "Withdrawal Requested!",
        text: "Your withdrawal request has been submitted successfully.",
      });

      // Optional: update local data
      user.withdrawals = user.withdrawals || [];
      user.withdrawals.push(result);
      updateUserData(user);
      return result;
    } else {
      // apiLog("WITHDRAWAL_FAILED", result);
      Swal.fire({
        icon: "error",
        title: "Request Failed",
        text: result.message || "Unable to process withdrawal request.",
      });
    }
  } catch (error) {
    console.error("Withdrawal Error:", error);
    // apiLog("WITHDRAWAL_ERROR", error);
    Swal.fire({
      icon: "error",
      title: "Network Error",
      text: "Unable to connect to the server. Please try again later.",
    });
  }
}


// Claim reward
function claimReward(rewardId) {
  const user = getUserData();
  const reward = user.rewards.find(r => r.id === rewardId);
  if (reward && !reward.claimed) {
    reward.claimed = true;
    user.balance += reward.amount;
    user.referalBonus = (parseFloat(user.referalBonus) + reward.amount).toString();
    updateUserData(user);
    apiLog('REWARD_CLAIMED', { rewardId, amount: reward.amount });
    return true;
  }
  return false;
}

// Add referral
function addReferral(referredEmail) {
  const user = getUserData();
  const newReferral = {
    email: referredEmail,
    dateJoined: new Date().toISOString(),
    status: 'pending',
    earned: 0
  };
  user.referredUsers.push(newReferral);
  updateUserData(user);
  apiLog('REFERRAL_ADDED', newReferral);
  return newReferral;
}

// ==================== INVESTMENT MANAGEMENT ====================

// Purchase investment plan (Frontend)
// Purchase investment plan (Frontend)
async function purchaseInvestmentPlan(planId, amount) {

  console.log("called");
  
  const user = getUserData();
  console.log("user fetched"+user);
  
  const plans = getInvestmentPlans();
  const plan = plans.find(p => p.id === planId);

  if (!plan) return { success: false, error: 'Plan not found' };
  if (amount < plan.minInvestment) return { success: false, error: `Minimum investment is $${plan.minInvestment}` };
  if (amount > plan.maxInvestment) return { success: false, error: `Maximum investment is $${plan.maxInvestment}` };
  if (user.balance < amount) return { success: false, error: 'Insufficient balance' };

  const now = Date.now();
  const startDate = new Date(now).toISOString();
  const startTime = new Date(now).toISOString(); // keep both if you use them differently
  const endDate = new Date(now + plan.duration * 24 * 60 * 60 * 1000).toISOString(); // duration in days

  const investment = {
    _id: now.toString(),
    planId: plan.id,
    planName: plan.name,
    amount: Number(amount),
    dailyProfitRate: plan.dailyProfitRate,
    duration: plan.duration, // in days
    startDate,
    startTime,
    endDate,
    daysElapsed: 0,
    totalProfit: 0,
    status: 'active', // or 'pending' if you want server confirmation first
    lastProfitUpdate: startDate,
    from: user.from,
    to: user.email,
    timestamp: startDate,
    // reserve fields for trade flow
    command: null,
    profit: 0,
    result: null,
    exitPrice: null
  };


  console.log("lnvestmeant created"+" "+investment);
  

  // Local optimisitic update
  user.balance = Number(user.balance) - Number(amount);
  user.plan = user.plan || [];
  user.plan.push(investment);
  updateUserData(user);
  apiLog('INVESTMENT_PURCHASED_LOCAL', investment);
console.log("sendlng to baclend");
  // Send to backend for persistence
  try {
    const resp = await fetch(`https://vantage-render.onrender.com/transactions/${user._id}/subplan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // match backend payload keys (subname/subamount/from/to/timestamp) or send whole object
        subname: plan.name,
        subamount: Number(amount),
        from: user.from,
        to: user.email,
        timestamp: startDate,
        investmentObject: investment // optional: send full object so backend can store exactly same shape
      })
    });

    const data = await resp.json();
    if (!resp.ok || !data.success) {
      throw new Error(data.message || 'Server error');
    }

    apiLog('INVESTMENT_PURCHASED_SERVER', data);
    if (data.success) {
  console.log(data);
  
    Swal.fire({ 
      icon: 'success', 
      title: 'Investment Activated!', 
      html: `Plan purchase success!`,
      confirmButtonText: 'OK' 
    }).then(() => {
      renderInvestmentPage ();
    });
  } 
    return { success: true, investment };
  } catch (err) {
    console.error('API purchase error:', err);
    apiLog('INVESTMENT_PURCHASE_FAILED', { error: err.message, investment });
    // optionally rollback local change or mark as 'failed' locally
    return { success: false, error: err.message };
  }
}



// Calculate and add daily profits
// Intentionally a no-op. This used to auto-credit "profit" to the balance on a
// timer based on a fixed daily rate, which fabricates guaranteed returns. A real
// dashboard reflects actual trade/investment results, so nothing is credited here.
// Accrue due daily rewards on a list of active positions (stakes or
// investments). Mutates each entry (daysElapsed/totalProfit/status), stopping
// at the end of the term and at the optional capMultiple cap. Returns the total
// reward to credit; does not persist or touch balance/profit.
function fxAccruePositions(list) {
  if (!Array.isArray(list)) return 0;
  let total = 0;
  const now = new Date();

  list.forEach(inv => {
    if (!inv || inv.status !== 'active') return;

    const duration = Number(inv.duration) || 0;
    const elapsedSoFar = Number(inv.daysElapsed) || 0;
    const remainingDays = duration - elapsedSoFar;
    if (duration > 0 && remainingDays <= 0) { inv.status = 'completed'; return; }

    const last = new Date(inv.lastProfitUpdate || inv.startDate || now);
    let days = Math.floor((now - last) / 86400000);
    if (days <= 0) return;
    if (duration > 0) days = Math.min(days, remainingDays); // never pay past the term

    const amount = Number(inv.amount) || 0;
    const rate = Number(inv.dailyProfitRate) || 0;
    let profit = amount * rate * days;

    // Optional cap: total earnings can't exceed capMultiple × principal.
    const capMultiple = Number(inv.capMultiple) || 0;
    if (capMultiple > 0) {
      const remainingCap = amount * capMultiple - (Number(inv.totalProfit) || 0);
      profit = Math.max(0, Math.min(profit, remainingCap));
    }

    inv.daysElapsed = elapsedSoFar + days;
    inv.totalProfit = (Number(inv.totalProfit) || 0) + profit;
    inv.lastProfitUpdate = now.toISOString();
    total += profit;

    const maturedByTerm = duration > 0 && inv.daysElapsed >= duration;
    const maturedByCap = capMultiple > 0 && inv.totalProfit >= amount * capMultiple - 1e-9;
    if (maturedByTerm || maturedByCap) inv.status = 'completed';
  });

  return total;
}

// Staking plans → user.plan
function processDailyProfits() {
  const user = getUserData();
  if (!user) return 0;
  const added = fxAccruePositions(user.plan);
  if (added > 0) {
    user.balance = (Number(user.balance) || 0) + added;
    user.profit = (Number(user.profit) || 0) + added;
    updateUserData(user);
    apiLog('STAKING_REWARDS_ACCRUED', { total: added });
  }
  return added;
}

// Investment plans → user.investments (separate product from staking)
function processInvestmentProfits() {
  const user = getUserData();
  if (!user) return 0;
  const added = fxAccruePositions(user.investments);
  if (added > 0) {
    user.balance = (Number(user.balance) || 0) + added;
    user.profit = (Number(user.profit) || 0) + added;
    updateUserData(user);
    apiLog('INVESTMENT_RETURNS_ACCRUED', { total: added });
  }
  return added;
}

// Get active investments
function getPlan() {
  const user = getUserData();
  return user.plan || [];
}

// ==================== THEME & UI ====================

const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.classList.toggle('dark', savedTheme === 'dark');
}

themeToggle.addEventListener('click', () => {
  const isDark = html.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  apiLog('THEME_CHANGED', { theme: isDark ? 'dark' : 'light' });
});
// Sidebar Elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarClose = document.getElementById('sidebarClose');

// ✅ Collapse sidebar by default on page load
sidebar.classList.add('collapsed');

// Toggle sidebar open/close
sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

// Close sidebar when clicking the close button
sidebarClose.addEventListener('click', () => {
  sidebar.classList.add('collapsed');
});


// ==================== NAVIGATION ====================

const navLinks = document.querySelectorAll('.nav-link');
const content = document.getElementById('content');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    const page = link.dataset.page;
    loadPage(page);
    apiLog('PAGE_NAVIGATION', { page });
  });
});

function loadPage(page) {
  switch (page) {
    case 'market':
      renderMarketPage();
      break;
    case 'social-trading':
      renderSocialTradingPage();
      break;
    case 'live-stream':
      renderLiveStreamPage();
      break;
       case 'trade':
     renderTradePage();
      break;
    case 'fund-account':
      renderFundAccountPage();
      break;
    case 'profile':
      renderProfilePage();
      break;
    case 'investment':
     renderInvestmentPage();
      break;
  
    case 'withdrawal':
      renderWithdrawalPage();
      break;
    case 'referrals':
      renderReferralsPage();
      break;
    case 'rewards':
      renderRewardsPage();
      break;
    case 'dashboard':
 
   renderDashboardPage();
      break;
    case 'investment-plans':
     renderInvestmentPlansPage(); // immediate from cache
     fxLoadPlans().then(ok => { if (ok) renderInvestmentPlansPage(); }); // then refresh from server
      break;
    case 'invest-plans':
      renderInvestProductsPage();
      fxLoadInvestmentPlans().then(ok => { if (ok) renderInvestProductsPage(); });
      break;
    case 'converter':
      renderConverterPage();
      break;
    case 'pnl-calendar':
      renderPnLCalendarPage();
      break;
    case 'more':
      renderMorePage();
      break;

       case 'tradehistory':
      renderTradeHistoryPage();
      break;

        case 'copytradehistory':
      renderCopyTradingHistory()
      break;
    case 'profit-history':
      renderProfitHistoryPage();
      break;
    case 'admin':
      renderAdminPage();
      break;
    default:
      renderMarketPage();
  }

  // ✅ Keep sidebar collapsed after loading new page
  if (sidebar) sidebar.classList.add('collapsed');
  // Close any open modal when navigating to another page.
  document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
}

// Close modals via the × button, a click on the backdrop, or the Escape key.
// (The static modals have close buttons but no handlers were bound.)
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t && t.classList && t.classList.contains('modal-close')) {
    const m = t.closest('.modal');
    if (m) m.classList.remove('active');
  } else if (t && t.classList && t.classList.contains('modal')) {
    t.classList.remove('active'); // clicked the backdrop itself
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
});


// ==================== STATIC DATA (Only for Master Traders) ====================

// const masterTraders = [
//   {
//     name: 'Ali G',
//     level: 'Guru',
//     rating: 4,
//     trades: 51,
//     commission: 30,
//     pnl: '+$89000.00',
//     profileId: '79697172',
//     accountLevel: 5,
//     followers: 89,
//     watchers: 231,
//     profitableTrade: 70
//   },
//   {
//     name: 'Sarah Chen',
//     level: 'Expert',
//     rating: 5,
//     trades: 128,
//     commission: 25,
//     pnl: '+$142500.00',
//     profileId: '84521963',
//     accountLevel: 7,
//     followers: 234,
//     watchers: 512,
//     profitableTrade: 85
//   },
//   {
//     name: 'Marcus Rivera',
//     level: 'Master',
//     rating: 4,
//     trades: 89,
//     commission: 28,
//     pnl: '+$98750.00',
//     profileId: '73296847',
//     accountLevel: 6,
//     type:"",
//      history,
//     trades,
//     followers: 156,
//     watchers: 387,
//     profitableTrade: 78
//   }
// ];

// ==================== PAGE RENDERERS ====================
// ==================== PROFIT HISTORY PAGE ====================
async function renderProfitHistoryPage() {
  const user = getUserData();
  const content = document.getElementById('content');

  // Show loading state immediately
  content.innerHTML = `
    <div style="padding: 2rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem;">💰 Profit History</h1>
      <p class="text-muted" style="margin-bottom:1.5rem;">All admin profit adjustments on your account</p>
      <div style="text-align:center; padding:3rem; color: hsl(var(--muted-foreground));">Loading...</div>
    </div>
  `;

  let history = [];
  let currentProfit = user.profit || 0;

  try {
    const res = await $.ajax({
      type: "GET",
      url: `https://vantage-render.onrender.com/transactions/${user._id}/profit/history`,
      dataType: "json",
      timeout: 30000,
    });
    if (res.success) {
      history = res.data || [];
      currentProfit = res.currentProfit ?? currentProfit;
    }
  } catch (e) {
    console.warn("Could not fetch profit history from server:", e);
  }

  // Calculate totals
  const totalAdded   = history.filter(e => e.type === "add").reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalDeducted = history.filter(e => e.type === "deduct").reduce((s, e) => s + Number(e.amount || 0), 0);

  const fmt = n => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rowsHtml = history.length === 0
    ? `<tr><td colspan="5" style="text-align:center;padding:2rem;color:hsl(var(--muted-foreground));">No profit adjustments yet.</td></tr>`
    : history.map(entry => {
        const isAdd = entry.type === "add";
        const color = isAdd ? "hsl(var(--chart-2))" : "hsl(var(--destructive))";
        const icon  = isAdd ? "▲" : "▼";
        const label = isAdd ? "Credit" : "Debit";
        const date  = new Date(entry.date || entry.ts || Date.now()).toLocaleString();
        return `
          <tr>
            <td style="padding:12px 8px;">
              <span style="color:${color}; font-weight:700; font-size:0.85rem;">${icon} ${label}</span>
            </td>
            <td style="padding:12px 8px; font-weight:700; color:${color};">${isAdd ? "+" : "-"}${fmt(entry.amount)}</td>
            <td style="padding:12px 8px; color:hsl(var(--muted-foreground)); font-size:0.85rem;">${entry.note || "—"}</td>
            <td style="padding:12px 8px; font-size:0.85rem;">${fmt(entry.before)} → ${fmt(entry.after)}</td>
            <td style="padding:12px 8px; color:hsl(var(--muted-foreground)); font-size:0.8rem; white-space:nowrap;">${date}</td>
          </tr>
        `;
      }).join("");

  content.innerHTML = `
    <style>
      .ph-card {
        background: hsl(var(--card));
        border: 1px solid hsl(var(--card-border));
        border-radius: 12px;
        padding: 1.25rem 1.5rem;
      }
      .ph-stat { display:flex; flex-direction:column; gap:4px; }
      .ph-stat-label { font-size:0.78rem; color:hsl(var(--muted-foreground)); text-transform:uppercase; letter-spacing:.06em; }
      .ph-stat-value { font-size:1.5rem; font-weight:700; }
      .ph-table { width:100%; border-collapse:collapse; font-size:0.9rem; }
      .ph-table thead th { text-align:left; padding:10px 8px; border-bottom:1px solid hsl(var(--border)); color:hsl(var(--muted-foreground)); font-size:0.78rem; text-transform:uppercase; letter-spacing:.05em; font-weight:600; }
      .ph-table tbody tr:hover { background: hsl(var(--accent)); }
      .ph-table tbody tr { border-bottom:1px solid hsl(var(--border)); }
      @media(max-width:640px){
        .ph-stats-grid { grid-template-columns: 1fr 1fr !important; }
        .ph-table thead th:nth-child(4),
        .ph-table tbody td:nth-child(4) { display:none; }
      }
    </style>

    <div style="padding: 1.5rem 1rem;">
      <h1 style="font-size:1.5rem; font-weight:700; margin-bottom:0.25rem;">💰 Profit History</h1>
      <p class="text-muted" style="margin-bottom:1.5rem;">All admin profit adjustments credited or debited on your account</p>

      <!-- Summary cards -->
      <div class="ph-stats-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:1.5rem;">
        <div class="ph-card ph-stat">
          <span class="ph-stat-label">Current Profit</span>
          <span class="ph-stat-value" style="color:hsl(var(--chart-2));">${fmt(currentProfit)}</span>
        </div>
        <div class="ph-card ph-stat">
          <span class="ph-stat-label">Total Credited</span>
          <span class="ph-stat-value" style="color:hsl(var(--chart-2));">+${fmt(totalAdded)}</span>
        </div>
        <div class="ph-card ph-stat">
          <span class="ph-stat-label">Total Debited</span>
          <span class="ph-stat-value" style="color:hsl(var(--destructive));">-${fmt(totalDeducted)}</span>
        </div>
      </div>

      <!-- History table -->
      <div class="ph-card" style="overflow-x:auto;">
        <h2 style="font-size:1rem; font-weight:600; margin-bottom:1rem;">Adjustment Log</h2>
        <table class="ph-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Note</th>
              <th>Before → After</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    </div>
  `;
}

// ==================== DASHBOARD PAGE ====================
// ==================== ACCOUNT DASHBOARD (landing page) ====================
// Rewritten as an account "home" styled after the reference app. All figures
// come from the user's own data; nothing here fabricates balances or profit.

const fxIcons = {
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>',
  eyeOff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path><line x1="1" y1="1" x2="23" y2="23"></line>',
  info: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
  deposit: '<line x1="12" y1="3" x2="12" y2="15"></line><polyline points="7 10 12 15 17 10"></polyline><line x1="5" y1="21" x2="19" y2="21"></line>',
  withdraw: '<line x1="5" y1="3" x2="19" y2="3"></line><line x1="12" y1="21" x2="12" y2="9"></line><polyline points="7 14 12 9 17 14"></polyline>',
  convert: '<polyline points="8 3 4 7 8 11"></polyline><line x1="4" y1="7" x2="20" y2="7"></line><polyline points="16 13 20 17 16 21"></polyline><line x1="20" y1="17" x2="4" y2="17"></line>',
  history: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
  trending: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>',
  fileSearch: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="11.5" cy="14.5" r="2.5"></circle><line x1="13.3" y1="16.3" x2="15" y2="18"></line>',
  trade: '<line x1="6" y1="4" x2="6" y2="20"></line><rect x="4" y="8" width="4" height="7" rx="1"></rect><line x1="14" y1="3" x2="14" y2="19"></line><rect x="12" y="6" width="4" height="8" rx="1"></rect><line x1="3" y1="21" x2="21" y2="21"></line>',
  live: '<circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
  plans: '<circle cx="12" cy="12" r="10"></circle><polyline points="8 14 11 11 13 13 16 10"></polyline>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
  crown: '<path d="M2 18h20"></path><path d="M3 7l5 5 4-7 4 7 5-5-2 11H5z"></path>',
  settings: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>'
};

function fxIcon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${fxIcons[name]}</svg>`;
}

function fxUSD(value) {
  return Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Navigate from in-page buttons / bottom nav
function fxGo(page) {
  loadPage(page);
  if (content) content.scrollTop = 0;
  document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === page));
}

const fxDashState = { balanceHidden: false, calView: 'month', calMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1), tradesTab: 'stock', tradesMode: 'live' };

function renderDashboardPage() {
  processDailyProfits();      // staking rewards
  processInvestmentProfits(); // investment-plan returns
  const user = getUserData() || {};
  const txns = user.transactions || [];
  const withdrawals = user.withdrawals || [];
  // Backend stores deposit transactions as type "Deposit"; match case-insensitively.
  const totalDeposit = txns.filter(t => String(t.type || '').toLowerCase() === 'deposit').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
  const totalWithdrawals = withdrawals.reduce((s, w) => s + (parseFloat(w.amount) || 0), 0);
  const copied = (user.copyTradingActive || []).slice(-1)[0];
  const copiedName = copied ? (copied.trader || copied.name || copied.traderName || 'Active copy') : null;
  const verified = user.kyc === 'verified';
  const firstName = user.firstName || 'there';
  // Account type chosen at registration (individual | business).
  const acctLabel = String(user.accountType || 'individual').toLowerCase() === 'business' ? 'BUSINESS' : 'INDIVIDUAL';

  content.innerHTML = `
    <div class="home">
      <section class="home-welcome">
        <h1>Welcome, ${firstName}!</h1>
        <p>We hope you enjoy your trading experience with us. Explore the app to get started.</p>
      </section>

      <section class="home-card home-balance">
        <div class="home-balance-top">
          <div class="home-balance-label">Total Balance
            <button class="home-icon-btn" id="fxToggleBal" aria-label="Show or hide balance">${fxIcon(fxDashState.balanceHidden ? 'eyeOff' : 'eye')}</button>
          </div>
          <span class="home-pill home-pill-tier">${acctLabel}</span>
        </div>
        <div class="home-balance-value">≈ <span id="fxBalAmt">${fxDashState.balanceHidden ? '******' : '$' + fxUSD(fxPortfolioValue())}</span> USD
          <span class="home-info" title="Approximate value of all assets in your account">${fxIcon('info')}</span>
        </div>
        <div class="home-actions">
          <button class="home-action primary" data-goto="fund-account">${fxIcon('deposit')}<span>Deposit</span></button>
          <button class="home-action" data-goto="withdrawal">${fxIcon('withdraw')}<span>Withdraw</span></button>
          <button class="home-action" data-goto="converter">${fxIcon('convert')}<span>Convert</span></button>
          <button class="home-action" data-goto="profit-history">${fxIcon('history')}<span>History</span></button>
        </div>
        <div class="home-row"><span>Account Type</span><span class="home-pill home-pill-teal">Normal</span></div>
        <div class="home-row"><span>Verification</span><span class="home-pill ${verified ? 'home-pill-green' : 'home-pill-yellow'}">${verified ? 'Verified' : 'Pending Verification'}</span></div>
      </section>

      <button class="home-live" data-goto="live-stream"><span class="home-live-dot"></span>Start Live trading</button>

      <section class="home-card home-expert">
        <div class="home-expert-head"><span>Expert</span><strong>${copiedName || 'No Expert Copied'}</strong></div>
        <div class="home-expert-body">${copied ? `<p class="text-muted small">Copy trading is active on your account.</p>` : ''}</div>
        <div class="home-stat"><span class="home-dot" style="background-color:hsl(45 90% 50%);"></span>Total Deposit<strong>≈ ${fxUSD(totalDeposit)} USD</strong></div>
        <div class="home-stat"><span class="home-dot" style="background-color:hsl(22 95% 58%);"></span>Total Withdrawals<strong>≈ ${fxUSD(totalWithdrawals)} USD</strong></div>
        <div class="home-stat"><span class="home-dot" style="background-color:hsl(142 75% 45%);"></span>Total profits<strong>≈ ${fxUSD(user.profit)} USD</strong></div>
      </section>

      <section class="home-card home-calendar" id="fxHomeCal"></section>

      <section class="home-card">
        <div class="home-section-head"><h2>${fxIcon('trending')}Trending Experts</h2><button class="home-link" data-goto="social-trading">View All</button></div>
        <div id="fxTrending"><p class="text-muted small">Loading experts…</p></div>
      </section>

      <section class="home-trades" id="fxHomeTrades"></section>

      <section class="home-card home-markets">
        <div class="home-section-head"><h2>${fxIcon('trending')}Popular Markets</h2></div>
        <div id="fxMarkets"></div>
      </section>
    </div>
  `;

  content.querySelectorAll('[data-goto]').forEach(el => el.addEventListener('click', () => fxGo(el.dataset.goto)));
  document.getElementById('fxToggleBal').addEventListener('click', () => { fxDashState.balanceHidden = !fxDashState.balanceHidden; renderDashboardPage(); });

  fxRenderHomeCalendar();
  fxRenderHomeTrades();
  fxRenderTrending();
  fxRenderMarkets();
}

// Popular-coins list with a per-row three-dots menu (Convert / Trade / Details).
function fxRenderMarkets() {
  const el = document.getElementById('fxMarkets');
  if (!el) return;
  el.innerHTML = Object.keys(fxPrices).map(s => {
    const c = fxPrices[s];
    const up = c.change >= 0;
    return `
      <div class="market-row" data-sym="${s}">
        ${fxCoinIcon(s, 38)}
        <div class="market-info"><div class="market-name">${c.name}</div><div class="market-sym">${s}</div></div>
        <div class="market-price"><div class="market-val">${fxCoinPrice(c.price)}</div><div class="market-chg ${up ? 'up' : 'down'}">${up ? '+' : ''}${c.change.toFixed(2)}%</div></div>
        <div class="market-menu-wrap">
          <button class="market-dots" data-sym="${s}" aria-label="More options for ${c.name}"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg></button>
          <div class="market-menu" data-menu="${s}">
            <button data-act="convert" data-sym="${s}">${fxIcon('convert')}Convert</button>
            <button data-act="trade" data-sym="${s}">${fxIcon('trade')}Trade</button>
            <button data-act="details" data-sym="${s}">${fxIcon('info')}Details</button>
          </div>
        </div>
      </div>`;
  }).join('');

  const closeMenus = () => el.querySelectorAll('.market-menu.open').forEach(m => m.classList.remove('open'));
  el.querySelectorAll('.market-dots').forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = el.querySelector(`.market-menu[data-menu="${btn.dataset.sym}"]`);
    const willOpen = !menu.classList.contains('open');
    closeMenus();
    if (willOpen) {
      menu.classList.add('open');
      // Bind a fresh outside-click handler each time a menu opens.
      setTimeout(() => document.addEventListener('click', function h() { closeMenus(); document.removeEventListener('click', h); }), 0);
    }
  }));
  el.querySelectorAll('.market-menu button').forEach(b => b.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    fxMarketAction(b.dataset.act, b.dataset.sym);
  }));
}

function fxMarketAction(act, sym) {
  const c = fxPrices[sym];
  if (act === 'convert') { fxConvertPreset = sym; fxGo('converter'); }
  else if (act === 'trade') { fxGo('market'); }
  else if (act === 'details') {
    Swal.fire({
      title: `${c.name} (${sym})`,
      html: `<div style="display:flex;justify-content:center;margin-bottom:0.75rem;">${fxCoinIcon(sym, 48)}</div><strong>Price:</strong> ${fxCoinPrice(c.price)}<br><strong>24h change:</strong> <span style="color:${c.change >= 0 ? 'hsl(142 70% 45%)' : 'hsl(350 80% 56%)'};">${c.change >= 0 ? '+' : ''}${c.change.toFixed(2)}%</span>`,
      confirmButtonText: 'Convert',
      showCancelButton: true,
      cancelButtonText: 'Close'
    }).then(r => { if (r.isConfirmed) { fxConvertPreset = sym; fxGo('converter'); } });
  }
}

async function fxRenderTrending() {
  const el = document.getElementById('fxTrending');
  if (!el) return;
  let traders = [];
  try { traders = await fetchTrader(); } catch (e) { traders = []; }
  if (!Array.isArray(traders) || !traders.length) {
    el.innerHTML = `<p class="text-muted small">No experts available right now. Check back soon.</p>`;
    return;
  }
  el.innerHTML = traders.slice(0, 3).map(t => {
    const name = t.name || 'Trader';
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const avatar = t.photo ? `<img src="${t.photo}" alt="${name}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'home-avatar',textContent:'${initials}'}))">` : initials;
    const win = t.profitableTrade != null ? `${String(t.profitableTrade).replace(/%+$/, '')}%` : '—';
    const watchers = t.watchers != null ? t.watchers : (t.followers != null ? t.followers : '—');
    const esc = (v) => String(v == null ? '' : v).replace(/"/g, '&quot;');
    return `
      <div class="home-expert-item">
        <div class="home-avatar">${avatar}</div>
        <div class="home-expert-info">
          <div class="home-expert-name">${name}</div>
          <div class="home-expert-meta">${fxIcon('users')}<strong>${watchers}</strong><span class="home-sep">·</span>Win <span class="home-win">${win}</span></div>
        </div>
        <button class="home-copy-btn"
          data-name="${esc(t.name || 'Unknown')}"
          data-level="${esc(t.level || 'N/A')}"
          data-rating="${esc(t.rating || '0')}"
          data-photo="${esc(t.photo || ' ')}"
          data-trades='${esc(JSON.stringify(t.trades || []))}'
          data-commission="${esc(t.commission || '0%')}"
          data-pnl="${esc(t.pnl || '₦0')}"
          data-profileid="${esc(t.profileId || 'N/A')}"
          data-accountlevel="${esc(t.accountLevel || 'Basic')}"
          data-type="${esc(t.type || 'N/A')}"
          data-history='${esc(JSON.stringify(t.history || []))}'
          data-followers="${esc(t.followers || '0')}"
          data-watchers="${esc(t.watchers || '0')}"
          data-profitabletrade="${esc(t.profitableTrade || '0%')}"
          onclick="openCopyTradeModal(this)">Copy</button>
      </div>`;
  }).join('');
}

// ---- P&L data: real trade results when available, else deterministic mock ----
const FX_PNL_MONTHS = 12;

// Built from the user's own closed trades (user.planHistory entries carry
// `profit` + `date`). Returns { 'YYYY-M-D': totalProfit } or null if the user
// has no trade history yet (then the calendar falls back to the mock).
let fxPnlRealMap; // undefined = not computed; null = no real data; object = real
function fxComputeRealPnl() {
  const u = fxCurrentUser();
  const trades = u && Array.isArray(u.planHistory) ? u.planHistory : [];
  const map = {};
  let count = 0;
  trades.forEach(t => {
    if (!t || t.date == null || t.profit == null) return;
    const p = Number(t.profit);
    const d = new Date(t.date);
    if (Number.isNaN(p) || isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    map[key] = (map[key] || 0) + p;
    count++;
  });
  return count ? map : null;
}
// Recomputed at the start of each calendar render so fresh user data shows up.
function fxResetPnl() { fxPnlRealMap = fxComputeRealPnl(); }
function fxPnlKey(date) { return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`; }

function fxDailyPnL(date) {
  if (fxPnlRealMap) return fxPnlRealMap[fxPnlKey(date)] || 0;
  // Mock fallback (demo / accounts with no trades yet).
  let seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const rnd = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const profitable = rnd() < 0.62;
  const size = 20 + rnd() * 480;
  return Math.round((profitable ? size : -size * 0.7) * 100) / 100;
}

function fxFormatPnL(value, compact) {
  const sign = value >= 0 ? '+' : '-';
  const abs = Math.abs(value);
  if (compact) return `${sign}$${abs >= 1000 ? (abs / 1000).toFixed(1) + 'k' : Math.round(abs)}`;
  return `${sign}$${abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fxHasHistory(date) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const earliest = new Date(today.getFullYear(), today.getMonth() - (FX_PNL_MONTHS - 1), 1);
  if (date < earliest || date > today) return false;
  // With real data, only days that actually have trades are marked; the mock
  // treats every past day in the window as having a result.
  if (fxPnlRealMap) return Object.prototype.hasOwnProperty.call(fxPnlRealMap, fxPnlKey(date));
  return true;
}

function fxClampMonth(date) {
  const today = new Date();
  const earliest = new Date(today.getFullYear(), today.getMonth() - (FX_PNL_MONTHS - 1), 1);
  const latest = new Date(today.getFullYear(), today.getMonth(), 1);
  return date < earliest ? earliest : (date > latest ? latest : date);
}

function fxPnLRange(start, end) {
  const days = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) if (fxHasHistory(d)) days.push(fxDailyPnL(d));
  return days;
}

function fxShowPnLDay(date, pnl) {
  Swal.fire({ icon: pnl > 0 ? 'success' : 'error', title: fxFormatPnL(pnl), text: `${pnl > 0 ? 'Profitable day' : 'Losing day'} · ${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`, confirmButtonText: 'OK' });
}

function fxRenderHomeCalendar() {
  const el = document.getElementById('fxHomeCal');
  if (!el) return;
  fxResetPnl();
  const view = fxDashState.calView, current = fxDashState.calMonth;
  const year = current.getFullYear(), month = current.getMonth();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const step = (m) => fxClampMonth(new Date(year, month + m, 1));
  const navBtn = (id, label, sym, m) => `<button class="cal-nav-btn" id="${id}" ${step(m).getTime() === current.getTime() ? 'disabled' : ''} aria-label="${label}">${sym}</button>`;

  let title, body;
  if (view === 'month') {
    title = current.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    const dim = new Date(year, month + 1, 0).getDate();
    const n = Math.ceil((offset + dim) / 7) * 7;
    let cells = '';
    for (let i = 0; i < n; i++) {
      const date = new Date(year, month, 1 - offset + i);
      const inMonth = date.getMonth() === month;
      const pnl = inMonth && fxHasHistory(date) ? fxDailyPnL(date) : null;
      let cls = 'cal-day';
      if (!inMonth) cls += ' other'; else if (pnl === null) cls += ' empty'; else cls += pnl > 0 ? ' green' : ' red';
      if (date.getTime() === today.getTime()) cls += ' today';
      cells += pnl === null ? `<span class="${cls}">${date.getDate()}</span>` : `<button class="${cls}" data-ts="${date.getTime()}" data-pnl="${pnl}" title="${fxFormatPnL(pnl)}">${date.getDate()}</button>`;
    }
    body = `<div class="cal-grid">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(w => `<span class="cal-weekday">${w}</span>`).join('')}${cells}</div>`;
  } else {
    title = `${year}`;
    body = `<div class="cal-year-grid">${Array.from({ length: 12 }, (_, m) => {
      const days = fxPnLRange(new Date(year, m, 1), new Date(year, m + 1, 0));
      const total = days.reduce((s, v) => s + v, 0);
      const label = new Date(year, m, 1).toLocaleDateString(undefined, { month: 'short' });
      return days.length ? `<button class="cal-month ${total >= 0 ? 'green' : 'red'}" data-month="${m}"><span>${label}</span><strong>${fxFormatPnL(total, true)}</strong></button>` : `<span class="cal-month empty"><span>${label}</span><span>—</span></span>`;
    }).join('')}</div>`;
  }

  el.innerHTML = `
    <h2 class="cal-title">P&amp;L Calendar</h2>
    <div class="cal-toolbar">
      <button class="cal-summary-btn" id="fxCalSummary">Summary <span aria-hidden="true">🏅</span></button>
      <div class="home-segment"><button class="${view === 'month' ? 'active' : ''}" data-view="month">Month</button><button class="${view === 'year' ? 'active' : ''}" data-view="year">Year</button></div>
    </div>
    <div class="cal-nav">
      ${navBtn('fxCalPY', 'Previous year', '«', -12)}
      ${view === 'month' ? navBtn('fxCalPM', 'Previous month', '‹', -1) : '<span></span>'}
      <span class="cal-period">${title}</span>
      ${view === 'month' ? navBtn('fxCalNM', 'Next month', '›', 1) : '<span></span>'}
      ${navBtn('fxCalNY', 'Next year', '»', 12)}
    </div>
    ${body}
    <div class="pnl-legend"><span class="pnl-legend-item"><span class="pnl-swatch" style="background-color:hsl(142 70% 45%);"></span>Profitable day</span><span class="pnl-legend-item"><span class="pnl-swatch" style="background-color:hsl(350 80% 56%);"></span>Losing day</span></div>
  `;

  const moves = { fxCalPY: -12, fxCalPM: -1, fxCalNM: 1, fxCalNY: 12 };
  Object.entries(moves).forEach(([id, m]) => { const b = document.getElementById(id); if (b) b.addEventListener('click', () => { fxDashState.calMonth = step(m); fxRenderHomeCalendar(); }); });
  el.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => { fxDashState.calView = b.dataset.view; fxRenderHomeCalendar(); }));
  el.querySelectorAll('.cal-day[data-pnl]').forEach(c => c.addEventListener('click', () => fxShowPnLDay(new Date(parseInt(c.dataset.ts, 10)), parseFloat(c.dataset.pnl))));
  el.querySelectorAll('.cal-month[data-month]').forEach(c => c.addEventListener('click', () => { fxDashState.calMonth = fxClampMonth(new Date(year, parseInt(c.dataset.month, 10), 1)); fxDashState.calView = 'month'; fxRenderHomeCalendar(); }));
  document.getElementById('fxCalSummary').addEventListener('click', () => {
    const days = view === 'month' ? fxPnLRange(new Date(year, month, 1), new Date(year, month + 1, 0)) : fxPnLRange(new Date(year, 0, 1), new Date(year, 11, 31));
    const green = days.filter(v => v > 0).length, total = days.reduce((s, v) => s + v, 0);
    Swal.fire({ title: `${title} Summary`, html: `<div style="font-size:1.75rem;font-weight:700;color:${total >= 0 ? 'hsl(142 70% 45%)' : 'hsl(350 80% 56%)'};margin-bottom:1rem;">${fxFormatPnL(total)}</div><strong>Green days:</strong> ${green}<br><strong>Red days:</strong> ${days.length - green}<br><strong>Win rate:</strong> ${days.length ? Math.round(green / days.length * 100) : 0}%`, confirmButtonText: 'OK' });
  });
}

function fxRenderHomeTrades() {
  const el = document.getElementById('fxHomeTrades');
  if (!el) return;
  const user = getUserData() || {};
  const { tradesTab, tradesMode } = fxDashState;
  const isCrypto = (t) => /BTC|ETH|LTC|SOL|USDT/i.test(t.symbol || '');
  const tabs = [{ id: 'stock', label: 'Stock Options' }, { id: 'futures', label: 'Crypto Futures' }, { id: 'wallets', label: 'Wallets' }];
  let bodyHTML;
  if (tradesTab === 'wallets') {
    const holdings = fxGetHoldings();
    const walletCoins = Object.keys(fxPrices).filter(s => (holdings[s] || 0) > 0);
    bodyHTML = (walletCoins.length ? walletCoins : Object.keys(fxPrices).slice(0, 5)).map(s => `<div class="home-wallet-row">${fxCoinIcon(s, 40)}<div class="home-expert-info"><div class="home-expert-name">${fxPrices[s].name}</div><div class="home-expert-meta">${fxFormatCrypto(holdings[s] || 0, s)}</div></div><strong>≈ $${fxUSD((holdings[s] || 0) * fxPrices[s].price)}</strong></div>`).join('');
  } else {
    const trades = tradesMode === 'demo' ? [] : (user.transactions || []).filter(t => t.type === 'trade' && (tradesTab === 'futures') === isCrypto(t)).slice().reverse();
    bodyHTML = trades.length ? trades.map(t => `<div class="home-wallet-row"><div class="home-expert-info"><div class="home-expert-name">${t.symbol}</div><div class="home-expert-meta">${new Date(t.timestamp).toLocaleString()}</div></div><span class="home-pill ${t.tradeType === 'BUY' ? 'home-pill-green' : 'home-pill-red'}">${t.tradeType || ''}</span><strong>$${fxUSD(t.amount)}</strong></div>`).join('') : `<div class="home-empty">${fxIcon('fileSearch')}<p>No ${tradesTab === 'stock' ? 'stock' : 'futures'} trades found</p><button class="home-empty-link" data-goto="fund-account">Deposit</button></div>`;
  }
  el.innerHTML = `
    <div class="home-tabs">${tabs.map(t => `<button class="${t.id === tradesTab ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`).join('')}</div>
    ${tradesTab !== 'wallets' ? `<div class="home-segment home-segment-left"><button class="${tradesMode === 'live' ? 'active' : ''}" data-mode="live">Live</button><button class="${tradesMode === 'demo' ? 'active' : ''}" data-mode="demo">Demo</button></div>` : ''}
    <div class="home-card">${bodyHTML}</div>
  `;
  el.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { fxDashState.tradesTab = b.dataset.tab; fxRenderHomeTrades(); }));
  el.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { fxDashState.tradesMode = b.dataset.mode; fxRenderHomeTrades(); }));
  el.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => fxGo(b.dataset.goto)));
}

// ==================== CRYPTO CONVERTER ====================
// Holdings/history live under their own localStorage keys so the background
// user refresh (which overwrites userData from the server) won't wipe them.
// Popular coins shown in the dashboard market list and offered in the converter.
// Prices/changes are illustrative mock data (no live price feed in the prototype).
const fxPrices = {
  BTC:  { name: 'Bitcoin',      price: 67250.00,  change: 2.1 },
  ETH:  { name: 'Ethereum',     price: 3480.50,   change: 1.4 },
  USDT: { name: 'Tether',       price: 1.00,      change: 0.0 },
  BNB:  { name: 'BNB',          price: 585.20,    change: 0.8 },
  SOL:  { name: 'Solana',       price: 152.30,    change: 3.2 },
  XRP:  { name: 'XRP',          price: 0.52,      change: -1.1 },
  USDC: { name: 'USD Coin',     price: 1.00,      change: 0.0 },
  ADA:  { name: 'Cardano',      price: 0.38,      change: -0.6 },
  DOGE: { name: 'Dogecoin',     price: 0.12,      change: 4.5 },
  TRX:  { name: 'TRON',         price: 0.16,      change: 0.3 },
  TON:  { name: 'Toncoin',      price: 5.40,      change: 1.9 },
  AVAX: { name: 'Avalanche',    price: 27.80,     change: -2.3 },
  SHIB: { name: 'Shiba Inu',    price: 0.000018,  change: 6.1 },
  DOT:  { name: 'Polkadot',     price: 4.30,      change: -0.9 },
  LINK: { name: 'Chainlink',    price: 11.20,     change: 2.7 },
  MATIC:{ name: 'Polygon',      price: 0.42,      change: -1.4 },
  LTC:  { name: 'Litecoin',     price: 84.20,     change: 0.5 },
  BCH:  { name: 'Bitcoin Cash', price: 395.00,    change: 1.1 },
  XLM:  { name: 'Stellar',      price: 0.11,      change: -0.7 },
  UNI:  { name: 'Uniswap',      price: 7.80,      change: 3.0 }
};
const FX_FEE = 0.005;
const FX_API_BASE = "https://vantage-render.onrender.com";
// Set before navigating to the converter to preselect the "From" coin.
let fxConvertPreset = null;

// Crypto icon from a CDN, with a lettered fallback circle if the icon is missing.
function fxCoinIcon(symbol, size) {
  const s = size || 36;
  const sym = symbol.toLowerCase();
  return `<span class="fx-coin-ico" style="width:${s}px;height:${s}px;">
    <img src="https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${sym}.svg" alt="${symbol}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
    <span class="fx-coin-fallback" style="display:none;">${symbol.slice(0, 3)}</span>
  </span>`;
}

function fxCoinPrice(p) {
  if (p >= 1) return '$' + p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 0.01) return '$' + p.toFixed(4);
  return '$' + p.toPrecision(2);
}

// ---- Live prices (CoinGecko), so holdings fluctuate with the market ----
const FX_COIN_IDS = {
  BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', BNB: 'binancecoin', SOL: 'solana',
  XRP: 'ripple', USDC: 'usd-coin', ADA: 'cardano', DOGE: 'dogecoin', TRX: 'tron',
  TON: 'the-open-network', AVAX: 'avalanche-2', SHIB: 'shiba-inu', DOT: 'polkadot',
  LINK: 'chainlink', MATIC: 'matic-network', LTC: 'litecoin', BCH: 'bitcoin-cash',
  XLM: 'stellar', UNI: 'uniswap'
};
let fxPricesLive = false;

// Fetches live USD prices + 24h change into fxPrices. Returns true on success.
// On failure the existing (static) prices stay in place, so the UI still works.
async function fxLoadPrices() {
  try {
    const ids = Object.values(FX_COIN_IDS).join(',');
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
    if (!res.ok) return false;
    const data = await res.json();
    let ok = false;
    for (const [sym, id] of Object.entries(FX_COIN_IDS)) {
      const row = data[id];
      if (row && typeof row.usd === 'number' && row.usd > 0) {
        fxPrices[sym].price = row.usd;
        if (typeof row.usd_24h_change === 'number') fxPrices[sym].change = row.usd_24h_change;
        ok = true;
      }
    }
    fxPricesLive = ok;
    return ok;
  } catch (e) { return false; }
}

// ---- Assets: USD cash + crypto holdings (USD is convertible too) ----
function fxAssetSymbols() { return ['USD', ...Object.keys(fxPrices)]; }
function fxAssetName(s) { return s === 'USD' ? 'US Dollar' : fxPrices[s].name; }
function fxAssetPrice(s) { return s === 'USD' ? 1 : fxPrices[s].price; }
function fxAssetBalance(s) { return s === 'USD' ? Number((fxCurrentUser() || {}).balance || 0) : Number(fxGetHoldings()[s] || 0); }
function fxFormatAsset(amount, s) { return s === 'USD' ? `$${fxUSD(amount)}` : fxFormatCrypto(amount, s); }

// Total portfolio value = USD cash + live value of all crypto holdings.
function fxPortfolioValue() {
  const cash = Number((fxCurrentUser() || {}).balance || 0);
  const h = fxGetHoldings();
  let v = cash;
  Object.keys(h).forEach(s => { if (fxPrices[s]) v += (h[s] || 0) * fxPrices[s].price; });
  return v;
}

// Update the live-priced bits in place (no full re-render) on a price tick.
function fxRefreshPricesUI() {
  const amt = document.getElementById('fxBalAmt');
  if (amt && !fxDashState.balanceHidden) amt.textContent = '$' + fxUSD(fxPortfolioValue());
  document.querySelectorAll('.market-row[data-sym]').forEach(row => {
    const c = fxPrices[row.dataset.sym];
    if (!c) return;
    const val = row.querySelector('.market-val');
    if (val) val.textContent = fxCoinPrice(c.price);
    const chg = row.querySelector('.market-chg');
    if (chg) { const up = c.change >= 0; chg.textContent = `${up ? '+' : ''}${c.change.toFixed(2)}%`; chg.className = `market-chg ${up ? 'up' : 'down'}`; }
  });
  // Refresh the converter only when the user isn't typing in it.
  if (document.getElementById('fxConvForm') && !(document.activeElement && document.activeElement.closest && document.activeElement.closest('#fxConvForm'))) {
    renderConverterPage();
  }
}

// Read the cached user document without triggering a background refresh.
function fxCurrentUser() { try { return JSON.parse(localStorage.getItem('userData') || 'null'); } catch (e) { return null; } }

function fxGetHoldings() {
  // Holdings come only from the user document (once the backend provides it) or
  // from conversions saved locally. There are NO pre-seeded balances: an account
  // starts with no coins and builds holdings by converting its deposited cash.
  const u = fxCurrentUser();
  if (u && u.holdings && Object.keys(u.holdings).length) return { ...u.holdings };
  try {
    const raw = localStorage.getItem('fxHoldings');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}
// Keep the cached user document in sync so holdings-from-user reads stay correct.
function fxSetCachedUser(mutator) {
  try {
    const u = JSON.parse(localStorage.getItem('userData') || 'null');
    if (!u) return;
    mutator(u);
    localStorage.setItem('userData', JSON.stringify(u));
  } catch (e) {}
}
function fxSaveHoldings(h) {
  try { localStorage.setItem('fxHoldings', JSON.stringify(h)); } catch (e) {}
  fxSetCachedUser(u => { u.holdings = h; });
}
function fxGetConversions() {
  const u = fxCurrentUser();
  if (u && Array.isArray(u.conversions) && u.conversions.length) return u.conversions;
  try { return JSON.parse(localStorage.getItem('fxConversions') || '[]'); } catch (e) { return []; }
}

function fxFormatCrypto(amount, symbol) {
  const decimals = symbol === 'USDT' ? 2 : 6;
  return `${Number(amount || 0).toLocaleString(undefined, { maximumFractionDigits: decimals })} ${symbol}`;
}

// Converts between USD cash and/or crypto holdings. USD debits/credits the
// user's cash balance; coins debit/credit holdings.
function fxConvert(from, to, amount) {
  const rate = fxAssetPrice(from) / fxAssetPrice(to);
  const fee = amount * FX_FEE;
  const received = (amount - fee) * rate;
  const holdings = fxGetHoldings();

  // Debit source
  if (from === 'USD') fxSetCachedUser(u => { u.balance = Number(u.balance || 0) - amount; });
  else { const rem = (holdings[from] || 0) - amount; holdings[from] = rem < 1e-9 ? 0 : rem; }
  // Credit destination
  if (to === 'USD') fxSetCachedUser(u => { u.balance = Number(u.balance || 0) + received; });
  else holdings[to] = (holdings[to] || 0) + received;

  fxSaveHoldings(holdings); // persists holdings locally + mirrors into cached user
  const conversions = fxGetConversions().slice();
  const record = { id: Date.now().toString(), timestamp: new Date().toISOString(), from, to, amount, received, rate, fee };
  conversions.push(record);
  try { localStorage.setItem('fxConversions', JSON.stringify(conversions)); } catch (e) {}
  fxSetCachedUser(u => { u.conversions = conversions; });
  apiLog('CRYPTO_CONVERTED', record);
  fxPersistConversion(from, to, amount); // non-blocking; reconciles with server
  return record;
}

// Persist a conversion to the backend (POST /transactions/:_id/convert) and
// reconcile local holdings with the server's response. No-ops without a logged-in
// user id, so the prototype/demo keeps working offline from the local store.
async function fxPersistConversion(from, to, amount) {
  const u = fxCurrentUser();
  if (!u || !u._id) return;
  try {
    const res = await fetch(`${FX_API_BASE}/transactions/${u._id}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, amount, feeRate: FX_FEE })
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json && json.success && json.data && json.data.holdings) {
      fxSaveHoldings(json.data.holdings);
      if (typeof json.data.balance === 'number') fxSetCachedUser(u => { u.balance = json.data.balance; });
      apiLog('CRYPTO_CONVERT_SYNCED', { id: json.data.conversion && json.data.conversion._id });
    } else {
      apiLog('CRYPTO_CONVERT_SYNC_FAILED', { status: res.status, message: json && json.message });
    }
  } catch (e) {
    apiLog('CRYPTO_CONVERT_SYNC_ERROR', { error: String(e && e.message || e) });
  }
}

function renderConverterPage() {
  const conversions = fxGetConversions();
  const assets = fxAssetSymbols();                 // ['USD', ...coins]
  const funded = assets.filter(s => fxAssetBalance(s) > 0);
  const totalValue = fxPortfolioValue();
  const opts = (sel) => assets.map(s => `<option value="${s}" ${s === sel ? 'selected' : ''}>${fxAssetName(s)} (${s})</option>`).join('');
  // "From" defaults to a coin from the market list (if preset), else your cash,
  // else the first funded asset.
  const preset = fxConvertPreset && fxPrices[fxConvertPreset] ? fxConvertPreset : null;
  fxConvertPreset = null;
  const fromDefault = preset || (fxAssetBalance('USD') > 0 ? 'USD' : funded[0]) || 'USD';
  const toDefault = assets.find(s => s !== fromDefault) || 'BTC';
  const assetIcon = (s, size) => s === 'USD'
    ? `<span class="fx-coin-ico fx-usd-ico" style="width:${size}px;height:${size}px;">$</span>`
    : fxCoinIcon(s, size);

  content.innerHTML = `
    <div class="fx-page">
      <div style="margin-bottom:1.5rem;">
        <h1 style="font-size:1.5rem;font-weight:700;margin-bottom:0.5rem;">Convert</h1>
        <p class="text-muted">Convert your cash balance and coins (Total value: $${fxUSD(totalValue)}${fxPricesLive ? ' · live prices' : ''})</p>
      </div>
      <div class="holdings-grid">
        ${(funded.length ? funded : ['USD', 'BTC', 'ETH']).map(s => `<div class="home-card holding-card"><div class="holding-head">${assetIcon(s, 28)}<div class="stat-label">${fxAssetName(s)}</div></div><div class="holding-amount">${fxFormatAsset(fxAssetBalance(s), s)}</div><div class="text-muted small">≈ $${fxUSD(fxAssetBalance(s) * fxAssetPrice(s))}</div></div>`).join('')}
      </div>
      <div class="home-card" style="max-width:42rem;">
        <h2 style="font-size:1.25rem;font-weight:600;margin-bottom:1.5rem;">Convert</h2>
        <form id="fxConvForm">
          <div class="form-group"><label>From</label>
            <div class="converter-row"><select id="fxFrom" class="input">${opts(fromDefault)}</select><input type="number" id="fxAmt" class="input" placeholder="0.00" step="any" min="0"></div>
            <div class="converter-meta"><span id="fxAvail"></span><button type="button" class="btn-link" id="fxMax">Max</button></div>
          </div>
          <div class="converter-swap"><button type="button" id="fxSwap" aria-label="Swap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 4 7 20"></polyline><polyline points="3 8 7 4 11 8"></polyline><polyline points="17 20 17 4"></polyline><polyline points="13 16 17 20 21 16"></polyline></svg></button></div>
          <div class="form-group"><label>To</label>
            <div class="converter-row"><select id="fxTo" class="input">${opts(toDefault)}</select><input type="text" id="fxRecv" class="input" placeholder="You receive" readonly></div>
          </div>
          <div class="converter-summary"><div><span>Rate</span><span id="fxRate"></span></div><div><span>Fee (0.5%)</span><span id="fxFeeV"></span></div><div><span>Value</span><span id="fxVal"></span></div></div>
          <button type="submit" class="btn btn-primary btn-block">Convert</button>
        </form>
      </div>
      <section class="home-card home-markets" style="margin-top:2rem;">
        <div class="home-section-head"><h2>${fxIcon('trending')}Popular Markets</h2></div>
        <div id="fxMarkets"></div>
      </section>
      ${conversions.length ? `<div class="home-card" style="margin-top:2rem;"><h2 style="font-size:1.25rem;font-weight:600;margin-bottom:1rem;">Conversion History</h2><div class="table-container"><table><thead><tr><th>Date</th><th>From</th><th>To</th><th>Rate</th></tr></thead><tbody>${conversions.slice().reverse().map(c => `<tr><td>${new Date(c.timestamp).toLocaleDateString()}</td><td>${fxFormatAsset(c.amount, c.from)}</td><td style="color:hsl(142 70% 45%);">${fxFormatAsset(c.received, c.to)}</td><td>1 ${c.from} = ${fxFormatAsset(c.rate, c.to)}</td></tr>`).join('')}</tbody></table></div></div>` : ''}
    </div>
  `;

  const fromEl = document.getElementById('fxFrom'), toEl = document.getElementById('fxTo'), amtEl = document.getElementById('fxAmt');
  function preview() {
    const from = fromEl.value, to = toEl.value, amount = parseFloat(amtEl.value) || 0;
    const rate = fxAssetPrice(from) / fxAssetPrice(to);
    const received = amount * (1 - FX_FEE) * rate;
    document.getElementById('fxAvail').textContent = `Available: ${fxFormatAsset(fxAssetBalance(from), from)}`;
    document.getElementById('fxRecv').value = amount > 0 && from !== to ? fxFormatAsset(received, to) : '';
    document.getElementById('fxRate').textContent = `1 ${from} = ${fxFormatAsset(rate, to)}`;
    document.getElementById('fxFeeV').textContent = fxFormatAsset(amount * FX_FEE, from);
    document.getElementById('fxVal').textContent = `$${fxUSD(amount * fxAssetPrice(from))}`;
  }
  fromEl.addEventListener('change', preview); toEl.addEventListener('change', preview); amtEl.addEventListener('input', preview);
  document.getElementById('fxMax').addEventListener('click', () => { amtEl.value = fxAssetBalance(fromEl.value) || 0; preview(); });
  document.getElementById('fxSwap').addEventListener('click', () => { const f = fromEl.value; fromEl.value = toEl.value; toEl.value = f; preview(); });
  document.getElementById('fxConvForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const from = fromEl.value, to = toEl.value, amount = parseFloat(amtEl.value);
    if (from === to) return Swal.fire({ icon: 'warning', title: 'Same Currency', text: 'Choose two different currencies.', confirmButtonText: 'OK' });
    if (!amount || amount <= 0) return Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Enter an amount to convert.', confirmButtonText: 'OK' });
    if (amount > fxAssetBalance(from)) return Swal.fire({ icon: 'error', title: 'Insufficient Balance', text: `You only have ${fxFormatAsset(fxAssetBalance(from), from)}`, confirmButtonText: 'OK' });
    const c = fxConvert(from, to, amount);
    Swal.fire({ icon: 'success', title: 'Conversion Complete!', html: `<strong>Sent:</strong> ${fxFormatAsset(c.amount, from)}<br><strong>Received:</strong> ${fxFormatAsset(c.received, to)}<br><strong>Fee:</strong> ${fxFormatAsset(c.fee, from)}`, confirmButtonText: 'OK' });
    renderConverterPage();
  });
  preview();
  fxRenderMarkets(); // the popular-coins list, shown under the converter widget
}

// ==================== P&L CALENDAR (full page) ====================
let fxPnlMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

function renderPnLCalendarPage() {
  fxResetPnl();
  const year = fxPnlMonth.getFullYear(), month = fxPnlMonth.getMonth();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const earliest = new Date(today.getFullYear(), today.getMonth() - (FX_PNL_MONTHS - 1), 1);
  const dim = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = [];
  for (let d = 1; d <= dim; d++) { const date = new Date(year, month, d); days.push({ day: d, date, pnl: fxHasHistory(date) ? fxDailyPnL(date) : null }); }
  const traded = days.filter(d => d.pnl !== null);
  const green = traded.filter(d => d.pnl > 0).length, red = traded.length - green;
  const total = traded.reduce((s, d) => s + d.pnl, 0);
  const winRate = traded.length ? green / traded.length * 100 : 0;
  const label = fxPnlMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const cells = [...Array(offset).fill('<span class="cal-day other"></span>'), ...days.map(d => {
    const isToday = d.date.getTime() === today.getTime();
    if (d.pnl === null) return `<span class="cal-day empty ${isToday ? 'today' : ''}">${d.day}</span>`;
    return `<button class="cal-day ${d.pnl > 0 ? 'green' : 'red'} ${isToday ? 'today' : ''}" data-ts="${d.date.getTime()}" data-pnl="${d.pnl}" title="${fxFormatPnL(d.pnl)}">${d.day}<small>${fxFormatPnL(d.pnl, true)}</small></button>`;
  })].join('');

  content.innerHTML = `
    <div class="fx-page">
      <div style="margin-bottom:1.5rem;"><h1 style="font-size:1.5rem;font-weight:700;margin-bottom:0.5rem;">P&amp;L Calendar</h1><p class="text-muted">See your profitable (green) and losing (red) days at a glance</p></div>
      <div class="stats-grid">
        <div class="home-card stat-card"><div class="stat-label">Monthly P&amp;L</div><div class="stat-value" style="color:${total >= 0 ? 'hsl(142 70% 45%)' : 'hsl(350 80% 56%)'};">${fxFormatPnL(total)}</div></div>
        <div class="home-card stat-card"><div class="stat-label">Green Days</div><div class="stat-value" style="color:hsl(142 70% 45%);">${green}</div></div>
        <div class="home-card stat-card"><div class="stat-label">Red Days</div><div class="stat-value" style="color:hsl(350 80% 56%);">${red}</div></div>
        <div class="home-card stat-card"><div class="stat-label">Win Rate</div><div class="stat-value">${winRate.toFixed(0)}%</div></div>
      </div>
      <div class="home-card">
        <div class="cal-nav" style="margin-bottom:1.25rem;">
          <button class="cal-nav-btn" id="fxPnlPrev" ${fxPnlMonth <= earliest ? 'disabled' : ''} aria-label="Previous month">‹</button>
          <span></span><span class="cal-period">${label}</span><span></span>
          <button class="cal-nav-btn" id="fxPnlNext" ${fxPnlMonth >= currentMonth ? 'disabled' : ''} aria-label="Next month">›</button>
        </div>
        <div class="cal-grid big">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(w => `<span class="cal-weekday">${w}</span>`).join('')}${cells}</div>
        <div class="pnl-legend"><span class="pnl-legend-item"><span class="pnl-swatch" style="background-color:hsl(142 70% 45%);"></span>Profitable day</span><span class="pnl-legend-item"><span class="pnl-swatch" style="background-color:hsl(350 80% 56%);"></span>Losing day</span></div>
      </div>
    </div>
  `;
  document.getElementById('fxPnlPrev').addEventListener('click', () => { fxPnlMonth = new Date(year, month - 1, 1); renderPnLCalendarPage(); });
  document.getElementById('fxPnlNext').addEventListener('click', () => { fxPnlMonth = new Date(year, month + 1, 1); renderPnLCalendarPage(); });
  content.querySelectorAll('.cal-day[data-pnl]').forEach(c => c.addEventListener('click', () => fxShowPnLDay(new Date(parseInt(c.dataset.ts, 10)), parseFloat(c.dataset.pnl))));
}

// ==================== MORE MENU (mobile bottom-nav) ====================
function renderMorePage() {
  const sections = [
    { label: 'User', items: [{ t: 'Deposit', i: 'deposit', p: 'fund-account' }, { t: 'Withdrawal', i: 'withdraw', p: 'withdrawal' }, { t: 'Transaction History', i: 'history', p: 'profit-history' }] },
    { label: 'Trade', items: [{ t: 'Trade', i: 'trade', p: 'trade' }, { t: 'Investment Plans', i: 'plans', p: 'investment-plans' }, { t: 'Live Trade', i: 'live', p: 'live-stream' }, { t: 'P&amp;L Calendar', i: 'calendar', p: 'pnl-calendar' }, { t: 'Convert', i: 'convert', p: 'converter' }, { t: 'Market', i: 'trade', p: 'market' }] },
    { label: 'Promotions', items: [{ t: 'Referral', i: 'user', p: 'referrals' }, { t: 'Reward Center', i: 'crown', p: 'rewards' }] },
    { label: 'Other', items: [{ t: 'Settings', i: 'settings', p: 'profile' }] }
  ];
  content.innerHTML = `<div class="fx-page">${sections.map(s => `<section class="more-section"><h2 class="more-label">${s.label}</h2><div class="more-grid">${s.items.map(it => `<button class="more-tile" data-goto="${it.p}">${fxIcon(it.i)}<span>${it.t}</span></button>`).join('')}</div></section>`).join('')}</div>`;
  content.querySelectorAll('[data-goto]').forEach(el => el.addEventListener('click', () => fxGo(el.dataset.goto)));
}
function loadTickerTapeWidget() {
  const container = document.getElementById('tradingview-ticker-tape');
  if (!container) return console.warn('Ticker tape container not found');

  container.innerHTML = '';

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
  script.async = true;

  const config = {
    symbols: [
      { proName: "FOREXCOM:SPXUSD", title: "S&P 500 Index" },
      { proName: "FOREXCOM:NSXUSD", title: "US 100 Cash CFD" },
      { proName: "FX_IDC:EURUSD", title: "EUR to USD" },
      { proName: "NASDAQ:TSLA", title: "Tesla" },
      { proName: "NASDAQ:NVDA", title: "NVIDIA" },
      { proName: "NASDAQ:AMZN", title: "Amazon" },
      { proName: "NASDAQ:META", title: "Meta" }
    ],
    colorTheme: document.documentElement.classList.contains('dark') ? "dark" : "light",
    locale: "en",
    isTransparent: true,
    showSymbolLogo: true,
    displayMode: "adaptive"
  };

  script.innerHTML = JSON.stringify(config);
  container.appendChild(script);
}

function loadTradingViewWidget2(containerId, symbol) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = ''; // clear before appending new one

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
  script.async = true;

  const config = {
    symbol: symbol,
    width: "100%",
    height: 350,
    locale: "en",
    dateRange: "12M",
    colorTheme: document.documentElement.classList.contains('dark') ? "dark" : "light",
    trendLineColor: "#37a2eb",
    underLineColor: "rgba(55, 162, 235, 0.1)",
    isTransparent: true
  };

  script.innerHTML = JSON.stringify(config);
  container.appendChild(script);
}

 function renderTradePage() {
  const content = document.getElementById('content');
  const user = getUserData(); // however you retrieve user info
  console.log(user);

  content.innerHTML = `
    <div class="trade-page">
     <div class="trade-intro">
  <h3>Smart Trading Dashboard</h3>
  <p>
    Trade crypto, forex, and stocks with real-time insights. 
    Use the charts below to analyze market movements before placing your trades.
  </p>
</div>


      <!-- Top TradingView Chart -->
      <div id="tradingview_top" class="tradingview-widget"></div>

      <!-- Trading Card -->
      <div class="trade-container">
        <div class="trading-card">
          <div class="header">
            <div class="balance">Balance: $<span id="balance2">${user.balance.toFixed(2)}</span></div>
            <div class="live">LIVE TRADING</div>
          </div>

          <form id="tradeForm">
            <label>Asset Type</label>
            <select id="assetType" required>
              <option value="">Select Asset Type</option>
              <option value="crypto">Crypto</option>
              <option value="forex">Forex</option>
              <option value="stock">Stock</option>
            </select>

            <label>Asset</label>
            <select id="assetName" required>
              <option value="">Select Asset</option>
            </select>

            <label>Leverage</label>
            <div class="leverage-buttons" id="leverageButtons"></div>
            <input type="range" id="leverageRange" min="1" max="100" step="1" value="1">

            <label>Duration</label>
            <select id="duration" required>
              <option value="">Select Duration</option>
              <option value="1">1 Minute</option>
              <option value="2">2 Minutes</option>
              <option value="5">5 Minutes</option>
              <option value="15">15 Minutes</option>
              <option value="60">1 Hour</option>
               <option value="1440">1 Day</option>
  <option value="2880">2 Days</option>
  <option value="4320">3 Days</option>
  <option value="5760">4 Days</option>
  <option value="7200">5 Days</option>
  <option value="8640">6 Days</option>
  <option value="10080">7 Days</option>
            </select>

            <label>Amount</label>
            <input type="number" id="amount" placeholder="Enter trade amount" required>

            <div class="tp-sl">
              <div>
                <label>Take Profit</label>
                <input type="number" id="takeProfit" required>
              </div>
              <div>
                <label>Stop Loss</label>
                <input type="number" id="stopLoss" required>
              </div>
            </div>

            <div class="actions">
              <button type="button" id="buyBtn" class="buy" disabled>Buy</button>
              <button type="button" id="sellBtn" class="sell" disabled>Sell</button>
            </div>
             <!-- History Button -->
        <div class="history-section">
          <button id="viewHistoryBtn" class="history-btn">
            <i class="fas fa-history"></i> View Trade History
          </button>
        </div>
      </div>
          </form>
        </div>
      </div>

      <!-- Bottom TradingView Chart -->
      <div id="tradingview_bottom" class="tradingview-widget"></div>

     
    </div>
  `;

  // ✅ Initialize TradingView
  function initializeTradingView(symbol = "BTCUSDT") {
    const topWidget = document.getElementById("tradingview_top");
    const bottomWidget = document.getElementById("tradingview_bottom");
    topWidget.innerHTML = "";
    bottomWidget.innerHTML = "";

    new TradingView.widget({
      autosize: true,
      symbol: symbol,
      interval: "30",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      toolbar_bg: "#f1f3f6",
      enable_publishing: false,
      container_id: "tradingview_top"
    });

    new TradingView.widget({
      autosize: true,
      symbol: symbol,
      interval: "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      hide_top_toolbar: false,
      enable_publishing: false,
      container_id: "tradingview_bottom"
    });
  }

  // Load initial charts
  initializeTradingView();

  // ------------------------------
  // Initialize Assets & Leverage
  // ------------------------------
  const assets = {
    crypto: ["BTC/USDT","ETH/USDT","XRP/USDT","ADA/USDT","DOGE/USDT","SOL/USDT","DOT/USDT","LTC/USDT","BNB/USDT","MATIC/USDT"],
    forex: ["EUR/USD","GBP/USD","USD/JPY","AUD/USD","USD/CAD","USD/CHF","NZD/USD","EUR/GBP","EUR/JPY","GBP/JPY"],
    stock: ["AAPL","TSLA","GOOGL","AMZN","MSFT","NFLX","META","NVDA","BABA","AMD"]
  };

  const assetTypeEl = document.getElementById("assetType");
  const assetNameEl = document.getElementById("assetName");
  const leverageButtonsEl = document.getElementById("leverageButtons");
  const leverageRangeEl = document.getElementById("leverageRange");
  const form = document.getElementById("tradeForm");
  const buyBtn = document.getElementById("buyBtn");
  const sellBtn = document.getElementById("sellBtn");

  // Populate leverage buttons
  const LEVERAGES = [...Array(10).keys()].map(i => i + 1).concat([20,30,40,50,60,70,80,90,100]);
  LEVERAGES.forEach(lv => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = `${lv}x`;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".leverage-buttons button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      leverageRangeEl.value = lv;
    });
    leverageButtonsEl.appendChild(btn);
  });

  leverageRangeEl.addEventListener("input", e => {
    document.querySelectorAll(".leverage-buttons button").forEach(b => b.classList.remove("active"));
    const closest = LEVERAGES.reduce((prev, curr) => Math.abs(curr - e.target.value) < Math.abs(prev - e.target.value) ? curr : prev);
    const activeBtn = Array.from(leverageButtonsEl.children).find(b => b.textContent === `${closest}x`);
    if (activeBtn) activeBtn.classList.add("active");
  });

  // Populate assets dropdown
  assetTypeEl.addEventListener("change", () => {
    assetNameEl.innerHTML = '<option value="">Select Asset</option>';
    if (assets[assetTypeEl.value]) {
      assets[assetTypeEl.value].forEach(a => {
        const option = document.createElement("option");
        option.value = a;
        option.textContent = a;
        assetNameEl.appendChild(option);
      });
    }
  });

  // ✅ Auto-update chart when asset changes
  assetNameEl.addEventListener("change", () => {
    const asset = assetNameEl.value;
    if (!asset) return;
    const formatted = asset.replace("/", ""); // e.g. BTC/USDT → BTCUSDT
    initializeTradingView(formatted);
  });

  // Enable buttons when form is filled
  form.addEventListener("input", () => {
    const allFilled = [...form.elements].every(el => {
      if (el.tagName === "SELECT" || el.tagName === "INPUT") return el.value.trim() !== "";
      return true;
    });
    buyBtn.disabled = !allFilled;
    sellBtn.disabled = !allFilled;
  });

  // ------------------------------
  // Backend Trade Functions
  // ------------------------------
  const email = user.email;

  async function getPartUserData() {
    try {
      const data = await $.ajax({
        type: "GET",
        url: `https://vantage-render.onrender.com/users/${email}`,
        dataType: "json",
        timeout: 30000
      });
      $("#balance2").text(data.data.balance);
      return data.data;
    } catch (err) {
      console.error(err);
    }
  }

  async function commandTrade(tradeId, state) {
    try {
      const res = await $.ajax({
        type: "PUT",
        url: `https://vantage-render.onrender.com/transactions/trades/${tradeId}/commandTrade`,
        data: JSON.stringify({ command: state }),
        contentType: "application/json",
        dataType: "json"
      });
      return res;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async function depositFnc(trade) {
    try {
      const user_Id = user._id;
      const data = await $.ajax({
        type: "POST",
        url: `https://vantage-render.onrender.com/transactions/${user_Id}/userdeposit`,
        dataType: "json",
        data: trade,
        timeout: 30000
      });
      const tradeId = data.tradeId;
      const state = "true";
      await commandTrade(tradeId, state);
      Swal.fire({
        icon: 'success',
        title: `Trade Placed!`,
        text: `${trade.assetName} | $${trade.amount} @ ${trade.leverage}`,
        confirmButtonColor: '#f0b90b'
      });
      setTimeout(() => renderTradeHistoryPage(), 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to place trade");
    }
  }

  async function placeTrade(action) {
    const trade = {
      assetType: assetTypeEl.value,
      assetName: assetNameEl.value,
      leverage: leverageRangeEl.value + "x",
      duration: document.getElementById("duration").value,
      amount: document.getElementById("amount").value,
      takeProfit: document.getElementById("takeProfit").value,
      stopLoss: document.getElementById("stopLoss").value,
      action
    };
    await depositFnc(trade);
  }

  buyBtn.addEventListener("click", () => placeTrade("BUY"));
  sellBtn.addEventListener("click", () => placeTrade("SELL"));
  document.getElementById("viewHistoryBtn").addEventListener("click", () => renderTradeHistoryPage());

  // Fetch latest user balance
  getPartUserData();
}


function renderTradeHistoryPage() {
  const content = document.getElementById('content');

  content.innerHTML = `
    <div class="trade-history-page">
<!-- Top Section: Write-up + Widget -->
<div class="trade-history-top">
  <div class="writeup">
    <h1>Trade History Overview 📊</h1>
    <p>
      Review all your past trades with detailed performance metrics.
      Track profits, losses, leverage used, and trade durations to improve your trading strategy.
    </p>
    <button id="historyRefreshBtn" class="btn btn-primary">Refresh Trades</button>
  </div>
  
  <div class="widget-placeholder">
    <h3>Portfolio Summary</h3>
    <p id="tradeSummaryWidget">Loading...</p>
  </div>
</div>

      </div>

      <!-- Loader -->
      <div id="loader" class="loader" style="display:none; text-align:center; margin:1rem 0;">
        <div class="spinner" style="border:4px solid #333; border-top:4px solid #f0b90b; border-radius:50%; width:30px; height:30px; animation:spin 1s linear infinite; margin:auto;"></div>
        <p style="color:#aaa; margin-top:0.5rem;">Loading...</p>
      </div>

      <!-- Trade Table -->
      <div class="table-container" style="overflow-x:auto; margin-bottom:2rem;">
        <table class="trade-table ">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Amount</th>
              <th>Leverage</th>
              <th>Duration</th>
              <th>Countdown</th>
              <th>Profit / Loss</th>
              <th>Action</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="tradeTable"></tbody>
        </table>
      </div>

      <!-- Analytics / Graphs -->
      <div class="trade-analytics" style="margin-top:2rem;">
        <div class="trade-history-top">
  <div class="writeup">
   

    </div>
    </div>
       
      </div>
    </div>

    <style>
      @keyframes spin { 100% { transform: rotate(360deg); } }
      .trade-table.dark-theme { width:100%; border-collapse:collapse; background:#1e1e2f; color:#ddd; border-radius:0.5rem; overflow:hidden; }
      .trade-table.dark-theme thead { background:#2c2c3c; color:#f0b90b; }
      .trade-table.dark-theme tbody tr:nth-child(even) { background:#2a2a3a; }
      .trade-table.dark-theme tbody tr:hover { background:#33334d; }
      .trade-table td, .trade-table th { padding:0.75rem; }
      .won { color:#4caf50; font-weight:600; }
      .lost { color:#f44336; font-weight:600; }
    </style>
  `;

  const BASE_URL = "https://vantage-render.onrender.com";
  const tradeTable = document.getElementById("tradeTable");
  const loader = document.getElementById("loader");
  const summaryWidget = document.getElementById("tradeSummaryWidget");
  const historyRefreshBtn = document.getElementById("historyRefreshBtn");

  const timers = new Map();

//   // ------------------ Chart.js instances ------------------
//   let profitLossChartInstance = null;
//   let tradesByAssetChartInstance = null;
//   let leverageUsageChartInstance = null;
// const chartOptions = (textColor) => ({
//   responsive: true,
//   plugins: {
//     legend: {
//       display: true,
//       labels: {
//         color: `hsl(${textColor})`, // text color from theme
//         font: { size: 13, family: 'Inter, sans-serif', weight: '600' }
//       }
//     },
//     tooltip: {
//       bodyColor: `hsl(${textColor})`,
//       titleColor: `hsl(${textColor})`,
//       backgroundColor: 'rgba(0,0,0,0.7)',
//       titleFont: { weight: '700' }
//     }
//   },
//   scales: {
//     x: { ticks: { color: `hsl(${textColor})` }, grid: { color: 'rgba(255,255,255,0.1)' } },
//     y: { ticks: { color: `hsl(${textColor})` }, grid: { color: 'rgba(255,255,255,0.1)' } },
//   }
// });

// function generateCharts(trades) {
//   // Extract colors from CSS variables
//   const styles = getComputedStyle(document.documentElement);
//   const colors = {
//     text: styles.getPropertyValue('--foreground').trim(),
//     grid: styles.getPropertyValue('--border').trim(),
//     profit: styles.getPropertyValue('--chart-1').trim(),
//     asset: styles.getPropertyValue('--chart-2').trim(),
//     leverage: styles.getPropertyValue('--chart-3').trim(),
//     leverage2: styles.getPropertyValue('--chart-4').trim(),
//     background: styles.getPropertyValue('--card').trim(),
//   };

//   const labels = trades.map(t => t.assetName ?? "Unknown");
//   const profitData = trades.map(t => Number(t.profit || 0));

//   const assetsCount = {};
//   const leverageCount = {};
//   trades.forEach(t => {
//     assetsCount[t.assetName] = (assetsCount[t.assetName] || 0) + 1;
//     leverageCount[t.leverage] = (leverageCount[t.leverage] || 0) + 1;
//   });

//   // Destroy previous charts
//   if (window.profitLossChartInstance) window.profitLossChartInstance.destroy();
//   if (window.tradesByAssetChartInstance) window.tradesByAssetChartInstance.destroy();
//   if (window.leverageUsageChartInstance) window.leverageUsageChartInstance.destroy();

//   // Profit/Loss Line Chart
//   const ctxProfit = document.getElementById('profitLossChart').getContext('2d');
//   window.profitLossChartInstance = new Chart(ctxProfit, {
//     type: 'line',
//     data: {
//       labels,
//       datasets: [{
//         label: 'Profit / Loss',
//         data: profitData,
//         borderColor: `hsl(${colors.profit})`,
//         backgroundColor: `hsla(${colors.profit},0.2)`,
//         tension: 0.3,
//         fill: true,
//         pointRadius: 3,
//         pointBackgroundColor: `hsl(${colors.profit})`,
//       }]
//     },
//     options: {
//       responsive: true,
//       plugins: {
//         legend: { labels: { color: `hsl(${colors.text})` } },
//         tooltip: { mode: 'index', intersect: false }
//       },
//       scales: {
//         x: { ticks: { color: `hsl(${colors.text})` }, grid: { color: `hsla(${colors.grid},0.2)` } },
//         y: { ticks: { color: `hsl(${colors.text})` }, grid: { color: `hsla(${colors.grid},0.2)` } },
//       }
//     }
//   });

//   // Trades by Asset Pie Chart
//   const ctxAsset = document.getElementById('tradesByAssetChart').getContext('2d');
//   window.tradesByAssetChartInstance = new Chart(ctxAsset, {
//     type: 'pie',
//     data: {
//       labels: Object.keys(assetsCount),
//       datasets: [{
//         label: 'Trades by Asset',
//         data: Object.values(assetsCount),
//         backgroundColor: Object.keys(assetsCount).map((_, i) => `hsl(${(i*60)%360}, 70%, 50%)`),
//         borderColor: `hsl(${colors.background})`,
//         borderWidth: 1
//       }]
//     },
//     options: {
//       responsive: true,
//       plugins: {
//         legend: { labels: { color: `hsl(${colors.text})` } },
//         tooltip: { mode: 'nearest' }
//       }
//     }
//   });

//   // Leverage Usage Bar Chart
//   const ctxLeverage = document.getElementById('leverageUsageChart').getContext('2d');
//   window.leverageUsageChartInstance = new Chart(ctxLeverage, {
//     type: 'bar',
//     data: {
//       labels: Object.keys(leverageCount),
//       datasets: [{
//         label: 'Leverage Usage',
//         data: Object.values(leverageCount),
//         backgroundColor: Object.keys(leverageCount).map((_, i) => `hsl(${i%2 === 0 ? colors.leverage : colors.leverage2})`)
//       }]
//     },
//     options: {
//       responsive: true,
//       plugins: {
//         legend: { display: false },
//         tooltip: { mode: 'nearest' }
//       },
//       scales: {
//         y: { beginAtZero: true, ticks: { color: `hsl(${colors.text})` }, grid: { color: `hsla(${colors.grid},0.2)` } },
//         x: { ticks: { color: `hsl(${colors.text})` }, grid: { color: `hsla(${colors.grid},0.2)` } }
//       }
//     }
//   });
// }


  // ------------------ Helpers ------------------
  function parseDuration(duration) {
    if (!duration) return 0;
    if (typeof duration === "number") return duration*60;
    if (!isNaN(duration)) return Number(duration)*60;
    const match = /^(\d+)([smhd])?$/i.exec(String(duration).trim());
    if (!match) return 0;
    const value = parseInt(match[1],10);
    const unit = (match[2]||"m").toLowerCase();
    switch(unit){
      case "s": return value;
      case "m": return value*60;
      case "h": return value*3600;
      case "d": return value*86400;
      default: return 0;
    }
  }

  function formatTime(totalSeconds) {
    const sec = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(sec/3600);
    const m = Math.floor((sec%3600)/60);
    const s = sec%60;
    const pad = n=>String(n).padStart(2,"0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  async function fetchTradeFromBackend(tradeId){
    try{
      const response = await $.ajax({type:"GET", url:`${BASE_URL}/transactions/trades/${tradeId}`, dataType:"json", timeout:30000});
      if(response && response.success && response.trade) return response.trade;
      console.error("No trade object returned:", response); return null
    } catch(err){ console.error("Error fetching trade:", err); return null; }
  }

  function updateResultUI(trade, profitLossEl, actionEl, statusEl){
    if(!trade){
      profitLossEl.textContent="--"; actionEl.textContent="Error"; statusEl.textContent="FAILED"; return;
    }
    const profit=Number(trade.profit||0);
    const amount=Number(trade.tradeAmount||0);
    if(profit>0){
      profitLossEl.textContent=`+$${profit}`; profitLossEl.className="won";
      actionEl.textContent="Won"; actionEl.className="won";
    } else{
      profitLossEl.textContent=`-$${amount}`; profitLossEl.className="lost";
      actionEl.textContent="Lost"; actionEl.className="lost";
    }
    statusEl.textContent="COMPLETED";
  }

  function renderTrades(trades){
    timers.forEach(t=>clearInterval(t)); timers.clear();
    tradeTable.innerHTML="";

    trades.forEach(trade=>{
      const id=trade._id;
      const row=document.createElement("tr");
      row.innerHTML=`
        <td>${trade.assetName??"-"}</td>
        <td>$${Number(trade.tradeAmount||0)}</td>
        <td>${trade.leverage??"-"}</td>
        <td>${trade.duration??"-"}</td>
        <td id="countdown-${id}">--:--:--</td>
        <td id="profitLoss-${id}">-</td>
        <td id="action-${id}">${trade.command==="true"?"Running":"Pending"}</td>
        <td id="status-${id}">${trade.status??"-"}</td>
      `;
      tradeTable.appendChild(row);

      const countdownEl=document.getElementById(`countdown-${id}`);
      const profitLossEl=document.getElementById(`profitLoss-${id}`);
      const actionEl=document.getElementById(`action-${id}`);
      const statusEl=document.getElementById(`status-${id}`);

      if((trade.status||"").toUpperCase()==="COMPLETED"){
        countdownEl.textContent="00:00:00";
        updateResultUI(trade,profitLossEl,actionEl,statusEl);
        return;
      }

      const statusUpper=(trade.status||"").toUpperCase();
      const isActive=statusUpper==="ACTIVE"||statusUpper==="RUNNING"||trade.command==="true";
      if(!isActive){ countdownEl.textContent="--:--:--"; return; }

      const startMs=trade.startTime?Date.parse(trade.startTime):NaN;
      if(!startMs||Number.isNaN(startMs)){ countdownEl.textContent="Waiting…"; statusEl.textContent=trade.status||"PENDING"; return; }

      const durSec=parseDuration(trade.duration);
      if(!durSec){ countdownEl.textContent="—"; return; }

      const endMs=startMs+durSec*1000;

      if(timers.has(id)){ clearInterval(timers.get(id)); timers.delete(id); }

      const tick=async ()=>{
        const now=Date.now();
        const left=Math.max(0,Math.floor((endMs-now)/1000));
        countdownEl.textContent=formatTime(left);
        actionEl.textContent=trade.command==="true"?"Running":actionEl.textContent;
        statusEl.textContent=statusUpper||"ACTIVE";

        if(left<=0){
          clearInterval(timers.get(id)); timers.delete(id);
          countdownEl.textContent="00:00:00"; statusEl.textContent="Fetching Result...";
          try{
            loader.style.display="flex";
            const refreshed=await fetchTradeFromBackend(id);
            if(refreshed){ updateResultUI(refreshed,profitLossEl,actionEl,statusEl); }
            else{ statusEl.textContent="Error fetching result"; }
          } catch(err){ console.error(err); statusEl.textContent="Error fetching result"; }
          finally{ loader.style.display="none"; }
        }
      };

      tick(); timers.set(id,setInterval(tick,1000));
    });

    // Update summary widget
    const totalTrades=trades.length;
    const totalProfit=trades.reduce((sum,t)=>sum+Number(t.profit||0),0);
    summaryWidget.textContent=`Total Trades: ${totalTrades} | Total Profit/Loss: $${totalProfit.toFixed(2)}`;

    // Generate charts
    // generateCharts(trades);
  }

  async function loadTrades(){
    try{
      loader.style.display="flex";
      const parsedUser=localStorage.getItem("userData");
      if(!parsedUser){ console.warn("No user in localStorage"); loader.style.display="none"; return []; }

      const userFromLS=JSON.parse(parsedUser);
      const email=userFromLS.email;

      const response=await $.ajax({ type:"GET", url:`${BASE_URL}/users/${email}`, dataType:"json", timeout:30000 });
      if(!response||!response.data) throw new Error("Invalid response from server");

      localStorage.setItem("userData",JSON.stringify(response.data));
      const trades=response.data.planHistory||response.data.trades||[];
      renderTrades(trades);
      return trades;
    } catch(error){
      console.error("Error loading trades:",error);
      Swal.fire({ icon:"error", title:"Failed to load trades", text:"Please check your connection or try again later.", confirmButtonColor:"#f0b90b" });
      return [];
    } finally{ loader.style.display="none"; }
  }

  // Initial load
  loadTrades();
  setInterval(loadTrades,60*1000);

  // Refresh button
  historyRefreshBtn.addEventListener("click", ()=>{ loadTrades(); });
}

async function handlePurchasePlan(planId) {
  const amountInput = document.getElementById(`amount-${planId}`);
  const amount = parseFloat(amountInput.value);

  if (!amount || amount <= 0) {
    Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Please enter a valid investment amount', confirmButtonText: 'OK' });
    return;
  }

  // Call purchase function
  const result = await purchaseInvestmentPlan(planId, amount);

  if (!result.success) {
    Swal.fire({
      icon: 'error',
      title: 'Investment Failed',
      text: result.error || 'Something went wrong',
      confirmButtonText: 'OK'
    });
  }
}

function renderAdminPage() {
  const user = getUserData();
  const plans = getInvestmentPlans();
  const plan = user.plan || [];
  
  // Calculate statistics
  const totalUsers = 1; // We only have one user in localStorage
  const totalInvested = plan.filter(inv => inv.status === 'active').reduce((sum, inv) => sum + inv.amount, 0);
  const totalProfitPaid = plan.reduce((sum, inv) => sum + inv.totalProfit, 0);
  const activeInvestmentCount = plan.filter(inv => inv.status === 'active').length;
  
  const plansTableHTML = plans.map((plan, index) => `
    <tr>
      <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">${index + 1}</td>
      <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${plan.color};"></div>
          <strong>${plan.name}</strong>
        </div>
      </td>
      <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">$${plan.minInvestment} - $${plan.maxInvestment.toLocaleString()}</td>
      <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">${(plan.dailyProfitRate * 100).toFixed(2)}%</td>
       <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">${plan.monthly != null ? (plan.monthly * 100).toFixed(2) + "%" : "—"}</td>
      <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">${plan.durationn} hours</td>
      <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">
        <button class="btn" style="background-color: hsl(var(--destructive)); color: hsl(var(--destructive-foreground)); padding: 0.25rem 0.75rem; font-size: 0.875rem;" onclick="handleDeletePlan('${plan.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
  
  const investmentsTableHTML = plan.length > 0 ? plan.map((inv, index) => {
    const daysRemaining = inv.duration - inv.daysElapsed;
    const progress = (inv.daysElapsed / inv.duration) * 100;
    return `
      <tr>
        <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">${index + 1}</td>
        <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">${inv.planName}</td>
        <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">$${inv.amount.toFixed(2)}</td>
        <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">${new Date(inv.startDate).toLocaleDateString()}</td>
        <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">${inv.daysElapsed} / ${inv.duration}</td>
        <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">
          <div style="width: 100%; background-color: hsl(var(--muted)); border-radius: 9999px; height: 6px;">
            <div style="width: ${progress}%; background-color: hsl(var(--chart-2)); height: 100%; border-radius: 9999px;"></div>
          </div>
        </td>
        <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border)); color: hsl(var(--chart-2));">$${inv.totalProfit.toFixed(2)}</td>
        <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">
          <span class="badge" style="background-color: ${inv.status === 'active' ? 'hsl(var(--chart-2))' : 'hsl(var(--muted))'}; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">${inv.status}</span>
        </td>
      </tr>
    `;
  }).join('') : '<tr><td colspan="8" style="padding: 2rem; text-align: center; color: hsl(var(--muted-foreground));">No active investments</td></tr>';
  
  const html = `
    <div style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Admin Panel 🔒</h1>
      <p class="text-muted">Manage investment plans and monitor platform activity</p>
    </div>
    
    <div class="stats-grid" style="margin-bottom: 1.5rem;">
      <div class="card stat-card">
        <div class="stat-label">Total Users</div>
        <div class="stat-value">${totalUsers}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Active Investments</div>
        <div class="stat-value">${activeInvestmentCount}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Total Invested</div>
        <div class="stat-value">$${totalInvested.toFixed(2)}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Total Profit Paid</div>
        <div class="stat-value" style="color: hsl(var(--chart-2));">$${totalProfitPaid.toFixed(2)}</div>
      </div>
    </div>
    
    <div class="card" style="margin-bottom: 1.5rem; padding: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h2 style="font-size: 1.125rem; font-weight: 600;">Quick Actions</h2>
      </div>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn btn-primary" onclick="handleProcessProfits()">Process Daily Profits</button>
        <button class="btn" style="background-color: hsl(var(--secondary)); color: hsl(var(--secondary-foreground));" onclick="handleAddPlan()">Add New Plan</button>
        <button class="btn" style="background-color: hsl(var(--accent)); color: hsl(var(--accent-foreground));" onclick="handleViewLogs()">View API Logs</button>
      </div>
    </div>
    
    <div class="card" style="margin-bottom: 1.5rem; padding: 1.5rem;">
      <h2 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">Investment Plans Management</h2>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid hsl(var(--border));">
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">#</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Plan Name</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Investment Range</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Daily Rate</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Monthly</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Duration</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${plansTableHTML}
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="card" style="padding: 1.5rem;">
      <h2 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">All Active Investments</h2>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid hsl(var(--border));">
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">#</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Plan</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Amount</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Start Date</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Days</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Progress</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Profit</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${investmentsTableHTML}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  content.innerHTML = html;
}

// Admin Functions
function handleProcessProfits() {
  const totalProfit = processDailyProfits();
  if (totalProfit > 0) {
    Swal.fire({ 
      icon: 'success', 
      title: 'Profits Processed!', 
      html: `Total profit distributed: $${totalProfit.toFixed(2)}<br>User balances have been updated.`,
      confirmButtonText: 'OK' 
    }).then(() => {
      renderAdminPage();
    });
  } else {
    Swal.fire({ icon: 'info', title: 'No Profits to Process', text: 'All investments are up to date.', confirmButtonText: 'OK' });
  }
}

function handleAddPlan() {
  Swal.fire({
    title: 'Add New Investment Plan',
    html: `
      <div style="display: flex; flex-direction: column; gap: 1rem; text-align: left;">
        <input id="plan-name" class="swal2-input" placeholder="Plan Name" style="margin: 0;">
        <input id="plan-min" type="number" class="swal2-input" placeholder="Minimum Investment" style="margin: 0;">
        <input id="plan-max" type="number" class="swal2-input" placeholder="Maximum Investment" style="margin: 0;">
        <input id="plan-rate" type="number" step="0.001" class="swal2-input" placeholder="Daily Rate (e.g. 0.02 for 2%)" style="margin: 0;">
        <input id="plan-color" class="swal2-input" placeholder="Color (e.g. hsl(30, 60%, 50%))" style="margin: 0;">
        <textarea id="plan-desc" class="swal2-textarea" placeholder="Description" style="margin: 0;"></textarea>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Add Plan',
    preConfirm: () => {
      const name = document.getElementById('plan-name').value;
      const min = parseFloat(document.getElementById('plan-min').value);
      const max = parseFloat(document.getElementById('plan-max').value);
      const rate = parseFloat(document.getElementById('plan-rate').value);
      const color = document.getElementById('plan-color').value;
      const desc = document.getElementById('plan-desc').value;
      
      if (!name || !min || !max || !rate || !color || !desc) {
        Swal.showValidationMessage('Please fill all fields');
        return false;
      }
      
      return { name, min, max, rate, color, desc };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const plans = getInvestmentPlans();
      const newPlan = {
        id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        name: result.value.name,
        minInvestment: result.value.min,
        maxInvestment: result.value.max,
        dailyProfitRate: result.value.rate,
        duration: 90,
        description: result.value.desc,
        color: result.value.color
      };
      plans.push(newPlan);
      updateInvestmentPlans(plans);
      Swal.fire({ icon: 'success', title: 'Plan Added!', text: 'The new investment plan has been created.', confirmButtonText: 'OK' }).then(() => {
        renderAdminPage();
      });
    }
  });
}

function handleDeletePlan(planId) {
  Swal.fire({
    title: 'Delete Plan?',
    text: 'This will permanently delete the investment plan. Existing investments will not be affected.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      const plans = getInvestmentPlans();
      const updatedPlans = plans.filter(p => p.id !== planId);
      updateInvestmentPlans(updatedPlans);
      Swal.fire({ icon: 'success', title: 'Deleted!', text: 'The plan has been deleted.', confirmButtonText: 'OK' }).then(() => {
        renderAdminPage();
      });
    }
  });
}

function handleViewLogs() {
  const logs = JSON.parse(localStorage.getItem('apiLogs') || '[]');
  const recentLogs = logs.slice(-20).reverse();
  
  const logsHTML = recentLogs.map(log => `
    <div style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border)); font-size: 0.875rem;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
        <strong>${log.action}</strong>
        <span class="text-muted small">${new Date(log.timestamp).toLocaleString()}</span>
      </div>
      <pre style="margin: 0; color: hsl(var(--muted-foreground)); font-size: 0.75rem; white-space: pre-wrap;">${JSON.stringify(log.data, null, 2)}</pre>
    </div>
  `).join('');
  
  Swal.fire({
    title: 'Recent API Logs',
    html: `<div style="max-height: 400px; overflow-y: auto; text-align: left;">${logsHTML}</div>`,
    width: '800px',
    confirmButtonText: 'Close'
  });
}

function renderMarketPage() {
  const html = `
    <div>
      <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Market</h1>
      <p class="text-muted" style="margin-bottom: 1.5rem;">Trade forex, crypto, stocks, and more with real-time data</p>
    </div>
    
    <div class="card" style="padding: 0; margin-bottom: 1.5rem;">
      <div id="tradingview-widget" style="height: 500px;"></div>
    </div>
    
    <div class="tabs">
      <div class="tabs-list">
        <button class="tab active" data-symbol="FX:EURUSD">EUR/USD</button>
        <button class="tab" data-symbol="FX:GBPUSD">GBP/USD</button>
        <button class="tab" data-symbol="BTCUSD">BTC/USD</button>
        <button class="tab" data-symbol="ETHUSD">ETH/USD</button>
        <button class="tab" data-symbol="NASDAQ:AAPL">AAPL</button>
        <button class="tab" data-symbol="NASDAQ:TSLA">TSLA</button>
      </div>
      <div id="symbolInfo" class="card" style="margin-top: 1rem; padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <h3 id="symbolName" style="font-size: 1.25rem; font-weight: 600;">EUR/USD</h3>
            <p class="text-muted small">Real-time chart data from TradingView</p>
          </div>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-buy" onclick="openQuickTrade('buy')">BUY</button>
          <button class="btn btn-sell" onclick="openQuickTrade('sell')">SELL</button>
        </div>
      </div>
    </div>
  `;
  
  content.innerHTML = html;
  
  // Initialize TradingView Widget with current symbol
  let currentSymbol = 'FX:EURUSD';
  loadTradingViewWidget(currentSymbol);
  
  // Tab switching
  const tabs = content.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentSymbol = tab.dataset.symbol;
      loadTradingViewWidget(currentSymbol);
      document.getElementById('symbolName').textContent = tab.textContent;
      apiLog('MARKET_SYMBOL_CHANGED', { symbol: currentSymbol });
    });
  });
}

function loadTradingViewWidget(symbol) {
  const container = document.getElementById('tradingview-widget');
  container.innerHTML = '';
  
  new TradingView.widget({
    container_id: 'tradingview-widget',
    autosize: true,
    symbol: symbol,
    interval: '15',
    timezone: 'Etc/UTC',
    theme: html.classList.contains('dark') ? 'dark' : 'light',
    style: '1',
    locale: 'en',
    toolbar_bg: '#f1f3f6',
    enable_publishing: false,
    hide_side_toolbar: false,
    allow_symbol_change: true,
    save_image: false,
    studies: [
      'MASimple@tv-basicstudies'
    ]
  });
}

function openQuickTrade(type) {
  const symbolName = document.getElementById('symbolName').textContent;
  const price = 'Market Price'; // TradingView widget shows real-time price
  openTradeModal(symbolName, type.toUpperCase(), price);
}

async function fetchTrader() {
  try {
    const response = await fetch('https://vantage-render.onrender.com/auth/trader/fetch-trader');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const traders = await response.json();
    console.log("Fetched traders:", traders);
    return traders;
  } catch (error) {
    console.error('Error fetching traders:', error);
    return []; // Return empty array if fetch fails
  }
}

async function renderSocialTradingPage() {
  const user = getUserData();
  const displayName = `${user.firstName}${user.lastName}`.toLowerCase();

  // 🔹 Fetch traders dynamically
  const masterTraders = await fetchTrader();

  // If no traders fetched, show fallback
  if (!masterTraders.length) {
    content.innerHTML = `
      <div class="hero-banner">
        <h1 class="hero-title">Welcome, <span class="text-primary">${displayName}</span>!</h1>
        <p style="font-size: 1.125rem;">Social Trading 🔥</p>
      </div>
      <div class="card" style="padding: 1rem; text-align: center;">
        <p>No master traders available at the moment. Please check back later.</p>
      </div>
      <!-- Place this button somewhere on your dashboard -->


    `;
    return;

    // JS: Event listener to load Copy Trading History
document.getElementById("loadCopyHistoryBtn").addEventListener("click", () => {
  renderCopyTradingHistory();
});
  }

  const html = `
    <div class="hero-banner">
      <h1 class="hero-title">Welcome, <span class="text-primary">${displayName}</span>!</h1>
      <p style="font-size: 1.125rem;">Social Trading 🔥</p>
      
    </div>

    ${user.copyTradingActive && user.copyTradingActive.length > 0 ? `
      <div class="card" style="margin-bottom: 1.5rem; background-color: hsl(var(--primary) / 0.1); border-color:#0fef9e;">
        <h3 style="font-weight: 600; margin-bottom: 0.5rem;">Active Copy Trading</h3>
        <p class="text-muted small">You are currently copying ${user.copyTradingActive.length} trader(s)</p>
      </div>
    ` : ''}
<button id="loadCopyHistoryBtn" class="btn btn-primary">
 History <i class="fas fa-arrow-right" style="color:#fff;"></i>

</button>

    <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Master Traders</h2>
    <div class="card-grid">
      ${masterTraders.map(trader => `
        <div class="card trader-card">
          <div class="trader-header">
            <div class="trader-avatar" 
                 style="background-color: hsl(var(--primary) / 0.2); display: flex; align-items: center; justify-content: center; font-weight: 600; color: hsl(var(--primary))">

          <img src=${trader.photo} style="width:50px; height:50px; border-radius:50%;"/>
            </div>
            <div class="trader-info">
              <h3>${trader.name || 'Unnamed Trader'}</h3>
              <span class="badge">${trader.level || 'Standard'}</span>
            </div>
          </div>

          <div class="trader-rating">
            ${Array(5).fill(0).map((_, i) => `
              <svg class="star ${i < (trader.rating || 0) ? '' : 'empty'}" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 
                                 18.18 21.02 12 17.77 5.82 21.02 
                                 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            `).join('')}
          </div>

          <div class="trader-stats">
            <div>
              <div class="stat-label">Number of trades</div>
              <div class="stat-value">${trader.trades || 0}</div>
            </div>
            <div>
              <div class="stat-label">Commission</div>
              <div class="stat-value">${trader.commission || 0}%</div>
            </div>
          </div>

          <div class="trader-pnl">
            <span style="font-weight: 600;">P&L</span>
            <span class="pnl-value">${trader.pnl || '₦0'}</span>
          </div>

          <button 
  class="btn btn-primary btn-block"
  data-name="${trader.name || 'Unknown'}"
  data-level="${trader.level || 'N/A'}"
  data-rating="${trader.rating || '0'}"
  data-photo="${trader.photo || ' '}"
  data-trades='${JSON.stringify(trader.trades || [])}'
  data-commission="${trader.commission || '0%'}"
  data-pnl="${trader.pnl || '₦0'}"
  data-profileid="${trader.profileId || 'N/A'}"
  data-accountlevel="${trader.accountLevel || 'Basic'}"
  data-type="${trader.type || 'N/A'}"
  data-history='${JSON.stringify(trader.history || [])}'
  data-followers="${trader.followers || '0'}"
  data-watchers="${trader.watchers || '0'}"
  data-profitabletrade="${trader.profitableTrade || '0%'}"
  onclick="openCopyTradeModal(this)">
  Mirror Trade
</button>

        </div>
      `
    
    ).join('')}
    </div>
  `;

  content.innerHTML = html;

   // JS: Event listener to load Copy Trading History
document.getElementById("loadCopyHistoryBtn").addEventListener("click", () => {
  renderCopyTradingHistory(user.copyTradingActive);
});
}

// function openCopyTradeModal(btn) {
//   // Parse arrays safely
//   const trades = JSON.parse(btn.dataset.trades || "[]");
//   const history = JSON.parse(btn.dataset.history || "[]");

//   // Fill modal fields
//   document.getElementById("name").textContent = btn.dataset.name;
//   document.getElementById("level").textContent = btn.dataset.level;
//   document.getElementById("rating").textContent = btn.dataset.rating;
//   document.getElementById("trades").textContent = trades.length || 0;
//   document.getElementById("commission").textContent = btn.dataset.commission;
//   document.getElementById("pnl").textContent = btn.dataset.pnl;
//   document.getElementById("profileId").textContent = btn.dataset.profileid;
//   document.getElementById("accountLevel").textContent = btn.dataset.accountlevel;
//   document.getElementById("type").textContent = btn.dataset.type;
//   document.getElementById("followers").textContent = btn.dataset.followers;
//   document.getElementById("watchers").textContent = btn.dataset.watchers;
//   document.getElementById("profitableTrade").textContent = btn.dataset.profitabletrade;

//   // If you have a trader photo
//   if (btn.dataset.photo) {
//     document.getElementById("photo").src = btn.dataset.photo;
//   }

//   // If you want to display trade history (optional)
//   const historyList = document.getElementById("historyList");
//   if (historyList) {
//     historyList.innerHTML = history.length
//       ? history.map((h) => `<li>${h}</li>`).join("")
//       : "<li>No history available</li>";
//   }

//   // Show modal
//   document.getElementById("copyTradeModal").classList.add("show");
// }



function renderLiveStreamPage() {
  const user = getUserData();
  const html = `
    <div style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Live Stream 📊🔥</h1>
      <p class="text-muted">Watch professional traders in action</p>
    </div>
    <div class="live-stream-container">
      <div class="video-background" style="background: linear-gradient(45deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);"></div>
      <div class="stream-overlay">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
          <polyline points="17 2 12 7 7 2"></polyline>
        </svg>
        <h2>Premium Content</h2>
        <p>${user.amountDeposited}</p>
        <div style="display: flex; gap: 1rem;">
          <button class="btn btn-primary" onclick="Swal.fire({ icon: 'info', title: 'Upgrade Required', text: 'Please contact support to upgrade your account', confirmButtonText: 'OK' })">Contact Support</button>
          <button class="btn" style="background-color: hsl(var(--secondary)); color: hsl(var(--secondary-foreground));" onclick="loadPage('fund-account')">Fund Account</button>
        </div>
      </div>
    </div>
    <div style="margin-top: 2rem;">
      <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">Upcoming Sessions</h3>
      <div class="card-grid">
        <div class="card" style="padding: 1.25rem;">
          <h4 style="font-weight: 600; margin-bottom: 0.5rem;">Forex Day Trading</h4>
          <p class="text-muted small" style="margin-bottom: 0.75rem;">Master: Ali G</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="text-muted small">Tomorrow, 9:00 AM</span>
            <span class="badge">Premium</span>
          </div>
        </div>
        <div class="card" style="padding: 1.25rem;">
          <h4 style="font-weight: 600; margin-bottom: 0.5rem;">Crypto Swing Trading</h4>
          <p class="text-muted small" style="margin-bottom: 0.75rem;">Master: Sarah Chen</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="text-muted small">Tomorrow, 2:00 PM</span>
            <span class="badge">Premium</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  content.innerHTML = html;
}

function renderFundAccountPage() {
  const user = getUserData();
  const html = `
    <div class="hero-banner">
  <h1 class="hero-title">Fund Account 💰</h1>
  <p style="font-size: 1rem; opacity: 0.9;">Current Balance: $${user.balance.toFixed(2)}</p>
</div>

<div class="card" style="max-width: 42rem;">
  <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem;">Make Deposit</h2>

  <!-- 👇 Wallet Display Area -->
  <div id="walletDisplay" style="display: none; text-align: center; margin-bottom: 1.5rem;">
    <img id="walletQr" src="" alt="Wallet QR" style="width: 140px; height: 140px; margin-bottom: 1rem; border-radius: 8px; border: 1px solid #eee;">
    <p style="font-size: 0.95rem; word-break: break-all; margin: 0 0 0.75rem 0;">
      <strong id="walletLabel"></strong>: 
      <span id="walletAddress"></span>
    </p>
    <button id="copyAddressBtn" onclick="(function(){
      const addr = document.getElementById('walletAddress').textContent;
      navigator.clipboard.writeText(addr).then(function(){
        const btn = document.getElementById('copyAddressBtn');
        const orig = btn.textContent;
        btn.textContent = '✅ Copied!';
        btn.style.backgroundColor = 'hsl(var(--chart-2))';
        setTimeout(function(){ btn.textContent = orig; btn.style.backgroundColor = ''; }, 2000);
      }).catch(function(){
        const ta = document.createElement('textarea');
        ta.value = addr;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        const btn = document.getElementById('copyAddressBtn');
        btn.textContent = '✅ Copied!';
        setTimeout(function(){ btn.textContent = '📋 Copy Address'; }, 2000);
      });
    })()" style="
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 1.1rem;
      border: 1px solid hsl(var(--border));
      border-radius: 6px;
      background: hsl(var(--muted));
      color: hsl(var(--foreground));
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    ">📋 Copy Address</button>
  </div>

  <!-- 👇 Wire Transfer bank details (shown when "Wire Transfer" is selected) -->
  <div id="wireDisplay" style="display: none; margin-bottom: 1.5rem; padding: 1rem; border: 1px solid hsl(var(--border)); border-radius: 8px; font-size: 0.95rem;"></div>

  <form id="depositForm">
    <div class="form-group">
      <label for="depositWallet">Deposit Channel</label>
      <select id="depositWallet" class="input" required>
        <option value="">Select a Wallet</option>
        <option value="bitcoin">Bitcoin</option>
        <option value="ethereum">Ethereum</option>
        <option value="solana">Solana</option>
        <option value="usdt">USDT (TRC20)</option>
        <option value="usdt2">USDT (ERC20)</option>
        <option value="litecoin">LTC</option>
       
      </select>
    </div>

    <div class="form-group">
      <label for="depositAmount">Amount ($)</label>
      <input type="number" id="depositAmount" class="input" placeholder="Enter Amount ($)" step="0.01" min="10" required>
    </div>

    <button type="submit" class="btn btn-primary btn-block">Submit Deposit Request</button>
  </form>
</div>

<div style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid hsl(var(--border));">
  <p class="text-muted small">COPYRIGHT ©2025 Demoweb3s, All rights Reserved</p>
</div>


  `;
  
  content.innerHTML = html;
  
  const walletDisplay = document.getElementById("walletDisplay");
  const walletLabel = document.getElementById("walletLabel");
  const walletAddress = document.getElementById("walletAddress");
  const walletQr = document.getElementById("walletQr");

  // Replace with actual addresses from user object
 const wallets = {
    bitcoin: { label: "Bitcoin", address: "bc1q70hx8f5rzlv7g9man8gat77kup5v0s8ennvqaq", qr: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bc1q70hx8f5rzlv7g9man8gat77kup5v0s8ennvqaq" },
    ethereum: { label: "Ethereum", address: "0xbe085b0F1F7cd38EEC8D804f40Bfd1703F380C51", qr: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=0xbe085b0F1F7cd38EEC8D804f40Bfd1703F380C51" },
    usdt: { label: "USDT (TRC20)", address: "TYcK8LbaAZYbn2n3o7MfJjkxFgEAZfGXPC", qr: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TYcK8LbaAZYbn2n3o7MfJjkxFgEAZfGXPC" },
     usdt2: { label: "USDT (ERC20)", address: "0xbe085b0F1F7cd38EEC8D804f40Bfd1703F380C51", qr: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=0xbe085b0F1F7cd38EEC8D804f40Bfd1703F380C51" },
  

    solana: { label: "SOL", address: "CYAn5Le2dRBvSFVVxuPr527jbKLZb96k82kUWh9ZQ77d", qr: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CYAn5Le2dRBvSFVVxuPr527jbKLZb96k82kUWh9ZQ77d" },
  };


  // Demo deposit method — only offered when an admin has switched it on.
  const DEMO_FALLBACK = { title: "Demo Mode", message: "This is a demo deposit method. No real funds are moved." };
  let demoSettings = null;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function showDemoMessage() {
    const title = (demoSettings && demoSettings.title) || DEMO_FALLBACK.title;
    const message = (demoSettings && demoSettings.message) || DEMO_FALLBACK.message;
    Swal.fire({
      icon: 'info',
      title: escapeHtml(title),
      html: escapeHtml(message).replace(/\n/g, '<br>'),
      confirmButtonText: 'OK'
    });
  }

  $.ajax({
    type: "GET",
    url: "https://vantage-render.onrender.com/demo-settings",
    dataType: "json",
    timeout: 30000
  }).then(res => {
    const select = document.getElementById("depositWallet");
    if (!res || !res.data || !res.data.enabled || !select) return;
    demoSettings = res.data;
    const opt = document.createElement("option");
    opt.value = "demo";
    opt.textContent = "Demo";
    select.appendChild(opt);
  }).catch(err => console.error("Error loading demo settings:", err));

  // Wire Transfer deposit method — only offered when an admin has switched it on.
  const wireDisplay = document.getElementById("wireDisplay");

  $.ajax({
    type: "GET",
    url: "https://vantage-render.onrender.com/wire-transfer-settings",
    dataType: "json",
    timeout: 30000
  }).then(res => {
    const select = document.getElementById("depositWallet");
    if (!res || !res.data || !res.data.enabled || !select || !wireDisplay) return;
    const s = res.data;
    const rows = [
      ["Bank Name", s.bankName],
      ["Account Name", s.accountName],
      ["Account Number", s.accountNumber],
      ["Routing / Sort Code", s.routingOrSortCode],
      ["SWIFT / BIC", s.swiftBic],
    ].filter(([, v]) => v);
    wireDisplay.innerHTML =
      rows.map(([k, v]) => `<p style="margin: 0 0 0.4rem; word-break: break-all;"><strong>${k}:</strong> ${escapeHtml(v)}</p>`).join("") +
      (s.referenceNote ? `<p class="text-muted small" style="margin: 0.6rem 0 0;">${escapeHtml(s.referenceNote)}</p>` : "");
    const opt = document.createElement("option");
    opt.value = "wire";
    opt.textContent = "Wire Transfer";
    // keep Demo (if already added) as the last option
    const demoOpt = select.querySelector('option[value="demo"]');
    select.insertBefore(opt, demoOpt);
  }).catch(err => console.error("Error loading wire transfer settings:", err));

  document.getElementById("depositWallet").addEventListener("change", function() {
    const value = this.value;
    wireDisplay.style.display = value === "wire" ? "block" : "none";
    if (value === "wire") {
      walletDisplay.style.display = "none";
      return;
    }
    if (value === "demo") {
      walletDisplay.style.display = "none";
      showDemoMessage();
      return;
    }
    if (wallets[value] && wallets[value].address) {
      walletDisplay.style.display = "block";
      walletLabel.textContent = wallets[value].label;
      walletAddress.textContent = wallets[value].address;
      walletQr.src = wallets[value].qr;
    } else {
      walletDisplay.style.display = "none";
    }
  });
  document.getElementById('depositForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const wallet = document.getElementById('depositWallet').value;
    const amount = parseFloat(document.getElementById('depositAmount').value);

    // Demo never creates a real deposit request — just show the message again.
    if (wallet === 'demo') {
      showDemoMessage();
      return;
    }

    if (amount < 10) {
      Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Minimum deposit amount is $10', confirmButtonText: 'OK' });
      return;
    }
    
    addTransaction({
      type: 'deposit',
      method: wallet,
      amount: amount,
      status: 'pending'
    });
    
    // Swal.fire({ 
    //   icon: 'success', 
    //   title: 'Deposit Submitted!', 
    //   html: `<strong>Method:</strong> ${wallet}<br><strong>Amount:</strong> $${amount.toFixed(2)}<br><br>Your deposit is being processed.`,
    //   confirmButtonText: 'OK'
    // });
    e.target.reset();
    wireDisplay.style.display = "none";
  });
}

function renderProfilePage() {
  const user = getUserData();
  const initials = (user.firstName[0] + user.lastName[0]).toUpperCase();
  
  const html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700;">Profile Settings</h1>
      <div class="avatar" style="width: 4rem; height: 4rem; font-size: 1.25rem;">${initials}</div>
    </div>
    <div class="card">
      <p class="text-muted" style="margin-bottom: 1.5rem;">
        We provide innovative strategies and expert insights to secure your future and build a lasting legacy. Your journey to financial greatness begins now!
      </p>
      <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Personal Data</h2>
      ${user.kyc !== 'Verified' ? `
        <div style="padding: 0.75rem; background-color: hsl(var(--destructive) / 0.1); border: 1px solid hsl(var(--destructive) / 0.2); border-radius: 0.5rem; margin-bottom: 1.5rem;">
          <p style="font-size: 0.875rem; color: hsl(var(--destructive)); font-weight: 500;">KYC ${user.kyc === 'unverified' ? 'Required' : user.kyc} - Please update your profile.</p>
        </div>
      ` : ''}
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
        <div>
          <div class="stat-label">Full Name</div>
          <div class="stat-value">${user.firstName} ${user.lastName}</div>
        </div>
        <div>
          <div class="stat-label">Display Name</div>
          <div class="stat-value">${user.firstName}${user.lastName}</div>
        </div>
        <div>
          <div class="stat-label">Email</div>
          <div class="stat-value">${user.email}</div>
        </div>
        <div>
          <div class="stat-label">Country</div>
          <div class="stat-value">${user.country}</div>
        </div>
        <div>
          <div class="stat-label">KYC Status</div>
          <span class="badge" style="background-color: ${user.kyc === 'Verified' ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}; color: white;">${user.kyc}</span>
        </div>
        <div>
          <div class="stat-label">Date Joined</div>
          <div class="stat-value">${new Date(user.dateJoined).toLocaleDateString()}</div>
        </div>
        <div>
          <div class="stat-label">Balance</div>
          <div style="font-size: 1.5rem; font-weight: 700;">$${user.balance.toFixed(2)}</div>
        </div>
        <div>
          <div class="stat-label">Total Profit</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: hsl(var(--chart-2));">$${user.profit.toFixed(2)}</div>
        </div>
       
      </div>
      <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
        <button class="btn btn-primary" onclick="handleEditProfile()">Edit Profile</button>
        <button class="btn" style="background-color: transparent; border: 1px solid hsl(var(--border)); color: hsl(var(--foreground));" onclick="handleUpdateKYC()">Update KYC</button>
      </div>
     <button class="btn" style="background-color: transparent;margin-top:10px;  border: 1px solid hsl(var(--border)); color: hsl(var(--foreground));" onclick="handleChangePassword()">Change Password</button>

    </div>
  `;
  
  content.innerHTML = html;
}
async function handleChangePassword() {
  // Fetch user info from localStorage/server
  const storedUser = localStorage.getItem('userData');
  if (!storedUser) return alert('No user data found');

  const userFromLS = JSON.parse(storedUser);

  let userInfo;
  try {
    const response = await $.ajax({
      type: "GET",
      url: `https://vantage-render.onrender.com/users/${userFromLS.email}`, // Adjust your endpoint
      dataType: "json",
      timeout: 30000
    });
    userInfo = response.data;
    localStorage.setItem("userData", JSON.stringify(userInfo));
  } catch (err) {
    console.error('Error fetching user info:', err);
    return alert('Failed to fetch user info.');
  }

  // SweetAlert form for password
  const { value: formValues } = await Swal.fire({
    title: 'Change Password',
    html: `
      <input type="password" id="swalNewPassword" class="swal2-input" placeholder="New Password">
      <input type="password" id="swalConfirmPassword" class="swal2-input" placeholder="Confirm Password">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Save Password',
    preConfirm: () => {
      return {
        password: document.getElementById('swalNewPassword').value.trim(),
        confirmPassword: document.getElementById('swalConfirmPassword').value.trim()
      };
    }
  });

  if (!formValues) return; // User canceled

  const { password, confirmPassword } = formValues;

  if (!password || !confirmPassword) return Swal.fire('Error', 'Both fields are required', 'error');
  if (password !== confirmPassword) return Swal.fire('Error', 'Passwords do not match', 'error');

  // Show loading indicator
  Swal.fire({ title: 'Updating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  // Send request to backend
  try {
    await $.ajax({
      type: "PUT",
      url: `https://vantage-render.onrender.com/auth/${userInfo._id}/reset-password`,
      dataType: "json",
      data: { password },
      timeout: 30000
    });

    Swal.fire({
      title: "Success",
      text: "Your password has been successfully reset.",
      icon: "success",
      timer: 3000
    });

    

  } catch (err) {
    console.error('Error resetting password:', err);
    Swal.fire('Error', 'Failed to reset password. Please try again.', 'error');
  }
}


async function handleUpdateKYC() {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.classList.add('modal-overlay');
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;

  // Modal content
  modal.innerHTML = `
    <div class="modal-card" style="
      background: hsl(var(--card));
      padding: 2rem;
      border-radius: 1rem;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      text-align: center;
      position: relative;
    ">
      <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">KYC Verification</h2>
      <p style="font-size: 0.9rem; color: hsl(var(--muted-foreground)); margin-bottom: 1rem;">
        Please upload a clear photo of your valid ID card or passport and enter the document number below.
      </p>

      <input type="text" id="documentNumber" placeholder="Enter document number" style="
        width: 100%;
        padding: 0.5rem;
        border: 1px solid hsl(var(--border));
        border-radius: 0.5rem;
        margin-bottom: 1rem;
      " />

      <input type="file" id="image-upload" accept="image/*" style="
        display: block;
        margin: 0 auto 1rem auto;
        padding: 0.5rem;
        border: 1px solid hsl(var(--border));
        border-radius: 0.5rem;
        width: 100%;
        background: hsl(var(--background));
      ">

      <img id="image-preview" style="
        display: none;
        max-width: 100%;
        margin-bottom: 1rem;
        border-radius: 0.5rem;
        border: 1px solid hsl(var(--border));
      " />

      <div style="display: flex; gap: 0.75rem; justify-content: center;">
        <button id="upload-button" class="btn btn-primary">Submit KYC</button>
        <button id="cancelKYCBtn" class="btn" style="
          background: transparent;
          border: 1px solid hsl(var(--border));
          color: hsl(var(--foreground));
        ">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // --- Cloudinary Settings ---
  const cloudName = 'dsyjlantq';
  const uploadPreset = 'assetspur';

  // --- Functions ---
  function storeImg(imageUrl, owner, docNum,ownerdet) {
    $.ajax({
      type: 'POST',
      url: 'https://vantage-render.onrender.com/auth/kyc',
      dataType: 'json',
      data: { imageUrl, owner, docNum,ownerdet },
      timeout: 30000,
      success: function () {
        localStorage.setItem("kycStatus", "pending");
        alert("Your details have been successfully uploaded. Please wait a few hours for validation.");
         renderDashboardPage();
      },
      error: function (xhr, status, error) {
        console.error('Error uploading image:', error);
        alert('Error uploading your document. Please try again.');
      }
    });
  }

  function uploadToCloudinary(file, docNum) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        const imageUrl = data.secure_url;
        console.log(imageUrl);
        
        localStorage.setItem("imgUrl", imageUrl);

        const userData = JSON.parse(localStorage.getItem("userData"));
        const owner = `${userData.firstName} ${userData.lastName}`;
        const ownerdet=userData._id
        storeImg(imageUrl, owner, docNum,ownerdet);
      })
      .catch(error => {
        console.error('Image upload failed:', error);
        alert('Image upload failed. Please check your internet connection.');
      });
  }

  async function fetchUserInfo() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData?.email) return;

    try {
      const response = await $.ajax({
        type: "GET",
        url: `https://vantage-render.onrender.com/users/${userData.email}`,
        dataType: "json",
        timeout: 30000
      });

      localStorage.setItem("userData", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  }

  // --- Event Listeners ---
  const imageInput = modal.querySelector('#image-upload');
  const preview = modal.querySelector('#image-preview');
  const cancelBtn = modal.querySelector('#cancelKYCBtn');
  const uploadBtn = modal.querySelector('#upload-button');

  // Preview selected image
  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        preview.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  // Cancel modal
  cancelBtn.addEventListener('click', () => modal.remove());

  // Upload KYC
  uploadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const file = imageInput.files[0];
    const docNum = document.getElementById("documentNumber").value.trim();

    if (!file) return alert('Please select an image.');
    if (!docNum) return alert('Please enter your document number.');

    uploadBtn.textContent = "Uploading...";
    uploadBtn.disabled = true;

    uploadToCloudinary(file, docNum);
  });

  // Fetch user info on modal open
  await fetchUserInfo();
}


function renderInvestmentPage() {
  const user = getUserData();
  processDailyProfits();

  const plan = user.plan.filter(inv => inv.status === "active") || [];
  const totalPnL = Array.isArray(user.plan)
  ? user.plan.reduce((sum, plan) => sum + (Number(plan.totalProfit) || 0), 0)
  : 0;


  const investmentsHTML =
    plan.length > 0
      ? plan
          .map(inv => {
            const dailyProfit = inv.amount * inv.dailyProfitRate;
            const progress = (inv.daysElapsed / inv.duration) * 100;
            const daysRemaining = inv.duration - inv.daysElapsed;

            return `
        <div class="card" style="padding:1.5rem;margin-bottom:1rem;">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:1rem;">
            <div>
              <h3 style="font-size:1.125rem;font-weight:600;margin-bottom:0.25rem;">${inv.planName}</h3>
              <p class="text-muted small">Started ${inv.startDate}</p>
            </div>
            <span class="badge" style="background-color:hsl(var(--chart-2));color:white;padding:0.25rem 0.75rem;border-radius:0.25rem;">${inv.status}</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem;margin-bottom:1rem;">
            <div>
              <div class="text-muted small">Invested Amount</div>
              <div style="font-weight:600;margin-top:0.25rem;">$${inv.amount.toFixed(2)}</div>
            </div>
            <div>
              <div class="text-muted small">Daily Profit</div>
              <div style="font-weight:600;color:hsl(var(--chart-2));margin-top:0.25rem;">$${dailyProfit.toFixed(2)} (${(
              inv.dailyProfitRate * 100
            ).toFixed(2)}%)</div>
            </div>
            <div>
              <div class="text-muted small">Total Earned</div>
              <div style="font-weight:600;color:hsl(var(--chart-2));margin-top:0.25rem;">$${inv.totalProfit.toFixed(
                2
              )}</div>
            </div>
            <div>
              <div class="text-muted small">Days Remaining</div>
              <div style="font-weight:600;margin-top:0.25rem;">${daysRemaining} / ${
              inv.duration
            }</div>
            </div>
          </div>

          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
              <span class="text-muted small">Progress</span>
              <span class="small" style="font-weight:600;">${progress.toFixed(1)}%</span>
            </div>
            <div style="width:100%;background-color:hsl(var(--muted));border-radius:9999px;height:8px;">
              <div style="width:${progress}%;background-color:hsl(var(--chart-2));height:100%;border-radius:9999px;transition:width 0.3s;"></div>
            </div>
          </div>
        </div>`;
          })
          .join("")
      : `<div class="card"><p class="text-muted" style="text-align:center;padding:2rem;">No active investment plans. <a href="#investment-plans" style="color:hsl(var(--primary));">Browse available plans</a></p></div>`;

  // Tables (renamed)
  const depositsTable = user.transactions?.length
    ? `
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${user.transactions
            .slice()
            .reverse()
            .map(
              d => `
              <tr>
                <td>${new Date(d.timestamp).toLocaleDateString()}</td>
                <td>$${d.amount}</td>
                <td>${d.method}</td>
                <td><span class="badge" style="background:${
                  d.status === "Approved"
                    ? "hsl(var(--chart-2))"
                    : "hsl(var(--destructive))"
                };color:white;">${d.status}</span></td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`
    : `<p class="text-muted" style="text-align:center;padding:2rem;">No deposits found.</p>`;

  const withdrawalsTable = user.withdrawals?.length
    ? `
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${user.withdrawals
            .slice()
            .reverse()
            .map(
              w => `
              <tr>
                <td>${new Date(w.timestamp).toLocaleDateString()}</td>
                <td>$${w.amount}</td>
                <td>${w.method}</td>
                <td><span class="badge" style="background:${
                  w.status === "Approved"
                    ? "hsl(var(--chart-2))"
                    : "hsl(var(--destructive))"
                };color:white;">${w.status}</span></td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`
    : `<p class="text-muted" style="text-align:center;padding:2rem;">No withdrawals found.</p>`;

  const html = `
    <div style="margin-bottom:1.5rem;">
      <h1 style="font-size:1.5rem;font-weight:700;margin-bottom:0.5rem;">My Investments</h1>
      <p class="text-muted">Track your active investment plans, deposits, and withdrawals</p>
    </div>

    <div class="stats-grid" style="margin-bottom:1.5rem;">
      <div class="card stat-card"><div class="stat-label">Total Balance</div><div class="stat-value">$${user.balance.toFixed(
        2
      )}</div></div>
      <div class="card stat-card"><div class="stat-label">Active Investments</div><div class="stat-value">${plan.length}</div></div>
      <div class="card stat-card">
  <div class="stat-label">Investment Profit</div>
  <div class="stat-value" style="color:hsl(var(--chart-2));">
    $${plan
      .filter(inv => inv.status === "active")
      .reduce((sum, inv) => sum + (inv.totalProfit || 0), 0)
      .toFixed(2)}
  </div>
</div>

      <div class="card stat-card"><div class="stat-label">Total P&L</div><div class="stat-value" style="color:${
        totalPnL >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"
      };">${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(2)}</div></div>
    </div>

    ${plan.length > 0 ? `<h2 style="font-size:1.125rem;font-weight:600;margin-bottom:1rem;">Active Investment Plans</h2>${investmentsHTML}` : investmentsHTML}

    <div class="card" style="margin-top:1.5rem;">
      <div style="display:flex;justify-content:center;gap:1rem;margin-bottom:1rem;flex-wrap:wrap;">
        <button class="tab-btn active" data-tab="investments">Investments</button>
        <button class="tab-btn" data-tab="deposits">Deposits</button>
        <button class="tab-btn" data-tab="withdrawals">Withdrawals</button>
      </div>

      <div id="tab-content">
        <div id="tab-investments">${user.plan.length ? `
          <div class="table-scroll">
            <table class="data-table">
              <thead><tr><th>Date</th><th>Plan</th><th>Amount</th><th>Profit</th><th>Status</th></tr></thead>
              <tbody>
                ${user.plan
                  .slice()
                  .reverse()
                  .map(
                    t => `
                    <tr>
                      <td>${new Date(t.timestamp).toLocaleDateString()}</td>
                      <td>${t.planName}</td>
                      <td>$${t.amount}</td>
                      <td>$${t.totalProfit}</td>
                      <td><span class="badge" style="${
                        t.status === "active" || t.status === "completed"
                          ? "background-color:hsl(var(--chart-2));color:white;"
                          : ""
                      }">${t.status}</span></td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>` : `<p class="text-muted" style="text-align:center;padding:2rem;">No investments yet.</p>`}
        </div>
        <div id="tab-deposits" style="display:none;">${depositsTable}</div>
        <div id="tab-withdrawals" style="display:none;">${withdrawalsTable}</div>
      </div>
    </div>

    <style>
      .tab-btn {
        background: none;
        border: 1px solid hsl(var(--border));
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: 0.2s;
      }
      .tab-btn:hover { background: hsl(var(--muted)); }
      .tab-btn.active { background: hsl(var(--chart-2)); color: white; }

      .table-scroll {
        overflow-x: auto;
        width: 100%;
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 700px;
      }
      .data-table th, .data-table td {
        text-align: left;
        padding: 0.75rem;
        border-bottom: 1px solid hsl(var(--border));
        white-space: nowrap;
      }
      .data-table th {
        color: hsl(var(--muted-foreground));
        text-transform: uppercase;
        font-size: 0.75rem;
      }
    </style>
  `;

  content.innerHTML = html;

  // New tab switcher logic
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.tab;
      document.querySelectorAll("#tab-content > div").forEach(div => (div.style.display = "none"));
      document.getElementById("tab-" + target).style.display = "block";
    });
  });
}

// ===== Investment Plans product: view catalog, buy, show active investments =====
function renderInvestProductsPage() {
  processInvestmentProfits();
  const user = getUserData() || {};
  const products = getInvestmentProducts();
  const investments = Array.isArray(user.investments) ? user.investments : [];
  const active = investments.filter(i => i.status === 'active');
  const fmtMax = (m) => (m === 'unlimited' || m == null) ? 'Unlimited' : '$' + Number(m).toLocaleString();

  const cards = products.map(p => `
    <div class="home-card" style="border-top:3px solid ${p.color || 'hsl(var(--fx-cyan))'};">
      <h3 style="font-size:1.15rem;font-weight:700;margin-bottom:.25rem;">${p.name}</h3>
      <p class="text-muted small" style="margin-bottom:.75rem;">${p.description || ''}</p>
      <div class="inv-rows">
        <div><span class="text-muted small">Daily return</span><strong>${((Number(p.dailyProfitRate) || 0) * 100).toFixed(2)}%</strong></div>
        <div><span class="text-muted small">Term</span><strong>${p.duration || 0} days</strong></div>
        <div><span class="text-muted small">Min</span><strong>$${Number(p.minInvestment || 0).toLocaleString()}</strong></div>
        <div><span class="text-muted small">Max</span><strong>${fmtMax(p.maxInvestment)}</strong></div>
        ${p.capMultiple ? `<div><span class="text-muted small">Max return</span><strong>${p.capMultiple}×</strong></div>` : ''}
      </div>
      <button class="btn btn-primary btn-block" style="margin-top:1rem;" data-buy="${p.id}">Invest</button>
    </div>`).join('');

  const activeHTML = active.length ? active.map(i => {
    const progress = i.duration ? Math.min(100, (i.daysElapsed / i.duration) * 100) : 0;
    return `<div class="home-card" style="margin-bottom:.75rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;"><strong>${i.planName}</strong><span class="home-pill home-pill-green">Active</span></div>
      <div class="inv-rows" style="margin-top:.5rem;">
        <div><span class="text-muted small">Invested</span><strong>$${Number(i.amount).toFixed(2)}</strong></div>
        <div><span class="text-muted small">Earned</span><strong style="color:hsl(var(--fx-green));">$${Number(i.totalProfit || 0).toFixed(2)}</strong></div>
        <div><span class="text-muted small">Day</span><strong>${i.daysElapsed}/${i.duration}</strong></div>
      </div>
      <div class="inv-progress"><div style="width:${progress}%;"></div></div>
    </div>`;
  }).join('') : `<p class="text-muted small">No active investments yet.</p>`;

  content.innerHTML = `
    <div class="fx-page">
      <div style="margin-bottom:1.5rem;"><h1 style="font-size:1.5rem;font-weight:700;margin-bottom:.5rem;">Investment Plans</h1><p class="text-muted">Invest in a managed fund and earn daily returns over the term.</p></div>
      <div class="holdings-grid">${cards}</div>
      <h2 style="font-size:1.25rem;font-weight:600;margin:1.5rem 0 1rem;">My Investments</h2>
      ${activeHTML}
    </div>`;

  content.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => handleBuyInvestment(b.dataset.buy)));
}

function handleBuyInvestment(planId) {
  const plan = getInvestmentProducts().find(p => String(p.id) === String(planId));
  if (!plan) return;
  const bal = Number((getUserData() || {}).balance || 0);
  const min = Number(plan.minInvestment || 0);
  const maxRaw = plan.maxInvestment;
  const max = (maxRaw === 'unlimited' || maxRaw == null) ? Infinity : Number(maxRaw);

  Swal.fire({
    title: `Invest in ${plan.name}`,
    html: `Daily return: <b>${((Number(plan.dailyProfitRate) || 0) * 100).toFixed(2)}%</b> · Term: <b>${plan.duration} days</b><br>Min $${min.toLocaleString()} · Available $${bal.toFixed(2)}`,
    input: 'number', inputPlaceholder: 'Amount to invest ($)',
    showCancelButton: true, confirmButtonText: 'Invest'
  }).then(res => {
    if (!res.isConfirmed) return;
    const amount = Number(res.value);
    if (!amount || amount <= 0) return Swal.fire({ icon: 'warning', title: 'Invalid amount', confirmButtonText: 'OK' });
    if (amount < min) return Swal.fire({ icon: 'warning', title: 'Below minimum', text: `Minimum is $${min.toLocaleString()}`, confirmButtonText: 'OK' });
    if (amount > max) return Swal.fire({ icon: 'warning', title: 'Above maximum', confirmButtonText: 'OK' });
    if (amount > bal) return Swal.fire({ icon: 'error', title: 'Insufficient balance', confirmButtonText: 'OK' });

    const now = new Date();
    const u = getUserData();
    u.investments = Array.isArray(u.investments) ? u.investments : [];
    u.investments.push({
      _id: 'inv_' + Date.now(), planId: plan.id, planName: plan.name,
      amount, dailyProfitRate: Number(plan.dailyProfitRate) || 0,
      duration: Number(plan.duration) || 0, capMultiple: Number(plan.capMultiple) || 0,
      startDate: now.toISOString(),
      endDate: new Date(now.getTime() + (Number(plan.duration) || 0) * 86400000).toISOString(),
      daysElapsed: 0, totalProfit: 0, status: 'active', lastProfitUpdate: now.toISOString()
    });
    u.balance = Number(u.balance || 0) - amount;
    updateUserData(u);
    Swal.fire({ icon: 'success', title: 'Investment started!', html: `<b>${plan.name}</b><br>$${amount.toFixed(2)} invested`, confirmButtonText: 'OK' });
    renderInvestProductsPage();
  });
}

function renderInvestmentPlansPage() {
  const user = getUserData();
  const plans = getInvestmentPlans();
  
  // Process daily profits on page load
  processDailyProfits();
  
  const plansHTML = plans.map(plan => {
    const totalReturn = plan.dailyProfitRate * plan.duration * 100;
    return `
      <div class="card" style="padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${plan.color};"></div>
              <h3 style="font-size: 1.25rem; font-weight: 600;">${plan.name}</h3>
            </div>
            <p class="text-muted small">${plan.description}</p>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background-color: hsl(var(--muted)); border-radius: 0.375rem;">
          <div>
            <div class="text-muted small">Min Investment</div>
            <div style="font-weight: 600; margin-top: 0.25rem;">$${plan.minInvestment.toLocaleString()}</div>
          </div>
          <div>
            <div class="text-muted small">Max Investment</div>
            <div style="font-weight: 600; margin-top: 0.25rem;">${plan.maxInvestment.toLocaleString()}</div>
          </div>
          <div>
            <div class="text-muted small">Daily Profit</div>
            <div style="font-weight: 600; color: hsl(var(--chart-2)); margin-top: 0.25rem;">${(plan.dailyProfitRate * 100).toFixed(2)}%</div>
          </div>
          <div>
            <div class="text-muted small">Total Return</div>
            <div style="font-weight: 600; color: hsl(var(--chart-2)); margin-top: 0.25rem;">${totalReturn.toFixed(0)}%</div>
          </div>
          <div>
            <div class="text-muted small">Duration</div>
            <div style="font-weight: 600; margin-top: 0.25rem;">${plan.durationn} Hours</div>
          </div>
          <div>
            <div class="text-muted small">Your Balance</div>
            <div style="font-weight: 600; margin-top: 0.25rem;">$${user.balance.toFixed(2)}</div>
          </div>
        </div>
        
        <div style="display: flex; gap: 0.75rem;">
          <input type="number" id="amount-${plan.id}" class="input" placeholder="Enter amount" min="${plan.minInvestment}" max="${plan.maxInvestment}" style="flex: 1;">
          <button class="btn btn-primary" onclick="handlePurchasePlan('${plan.id}')" style="white-space: nowrap;">Invest Now</button>
        </div>
      </div>
    `;
  }).join('');
  
  const html = `
    <div style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Investment Plans 📈</h1>
      <p class="text-muted">Choose a plan and start earning daily profits for 90 days</p>
    </div>
    
    <div class="stats-grid" style="margin-bottom: 1.5rem;">
      <div class="card stat-card">
        <div class="stat-label">Current Balance</div>
        <div class="stat-value">$${user.balance.toFixed(2)}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Active Investments</div>
        <div class="stat-value">${user.plan.filter(inv => inv.status === 'active').length}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Total Invested</div>
        <div class="stat-value">$${user.plan.filter(inv => inv.status === 'active').reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}</div>
      </div>
      <div class="card stat-card">
  <div class="stat-label">Active Earnings</div>
  <div class="stat-value" style="color: hsl(var(--chart-2));">
    $${user.plan
      .filter(inv => inv.status === "active")
      .reduce((sum, inv) => sum + (inv.totalProfit || 0), 0)
      .toFixed(2)}
  </div>
</div>

      <div class="card stat-card">
        <div class="stat-label">Total Earnings</div>
        <div class="stat-value" style="color: hsl(var(--chart-2));">$${user.plan.reduce((sum, inv) => sum + inv.totalProfit, 0).toFixed(2)}</div>
      </div>
    </div>
    
    <div style="display: grid; gap: 1rem;">
      ${plansHTML}
    </div>
  `;
  
  content.innerHTML = html;
}

async function handleWithdrawal() {
  const user = getUserData();
  const type = document.getElementById('withdrawalType').value;
  const method = document.getElementById('withdrawalWallet').value;
  const amount = parseFloat(document.getElementById('withdrawalAmount').value);
  const address = document.getElementById('withdrawalAddress').value;

  // 🟢 Basic validation
  if (!type) return Swal.fire({ icon: 'warning', title: 'Missing Type', text: 'Select a withdrawal wallet.' });
  if (!method) return Swal.fire({ icon: 'warning', title: 'Missing Method', text: 'Select a withdrawal method.' });
  if (amount < 10) return Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Minimum withdrawal is $10.' });

  // 🟠 Choose the correct wallet dynamically
  const available = type === 'Balance' ? user.balance : user.profit;

  if (amount > available) {
    Swal.fire({
      icon: 'error',
      title: 'Insufficient Funds',
      text: `You do not have enough ${type.toLowerCase()} for this withdrawal.`,
    });
    return;
  }

  // 🟣 Common withdrawal handler
  await addWithdrawal({
    method,
    amount,
    address,
    to: user.email,
    from: user.firstName + " " + user.lastName,
    source: type, // optional: to track where it came from
  });

  console.log(  method,
    amount,
    address,
   type,);
  
  Swal.fire({
    icon: 'success',
    title: 'Withdrawal Submitted!',
    html: `<strong>Type:</strong> ${type}<br><strong>Method:</strong> ${method}<br><strong>Amount:</strong> $${amount.toFixed(2)}<br><strong>Address:</strong> ${address}`,
  });

  renderWithdrawalPage();
}
function renderWithdrawalHistory(user) {
  if (!user.withdrawals.length) return '';

  return `
    <div class="card" style="margin-top: 2rem;">
      <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Withdrawal History</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr><th>Date</th><th>Method</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${user.withdrawals.slice().reverse().map(w => `
              <tr>
                <td>${new Date(w.timestamp).toLocaleDateString()}</td>
                <td>${w.method}</td>
                <td>$${w.amount.toFixed(2)}</td>
                <td><span class="badge">${w.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderWithdrawalPage() {
  const user = getUserData();

  const html = `
    <div style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Withdrawal</h1>
      <p class="text-muted">
        Request a withdrawal from your account 
        (Balance: $${user.balance.toFixed(2)} | Profit: $${user.profit.toFixed(2)})
      </p>
    </div>

    <div class="card" style="max-width: 42rem;">
      <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem;">Make Withdrawal</h2>
      <form id="withdrawalForm">
        <div class="form-group">
          <label for="withdrawalType">Withdrawal Wallet</label>
          <select id="withdrawalType" class="input" required>
            <option value="">Select a Wallet</option>
            <option value="Balance">Balance</option> 
            <option value="Profit">Profit</option>  
          </select>
        </div>

        <div class="form-group">
          <label for="withdrawalWallet">Withdrawal Method</label>
          <select id="withdrawalWallet" class="input" required>
            <option value="">Select a Method</option>
            <option value="Bitcoin">Bitcoin</option>
            <option value="Ethereum">Ethereum</option>
            <option value="USDT">USDT (TRC20)</option>
            <option value="Litecoin">Litecoin</option>
          </select>
        </div>

        <div class="form-group">
          <label for="withdrawalAmount">Amount ($)</label>
          <input type="number" id="withdrawalAmount" class="input" placeholder="Enter Amount ($)" step="0.01" min="10" required>
        </div>

        <div class="form-group">
          <label for="withdrawalAddress">Wallet Address / Bank Account</label>
          <input type="text" id="withdrawalAddress" class="input" placeholder="Enter your wallet address or bank account" required>
        </div>

        <div style="padding: 1rem; background-color: hsl(var(--muted) / 0.5); border-radius: 0.5rem; border: 1px solid hsl(var(--border)); margin-bottom: 1.5rem;">
          <p class="text-muted small">Please note: Withdrawals may take a few minutes to process.</p>
        </div>

        <button type="submit" class="btn btn-primary btn-block">Withdraw</button>
      </form>
    </div>

    ${renderWithdrawalHistory(user)}
  `;

  content.innerHTML = html;

  document.getElementById('withdrawalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleWithdrawal();
  });
}


function renderReferralsPage() {
  const user = getUserData();
  const activeReferrals = user.referredUsers.filter(r => r.status === 'active');
  const totalEarned = user.referredUsers.reduce((sum, r) => sum + (r.earned || 0), 0);
  
  const html = `
    <div style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Referral Program</h1>
      <p class="text-muted">Earn rewards by inviting friends to Demoweb3s</p>
    </div>
    
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-label">Total Referrals</div>
        <div class="stat-value">${user.referredUsers.length}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Active Referrals</div>
        <div class="stat-value">${activeReferrals.length}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Total Earned</div>
        <div class="stat-value" style="color: hsl(var(--chart-2));">$${totalEarned.toFixed(2)}</div>
      </div>
    </div>
    
    <div class="card" style="margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Your Referral Code</h2>
      <p class="text-muted" style="margin-bottom: 1rem;">Share this code with your friends. They get a bonus and you earn 10% of their first deposit!</p>
      <div class="referral-code">
        <input type="text" id="referralCodeInput" class="input" value="https://www.Demoweb3s.com/register.html?ref=${user.referralCode}" readonly>
        <button class="copy-btn" onclick="copyReferralCode()">
          <svg style="width: 1rem; height: 1rem; display: inline; vertical-align: middle; margin-right: 0.25rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy
        </button>
      </div>
    </div>
    
    ${user.referredUsers.length > 0 ? `
      <div class="card">
        <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Referral History</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date Joined</th>
                <th>Status</th>
                <th>Earned</th>
              </tr>
            </thead>
            <tbody>
              ${user.referredUsers.slice().reverse().map(ref => `
                <tr>
                  <td style="font-weight: 600;">${ref.name}</td>
                  <td>${new Date(ref.dateJoined).toLocaleDateString()}</td>
                  <td>
                    <span class="badge" style="${ref.status === 'active' ? 'background-color: hsl(var(--chart-2)); color: white;' : ''}">${ref.status}</span>
                  </td>
                  <td style="font-weight: 600; color: ${ref.earned > 0 ? 'hsl(var(--chart-2))' : 'inherit'};">$${ref.earned.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : `
      <div class="card">
        <p class="text-muted" style="text-align: center; padding: 2rem;">No referrals yet. Share your code and start earning!</p>
      </div>
    `}
  `;
  
  content.innerHTML = html;
}

function renderRewardsPage() {
  const user = getUserData();
  const totalClaimed = user.rewards.filter(r => r.claimed).reduce((sum, r) => sum + r.amount, 0);
  const totalAvailable = user.rewards.filter(r => !r.claimed).reduce((sum, r) => sum + r.amount, 0);
  
  const html = `
    <div style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Rewards</h1>
      <p class="text-muted">Complete tasks and earn rewards</p>
    </div>
    
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-label">Total Claimed</div>
        <div class="stat-value" style="color: hsl(var(--chart-2));">$${totalClaimed.toFixed(2)}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Available Rewards</div>
        <div class="stat-value">$${totalAvailable.toFixed(2)}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Total Value</div>
        <div class="stat-value">$${(totalClaimed + totalAvailable).toFixed(2)}</div>
      </div>
    </div>
    
    <div style="display: grid; gap: 1rem;">
      ${user.rewards.map((reward, index) => `
        <div class="reward-card ${reward.claimed ? 'claimed' : ''}">
          <div class="reward-icon">
            ${getRewardIcon(reward.id)}
          </div>
          <div class="reward-info">
            <h3>${reward.title}</h3>
            <p>${reward.description}</p>
          </div>
          <div style="text-align: right;">
            <div class="reward-amount">$${reward.amount.toFixed(2)}</div>
            ${reward.claimed 
              ? '<span class="badge">Claimed</span>' 
              : `<button class="btn btn-primary" style="margin-top: 0.5rem; padding: 0.375rem 0.75rem; font-size: 0.75rem;" onclick="handleClaimReward('${reward.id}', '${reward.title}', ${reward.amount})">Claim</button>`
            }
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  content.innerHTML = html;
}

function getRewardIcon(type) {
  const icons = {
    'welcome': '<path d="M20 12v10H4V12"></path><path d="M2 7h20v5H2z"></path><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>',
    'first-deposit': '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
    'first-trade': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>',
    'weekly-trader': '<circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>',
    'copy-trading': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icons[type] || icons['welcome']}</svg>`;
}

// ==================== HELPER FUNCTIONS ====================

function copyReferralCode() {
  const input = document.getElementById('referralCodeInput');
  input.select();
  document.execCommand('copy');
  apiLog('REFERRAL_CODE_COPIED', { code: input.value });
  Swal.fire({ icon: 'success', title: 'Copied!', text: 'Referral code copied to clipboard!', timer: 2000, showConfirmButton: false });
}

function handleClaimReward(rewardId, title, amount) {
  if (claimReward(rewardId)) {
    Swal.fire({ 
      icon: 'success', 
      title: 'Reward Claimed!', 
      html: `<strong>${title}</strong><br>$${amount.toFixed(2)}<br><br>Your new balance has been updated!`,
      confirmButtonText: 'OK' 
    }).then(() => {
      renderRewardsPage();
    });
  } else {
    Swal.fire({ icon: 'error', title: 'Unable to Claim', text: 'This reward may have already been claimed.', confirmButtonText: 'OK' });
  }
}

async function handleEditProfile() {
  // Fetch user info from localStorage/server
  const storedUser = localStorage.getItem('userData');
  if (!storedUser) return alert('No user data found');

  const userFromLS = JSON.parse(storedUser);

  let userInfo;
  try {
    const response = await $.ajax({
      type: "GET",
      url: `https://vantage-render.onrender.com/users/${userFromLS.email}`,
      dataType: "json",
      timeout: 30000
    });
    userInfo = response.data;
    localStorage.setItem("userData", JSON.stringify(userInfo));
  } catch (err) {
    console.error('Error fetching user info:', err);
    return alert('Failed to fetch profile info.');
  }

  // SweetAlert form
  const { value: formValues } = await Swal.fire({
    title: 'Edit Profile',
    html: `
      <input id="swalFirstName" class="swal2-input" placeholder="First Name" value="${userInfo.firstName}">
      <input id="swalLastName" class="swal2-input" placeholder="Last Name" value="${userInfo.lastName}">
      <input id="swalEmail" class="swal2-input" placeholder="Email" value="${userInfo.email}">
      <input id="swalMobile" class="swal2-input" placeholder="Mobile" value="${userInfo.mobile}">
      <input id="swalCountry" class="swal2-input" placeholder="Country" value="${userInfo.country}">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Save Changes',
    preConfirm: () => {
      return {
        firstName: document.getElementById('swalFirstName').value.trim(),
        lastName: document.getElementById('swalLastName').value.trim(),
        email: document.getElementById('swalEmail').value.trim(),
        mobile: document.getElementById('swalMobile').value.trim(),
        country: document.getElementById('swalCountry').value.trim(),
      }
    }
  });

  if (!formValues) return; // User canceled

  // Validate inputs
  const { firstName, lastName, email, mobile, country } = formValues;
  if (!firstName || !lastName || !email) return Swal.fire('Error', 'First Name, Last Name, and Email are required', 'error');

  // Update profile via AJAX
  try {
    const updateResponse = await $.ajax({
      type: "PUT",
      url: `https://vantage-render.onrender.com/users/${userInfo._id}/profile/update`,
      dataType: "json",
      data: { firstName, lastName, email, mobile, country },
      timeout: 30000
    });

    // Update localStorage
    localStorage.setItem("userData", JSON.stringify({ ...userInfo, firstName, lastName, email, mobile, country }));

    Swal.fire('Success', 'Profile successfully updated', 'success');

    // Optionally refresh profile page
    renderProfilePage();

  } catch (err) {
    console.error('Error updating profile:', err);
    Swal.fire('Error', 'Failed to update profile', 'error');
  }
}


// ==========================
// 🔹 KYC HANDLER (All Pure JS)
// ==========================

// ==================== MODALS ====================

function openTradeModal(symbol, type, price) {
  const modal = document.getElementById('tradeModal');
  document.getElementById('tradeModalTitle').textContent = `${type} ${symbol}`;
  document.getElementById('tradeModalPrice').textContent = price;
  modal.classList.add('active');
  
  const tradeData = { symbol, type, price };
  document.getElementById('placeTrade').onclick = () => {
    const amount = parseFloat(document.getElementById('tradeAmount').value);
    if (amount) {
      addTransaction({
        type: 'trade',
        symbol: symbol,
        tradeType: type,
        amount: amount,
        price: price,
        status: 'active'
      });
      
      Swal.fire({ 
        icon: 'success', 
        title: 'Order Placed!', 
        html: `<strong>${type} ${symbol}</strong><br>Amount: $${amount.toFixed(2)}<br>Price: ${price}`,
        confirmButtonText: 'OK' 
      });
      modal.classList.remove('active');
      document.getElementById('tradeAmount').value = '';
    }
  };
}

function openCopyTradeModal(btn) {
  // Convert button dataset into a trader object
  const trader = {
    name: btn.dataset.name,
    level: btn.dataset.level,
    rating: btn.dataset.rating,
    trades: JSON.parse(btn.dataset.trades || "[]"),
    commission: btn.dataset.commission,
    pnl: btn.dataset.pnl,
     photo: btn.dataset.photo,
    profileId: btn.dataset.profileid,
    accountLevel: btn.dataset.accountlevel,
    type: btn.dataset.type,
    history: JSON.parse(btn.dataset.history || "[]"),
    followers: btn.dataset.followers,
    watchers: btn.dataset.watchers,
    profitableTrade: btn.dataset.profitabletrade
  };

  // For debugging
  console.log("Trader info:", trader);

  const modal = document.getElementById('copyTradeModal');
  const profile = document.getElementById('copyTraderProfile');

  profile.innerHTML = `
    <div class="trader-avatar" style="background-color: hsl(var(--primary) / 0.2); display: flex; align-items: center; justify-content: center; font-weight: 600; color:#0fef9e; border: 2px solid#0fef9e;">
       <img src=${trader.photo} style="width:50px; height:50px; border-radius:50%;"/>
         
    </div>
    <div style="flex: 1;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <div>
          <h3 style="font-weight: 600; margin-bottom: 0.25rem;">${trader.name}</h3>
          <span class="badge">${trader.level}</span>
        </div>
        <div style="text-align: right;">
          <div class="stat-label">Status</div>
          <div style="display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem;">
            <div style="width: 0.5rem; height: 0.5rem; border-radius: 50%; background-color: hsl(var(--chart-2));"></div>
            <span>online</span>
          </div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.875rem; margin-top: 1rem;">
        <div>
          <div class="stat-label">Profile ID</div>
          <div class="stat-value">${trader.profileId}</div>
        </div>
        <div>
          <div class="stat-label">Account Level</div>
          <div class="stat-value">${trader.accountLevel}</div>
        </div>
        <div>
          <div class="stat-label">Followers</div>
          <div class="stat-value">${trader.followers}</div>
        </div>
        <div>
          <div class="stat-label">Watchers</div>
          <div class="stat-value">${trader.watchers}</div>
        </div>
        <div style="grid-column: 1 / -1;">
          <div class="stat-label">Profitable Trade %</div>
          <div class="stat-value">${trader.profitableTrade}</div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');

  // Copy Trade start button logic
 // Copy Trade start button logic
document.getElementById("startCopyTrade").onclick = async () => {
  const amount = parseFloat(document.getElementById("copyAmount").value);
  const duration = parseInt(document.getElementById("copyDuration").value);

  if (!amount || !duration) {
    Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: "Please enter both amount and duration.",
    });
    return;
  }

  const user = getUserData(); // from local storage/session
  const traderName = trader.name; // variable passed from openCopyTradeModal()

  // Check if user has enough balance
  if (user.balance < amount) {
    Swal.fire({
      icon: "error",
      title: "Insufficient Balance",
      text: `You only have ${user.balance} available, which is not enough for this trade.`,
    });
    return;
  }


  try {
    const res = await fetch("https://vantage-render.onrender.com/transactions/copy-trade/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        traderName,
        amount,
        duration,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Copy Trade Started!",
        html: `
          <strong>Trader:</strong> ${traderName}<br>
          <strong>Amount:</strong> $${amount.toFixed(2)}<br>
          <strong>Duration:</strong> ${duration} days
        `,
      });

      // Update user locally
      user.copyTradingActive = user.copyTradingActive || [];
      user.copyTradingActive.push(data.data);
      updateUserData(user);

      // Close modal and reset
      document.getElementById("copyTradeModal").classList.remove("active");
      document.getElementById("copyAmount").value = "";
      document.getElementById("copyDuration").value = "";
var userCopyTrades=user.copyTradingActive
      renderCopyTradingHistory(userCopyTrades)
    } else {
      Swal.fire({ icon: "error", title: "Failed", text: data.error });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Server Error",
      text: "Something went wrong. Try again later.",
    });
  }
};

}
function renderCopyTradingHistory(userCopyTrades) {
  // Get container or create one
 let container = document.getElementById("content");
container.innerHTML = ""; // clears previous content
// append table inside container

  if (!container) {
    container = document.createElement("div");
    container.id = "copyTradeHistoryContainer";
    container.style.width = "100%";
    container.style.marginTop = "2rem";
    document.body.appendChild(container);
  }

  // Clear previous content
  container.innerHTML = "";

  // Title
  const title = document.createElement("h2");
  title.textContent = "Copy Trading History";
  title.style.fontSize = "1.75rem";
  title.style.fontWeight = "700";
  title.style.marginBottom = "1rem";
  title.style.color = "hsl(var(--foreground))";
  container.appendChild(title);

  // Table container
  const tableContainer = document.createElement("div");
  tableContainer.style.overflowX = "auto";
  container.appendChild(tableContainer);

  // Table
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.minWidth = "600px";

  // Header
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const headers = ["Trader", "Amount", "Duration", "Start Date", "Status", "Action"];
  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    th.style.padding = "12px 8px";
    th.style.textAlign = "left";
    th.style.borderBottom = "1px solid hsl(var(--border))";
    th.style.color = "hsl(var(--muted-foreground))";
    th.style.backgroundColor = "hsl(var(--card))";
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement("tbody");

  userCopyTrades.forEach(trade => {
    const tr = document.createElement("tr");

    // Trader
    const tdTrader = document.createElement("td");
    tdTrader.textContent = trade.trader ?? "Unknown";
    tdTrader.style.padding = "10px 8px";
    tdTrader.style.color = "hsl(var(--foreground))";
    tr.appendChild(tdTrader);

    // Amount
    const tdAmount = document.createElement("td");
    tdAmount.textContent = trade.amount ?? "-";
    tdAmount.style.padding = "10px 8px";
    tdAmount.style.color = "hsl(var(--accent))";
    tr.appendChild(tdAmount);

    // Duration
    const tdDuration = document.createElement("td");
    tdDuration.textContent = trade.duration ? `${trade.duration} days` : "-";
    tdDuration.style.padding = "10px 8px";
    tdDuration.style.color = "hsl(var(--foreground))";
    tr.appendChild(tdDuration);

    // Start Date
    const tdDate = document.createElement("td");
    tdDate.textContent = trade.startDate ? new Date(trade.startDate).toLocaleString() : "-";
    tdDate.style.padding = "10px 8px";
    tdDate.style.color = "hsl(var(--muted-foreground))";
    tr.appendChild(tdDate);

    // Status
    const tdStatus = document.createElement("td");
    tdStatus.textContent = trade.status ?? "-";
    tdStatus.style.padding = "10px 8px";
    tdStatus.style.fontWeight = "600";
    tdStatus.style.color = trade.status === "ACTIVE" ? "hsl(var(--primary))" : "hsl(var(--destructive))";
    tr.appendChild(tdStatus);

    // Action
    // const tdAction = document.createElement("td");
    // const btn = document.createElement("button");
    // btn.textContent = "View";
    // btn.style.padding = "6px 12px";
    // btn.style.border = "none";
    // btn.style.borderRadius = "6px";
    // btn.style.cursor = "pointer";
    // btn.style.backgroundColor = "hsl(var(--primary))";
    // btn.style.color = "hsl(var(--primary-foreground))";
    // btn.onmouseover = () => btn.style.backgroundColor = "hsl(var(--primary-hover))";
    // btn.onmouseout = () => btn.style.backgroundColor = "hsl(var(--primary))";
    // tdAction.appendChild(btn);
    // tr.appendChild(tdAction);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableContainer.appendChild(table);
}


// ==================== INITIALIZATION ====================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    localStorage.removeItem('investmentPlans');
  // One-time cleanup: drop the old demo holdings seed if it was never converted,
  // so coins don't show a balance before any deposit/conversion.
  try {
    if (localStorage.getItem('fxHoldings') === JSON.stringify({ BTC: 0.0542, ETH: 1.25, USDT: 1500, LTC: 8.4, SOL: 12 })) {
      localStorage.removeItem('fxHoldings');
    }
  } catch (e) {}
  if (!initUserData()) return;
  initTheme();
  updateSidebarUserInfo();
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.addEventListener('click', (e) => { e.preventDefault(); fxGo(item.dataset.page); });
  });
  loadPage('dashboard');

  // Pull the admin-managed plan catalogs from the server for this session.
  fxLoadPlans();
  fxLoadInvestmentPlans();

  // Live prices: load once, then refresh so holdings fluctuate with the market.
  fxLoadPrices().then(ok => { if (ok) fxRefreshPricesUI(); });
  setInterval(() => { fxLoadPrices().then(ok => { if (ok) fxRefreshPricesUI(); }); }, 60000);
});

// Update sidebar with user info
function updateSidebarUserInfo() {
  const user = getUserData();
  const displayName = `${user.firstName}${user.lastName}`;
  const initials = (user.firstName[0] + user.lastName[0]).toUpperCase();
  
  // Update username in sidebar if element exists
  const usernameEl = document.getElementById('sidebarUsername');
  if (usernameEl) usernameEl.textContent = displayName;
  
  // Update avatar if element exists
  const avatarEl = document.getElementById('sidebarAvatar');
  if (avatarEl) avatarEl.textContent = initials;
  
  // Update balance if element exists
  const balanceEl = document.getElementById('sidebarBalance');
  if (balanceEl) balanceEl.textContent = `$${user.balance.toFixed(2)}`;
}