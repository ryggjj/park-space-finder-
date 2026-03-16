// 默认车位数据（含付费/免费与免费时长，用户可自行输入经纬度）
const DEFAULT_SPOTS = [
  { id: '1', name: '中央商场地下停车场', address: '人民路 100 号', lat: -33.8688, lng: 151.2093, paid: true, freeMinutes: 0, total: 80, available: 12 },
  { id: '2', name: '市政广场停车场', address: '解放大道 200 号', lat: -33.872, lng: 151.205, paid: false, freeMinutes: 60, total: 50, available: 5 },
  { id: '3', name: '火车站东侧停车场', address: '站前路 1 号', lat: -33.865, lng: 151.212, paid: true, freeMinutes: 0, total: 120, available: 0 },
  { id: '4', name: '大学城停车场 A 区', address: '学府路 88 号', lat: -33.875, lng: 151.202, paid: false, freeMinutes: 0, total: 200, available: 45 },
  { id: '5', name: '医院南门临时停车场', address: '健康路 66 号', lat: -33.862, lng: 151.206, paid: false, freeMinutes: 30, total: 30, available: 8 },
  { id: '6', name: '体育馆北停车场', address: '体育街 15 号', lat: -33.878, lng: 151.215, paid: true, freeMinutes: 0, total: 90, available: 0 },
  { id: '7', name: '超市地面停车场', address: '商业街 22 号', lat: -33.87, lng: 151.218, paid: false, freeMinutes: 120, total: 60, available: 20 },
  { id: '8', name: '公园西门停车场', address: '绿园路 5 号', lat: -33.88, lng: 151.198, paid: false, freeMinutes: 0, total: 40, available: 15 },
];

const STORAGE_KEY = 'parking-spots';
const LANG_KEY = 'app-language';

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => el.querySelectorAll(sel);

// 语言文本
const i18n = {
  zh: {
    appTitle: '车位地图',
    appTagline: '查找附近车位，可编辑付费/免费与时长',
    searchPlaceholder: '搜索地点或地址…',
    filterAll: '全部',
    filterFree: '仅免费',
    btnAddSpot: '+ 添加车位',
    panelTitle: '全部列表',
    editTitle: '编辑车位',
    addTitle: '添加车位',
    labelName: '名称',
    labelAddress: '地址',
    labelLat: '纬度',
    labelLng: '经度',
    labelPostal: '邮政编码',
    labelType: '类型',
    typeFree: '免费',
    typePaid: '付费',
    labelFreeDuration: '免费时长',
    labelTotal: '总车位数',
    labelAvailable: '当前空位',
    btnCancel: '取消',
    btnSave: '保存',
    legendAvailable: '有空位',
    legendOccupied: '已满',
    btnFitBoundsTitle: '缩放至全部标记',
    placeholderName: '如：商场地下停车场',
    placeholderAddress: '街道门牌',
    placeholderLat: '如 31.23 或 (31.23,121.47)',
    placeholderLng: '如 121.47',
    placeholderPostal: '如 200000',
    durationAllDay: '全天免费',
    duration15: '15 分钟',
    duration30: '30 分钟',
    duration60: '1 小时',
    duration120: '2 小时',
    duration180: '3 小时',
    paid: '付费',
    free: '免费',
    freeAllDay: '免费全天',
    minutes: '分钟',
    spaces: '空',
    full: '已满',
    errorInvalidCoords: '请填写有效的纬度和经度（纬度 -90～90，经度 -180～180）',
    errorGeolocationNotSupported: '您的浏览器不支持地理定位',
    errorGeolocationFailed: '无法获取位置，请检查权限',
    yourLocation: '您的位置',
    edit: '编辑',
  },
  en: {
    appTitle: 'Parking Map',
    appTagline: 'Find nearby parking spots, edit paid/free and duration',
    searchPlaceholder: 'Search location or address…',
    filterAll: 'All',
    filterFree: 'Free Only',
    btnAddSpot: '+ Add Spot',
    panelTitle: 'All Spots',
    editTitle: 'Edit Spot',
    addTitle: 'Add Spot',
    labelName: 'Name',
    labelAddress: 'Address',
    labelLat: 'Latitude',
    labelLng: 'Longitude',
    labelPostal: 'Postal Code',
    labelType: 'Type',
    typeFree: 'Free',
    typePaid: 'Paid',
    labelFreeDuration: 'Free Duration',
    labelTotal: 'Total Spaces',
    labelAvailable: 'Available Spaces',
    btnCancel: 'Cancel',
    btnSave: 'Save',
    legendAvailable: 'Available',
    legendOccupied: 'Full',
    btnFitBoundsTitle: 'Zoom to All Markers',
    placeholderName: 'e.g., Mall Underground Parking',
    placeholderAddress: 'Street address',
    placeholderLat: 'e.g., 31.23 or (31.23,121.47)',
    placeholderLng: 'e.g., 121.47',
    placeholderPostal: 'e.g., 200000',
    durationAllDay: 'All Day Free',
    duration15: '15 minutes',
    duration30: '30 minutes',
    duration60: '1 hour',
    duration120: '2 hours',
    duration180: '3 hours',
    paid: 'Paid',
    free: 'Free',
    freeAllDay: 'Free All Day',
    minutes: 'minutes',
    spaces: 'spaces',
    full: 'Full',
    errorInvalidCoords: 'Please enter valid latitude and longitude (lat: -90～90, lng: -180～180)',
    errorGeolocationNotSupported: 'Your browser does not support geolocation',
    errorGeolocationFailed: 'Failed to get location, please check permissions',
    yourLocation: 'Your Location',
    edit: 'Edit',
  },
};

