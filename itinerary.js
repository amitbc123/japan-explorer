import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDPeDrMQ9aPzwTO4wcdSAhpEmVBWIkhMxE",
  authDomain: "japan-explorer-22f18.firebaseapp.com",
  projectId: "japan-explorer-22f18",
  storageBucket: "japan-explorer-22f18.firebasestorage.app",
  messagingSenderId: "53809221413",
  appId: "1:53809221413:web:d7c3e75822bdaf7edc94cc"
};

const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const DEFAULT_STAGES = [
  {
    id: 's1', name: 'טוקיו — כניסה לעולם אחר', startDate: '6.10', endDate: '19.10', nights: 13,
    stops: [
      { id: 'st1', name: 'Tokyo', startDate: '6.10', endDate: '19.10', nights: 13,
        desc: 'בסיס קבוע. אקיהבארה, שיבויה, שינג\'וקו, אסאקוסה, אודאיבה, הארג\'וקו, שימוקיטאזווה, טוקיו סקייטרי, טימלאב פלנטס, Muscle Girls Bar',
        tags: ['city','anime','shopping'], mapsQuery: 'Tokyo Japan', img: '' }
    ]
  },
  {
    id: 's2', name: 'הר פוג\'י והסביבה', startDate: '20.10', endDate: '26.10', nights: 6,
    stops: [
      { id: 'st2', name: 'Hakone', startDate: '20.10', endDate: '22.10', nights: 2,
        desc: 'ראשון. אמבטיית חוץ בלילה עם נוף על הר פוג\'י. מרחצאות חמים מול הר פוג\'י. Ryokan',
        tags: ['nature','onsen','ryokan'], mapsQuery: 'Hakone Japan', img: '' },
      { id: 'st3', name: 'Kawaguchiko + Chureito Pagoda', startDate: '22.10', endDate: '24.10', nights: 2,
        desc: 'אגם עם השתקפות הר פוג\'י. פגודה אדומה על גבעה עם הר פוג\'י מאחוריה',
        tags: ['nature','scenic'], mapsQuery: 'Kawaguchiko Japan', img: '' },
      { id: 'st4', name: 'חזרה לטוקיו — יומיים חופשיים', startDate: '24.10', endDate: '26.10', nights: 2,
        desc: 'זמן פנוי לכל מה שפספסתם בשבועיים הראשונים',
        tags: ['city'], mapsQuery: 'Tokyo Japan', img: '' }
    ]
  },
  {
    id: 's3', name: 'קיוטו, נארה, אוסקה', startDate: '27.10', endDate: '9.11', nights: 13,
    stops: [
      { id: 'st5', name: 'קיוטו', startDate: '27.10', endDate: '3.11', nights: 7,
        desc: 'Fushimi Inari, Arashiyama, Nishiki Market, Philosopher\'s Path. יום טיול לנארה ולאייל החופשיים',
        tags: ['culture','scenic'], mapsQuery: 'Kyoto Japan', img: '' },
      { id: 'st6', name: 'אוסקה', startDate: '3.11', endDate: '9.11', nights: 6,
        desc: 'Dotonbori, Osaka Castle. עיר האוכל הכי טובה ביפן. אנרגיה שונה לגמרי מטוקיו',
        tags: ['city','food'], mapsQuery: 'Osaka Japan', img: '' }
    ]
  },
  {
    id: 's4', name: 'קיושו — הרי הגעש', startDate: '10.11', endDate: '20.11', nights: 10,
    stops: [
      { id: 'st7', name: 'Fukuoka', startDate: '10.11', endDate: '13.11', nights: 3,
        desc: 'Fukuoka Castle, Ohori Park, Nakasu. שער הכניסה לקיושו. עיר מודרנית וכיפית',
        tags: ['city'], mapsQuery: 'Fukuoka Japan', img: '' },
      { id: 'st8', name: 'Beppu', startDate: '13.11', endDate: '15.11', nights: 2,
        desc: 'Beppu Hells, Beppu Onsen. מעיינות רותחים צבעוניים ומרחצאות חמים. אדים עולים מהאדמה ברחוב',
        tags: ['onsen','volcano'], mapsQuery: 'Beppu Japan', img: '' },
      { id: 'st9', name: 'Mount Aso', startDate: '15.11', endDate: '17.11', nights: 2,
        desc: 'הר געש פעיל עם הקלדרה הכי גדולה בעולם. לעמוד על השפה ולהסתכל פנימה',
        tags: ['nature','volcano'], mapsQuery: 'Mount Aso Japan', img: '' },
      { id: 'st10', name: 'Kagoshima + Sakurajima', startDate: '17.11', endDate: '20.11', nights: 3,
        desc: 'נוף אפוקליפטי מרהיב, הר געש פעיל מול העיר, Sengan-en Garden',
        tags: ['nature','volcano'], mapsQuery: 'Kagoshima Japan', img: '' }
    ]
  },
  {
    id: 's5', name: 'הוקאידו — הצפון המושלג', startDate: '21.11', endDate: '6.12', nights: 15,
    stops: [
      { id: 'st11', name: 'Sapporo', startDate: '21.11', endDate: '25.11', nights: 4,
        desc: 'עיר גדולה עם שלג ראשון. שוק ענק, בירה מפורסמת, אנרגיה שונה',
        tags: ['city','snow'], mapsQuery: 'Sapporo Japan', img: '' },
      { id: 'st12', name: 'Otaru', startDate: '25.11', endDate: '27.11', nights: 2,
        desc: 'עיירת נמל מושלגת עם תעלות ובתי קפה קטנים. שקט ויפה',
        tags: ['quiet','snow'], mapsQuery: 'Otaru Japan', img: '' },
      { id: 'st13', name: 'Furano', startDate: '27.11', endDate: '30.11', nights: 3,
        desc: 'עם אמבטיית חוץ בשלג. שדות לבנים לכל הכיוונים. Ryokan כפר הרים שקט',
        tags: ['nature','snow','ryokan'], mapsQuery: 'Furano Japan', img: '' },
      { id: 'st14', name: 'Shiretoko', startDate: '30.11', endDate: '3.12', nights: 3,
        desc: 'חצי אי פראי ומבודד. דובים, צבאים, שלג. אחד האזורים הפראיים ביותר ביפן',
        tags: ['wild','nature'], mapsQuery: 'Shiretoko Japan', img: '' },
      { id: 'st15', name: 'חזרה לטוקיו — סיום', startDate: '3.12', endDate: '6.12', nights: 3,
        desc: 'ימים אחרונים. קניות, מה שפספסתם, ארוחה אחרונה, נסיעה לשדה התעופה',
        tags: ['city'], mapsQuery: 'Tokyo Japan', img: '' }
    ]
  }
];

