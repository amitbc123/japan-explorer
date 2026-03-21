import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const targetDate = new Date('2026-10-06T19:45:00+03:00').getTime();
function updateCountdown() {
  const diff = targetDate - Date.now();
  const container = document.getElementById('countdownContainer');
  if (diff <= 0) {
    container.innerHTML = '<h2 style="font-size:2rem;color:#feca57;">🎉 We are in Japan! 🎉</h2>';
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

// ── Calendar ──
const tripStart = new Date(2026, 9, 6);
const tripEnd = new Date(2026, 11, 6);
let currentMonth = new Date(2026, 9, 1);
let selectedDate = null;
let currentData = {};
let selectedMood = '';

function isTripDay(date) { return date >= tripStart && date <= tripEnd; }
function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function formatDateTitle(date) {
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

async function renderCalendar() {
  const calendar = document.getElementById('calendar');
  const monthTitle = document.getElementById('monthTitle');
  monthTitle.textContent = currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  calendar.innerHTML = '';
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-day-header';
    el.textContent = d;
    calendar.appendChild(el);
  });
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 0).getDate();
  const today = new Date();
  const keys = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
    keys.push({ date, key: formatDateKey(date) });
  }
  const snapshots = await Promise.all(keys.map(({ key }) => getDoc(doc(db, 'days', key))));
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day empty';
    calendar.appendChild(empty);
  }
  keys.forEach(({ date }, i) => {
    const el = document.createElement('div');
    el.className = 'cal-day';
    el.textContent = date.getDate();
    if (isTripDay(date)) el.classList.add('trip-day');
    if (date.toDateString() === today.toDateString()) el.classList.add('today');
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) el.classList.add('selected');
    const snapData = snapshots[i].exists() ? snapshots[i].data() : {};
    const hasRealData = snapData.hotelName || snapData.generalInfo || snapData.mood ||
      (snapData.places && snapData.places.some(p => p.name)) ||
      (snapData.food && snapData.food.some(f => f.name));
    if (hasRealData) el.classList.add('has-data');
    if (isTripDay(date)) {
      el.addEventListener('click', () => {
        selectedDate = date;
        document.getElementById('calendarSection').classList.add('collapsed');
        document.getElementById('day-panel').classList.remove('hidden');
        document.getElementById('dayTitle').textContent = formatDateTitle(date);
        showViewMode();
        loadDayData(date);
      });
    }
    calendar.appendChild(el);
  });
}

async function loadDayData(date) {
  const key = formatDateKey(date);
  const snap = await getDoc(doc(db, 'days', key));
  currentData = snap.exists() ? snap.data() : {};
  selectedMood = currentData.mood || '';
  renderViewMode();
}

function renderViewMode() {
  const d = currentData;
  const hotelEl = document.getElementById('view-hotel');
  if (d.hotelName || d.hotelAddress) {
    hotelEl.innerHTML = `<h3>🏨 Hotel</h3>
      <div class="view-item" data-name="${d.hotelName||''}" data-address="${d.hotelAddress||''}" data-notes="">
        <div class="view-item-name">${d.hotelName||''}</div>
        <div class="view-item-tap">📍 Tap for location</div>
      </div>`;
  } else { hotelEl.innerHTML = ''; }

  const generalEl = document.getElementById('view-general');
  generalEl.innerHTML = d.generalInfo ? `<h3>📋 General Info</h3><p>${d.generalInfo}</p>` : '';

  const placesEl = document.getElementById('view-places');
  if (d.places && d.places.length > 0 && d.places.some(p => p.name)) {
    placesEl.innerHTML = `<h3>📍 Attractions</h3>` + d.places.filter(p => p.name).map(p => `
      <div class="view-item" data-name="${p.name||''}" data-address="${p.address||''}" data-notes="${p.notes||''}">
        <div class="view-item-name">${p.name}</div>
        <div class="view-item-tap">📍 Tap for details & location</div>
      </div>`).join('');
  } else { placesEl.innerHTML = ''; }

  const foodEl = document.getElementById('view-food');
  if (d.food && d.food.length > 0 && d.food.some(f => f.name)) {
    foodEl.innerHTML = `<h3>🍜 Food</h3>` + d.food.filter(f => f.name).map(f => `
      <div class="view-item" data-name="${f.name||''}" data-address="${f.address||''}" data-notes="${f.notes||''}">
        <div class="view-item-name">${f.name}</div>
        <div class="view-item-tap">📍 Tap for details & location</div>
      </div>`).join('');
  } else { foodEl.innerHTML = ''; }

  const moodEl = document.getElementById('view-mood');
  const moodMap = { sad: '😢', neutral: '😐', happy: '😄', angry: '😤' };
  moodEl.innerHTML = d.mood ? `<h3>Omri Mood</h3><div class="mood-display">${moodMap[d.mood]}</div>` : '';

  document.querySelectorAll('.view-item').forEach(item => {
    item.addEventListener('click', () => openLocationModal(item.dataset.name, item.dataset.address, item.dataset.notes));
  });
}