let currentLang = localStorage.getItem(LANG_KEY) || 'zh';

let map = null;
let markerLayer = null;
let markers = [];
let currentFilter = 'all';
let spots = [];
let editingSpotId = null;

const mapEl = $('#map');
const searchInput = $('#search-input');
const spotListEl = $('#spot-list');
const panelEl = $('#panel');
const panelClose = $('#panel-close');
const btnLocate = $('#btn-locate');
const editModal = $('#edit-modal');
const editForm = $('#edit-form');
const editModalClose = $('#edit-modal-close');
const editCancel = $('#edit-cancel');
const freeDurationRow = $('#free-duration-row');
const btnAddSpot = $('#btn-add-spot');
const btnFitBounds = $('#btn-fit-bounds');
const btnLang = $('#btn-lang');

const DEFAULT_CENTER = [31.23, 121.47]; // 默认上海，首页会尽量展示所有标记
const DEFAULT_ZOOM = 12;

function loadSpots() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) spots = parsed;
      else spots = [...DEFAULT_SPOTS];
    } else spots = [...DEFAULT_SPOTS];
  } catch (_) {
    spots = [...DEFAULT_SPOTS];
  }
  // 兼容旧数据：无 paid/freeMinutes/postalCode 时补全
  spots = spots.map((s) => ({
    ...s,
    paid: s.paid != null ? s.paid : !(s.free === true),
    freeMinutes: s.freeMinutes != null ? s.freeMinutes : 0,
    postalCode: s.postalCode != null ? s.postalCode : '',
  }));
}

function saveSpots() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spots));
}

function initMap() {
  map = L.map('map').setView(DEFAULT_CENTER, DEFAULT_ZOOM);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19,
  }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);
  addSpotMarkers(getFilteredSpots());
  renderSpotList(getFilteredSpots());
  fitMapToMarkers();

  // 布局稳定后重新计算地图尺寸，确保点击有效
  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 100);
}

function getFilteredSpots() {
  if (currentFilter === 'free') {
    return spots.filter((s) => !s.paid && s.available > 0);
  }
  return [...spots];
}

function t(key) {
  return i18n[currentLang][key] || key;
}