let itineraryData = [];

async function loadItinerary() {
  try {
    const snap = await getDoc(doc(db, 'itinerary', 'main'));
    if (snap.exists() && snap.data().stages && snap.data().stages.length > 0) {
      itineraryData = snap.data().stages;
    } else {
      itineraryData = JSON.parse(JSON.stringify(DEFAULT_STAGES));
      await saveItinerary();
    }
  } catch (e) {
    itineraryData = JSON.parse(JSON.stringify(DEFAULT_STAGES));
  }
  renderItinerary();
}

async function saveItinerary() {
  try {
    await setDoc(doc(db, 'itinerary', 'main'), { stages: itineraryData });
  } catch (e) {
    console.error('Save error:', e);
  }
}

function getTagClass(tag) {
  const map = { city:'city', anime:'city', shopping:'shopping', nature:'nature', onsen:'onsen',
    ryokan:'ryokan', scenic:'scenic', culture:'culture', food:'food', snow:'snow',
    quiet:'quiet', wild:'wild', volcano:'volcano' };
  return map[tag] || 'city';
}

function getTagLabel(tag) {
  const map = { city:'עיר', anime:'אנימה', shopping:'קניות', nature:'טבע', onsen:'Onsen',
    ryokan:'Ryokan', scenic:'נוף', culture:'תרבות', food:'אוכל', snow:'שלג',
    quiet:'שקט', wild:'פראי', volcano:'וולקני' };
  return map[tag] || tag;
}

function renderItinerary() {
  const list = document.getElementById('itinerary-list');
  if (!list) return;
  list.innerHTML = '';
  itineraryData.forEach((stage, si) => {
    const card = document.createElement('div');
    card.className = 'stage-card';
    card.innerHTML = `
      <div class="stage-header">
        <span class="stage-chevron">▼</span>
        <span class="stage-nights">${stage.nights} לילות</span>
        <div class="stage-header-left">
          <div class="stage-name">${stage.name}</div>
          <div class="stage-dates">${stage.startDate} – ${stage.endDate} · ${stage.nights} לילות</div>
        </div>
      </div>
      <div class="stage-body">
        <div class="stops-list" id="stops-${stage.id}"></div>
        <div class="stage-actions">
          <button class="add-stop-btn" data-stage="${stage.id}">+ הוסף תחנה</button>
          <button class="delete-stage-btn" data-stage="${stage.id}">🗑 מחק שלב</button>
        </div>
      </div>`;
    list.appendChild(card);

    card.querySelector('.stage-header').addEventListener('click', () => {
      card.classList.toggle('open');
    });
    card.querySelector('.add-stop-btn').addEventListener('click', () => openStopModal(stage.id, null));
    card.querySelector('.delete-stage-btn').addEventListener('click', () => {
      if (confirm('למחוק את השלב הזה?')) {
        itineraryData = itineraryData.filter(s => s.id !== stage.id);
        saveItinerary(); renderItinerary();
      }
    });

    renderStops(stage, si);
  });
}