function showViewMode() {
  document.getElementById('view-mode').classList.remove('hidden');
  document.getElementById('edit-mode').classList.add('hidden');
  document.getElementById('editBtn').classList.remove('hidden');
}

function showEditMode() {
  document.getElementById('view-mode').classList.add('hidden');
  document.getElementById('edit-mode').classList.remove('hidden');
  document.getElementById('editBtn').classList.add('hidden');
  const d = currentData;
  document.getElementById('hotelName').value = d.hotelName || '';
  document.getElementById('hotelAddress').value = d.hotelAddress || '';
  document.getElementById('generalInfo').value = d.generalInfo || '';
  selectedMood = d.mood || '';
  document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.toggle('selected', btn.dataset.mood === selectedMood));
  renderPlaces(d.places || []);
  renderFood(d.food || []);
}

function renderPlaces(places) {
  const list = document.getElementById('placesList');
  list.innerHTML = '';
  places.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'place-item';
    div.innerHTML = `
      <input type="text" placeholder="Attraction name" value="${p.name||''}" data-index="${i}" data-field="name" />
      <input type="text" placeholder="Address" value="${p.address||''}" data-index="${i}" data-field="address" />
      <textarea placeholder="Notes (optional)" data-index="${i}" data-field="notes">${p.notes||''}</textarea>
      <button class="remove-btn" data-index="${i}">✕</button>`;
    list.appendChild(div);
  });
}

function renderFood(food) {
  const list = document.getElementById('foodList');
  list.innerHTML = '';
  food.forEach((f, i) => {
    const div = document.createElement('div');
    div.className = 'food-item';
    div.innerHTML = `
      <input type="text" placeholder="Restaurant / Food name" value="${f.name||''}" data-index="${i}" data-field="name" />
      <input type="text" placeholder="Address (optional)" value="${f.address||''}" data-index="${i}" data-field="address" />
      <textarea placeholder="Notes (optional)" data-index="${i}" data-field="notes">${f.notes||''}</textarea>
      <button class="remove-btn" data-index="${i}">✕</button>`;
    list.appendChild(div);
  });
}

function getPlaces() {
  return Array.from(document.querySelectorAll('.place-item')).map(item => ({
    name: item.querySelector('[data-field="name"]').value,
    address: item.querySelector('[data-field="address"]').value,
    notes: item.querySelector('[data-field="notes"]').value
  }));
}

function getFood() {
  return Array.from(document.querySelectorAll('.food-item')).map(item => ({
    name: item.querySelector('[data-field="name"]').value,
    address: item.querySelector('[data-field="address"]').value,
    notes: item.querySelector('[data-field="notes"]').value
  }));
}

async function saveDay() {
  if (!selectedDate) return;
  const key = formatDateKey(selectedDate);
  currentData = {
    hotelName: document.getElementById('hotelName').value,
    hotelAddress: document.getElementById('hotelAddress').value,
    generalInfo: document.getElementById('generalInfo').value,
    places: getPlaces(),
    food: getFood(),
    mood: selectedMood
  };
  const isEmpty = !currentData.hotelName && !currentData.hotelAddress &&
    !currentData.generalInfo && !currentData.mood &&
    currentData.places.every(p => !p.name) && currentData.food.every(f => !f.name);
  await setDoc(doc(db, 'days', key), isEmpty ? {} : currentData);
  renderViewMode();
  showViewMode();
  renderCalendar();
}

document.getElementById('prevMonth').addEventListener('click', () => { currentMonth.setMonth(currentMonth.getMonth()-1); renderCalendar(); });
document.getElementById('nextMonth').addEventListener('click', () => { currentMonth.setMonth(currentMonth.getMonth()+1); renderCalendar(); });
document.getElementById('closePanel').addEventListener('click', () => {
  document.getElementById('day-panel').classList.add('hidden');
  document.getElementById('calendarSection').classList.remove('collapsed');
  selectedDate = null; renderCalendar();
});
document.getElementById('editBtn').addEventListener('click', showEditMode);
document.getElementById('cancelEdit').addEventListener('click', () => { showViewMode(); renderViewMode(); });
document.getElementById('saveDay').addEventListener('click', saveDay);
document.getElementById('addPlace').addEventListener('click', () => renderPlaces([...getPlaces(), { name:'', address:'', notes:'' }]));
document.getElementById('addFood').addEventListener('click', () => renderFood([...getFood(), { name:'', address:'', notes:'' }]));
document.getElementById('placesList').addEventListener('click', e => {
  if (e.target.classList.contains('remove-btn')) { const p = getPlaces(); p.splice(+e.target.dataset.index,1); renderPlaces(p); }
});
document.getElementById('foodList').addEventListener('click', e => {
  if (e.target.classList.contains('remove-btn')) { const f = getFood(); f.splice(+e.target.dataset.index,1); renderFood(f); }
});
document.getElementById('moodSelector').addEventListener('click', e => {
  if (e.target.classList.contains('mood-btn')) {
    selectedMood = e.target.dataset.mood;
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.toggle('selected', btn.dataset.mood === selectedMood));
  }
});

