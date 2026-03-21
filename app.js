import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const tripStart = new Date(2026, 9, 6);
const tripEnd = new Date(2026, 11, 6);

let currentMonth = new Date(2026, 9, 1);
let selectedDate = null;
let currentData = {};
let selectedMood = '';

function isTripDay(date) {
  return date >= tripStart && date <= tripEnd;
}

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

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  days.forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-day-header';
    el.textContent = d;
    calendar.appendChild(el);
  });

  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 0).getDate();
  const today = new Date();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day empty';
    calendar.appendChild(empty);
  }

  const keys = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
    keys.push({ date, key: formatDateKey(date) });
  }

  const snapshots = await Promise.all(keys.map(({ key }) => getDoc(doc(db, 'days', key))));

  keys.forEach(({ date, key }, i) => {
    const el = document.createElement('div');
    el.className = 'cal-day';
    el.textContent = date.getDate();

    if (isTripDay(date)) el.classList.add('trip-day');
    if (date.toDateString() === today.toDateString()) el.classList.add('today');
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) el.classList.add('selected');
    if (snapshots[i].exists()) el.classList.add('has-data');

    if (isTripDay(date)) {
      el.addEventListener('click', () => {
        selectedDate = date;
        document.getElementById('calendar-section').classList.add('collapsed');
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
    hotelEl.innerHTML = `<h3>🏨 Accommodation</h3>
      <div class="view-item">
        <div class="view-item-name">${d.hotelName || ''}</div>
        <div class="view-item-address">${d.hotelAddress || ''}</div>
        ${d.hotelAddress ? `<a class="maps-btn" href="https://www.google.com/maps/search/${encodeURIComponent(d.hotelName+' '+d.hotelAddress)}" target="_blank">📍 Google Maps</a>` : ''}
      </div>`;
  } else {
    hotelEl.innerHTML = '';
  }

  const generalEl = document.getElementById('view-general');
  if (d.generalInfo) {
    generalEl.innerHTML = `<h3>📋 General Info</h3><p>${d.generalInfo}</p>`;
  } else {
    generalEl.innerHTML = '';
  }

  const placesEl = document.getElementById('view-places');
  if (d.places && d.places.length > 0) {
    placesEl.innerHTML = `<h3>📍 Attractions</h3>` + d.places.map(p => `
      <div class="view-item">
        <div class="view-item-name">${p.name || ''}</div>
        <div class="view-item-address">${p.address || ''}</div>
        ${p.notes ? `<div class="view-item-notes">${p.notes}</div>` : ''}
        ${p.name ? `<a class="maps-btn" href="https://www.google.com/maps/search/${encodeURIComponent(p.name+' '+(p.address||'')+' Japan')}" target="_blank">📍 Google Maps</a>` : ''}
      </div>`).join('');
  } else {
    placesEl.innerHTML = '';
  }

  const foodEl = document.getElementById('view-food');
  if (d.food && d.food.length > 0) {
    foodEl.innerHTML = `<h3>🍜 Food & Restaurants</h3>` + d.food.map(f => `
      <div class="view-item">
        <div class="view-item-name">${f.name || ''}</div>
        <div class="view-item-address">${f.address || ''}</div>
        ${f.notes ? `<div class="view-item-notes">${f.notes}</div>` : ''}
        ${f.name ? `<a class="maps-btn" href="https://www.google.com/maps/search/${encodeURIComponent(f.name+' '+(f.address||'')+' Japan')}" target="_blank">📍 Google Maps</a>` : ''}
      </div>`).join('');
  } else {
    foodEl.innerHTML = '';
  }

  const moodEl = document.getElementById('view-mood');
  const moodMap = { sad: '😢', neutral: '😐', happy: '😄', angry: '😤' };
  if (d.mood) {
    moodEl.innerHTML = `<h3>😄 Omri's Mood</h3><div class="mood-display">${moodMap[d.mood]}</div>`;
  } else {
    moodEl.innerHTML = '';
  }
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
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.mood === selectedMood);
  });

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
      <input type="text" placeholder="Attraction name" value="${p.name || ''}" data-index="${i}" data-field="name" />
      <input type="text" placeholder="Address" value="${p.address || ''}" data-index="${i}" data-field="address" />
      <textarea placeholder="Notes (optional)" data-index="${i}" data-field="notes">${p.notes || ''}</textarea>
      <button class="remove-btn" data-index="${i}">✕</button>
    `;
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
      <input type="text" placeholder="Restaurant / Food name" value="${f.name || ''}" data-index="${i}" data-field="name" />
      <input type="text" placeholder="Address (optional)" value="${f.address || ''}" data-index="${i}" data-field="address" />
      <textarea placeholder="Notes (optional)" data-index="${i}" data-field="notes">${f.notes || ''}</textarea>
      <button class="remove-btn" data-index="${i}">✕</button>
    `;
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
  await setDoc(doc(db, 'days', key), currentData);
  renderViewMode();
  showViewMode();
  renderCalendar();
}

document.getElementById('prevMonth').addEventListener('click', () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderCalendar();
});

document.getElementById('closePanel').addEventListener('click', () => {
  document.getElementById('day-panel').classList.add('hidden');
  document.getElementById('calendar-section').classList.remove('collapsed');
  selectedDate = null;
  renderCalendar();
});

document.getElementById('editBtn').addEventListener('click', showEditMode);

document.getElementById('cancelEdit').addEventListener('click', () => {
  showViewMode();
  renderViewMode();
});

document.getElementById('saveDay').addEventListener('click', saveDay);

document.getElementById('addPlace').addEventListener('click', () => {
  renderPlaces([...getPlaces(), { name: '', address: '', notes: '' }]);
});

document.getElementById('addFood').addEventListener('click', () => {
  renderFood([...getFood(), { name: '', address: '', notes: '' }]);
});

document.getElementById('placesList').addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-btn')) {
    const places = getPlaces();
    places.splice(parseInt(e.target.dataset.index), 1);
    renderPlaces(places);
  }
});

document.getElementById('foodList').addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-btn')) {
    const food = getFood();
    food.splice(parseInt(e.target.dataset.index), 1);
    renderFood(food);
  }
});

document.getElementById('moodSelector').addEventListener('click', (e) => {
  if (e.target.classList.contains('mood-btn')) {
    selectedMood = e.target.dataset.mood;
    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.mood === selectedMood);
    });
  }
});

renderCalendar();