function spotLabel(spot) {
  const hasSpace = spot.available > 0;
  if (spot.paid) {
    return hasSpace ? `${t('paid')} · ${t('spaces')} ${spot.available}` : `${t('paid')} · ${t('full')}`;
  }
  if (spot.freeMinutes === 0) {
    return hasSpace ? `${t('freeAllDay')} · ${t('spaces')} ${spot.available}` : `${t('freeAllDay')} · ${t('full')}`;
  }
  const label = `${t('free')}${spot.freeMinutes}${t('minutes')}`;
  return hasSpace ? `${label} · ${t('spaces')} ${spot.available}` : `${label} · ${t('full')}`;
}

function spotColor(spot) {
  if (spot.available > 0) return '#f0883e'; // 有空位：橙色
  return '#f85149'; // 已满：红色
}

function addSpotMarkers(spotList) {
  if (markerLayer) markerLayer.clearLayers();
  markers = [];

  spotList.forEach((spot) => {
    const color = spotColor(spot);
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<span style="
        width: 20px; height: 20px;
        background: ${color};
        border: 2px solid #fff;
        border-radius: 50%;
        display: block;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></span>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const popupContent = `
      <div class="popup-title">${escapeHtml(spot.name)}</div>
      <div class="popup-meta">${escapeHtml(spot.address || '')}${spot.postalCode ? ' · ' + escapeHtml(spot.postalCode) : ''}</div>
      <div class="popup-meta">${escapeHtml(spotLabel(spot))}</div>
      <button type="button" class="popup-edit-btn">${t('edit')}</button>
    `;
    const marker = L.marker([spot.lat, spot.lng], { icon })
      .addTo(markerLayer)
      .bindPopup(popupContent);

    marker.spot = spot;
    marker.on('click', () => {
      map.panTo([spot.lat, spot.lng]);
      panelEl.classList.add('open');
      highlightSpotInList(spot.id);
    });
    marker.on('popupopen', () => {
      const btn = marker.getPopup().getElement().querySelector('.popup-edit-btn');
      if (btn) btn.addEventListener('click', () => { openEditModal(spot.id); marker.closePopup(); });
    });
    markers.push(marker);
  });
}

function fitMapToMarkers() {
  if (!map || !markers.length) return;
  const group = L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.1));
}

function zoomToAllMarkers() {
  if (!markers.length) return;
  fitMapToMarkers();
}

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderSpotList(spotList) {
  const filtered = currentFilter === 'free' ? spotList.filter((s) => !s.paid && s.available > 0) : spotList;

  spotListEl.innerHTML = filtered
    .map(
      (spot) => `
    <li class="spot-item" data-id="${spot.id}">
      <span class="spot-dot ${spot.available > 0 ? 'available' : 'occupied'}"></span>
      <div class="spot-info">
        <div class="spot-name">${escapeHtml(spot.name)}</div>
        <div class="spot-meta">${escapeHtml(spot.address || '')}${spot.postalCode ? ' ' + escapeHtml(spot.postalCode) : ''} · ${spotLabel(spot)}</div>
      </div>
      <button type="button" class="spot-edit-btn" data-id="${spot.id}" aria-label="编辑">✎</button>
    </li>
  `
    )
    .join('');

  spotListEl.querySelectorAll('.spot-item').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.spot-edit-btn')) return;
      const spot = spots.find((s) => s.id === el.dataset.id);
      if (spot && map) {
        map.panTo([spot.lat, spot.lng]);
        map.setZoom(16);
        highlightSpotInList(spot.id);
      }
    });
  });

  spotListEl.querySelectorAll('.spot-edit-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(btn.dataset.id);
    });
  });
}

