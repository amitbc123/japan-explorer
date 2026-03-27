import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, collection, addDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDPeDrMQ9aPzwTO4wcdSAhpEmVBWIkhMxE",
  authDomain: "japan-explorer-22f18.firebaseapp.com",
  projectId: "japan-explorer-22f18",
  storageBucket: "japan-explorer-22f18.firebasestorage.app",
  messagingSenderId: "53809221413",
  appId: "1:53809221413:web:d7c3e75822bdaf7edc94cc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const people = ['Amit', 'Moshe', 'Omri'];

// ── Sidebar ──
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
document.getElementById('menuToggle').addEventListener('click', () => {
  sidebar.classList.add('active');
  sidebarOverlay.classList.add('active');
});
sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('active');
  sidebarOverlay.classList.remove('active');
});

let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; });
document.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].screenX;
  if (diff > 100) { sidebar.classList.add('active'); sidebarOverlay.classList.add('active'); }
  if (sidebar.classList.contains('active') && diff < -80) { sidebar.classList.remove('active'); sidebarOverlay.classList.remove('active'); }
});

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelector(`.nav-item[data-page="${name}"]`).classList.add('active');
  sidebar.classList.remove('active');
  sidebarOverlay.classList.remove('active');
  window.scrollTo(0, 0);
}
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => showPage(btn.dataset.page));
});

// ── Countdown ──
const targetDate = new Date('2026-10-06T16:45:00Z').getTime();
function updateCountdown() {
  const diff = targetDate - Date.now();
  const container = document.getElementById('countdownContainer');
  if (diff <= 0) {
    container.innerHTML = '<h2 style="font-size:2rem;color:#feca57;direction:ltr;">🎉 We are in Japan! 🎉</h2>';
    return;
  }
  document.getElementById('days').textContent = Math.floor(diff / 86400000).toString().padStart(3, '0');
  document.getElementById('hours').textContent = Math.floor((diff % 86400000) / 3600000).toString().padStart(2, '0');
  document.getElementById('minutes').textContent = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
  document.getElementById('seconds').textContent = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ── Currency ──
let jpyPerIls = 40.5;
let swapped = false;

document.getElementById('currencyToggleBtn').addEventListener('click', () => {
  document.getElementById('currencyCard').classList.toggle('hidden');
});

async function fetchRate() {
  try {
    const r = await fetch('https://api.exchangerate-api.com/v4/latest/ILS');
    const d = await r.json();
    jpyPerIls = d.rates.JPY;
    document.getElementById('rateInfo').textContent = `1 ₪ = ${jpyPerIls.toFixed(2)} ¥`;
  } catch {
    document.getElementById('rateInfo').textContent = `1 ₪ ≈ ${jpyPerIls} ¥ (offline)`;
  }
}
fetchRate();

document.getElementById('shekel').addEventListener('input', e => {
  if (swapped) return;
  const v = parseFloat(e.target.value);
  document.getElementById('yen').value = isNaN(v) ? '' : Math.round(v * jpyPerIls);
});
document.getElementById('yen').addEventListener('input', e => {
  if (!swapped) return;
  const v = parseFloat(e.target.value);
  document.getElementById('shekel').value = isNaN(v) ? '' : (v / jpyPerIls).toFixed(2);
});
document.getElementById('swapBtn').addEventListener('click', () => {
  swapped = !swapped;
  document.getElementById('shekel').value = '';
  document.getElementById('yen').value = '';
});

// ── Location Modal ──
function openDebtModal(title, linesHtml) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-notes').innerHTML = linesHtml;
  document.getElementById('modalSearchInput').style.display = 'none';
  document.getElementById('modalSearchResults').style.display = 'none';
  document.getElementById('modalMapsBtn').style.display = 'none';
  document.getElementById('location-modal').classList.remove('hidden');
}