function renderStops(stage, si) {
  const container = document.getElementById('stops-' + stage.id);
  if (!container) return;
  container.innerHTML = '';
  stage.stops.forEach((stop, sti) => {
    const div = document.createElement('div');
    div.className = 'stop-card';
    const tagsHtml = (stop.tags || []).map(t =>
      `<span class="stop-tag tag-${getTagClass(t)}">${getTagLabel(t)}</span>`).join('');
    const imgHtml = stop.img
      ? `<img class="stop-img" src="${stop.img}" alt="${stop.name}" onerror="this.style.display='none'" />`
      : `<div class="stop-img-placeholder">🗾</div>`;
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent((stop.mapsQuery || stop.name) + ' Japan')}`;

    div.innerHTML = `
      ${imgHtml}
      <div class="stop-content">
        <div class="stop-top">
          <div class="stop-name">${stop.name}</div>
          <div class="stop-nights-badge">${stop.nights} לילות</div>
        </div>
        <div class="stop-dates">${stop.startDate} – ${stop.endDate}</div>
        <div class="stop-desc">${stop.desc}</div>
        <div class="stop-tags">${tagsHtml}</div>
        <div class="stop-actions">
          <a class="stop-maps-btn" href="${mapsUrl}" target="_blank">📍 Google Maps</a>
          <button class="stop-edit-btn" data-si="${si}" data-sti="${sti}">✏️</button>
          <button class="stop-delete-btn" data-si="${si}" data-sti="${sti}">🗑</button>
        </div>
      </div>`;
    container.appendChild(div);

    div.querySelector('.stop-edit-btn').addEventListener('click', () => openStopModal(stage.id, sti));
    div.querySelector('.stop-delete-btn').addEventListener('click', () => {
      if (confirm('למחוק תחנה זו?')) {
        itineraryData[si].stops.splice(sti, 1);
        saveItinerary(); renderItinerary();
      }
    });
  });
}

const ALL_TAGS = ['city','anime','shopping','nature','onsen','ryokan','scenic','culture','food','snow','quiet','wild','volcano'];

let modalStageId = null;
let modalStopIdx = null;
let selectedTags = [];
let fetchedImg = '';

function openStopModal(stageId, stopIdx) {
  modalStageId = stageId;
  modalStopIdx = stopIdx;
  selectedTags = [];
  fetchedImg = '';

  const stage = itineraryData.find(s => s.id === stageId);
  const stop = stopIdx !== null ? stage.stops[stopIdx] : null;

  if (stop) {
    selectedTags = [...(stop.tags || [])];
    fetchedImg = stop.img || '';
  }

  const overlay = document.createElement('div');
  overlay.className = 'itin-modal-overlay';
  overlay.id = 'itinModalOverlay';
  overlay.innerHTML = `
    <div class="itin-modal-box">
      <div class="itin-modal-title">${stop ? 'עריכת תחנה' : 'הוספת תחנה'}</div>

      <div class="itin-label">שם המקום</div>
      <div class="itin-search-row">
        <input type="text" class="itin-input" id="itinName" placeholder="למשל: Hakone" value="${stop ? stop.name : ''}" style="margin-bottom:0" />
        <button class="itin-search-btn" id="itinFetchBtn">🔍 משוך מידע</button>
      </div>
      <div id="itinFetchedInfo"></div>

      <div class="itin-label">תאריך התחלה</div>
      <input type="text" class="itin-input" id="itinStart" placeholder="למשל: 20.10" value="${stop ? stop.startDate : ''}" />

      <div class="itin-label">תאריך סיום</div>
      <input type="text" class="itin-input" id="itinEnd" placeholder="למשל: 22.10" value="${stop ? stop.endDate : ''}" />

      <div class="itin-label">מספר לילות</div>
      <input type="number" class="itin-input" id="itinNights" placeholder="2" value="${stop ? stop.nights : ''}" />

      <div class="itin-label">תיאור</div>
      <textarea class="itin-textarea" id="itinDesc" placeholder="מה עושים פה?">${stop ? stop.desc : ''}</textarea>

      <div class="itin-label">תגיות</div>
      <div class="itin-tags-selector" id="itinTagsSelector">
        ${ALL_TAGS.map(t => `<button class="itin-tag-btn ${selectedTags.includes(t) ? 'active' : ''}" data-tag="${t}">${getTagLabel(t)}</button>`).join('')}
      </div>

      <div class="itin-modal-actions">
        <button class="itin-save-btn" id="itinSaveBtn">💾 שמור</button>
        <button class="itin-cancel-btn" id="itinCancelBtn">ביטול</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  overlay.querySelectorAll('.itin-tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      if (selectedTags.includes(tag)) {
        selectedTags = selectedTags.filter(t => t !== tag);
        btn.classList.remove('active');
      } else {
        selectedTags.push(tag);
        btn.classList.add('active');
      }
    });
  });

  document.getElementById('itinFetchBtn').addEventListener('click', async () => {
    const name = document.getElementById('itinName').value.trim();
    if (!name) return;
    const btn = document.getElementById('itinFetchBtn');
    btn.textContent = '⏳ טוען...';
    btn.disabled = true;
    await fetchPlaceInfo(name);
    btn.textContent = '🔍 משוך מידע';
    btn.disabled = false;
  });

  document.getElementById('itinSaveBtn').addEventListener('click', saveStop);
  document.getElementById('itinCancelBtn').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
}