function highlightSpotInList(spotId) {
  spotListEl.querySelectorAll('.spot-item').forEach((el) => el.classList.remove('highlight'));
  const el = spotListEl.querySelector(`[data-id="${spotId}"]`);
  if (el) {
    el.classList.add('highlight');
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

function applyFilter() {
  const filtered = getFilteredSpots();
  addSpotMarkers(filtered);
  renderSpotList(filtered);
}

function searchSpots(keyword) {
  const k = (keyword || '').trim().toLowerCase();
  if (!k) {
    applyFilter();
    return;
  }
  const filtered = getFilteredSpots().filter(
    (s) =>
      (s.name && s.name.toLowerCase().includes(k)) ||
      (s.address && s.address.toLowerCase().includes(k)) ||
      (s.postalCode && s.postalCode.toString().includes(k))
  );
  addSpotMarkers(filtered);
  renderSpotList(filtered);
}

function openEditModal(spotId) {
  editingSpotId = spotId;
  const spot = spotId ? spots.find((s) => s.id === spotId) : null;

  $('#edit-modal-title').textContent = spot ? t('editTitle') : t('addTitle');
  $('#edit-id').value = spot ? spot.id : '';
  $('#edit-name').value = spot ? spot.name : '';
  $('#edit-address').value = spot ? (spot.address || '') : '';
  $('#edit-postal').value = spot ? (spot.postalCode || '') : '';
  $('#edit-lat').value = spot ? String(spot.lat) : '';
  $('#edit-lng').value = spot ? String(spot.lng) : '';
  $('#edit-total').value = spot ? spot.total : 50;
  $('#edit-available').value = spot ? spot.available : 10;

  const isFree = spot ? !spot.paid : true;
  const freeMinutes = spot ? (spot.freeMinutes != null ? spot.freeMinutes : 0) : 0;

  $$('input[name="edit-type"]').forEach((r) => {
    r.checked = (r.value === 'free' && isFree) || (r.value === 'paid' && !isFree);
  });
  $('#edit-free-minutes').value = String(freeMinutes);
  freeDurationRow.classList.toggle('hidden', !isFree);

  editModal.classList.add('open');
  editModal.setAttribute('aria-hidden', 'false');
  $('#edit-name').focus();
}

function closeEditModal() {
  editModal.classList.remove('open');
  editModal.setAttribute('aria-hidden', 'true');
  editingSpotId = null;
}

function toggleFreeDurationVisibility() {
  const isFree = $('input[name="edit-type"]:checked').value === 'free';
  freeDurationRow.classList.toggle('hidden', !isFree);
}

function parseCoordPair(input) {
  // 解析 (lat,lng) 格式，如 (31.23,121.47) 或 (33,123)
  const match = String(input).trim().match(/^\s*\(?\s*([+-]?\d+\.?\d*)\s*[,，]\s*([+-]?\d+\.?\d*)\s*\)?\s*$/);
  if (match) {
    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2]),
    };
  }
  return null;
}

function parseCoord(val, min, max) {
  const n = parseFloat(String(val).trim().replace(',', '.'));
  if (Number.isNaN(n) || n < min || n > max) return null;
  return n;
}

function submitEdit(e) {
  e.preventDefault();
  const id = $('#edit-id').value.trim();
  const name = $('#edit-name').value.trim();
  if (!name) return;
  
  // 尝试解析 (lat,lng) 格式
  const latInput = $('#edit-lat').value.trim();
  const lngInput = $('#edit-lng').value.trim();
  let lat, lng;
  
  const pair = parseCoordPair(latInput);
  if (pair) {
    lat = pair.lat;
    lng = pair.lng;
    // 自动填充到经度输入框
    $('#edit-lng').value = String(lng);
  } else {
    lat = parseCoord(latInput, -90, 90);
    lng = parseCoord(lngInput, -180, 180);
  }
  
  if (lat === null || lng === null) {
    alert(t('errorInvalidCoords'));
    return;
  }
  const address = $('#edit-address').value.trim();
  const postalCode = $('#edit-postal').value.trim();
  const type = $('input[name="edit-type"]:checked').value;
  const paid = type === 'paid';
  const freeMinutes = paid ? 0 : parseInt($('#edit-free-minutes').value, 10) || 0;
  const total = Math.max(1, parseInt($('#edit-total').value, 10) || 1);
  const available = Math.max(0, Math.min(total, parseInt($('#edit-available').value, 10) || 0));

  if (id) {
    const spot = spots.find((s) => s.id === id);
    if (spot) {
      spot.name = name;
      spot.address = address;
      spot.postalCode = postalCode;
      spot.lat = lat;
      spot.lng = lng;
      spot.paid = paid;
      spot.freeMinutes = freeMinutes;
      spot.total = total;
      spot.available = available;
    }
  } else {
    spots.push({
      id: crypto.randomUUID(),
      name,
      address,
      postalCode,
      lat,
      lng,
      paid,
      freeMinutes,
      total,
      available,
    });
  }

  saveSpots();
  closeEditModal();
  applyFilter();
  fitMapToMarkers();
  panelEl.classList.add('open');
}