function openLocationModal(name, address, notes) {
  document.getElementById('modalSearchInput').style.display = '';
  document.getElementById('modalSearchResults').style.display = '';
  document.getElementById('modalMapsBtn').style.display = '';
  document.getElementById('modal-title').textContent = name;
  document.getElementById('modal-notes').textContent = notes || '';
  document.getElementById('modalSearchInput').value = address || name;
  document.getElementById('modalSearchResults').innerHTML = '';
  document.getElementById('modalMapsBtn').href = `https://www.google.com/maps/search/${encodeURIComponent((name||'')+(address?' '+address:'')+' Japan')}`;
  document.getElementById('location-modal').classList.remove('hidden');
}

document.getElementById('closeModal').addEventListener('click', () => document.getElementById('location-modal').classList.add('hidden'));
document.getElementById('location-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('location-modal')) document.getElementById('location-modal').classList.add('hidden');
});

let searchTimeout;
document.getElementById('modalSearchInput').addEventListener('input', e => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const query = e.target.value;
    if (!query) return;
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query+' Japan')}&format=json&limit=5&accept-language=en`);
    const data = await res.json();
    const results = document.getElementById('modalSearchResults');
    results.innerHTML = '';
    data.forEach(item => {
      const div = document.createElement('div');
      div.className = 'search-result-item';
      div.textContent = item.display_name;
      div.addEventListener('click', () => {
        document.getElementById('modalMapsBtn').href = `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lon}`;
        document.getElementById('modalSearchInput').value = item.display_name;
        results.innerHTML = '';
      });
      results.appendChild(div);
    });
  }, 500);
});

// ── Expenses ──
let selectedPayer = 'Amit';
let selectedSplit = ['Amit', 'Moshe', 'Omri'];

document.querySelectorAll('.payer-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.payer-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPayer = btn.dataset.payer;
  });
});

function updateCustomSplitInputs() {
  const amount = parseFloat(document.getElementById('expAmount').value) || 0;
  const equalShare = selectedSplit.length > 0 ? (amount / selectedSplit.length) : 0;
  people.forEach(person => {
    const input = document.getElementById('split' + person);
    const item = document.getElementById('customItem' + person);
    if (selectedSplit.includes(person)) {
      item.style.opacity = '1';
      input.disabled = false;
      if (!input.value) input.placeholder = equalShare > 0 ? equalShare.toFixed(0) : 'Auto';
    } else {
      item.style.opacity = '0.3';
      input.disabled = true;
      input.value = '';
      input.placeholder = '-';
    }
  });
  validateCustomSplit();
}

function validateCustomSplit() {
  const amount = parseFloat(document.getElementById('expAmount').value) || 0;
  const validation = document.getElementById('splitValidation');
  if (amount === 0) { validation.textContent = ''; return true; }
  const amitVal = parseFloat(document.getElementById('splitAmit').value);
  const mosheVal = parseFloat(document.getElementById('splitMoshe').value);
  const omriVal = parseFloat(document.getElementById('splitOmri').value);
  const hasAny = !isNaN(amitVal) || !isNaN(mosheVal) || !isNaN(omriVal);
  if (!hasAny) { validation.textContent = ''; return true; }
  let total = 0;
  people.forEach(p => {
    if (selectedSplit.includes(p)) {
      const v = parseFloat(document.getElementById('split'+p).value);
      if (!isNaN(v)) total += v;
    }
  });
  if (total > amount) {
    validation.textContent = `⚠️ Total (${total.toFixed(0)}) exceeds amount (${amount.toFixed(0)})`;
    validation.style.color = '#e94560';
    people.forEach(p => {
      if (selectedSplit.includes(p)) {
        const input = document.getElementById('split'+p);
        const v = parseFloat(input.value);
        if (!isNaN(v) && v > amount) input.value = amount;
      }
    });
    return false;
  }
  if (Math.abs(total - amount) < 0.5) {
    validation.textContent = `✅ Split OK (${total.toFixed(0)})`;
    validation.style.color = '#52b788';
  } else {
    validation.textContent = `Remaining: ${(amount - total).toFixed(0)}`;
    validation.style.color = '#feca57';
  }
  return true;
}

document.getElementById('expAmount').addEventListener('input', updateCustomSplitInputs);

people.forEach(p => {
  const input = document.getElementById('split'+p);
  input.addEventListener('input', () => {
    const amount = parseFloat(document.getElementById('expAmount').value) || 0;
    const v = parseFloat(input.value);
    if (!isNaN(v) && v > amount) input.value = amount;
    validateCustomSplit();
  });
});

document.querySelectorAll('.split-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    selectedSplit = Array.from(document.querySelectorAll('.split-btn.active')).map(b => b.dataset.person);
    updateCustomSplitInputs();
  });
});

async function loadExpenses() {
  const snapshot = await getDocs(collection(db, 'expenses'));
  const expenses = [];
  snapshot.forEach(d => expenses.push({ id: d.id, ...d.data() }));
  expenses.sort((a, b) => b.timestamp - a.timestamp);
  renderExpenses(expenses);
  renderBalance(expenses);
}

function renderExpenses(expenses) {
  const list = document.getElementById('expensesList');
  if (expenses.length === 0) {
    list.innerHTML = '<div style="color:rgba(255,255,255,.4);text-align:center;padding:15px;">No expenses yet</div>';
    return;
  }
  list.innerHTML = expenses.map((e, idx) => `
    <div class="expense-item" data-exp-index="${idx}" style="cursor:pointer;">
      <div class="expense-item-top">
        <div class="expense-desc">${e.desc}</div>
        <div style="display:flex;gap:8px;align-items:center;">
          <div class="expense-amount">${e.currency === 'JPY' ? '¥' : '₪'}${Number(e.amount).toLocaleString()}</div>
          <button class="expense-delete" data-id="${e.id}">✕</button>
        </div>
      </div>
      <div class="expense-meta">Paid by: ${e.payer} · Split: ${e.split.join(', ')}</div>
    </div>`).join('');

  expenses.forEach((e, idx) => {
    const item = document.querySelector(`[data-exp-index="${idx}"]`);
    item.addEventListener('click', (ev) => {
      if (ev.target.classList.contains('expense-delete') || ev.target.closest('.expense-delete')) return;
      let amount = parseFloat(e.amount);
      const toILS = e.currency === 'JPY' ? (v => v / jpyPerIls) : (v => v);
      const toJPY = e.currency === 'JPY' ? (v => v) : (v => v * jpyPerIls);
      const lines = people.map(person => {
        let share = 0;
        if (e.customSplit && e.customSplit[person] !== undefined) {
          share = parseFloat(e.customSplit[person]) || 0;
        } else if (e.split.includes(person)) {
          share = amount / e.split.length;
        }
        if (share === 0 && person !== e.payer) return '';
        const paidLabel = person === e.payer ? ' (paid)' : '';
        return `<div class="debt-detail-row">
          <span>${person}${paidLabel}</span>
          <span>₪${toILS(share).toFixed(2)} / ¥${Math.round(toJPY(share)).toLocaleString()}</span>
        </div>`;
      }).filter(Boolean).join('');
      openDebtModal(e.desc, lines);
    });
  });

  document.querySelectorAll('.expense-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      await deleteDoc(doc(db, 'expenses', btn.dataset.id));
      loadExpenses();
    });
  });
}

function renderBalance(expenses) {
  const balances = { Amit: 0, Moshe: 0, Omri: 0 };
  expenses.forEach(e => {
    let amount = parseFloat(e.amount);
    if (e.currency === 'JPY') amount = amount / jpyPerIls;
    balances[e.payer] += amount;
    if (e.customSplit) {
      Object.entries(e.customSplit).forEach(([person, share]) => {
        if (balances[person] !== undefined) balances[person] -= parseFloat(share) / (e.currency === 'JPY' ? jpyPerIls : 1);
      });
    } else {
      const share = amount / e.split.length;
      e.split.forEach(p => { balances[p] -= share; });
    }
  });

  const debts = [];
  const bal = { ...balances };
  for (let i = 0; i < 10; i++) {
    const maxCreditor = people.reduce((a, b) => bal[a] > bal[b] ? a : b);
    const maxDebtor = people.reduce((a, b) => bal[a] < bal[b] ? a : b);
    if (Math.abs(bal[maxCreditor]) < 0.5 || Math.abs(bal[maxDebtor]) < 0.5) break;
    const amount = Math.min(bal[maxCreditor], -bal[maxDebtor]);
    if (amount < 0.5) break;
    debts.push({ from: maxDebtor, to: maxCreditor, amountILS: amount, expenses });
    bal[maxCreditor] -= amount;
    bal[maxDebtor] += amount;
  }

  const summary = document.getElementById('balanceSummary');
  if (debts.length === 0) {
    summary.innerHTML = '<div class="balance-ok">✅ All settled up!</div>';
    return;
  }
  summary.innerHTML = debts.map((d, idx) => `
    <div class="balance-item" data-debt-index="${idx}" style="cursor:pointer;">
      <div class="balance-text">💸 ${d.from} owes ${d.to}</div>
      <div class="balance-amounts">
        <span class="balance-amount">₪${d.amountILS.toFixed(2)}</span>
        <span class="balance-amount-jpy">¥${Math.round(d.amountILS * jpyPerIls).toLocaleString()}</span>
      </div>
    </div>`).join('');

  debts.forEach((d, idx) => {
    document.querySelector(`[data-debt-index="${idx}"]`).addEventListener('click', () => {
      const relevant = expenses.filter(e => e.payer === d.to && e.split.includes(d.from));
      if (relevant.length === 0) return;
      const lines = relevant.map(e => {
        let share;
        if (e.customSplit && e.customSplit[d.from]) {
          share = parseFloat(e.customSplit[d.from]);
          if (e.currency === 'JPY') share = share / jpyPerIls;
        } else {
          let amount = parseFloat(e.amount);
          if (e.currency === 'JPY') amount = amount / jpyPerIls;
          share = amount / e.split.length;
        }
        return `<div class="debt-detail-row">
          <span>${e.desc}</span>
          <span>₪${share.toFixed(2)} / ¥${Math.round(share * jpyPerIls).toLocaleString()}</span>
        </div>`;
      }).join('');
      openDebtModal(`${d.from} owes ${d.to}`, lines);
    });
  });
}

document.getElementById('addExpenseBtn').addEventListener('click', async () => {
  const desc = document.getElementById('expDesc').value.trim();
  const amount = parseFloat(document.getElementById('expAmount').value);
  const currency = document.getElementById('expCurrency').value;
  if (!desc || isNaN(amount) || amount <= 0) {
    alert('Please enter a description and amount.');
    return;
  }
  if (selectedSplit.length === 0) {
    alert('Please select at least one person to split with.');
    return;
  }
  const amitVal = parseFloat(document.getElementById('splitAmit').value);
  const mosheVal = parseFloat(document.getElementById('splitMoshe').value);
  const omriVal = parseFloat(document.getElementById('splitOmri').value);
  const hasCustom = !isNaN(amitVal) || !isNaN(mosheVal) || !isNaN(omriVal);
  let customSplit = null;
  if (hasCustom) {
    const equalShare = amount / selectedSplit.length;
    customSplit = {
      Amit: selectedSplit.includes('Amit') ? (!isNaN(amitVal) ? amitVal : equalShare) : 0,
      Moshe: selectedSplit.includes('Moshe') ? (!isNaN(mosheVal) ? mosheVal : equalShare) : 0,
      Omri: selectedSplit.includes('Omri') ? (!isNaN(omriVal) ? omriVal : equalShare) : 0,
    };
  }
  await addDoc(collection(db, 'expenses'), {
    desc, amount, currency,
    payer: selectedPayer,
    split: selectedSplit,
    customSplit: customSplit,
    timestamp: Date.now()
  });
  document.getElementById('expDesc').value = '';
  document.getElementById('expAmount').value = '';
  document.getElementById('splitAmit').value = '';
  document.getElementById('splitMoshe').value = '';
  document.getElementById('splitOmri').value = '';
  document.getElementById('splitValidation').textContent = '';
  updateCustomSplitInputs();
  loadExpenses();
});

// ── Dictionary ──
document.querySelectorAll('.dict-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.dict-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.dict-section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('dict-' + btn.dataset.dict).classList.add('active');
  });
});

const dictSearchInput = document.getElementById('dictSearch');
const searchResultsDiv = document.getElementById('searchResults');
dictSearchInput.addEventListener('input', e => {
  const query = e.target.value.trim();
  if (!query) { searchResultsDiv.innerHTML = ''; return; }
  const results = [];
  document.querySelectorAll('.phrase-card').forEach(card => {
    const heb = card.querySelector('.phrase-hebrew')?.textContent || '';
    if (heb.includes(query)) results.push(card.cloneNode(true));
  });
  searchResultsDiv.innerHTML = results.length === 0
    ? '<div style="color:rgba(255,255,255,.5);padding:10px;text-align:center;">לא נמצאו תוצאות</div>'
    : '';
  results.forEach(r => searchResultsDiv.appendChild(r));
  addSpeakButtons();
});

function addSpeakButtons() {
  document.querySelectorAll('.phrase-card').forEach(card => {
    const japanese = card.querySelector('.phrase-pronunciation');
    if (japanese && !card.querySelector('.phrase-speak')) {
      const btn = document.createElement('button');
      btn.className = 'phrase-speak';
      btn.type = 'button';
      btn.textContent = '🔊';
      btn.setAttribute('data-text', japanese.textContent);
      card.appendChild(btn);
    }
  });
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('phrase-speak')) {
    const text = e.target.getAttribute('data-text');
    if (text && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP'; u.rate = 0.8;
      const voices = window.speechSynthesis.getVoices();
      const jpVoice = voices.find(v => v.lang.includes('ja'));
      if (jpVoice) u.voice = jpVoice;
      window.speechSynthesis.speak(u);
    }
  }
});
if ('speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

// ── Wheel ──
const wheelCanvas = document.getElementById('wheelCanvas');
const wheelCtx = wheelCanvas ? wheelCanvas.getContext('2d') : null;
let wheelOptions = [];
let wheelRotation = 0;
let wheelSpinning = false;
let selectedCity = '';
let selectedType = 'food';
const wheelColors = ['#e94560','#0f3460','#533483','#16213e','#2b9348','#e94560','#0f3460','#533483'];

function drawWheel() {
  if (!wheelCtx || wheelOptions.length === 0) return;
  const cx = wheelCanvas.width/2, cy = wheelCanvas.height/2, r = 150;
  const slice = (Math.PI*2)/wheelOptions.length;
  wheelCtx.clearRect(0,0,wheelCanvas.width,wheelCanvas.height);
  wheelCtx.save(); wheelCtx.translate(cx,cy); wheelCtx.rotate(wheelRotation);
  wheelOptions.forEach((opt,i) => {
    const start = i*slice, end = start+slice;
    wheelCtx.beginPath(); wheelCtx.arc(0,0,r,start,end); wheelCtx.lineTo(0,0);
    wheelCtx.fillStyle = wheelColors[i%wheelColors.length]; wheelCtx.fill();
    wheelCtx.strokeStyle='#fff'; wheelCtx.lineWidth=2; wheelCtx.stroke();
    wheelCtx.save(); wheelCtx.rotate(start+slice/2); wheelCtx.textAlign='center';
    wheelCtx.fillStyle='#fff'; wheelCtx.font='bold 13px Arial';
    wheelCtx.fillText(opt.name.substring(0,14), r*0.65, 0); wheelCtx.restore();
  });
  wheelCtx.restore();
  wheelCtx.beginPath(); wheelCtx.arc(cx,cy,15,0,Math.PI*2);
  wheelCtx.fillStyle='#fff'; wheelCtx.fill();
  wheelCtx.strokeStyle='#e94560'; wheelCtx.lineWidth=3; wheelCtx.stroke();
}

function getDefaultPlaces(city, type) {
  if (type === 'food') return [
    {name:'Ichiran Ramen',category:'Ramen',address:'Shibuya',icon:'🍜',description:'Famous ramen chain'},
    {name:'Sukiyabashi Jiro',category:'Sushi',address:'Ginza',icon:'🍣',description:'World-class sushi'},
    {name:'Tsukiji Market',category:'Market',address:'Tsukiji',icon:'🐟',description:'Fresh fish market'},
    {name:'Afuri Ramen',category:'Ramen',address:'Harajuku',icon:'🍜',description:'Yuzu ramen'},
    {name:'Gonpachi',category:'Izakaya',address:'Nishi-Azabu',icon:'🏮',description:'Famous izakaya'},
    {name:'Kura Sushi',category:'Sushi',address:'Various',icon:'🍣',description:'Conveyor belt sushi'},
  ];
  return [
    {name:'Senso-ji Temple',category:'Temple',address:'Asakusa',icon:'⛩️',description:'Oldest temple in Tokyo'},
    {name:'Shibuya Crossing',category:'Landmark',address:'Shibuya',icon:'🗼',description:'Famous crossing'},
    {name:'Tokyo Skytree',category:'Landmark',address:'Sumida',icon:'🗼',description:'Tallest tower in Japan'},
    {name:'Meiji Shrine',category:'Shrine',address:'Harajuku',icon:'⛩️',description:'Peaceful shrine'},
    {name:'Akihabara',category:'Shopping',address:'Akihabara',icon:'🛍️',description:'Electronics & anime'},
    {name:'teamLab Borderless',category:'Museum',address:'Odaiba',icon:'🎨',description:'Digital art museum'},
  ];
}

async function fetchPlaces(city, type) {
  try {
    const categories = type === 'food'
      ? ['restaurant','cafe','ramen','sushi','izakaya']
      : ['attraction','museum','park','shopping','landmark'];
    const places = [];
    for (const cat of categories) {
      const url = `https://api.foursquare.com/v3/places/search?near=${city},Japan&query=${cat}&limit=1`;
      const res = await fetch(url, { headers: { 'Authorization': 'fsq3...', 'Accept': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (data.results?.length > 0) {
          const p = data.results[0];
          places.push({ name: p.name, category: p.categories?.[0]?.name || cat, address: p.location?.formatted_address || '', icon: '📍', description: '' });
        }
      }
    }
    return places.length > 0 ? places : getDefaultPlaces(city, type);
  } catch { return getDefaultPlaces(city, type); }
}