// ── Location Modal ──
function openLocationModal(name, address, notes) {
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

document.querySelectorAll('.split-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    selectedSplit = Array.from(document.querySelectorAll('.split-btn.active')).map(b => b.dataset.person);
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
  list.innerHTML = expenses.map(e => `
    <div class="expense-item">
      <div class="expense-item-top">
        <div class="expense-desc">${e.desc}</div>
        <div style="display:flex;gap:8px;align-items:center;">
          <div class="expense-amount">${e.currency === 'JPY' ? '¥' : '₪'}${Number(e.amount).toLocaleString()}</div>
          <button class="expense-delete" data-id="${e.id}">✕</button>
        </div>
      </div>
      <div class="expense-meta">Paid by: ${e.payer} · Split: ${e.split.join(', ')}</div>
    </div>`).join('');

  document.querySelectorAll('.expense-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      await deleteDoc(doc(db, 'expenses', btn.dataset.id));
      loadExpenses();
    });
  });
}

function renderBalance(expenses) {
  const people = ['Amit', 'Moshe', 'Omri'];
  const balances = { Amit: 0, Moshe: 0, Omri: 0 };

  expenses.forEach(e => {
    let amount = parseFloat(e.amount);
    if (e.currency === 'JPY') amount = amount / jpyPerIls;
    const share = amount / e.split.length;
    balances[e.payer] += amount;
    e.split.forEach(p => { balances[p] -= share; });
  });

  const debts = [];
  const bal = { ...balances };

  for (let i = 0; i < 10; i++) {
    const maxCreditor = people.reduce((a, b) => bal[a] > bal[b] ? a : b);
    const maxDebtor = people.reduce((a, b) => bal[a] < bal[b] ? a : b);
    if (Math.abs(bal[maxCreditor]) < 0.5 || Math.abs(bal[maxDebtor]) < 0.5) break;
    const amount = Math.min(bal[maxCreditor], -bal[maxDebtor]);
    if (amount < 0.5) break;
    debts.push({ from: maxDebtor, to: maxCreditor, amount });
    bal[maxCreditor] -= amount;
    bal[maxDebtor] += amount;
  }

  const summary = document.getElementById('balanceSummary');
  if (debts.length === 0) {
    summary.innerHTML = '<div class="balance-ok">✅ All settled up!</div>';
    return;
  }
summary.innerHTML = debts.map(d => `
    <div class="balance-item">
      <div class="balance-text">💸 ${d.to} ← ${d.from} owes</div>
      <div class="balance-amount">₪${d.amount.toFixed(2)}</div>
    </div>`).join('');
}

document.getElementById('addExpenseBtn').addEventListener('click', async () => {
  const desc = document.getElementById('expDesc').value.trim();
  const amount = parseFloat(document.getElementById('expAmount').value);
  const currency = document.getElementById('expCurrency').value;
  if (!desc || isNaN(amount) || amount <= 0 || selectedSplit.length === 0) {
    alert('Please fill in all fields and select at least one person to split with.');
    return;
  }
  await addDoc(collection(db, 'expenses'), {
    desc, amount, currency,
    payer: selectedPayer,
    split: selectedSplit,
    timestamp: Date.now()
  });
  document.getElementById('expDesc').value = '';
  document.getElementById('expAmount').value = '';
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
  const query = e.target.value.trim().toLowerCase();
  if (!query) { searchResultsDiv.innerHTML = ''; return; }
  const results = [];
  document.querySelectorAll('.phrase-card').forEach(card => {
    const heb = card.querySelector('.phrase-hebrew')?.textContent.toLowerCase() || '';
    const pron = card.querySelector('.phrase-japanese')?.textContent.toLowerCase() || '';
    if (heb.includes(query) || pron.includes(query)) results.push(card.cloneNode(true));
  });
  searchResultsDiv.innerHTML = results.length === 0
    ? '<div style="color:rgba(255,255,255,.5);padding:10px;text-align:center;">No results found</div>'
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
const wheelColors = ['#e94560','#0f3460','#e94560','#16213e','#533483','#2b9348','#e94560','#0f3460'];

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
      ? ['restaurant','cafe','ramen','sushi','izakaya','bakery']
      : ['attraction','museum','park','shopping','landmark','arcade'];
    const places = [];
    for (const cat of categories.slice(0,5)) {
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
renderCalendar();
loadExpenses();
addSpeakButtons();