function locateUser() {
  if (!navigator.geolocation) {
    alert(t('errorGeolocationNotSupported'));
    return;
  }
  btnLocate.textContent = '…';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      map.panTo([lat, lng]);
      map.setZoom(15);
      L.marker([lat, lng]).addTo(map).bindPopup(t('yourLocation'));
      btnLocate.textContent = '📍';
    },
    () => {
      alert(t('errorGeolocationFailed'));
      btnLocate.textContent = '📍';
    }
  );
}

function updateI18n() {
  document.documentElement.lang = currentLang;
  $$('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key && i18n[currentLang][key]) {
      el.textContent = i18n[currentLang][key];
    }
  });
  $$('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && i18n[currentLang][key]) {
      el.placeholder = i18n[currentLang][key];
    }
  });
  $$('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (key && i18n[currentLang][key]) {
      el.title = i18n[currentLang][key];
    }
  });
  // 更新 select options
  $$('#edit-free-minutes option').forEach((opt) => {
    const key = opt.getAttribute('data-i18n');
    if (key && i18n[currentLang][key]) {
      opt.textContent = i18n[currentLang][key];
    }
  });
  // 更新语言按钮
  if (btnLang) btnLang.textContent = currentLang === 'zh' ? 'EN' : '中文';
  // 重新渲染列表和标记（因为标签文本变化）
  applyFilter();
}

function toggleLanguage() {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  localStorage.setItem(LANG_KEY, currentLang);
  updateI18n();
}

function bindEvents() {
  $$('.filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.filter').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applyFilter();
    });
  });

  searchInput.addEventListener('input', () => searchSpots(searchInput.value));
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') searchInput.value = '';
  });

  panelClose.addEventListener('click', () => panelEl.classList.remove('open'));
  btnLocate.addEventListener('click', locateUser);
  if (btnFitBounds) btnFitBounds.addEventListener('click', zoomToAllMarkers);
  if (btnLang) btnLang.addEventListener('click', toggleLanguage);

  btnAddSpot.addEventListener('click', () => openEditModal(null));

  $$('input[name="edit-type"]').forEach((r) => r.addEventListener('change', toggleFreeDurationVisibility));

  editForm.addEventListener('submit', submitEdit);
  editModalClose.addEventListener('click', closeEditModal);
  editCancel.addEventListener('click', closeEditModal);
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
  });
  
  // 监听纬度输入框，支持 (lat,lng) 格式
  const latInput = $('#edit-lat');
  if (latInput) {
    latInput.addEventListener('blur', () => {
      const val = latInput.value.trim();
      const pair = parseCoordPair(val);
      if (pair) {
        latInput.value = String(pair.lat);
        $('#edit-lng').value = String(pair.lng);
      }
    });
  }
}

function initApp() {
  loadSpots();
  bindEvents();
  initMap(); // 必须先初始化地图，否则 updateI18n -> applyFilter -> addSpotMarkers 会因 markerLayer 为 null 报错
  updateI18n();
}

document.addEventListener('DOMContentLoaded', initApp);