function spinWheel() {
  if (wheelSpinning || wheelOptions.length === 0) return;
  wheelSpinning = true;
  const spinBtn = document.getElementById('wheelSpinBtn');
  spinBtn.disabled = true;
  document.getElementById('wheelResult').classList.add('hidden');
  const total = (5 + Math.random()*3) * Math.PI * 2 + Math.random() * Math.PI * 2;
  const duration = 4000, start = Date.now(), startRot = wheelRotation;
  function animate() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed/duration, 1);
    const ease = 1 - Math.pow(1-progress, 3);
    wheelRotation = startRot + total * ease;
    drawWheel();
    if (progress < 1) { requestAnimationFrame(animate); }
    else {
      wheelSpinning = false; spinBtn.disabled = false;
      const slice = (Math.PI*2)/wheelOptions.length;
      const norm = ((wheelRotation % (Math.PI*2)) + Math.PI*2) % (Math.PI*2);
      let idx = Math.floor(((Math.PI*1.5 - norm + Math.PI*2) % (Math.PI*2)) / slice);
      if (idx < 0 || idx >= wheelOptions.length) idx = 0;
      const selected = wheelOptions[idx];
      document.getElementById('wheelResultIcon').textContent = selected.icon;
      document.getElementById('wheelResultTitle').textContent = selected.name;
      document.getElementById('wheelResultType').textContent = selected.category;
      document.getElementById('wheelResultAddress').textContent = selected.address;
      document.getElementById('wheelResult').classList.remove('hidden');
    }
  }
  animate();
}

