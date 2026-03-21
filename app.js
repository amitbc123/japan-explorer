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

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
    const key = formatDateKey(date);
    const el = document.createElement('div');
    el.className = 'cal-day';
    el.textContent = d;

    if (isTripDay(date)) el.classList.add('trip-day');
    if (date.toDateString() === today.toDateString()) el.classList.add('today');
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) el.classList.add('selected');

    const snap = await getDoc(doc(db, 'days', key));
    if (snap.exists() && Object.keys(snap.data()).length > 0) el.classList.add('has-data');

    el.addEventListener('click', () => {
      if (!isTripDay(date)) return;
      selectedDate = date;
      openDayPanel(date);
      renderCalendar();
    });

    calendar.appendChild(el);
  }
}

function openDayPanel(date) {
  document.getElementById('day-panel').classList.remove('hidden');
  document.getElementById('dayTitle').textContent = formatDateTitle(date);
  loadDayData(date);
}

async function loadDayData(date) {
  const key = formatDateKey(date);
  const snap = await getDoc(doc(db, 'days', key));
  const data = snap.exists() ? snap.data() : {};

  document.getElementById('hotelName').value = data.hotelName || '';
  document.getElementById('hotelAddress').value = data.hotelAddress || '';
  document.getElementById('transportation').value = data.transportation || '';
  document.getElementById('budget').value = data.budget || '';
  document.getElementById('budgetCurrency').value = data.budgetCurrency || 'JPY';
  document.getElementById('weather').value = data.weather || '';
  document.getElementById('notes').value = data.notes || '';

  renderPlaces(data.places || []);
  renderFood(data.food || []);
}

function renderPlaces(places) {
  const list = document.getElementById('placesList');
  list.innerHTML = '';
  places.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'place-item';
    div.innerHTML = `
      <input type="text" placeholder="Place name" value="${p.name || ''}" data-index="${i}" data-field="name" />
      <input type="text" placeholder="Address" value="${p.address || ''}" data-index="${i}" data-field="address" />
      <a class="maps-btn" href="https://www.google.com/maps/search/${encodeURIComponent((p.name||'')+(p.address?' '+p.address:''))}" target="_blank">📍 Open in Google Maps</a>
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
      <a class="maps-btn" href="https://www.google.com/maps/search/${encodeURIComponent((f.name||'')+(f.address?' '+f.address:''))}+Japan" target="_blank">📍 Open in Google Maps</a>
      <button class="remove-btn" data-index="${i}">✕</button>
    `;
    list.appendChild(div);
  });
}

function getPlaces() {
  const items = document.querySelectorAll('.place-item');
  return Array.from(items).map(item => ({
    name: item.querySelector('[data-field="name"]').value,
    address: item.querySelector('[data-field="address"]').value
  }));
}

function getFood() {
  const items = document.querySelectorAll('.food-item');
  return Array.from(items).map(item => ({
    name: item.querySelector('[data-field="name"]').value,
    address: item.querySelector('[data-field="address"]').value
  }));
}

async function saveDay() {
  if (!selectedDate) return;
  const key = formatDateKey(selectedDate);
  const data = {
    hotelName: document.getElementById('hotelName').value,
    hotelAddress: document.getElementById('hotelAddress').value,
    transportation: document.getElementById('transportation').value,
    budget: document.getElementById('budget').value,
    budgetCurrency: document.getElementById('budgetCurrency').value,
    weather: document.getElementById('weather').value,
    notes: document.getElementById('notes').value,
    places: getPlaces(),
    food: getFood()
  };
  await setDoc(doc(db, 'days', key), data);
  alert('Saved!');
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
  selectedDate = null;
  renderCalendar();
});

document.getElementById('saveDay').addEventListener('click', saveDay);

document.getElementById('addPlace').addEventListener('click', () => {
  const places = getPlaces();
  places.push({ name: '', address: '' });
  renderPlaces(places);
});

document.getElementById('addFood').addEventListener('click', () => {
  const food = getFood();
  food.push({ name: '', address: '' });
  renderFood(food);
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

renderCalendar();