async function fetchPlaceInfo(name) {
  const infoDiv = document.getElementById('itinFetchedInfo');
  infoDiv.innerHTML = '';
  try {
    const searchRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`);
    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.extract) {
        const desc = data.extract.substring(0, 200) + (data.extract.length > 200 ? '...' : '');
        const currentDesc = document.getElementById('itinDesc').value;
        if (!currentDesc) document.getElementById('itinDesc').value = desc;

        if (data.thumbnail?.source) {
          fetchedImg = data.thumbnail.source;
        }

        infoDiv.innerHTML = `<div class="itin-fetched">✅ נמצא מידע מ-Wikipedia${fetchedImg ? ' + תמונה' : ''}</div>`;
      }
    }
  } catch (e) {
    infoDiv.innerHTML = `<div class="itin-fetched" style="border-color:rgba(233,69,96,.3)">⚠️ לא נמצא מידע אוטומטי</div>`;
  }
}

function closeModal() {
  const overlay = document.getElementById('itinModalOverlay');
  if (overlay) overlay.remove();
}

function saveStop() {
  const stage = itineraryData.find(s => s.id === modalStageId);
  if (!stage) return;

  const name = document.getElementById('itinName').value.trim();
  const startDate = document.getElementById('itinStart').value.trim();
  const endDate = document.getElementById('itinEnd').value.trim();
  const nights = parseInt(document.getElementById('itinNights').value) || 0;
  const desc = document.getElementById('itinDesc').value.trim();

  if (!name) { alert('נא להכניס שם מקום'); return; }

  const stopData = {
    id: modalStopIdx !== null ? stage.stops[modalStopIdx].id : 'st' + Date.now(),
    name, startDate, endDate, nights, desc,
    tags: selectedTags,
    mapsQuery: name,
    img: fetchedImg || (modalStopIdx !== null ? stage.stops[modalStopIdx].img : '')
  };

  if (modalStopIdx !== null) {
    stage.stops[modalStopIdx] = stopData;
  } else {
    stage.stops.push(stopData);
  }

  saveItinerary();
  renderItinerary();
  closeModal();
}

function openStageModal() {
  const overlay = document.createElement('div');
  overlay.className = 'itin-modal-overlay';
  overlay.id = 'itinModalOverlay';
  overlay.innerHTML = `
    <div class="itin-modal-box">
      <div class="itin-modal-title">➕ הוסף שלב חדש</div>
      <div class="itin-label">שם השלב</div>
      <input type="text" class="itin-input" id="stageNameInput" placeholder="למשל: טוקיו" />
      <div class="itin-label">תאריך התחלה</div>
      <input type="text" class="itin-input" id="stageStartInput" placeholder="למשל: 6.10" />
      <div class="itin-label">תאריך סיום</div>
      <input type="text" class="itin-input" id="stageEndInput" placeholder="למשל: 19.10" />
      <div class="itin-label">מספר לילות</div>
      <input type="number" class="itin-input" id="stageNightsInput" placeholder="13" />
      <div class="itin-modal-actions">
        <button class="itin-save-btn" id="stageSaveBtn">💾 שמור</button>
        <button class="itin-cancel-btn" id="stageCancelBtn">ביטול</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById('stageSaveBtn').addEventListener('click', () => {
    const name = document.getElementById('stageNameInput').value.trim();
    const startDate = document.getElementById('stageStartInput').value.trim();
    const endDate = document.getElementById('stageEndInput').value.trim();
    const nights = parseInt(document.getElementById('stageNightsInput').value) || 0;
    if (!name) { alert('נא להכניס שם שלב'); return; }
    itineraryData.push({ id: 'stage' + Date.now(), name, startDate, endDate, nights, stops: [] });
    saveItinerary(); renderItinerary(); closeModal();
  });
  document.getElementById('stageCancelBtn').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
}

document.getElementById('addStageBtn')?.addEventListener('click', openStageModal);

loadItinerary();