document.getElementById('wheelSpinBtn').addEventListener('click', spinWheel);
document.getElementById('wheelCity').addEventListener('change', async e => {
  selectedCity = e.target.value;
  if (!selectedCity) return;
  const btn = document.getElementById('wheelSpinBtn');
  btn.disabled = true; btn.textContent = 'Loading... ⏳';
  wheelOptions = await fetchPlaces(selectedCity, selectedType);
  drawWheel();
  btn.disabled = false; btn.textContent = 'Spin! 🎰';
});
document.querySelectorAll('.wheel-type-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    document.querySelectorAll('.wheel-type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedType = btn.dataset.type;
    if (selectedCity) {
      const spinBtn = document.getElementById('wheelSpinBtn');
      spinBtn.disabled = true; spinBtn.textContent = 'Loading... ⏳';
      wheelOptions = await fetchPlaces(selectedCity, selectedType);
      drawWheel();
      spinBtn.disabled = false; spinBtn.textContent = 'Spin! 🎰';
    }
  });
});

// ── Game ──
const gameData = [
  { q: 'How do you say "Thank you" in Japanese?', options: ['Sumimasen','Arigatou gozaimasu','Hai','Iie'], answer: 1 },
  { q: 'What does "Sumimasen" mean?', options: ['Thank you','Yes','Excuse me','No'], answer: 2 },
  { q: 'How do you say "Where is the toilet?"', options: ['Toire wa doko desu ka','Ikura desu ka','Hai doko','Toire arigatou'], answer: 0 },
  { q: 'What does "Ikura desu ka" mean?', options: ['Where is it?','How much is it?','What is this?','Excuse me'], answer: 1 },
  { q: 'How do you say "Yes" in Japanese?', options: ['Iie','Sumimasen','Hai','Wakarimasen'], answer: 2 },
  { q: 'What does "Wakarimasen" mean?', options: ['I understand','I don\'t understand','Thank you','Excuse me'], answer: 1 },
  { q: 'How do you say "Salmon" in Japanese?', options: ['Maguro','Unagi','Saamon','Ebi'], answer: 2 },
  { q: 'What does "Eki wa doko desu ka" mean?', options: ['Where is the hotel?','Where is the station?','Where is the toilet?','How far is it?'], answer: 1 },
  { q: 'How do you say "Tuna" in Japanese?', options: ['Saamon','Ebi','Saba','Maguro'], answer: 3 },
  { q: 'What does "Arigatou gozaimasu" mean?', options: ['Excuse me','No problem','Thank you very much','Good morning'], answer: 2 },
];

let gameIndex = 0, gameScore = 0, gameAnswered = false;

function loadQuestion() {
  gameAnswered = false;
  const q = gameData[gameIndex % gameData.length];
  document.getElementById('gameQuestion').textContent = q.q;
  document.getElementById('gameFeedback').textContent = '';
  document.getElementById('nextQuestion').classList.add('hidden');
  const opts = document.getElementById('gameOptions');
  opts.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'game-option';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      if (gameAnswered) return;
      gameAnswered = true;
      if (i === q.answer) {
        btn.classList.add('correct');
        document.getElementById('gameFeedback').textContent = '✅ Correct!';
        gameScore++;
      } else {
        btn.classList.add('wrong');
        opts.querySelectorAll('.game-option')[q.answer].classList.add('correct');
        document.getElementById('gameFeedback').textContent = '❌ Wrong!';
      }
      document.getElementById('gameScore').textContent = `Score: ${gameScore} / ${gameIndex+1}`;
      document.getElementById('nextQuestion').classList.remove('hidden');
    });
    opts.appendChild(btn);
  });
  document.getElementById('gameScore').textContent = `Score: ${gameScore} / ${gameIndex}`;
}

document.getElementById('nextQuestion').addEventListener('click', () => { gameIndex++; loadQuestion(); });
loadQuestion();

// ── Init ──
loadExpenses();
addSpeakButtons();
updateCustomSplitInputs();
