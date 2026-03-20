// ===== DATA =====
const cityData = {
  haridwar: {
    name: "Haridwar", wqi: 84, status: "safe", statusLabel: "Safe",
    predicted: "Stable – Good quality expected", predictedWQI: 85,
    nitrate: 1.2, bod: 1.8, turbidity: 4.5, ph: 7.4,
    desc: "Upstream clean zone. Glacial inflow dominant.",
    insight: "Haridwar shows stable clean water. Glacial meltwater dominance. No industrial threat detected."
  },
  kanpur: {
    name: "Kanpur", wqi: 54, status: "moderate", statusLabel: "Alert",
    predicted: "Worsening – Industrial effluent rising", predictedWQI: 46,
    nitrate: 8.7, bod: 12.4, turbidity: 28.6, ph: 6.8,
    desc: "Major tannery discharge zone. Nitrate rising.",
    insight: "Model detects 12% increase in industrial effluent. Tannery discharge correlates with BOD spike. Intervention recommended."
  },
  prayagraj: {
    name: "Prayagraj", wqi: 66, status: "moderate", statusLabel: "Moderate",
    predicted: "Slight improvement in 3 days", predictedWQI: 70,
    nitrate: 5.4, bod: 7.2, turbidity: 18.3, ph: 7.1,
    desc: "Confluence point. Yamuna impact visible.",
    insight: "Yamuna confluence adding nutrient load. Seasonal variation detected. Models predict 6% improvement post-monsoon."
  },
  varanasi: {
    name: "Varanasi", wqi: 48, status: "polluted", statusLabel: "Alert",
    predicted: "Critical – Spike in 48 hours", predictedWQI: 38,
    nitrate: 12.1, bod: 18.6, turbidity: 42.7, ph: 6.5,
    desc: "High sewage + ghats runoff. Critical zone.",
    insight: "LSTM model detects anomalous sewage surge. Combined sewer overflow risk HIGH. Authorities alerted. 48-hour intervention window."
  },
  patna: {
    name: "Patna", wqi: 62, status: "moderate", statusLabel: "Moderate",
    predicted: "Improving – Rain dilution expected", predictedWQI: 68,
    nitrate: 6.8, bod: 9.1, turbidity: 21.4, ph: 7.0,
    desc: "Urban runoff + inland drainage.",
    insight: "Monsoon dilution effect forecasted. Industrial load stable. Urban runoff primary concern this week."
  }
};

const allAlerts = [
  { level: "high", icon: "🔴", title: "Pollution spike expected in Varanasi", desc: "LSTM model predicts a critical pollution surge in the Varanasi reach within 48 hours. Combined sewer overflow likely. Immediate intervention recommended.", meta: "Station: Varanasi • ETA: 48 hours • Confidence: 94%", time: "Just now" },
  { level: "high", icon: "🔴", title: "Nitrate levels rising in Kanpur", desc: "Sustained increase in nitrate concentrations detected at Kanpur monitoring station. Tannery discharge 18% above seasonal norm.", meta: "Station: Kanpur • Trend: +18% over 6hrs • Source: Tannery cluster", time: "12 min ago" },
  { level: "medium", icon: "🟡", title: "BOD elevation in Prayagraj", desc: "Biochemical Oxygen Demand elevated at Prayagraj junction. Yamuna tributary contributing additional nutrient load.", meta: "Station: Prayagraj • BOD: 7.2 mg/L (threshold: 6.0) ", time: "34 min ago" },
  { level: "medium", icon: "🟡", title: "Turbidity surge – Haridwar upstream", desc: "Unusual turbidity increase detected upstream of Haridwar. Possible hill runoff event. Monitoring active.", meta: "Station: Haridwar upstream • Turbidity: 31 NTU", time: "1 hr ago" },
  { level: "low", icon: "🟢", title: "Patna station: water quality improving", desc: "Monsoon dilution effect observed. WQI trending upward. No immediate action required.", meta: "Station: Patna • WQI: 62 → 68 (projected 3-day)", time: "2 hrs ago" }
];

const stationsInfo = Object.values(cityData);

// ===== CHARTS =====
let forecastChart = null;
let simChart = null;
let activeCity = null;
let showForecast = false;

const labels7Day = ["Day -4", "Day -3", "Day -2", "Day -1", "Today", "Day +1", "Day +2", "Day +3", "Day +4", "Day +5"];

function getChartData(city, forecast) {
  const d = cityData[city] || cityData.varanasi;
  const base = d.wqi;
  const current = [base+8, base+4, base+3, base-2, base, null, null, null, null, null];
  const predicted = [null, null, null, null, base, base + (Math.random()*6-8), d.predictedWQI, d.predictedWQI-2, d.predictedWQI+1, d.predictedWQI-1];
  if (forecast) {
    return { current, predicted };
  }
  return { current, predicted: [null, null, null, null, null, null, null, null, null, null] };
}

function initForecastChart() {
  const ctx = document.getElementById('forecastChart').getContext('2d');
  const city = activeCity || 'varanasi';
  const data = getChartData(city, showForecast);
  forecastChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels7Day,
      datasets: [
        {
          label: 'Current WQI',
          data: data.current,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0,212,255,0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#00d4ff',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4,
          spanGaps: false
        },
        {
          label: 'AI Predicted WQI',
          data: data.predicted,
          borderColor: '#00ff88',
          backgroundColor: 'rgba(0,255,136,0.06)',
          borderWidth: 2.5,
          borderDash: [6, 4],
          pointBackgroundColor: '#00ff88',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4,
          spanGaps: false
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeInOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(6,14,26,0.95)',
          borderColor: 'rgba(0,212,255,0.3)',
          borderWidth: 1,
          titleColor: '#00d4ff',
          bodyColor: '#e8f4fd',
          cornerRadius: 10,
          padding: 12
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#4a7a9b', font: { size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#4a7a9b', font: { size: 10 } },
          min: 20, max: 100
        }
      }
    }
  });
}

function updateForecastChart(city, forecast) {
  if (!forecastChart) return;
  const data = getChartData(city, forecast);
  forecastChart.data.datasets[0].data = data.current;
  forecastChart.data.datasets[1].data = data.predicted;
  forecastChart.update();
}

// ===== SIM CHART =====
function initSimChart() {
  const ctx = document.getElementById('simChart');
  if (!ctx) return;
  simChart = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels: ['Today', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
      datasets: [
        {
          label: 'Baseline WQI',
          data: [72, 70, 68, 66, 67, 69],
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0,212,255,0.08)',
          borderWidth: 2, fill: true, tension: 0.4,
          pointBackgroundColor: '#00d4ff', borderDash: [5,3]
        },
        {
          label: 'Simulated WQI',
          data: [72, 68, 64, 60, 62, 65],
          borderColor: '#00ff88',
          backgroundColor: 'rgba(0,255,136,0.06)',
          borderWidth: 2.5, fill: true, tension: 0.4,
          pointBackgroundColor: '#00ff88'
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 600 },
      plugins: {
        legend: {
          display: true,
          labels: { color: '#7fb3d3', font: { size: 11 }, usePointStyle: true }
        },
        tooltip: {
          backgroundColor: 'rgba(6,14,26,0.95)',
          borderColor: 'rgba(0,212,255,0.3)',
          borderWidth: 1,
          titleColor: '#00d4ff', bodyColor: '#e8f4fd',
          cornerRadius: 10, padding: 12
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a7a9b' } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a7a9b' }, min: 20, max: 100 }
      }
    }
  });
}

function updateSimChart(rainfall, flow, discharge) {
  if (!simChart) return;
  const factor = (rainfall/100 * 0.4) + (discharge/100 * 0.4) + ((100-flow)/100 * 0.2);
  const base = 72 - factor * 30;
  const sim = [
    base,
    base - factor * 3,
    base - factor * 6,
    base - factor * 8,
    base - factor * 7,
    base - factor * 5
  ].map(v => Math.max(20, Math.min(100, Math.round(v * 10)/10)));
  simChart.data.datasets[1].data = sim;
  simChart.update();
  // update projected WQI
  const proj = sim[3];
  const projEl = document.getElementById('projWQI');
  if (projEl) projEl.textContent = proj.toFixed(1);
  const riskEl = document.getElementById('projRisk');
  if (riskEl) {
    if (proj >= 75) { riskEl.textContent = 'Low'; riskEl.className = 'summary-val'; riskEl.style.color = '#00ff88'; }
    else if (proj >= 55) { riskEl.textContent = 'Medium'; riskEl.className = 'summary-val risk-medium'; riskEl.style.color = ''; }
    else { riskEl.textContent = 'High'; riskEl.className = 'summary-val'; riskEl.style.color = '#ff4757'; }
  }
  const confEl = document.getElementById('projConf');
  if (confEl) confEl.textContent = (85 + Math.random()*8).toFixed(0) + '%';
}

// ===== TABS =====
function switchTab(tabId) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');
  document.getElementById('panel-' + tabId).classList.add('active');
  if (tabId === 'forecast') { setTimeout(initSimChart, 100); }
  if (tabId === 'alerts') renderFullAlerts();
  if (tabId === 'map') renderStations();
}

document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

// ===== MAP MARKERS =====
function setMarkerHoverFix() {
  // Adjust transform-origin for marker:hover scaling
  const markers = {
    'marker-haridwar': 'translate(130px, 155px)',
    'marker-kanpur': 'translate(310px, 165px)',
    'marker-prayagraj': 'translate(420px, 175px)',
    'marker-varanasi': 'translate(530px, 190px)',
    'marker-patna': 'translate(640px, 198px)',
  };
}

document.querySelectorAll('.map-marker').forEach(marker => {
  marker.addEventListener('click', (e) => {
    const city = marker.dataset.city;
    selectCity(city, marker);
  });
});

function selectCity(city, markerEl) {
  activeCity = city;
  const d = cityData[city];
  const popup = document.getElementById('markerPopup');

  document.getElementById('popupCity').textContent = d.name;
  const statusEl = document.getElementById('popupStatus');
  statusEl.textContent = d.statusLabel;
  statusEl.className = 'popup-status ' + d.status;

  const wqiPct = (d.wqi / 100) * 100 + '%';
  const fillEl = document.getElementById('popupWQIFill');
  const colorMap = { safe: '#00ff88', moderate: '#ffd700', polluted: '#ff4757' };
  fillEl.style.background = colorMap[d.status] || '#00d4ff';
  fillEl.style.width = wqiPct;
  document.getElementById('popupWQI').textContent = d.wqi;

  const qualityMap = { safe: 'Good Quality', moderate: 'Slightly Impaired', polluted: 'Highly Polluted' };
  document.getElementById('popupQuality').textContent = qualityMap[d.status];
  document.getElementById('popupPredicted').textContent = 'Predicted: ' + d.predicted;

  popup.classList.add('visible');

  // Update forecast chart
  updateForecastChart(city, showForecast);
  // Update AI insight
  document.getElementById('insightText').textContent = d.insight;

  // Update alerts
  updateAlertsForCity(city);
}

function updateAlertsForCity(city) {
  const d = cityData[city];
  const list = document.getElementById('alertsList');
  if (!list) return;
  if (d.status === 'polluted') {
    list.innerHTML = `
      <div class="alert-item alert-high" style="animation-delay:0s">
        <div class="alert-icon">⚠</div>
        <div class="alert-body">
          <div class="alert-title">Critical: Pollution spike in ${d.name}</div>
          <div class="alert-meta">ETA: 24-48 hours • WQI: ${d.wqi} → ${d.predictedWQI}</div>
          <button class="action-btn" onclick="takeAction('${city}-critical')">Take Action</button>
        </div>
      </div>
      <div class="alert-item alert-high" style="animation-delay:0.1s">
        <div class="alert-icon">☣</div>
        <div class="alert-body">
          <div class="alert-title">BOD levels critical at ${d.name}</div>
          <div class="alert-meta">BOD: ${d.bod} mg/L • Threshold: 6.0 mg/L</div>
          <button class="action-btn" onclick="takeAction('${city}-bod')">Take Action</button>
        </div>
      </div>`;
  } else if (d.status === 'moderate') {
    list.innerHTML = `
      <div class="alert-item alert-medium" style="animation-delay:0s">
        <div class="alert-icon">⚠</div>
        <div class="alert-body">
          <div class="alert-title">Moderate risk at ${d.name}</div>
          <div class="alert-meta">Nitrate: ${d.nitrate} mg/L • Monitoring active</div>
          <button class="action-btn" onclick="takeAction('${city}-moderate')">Take Action</button>
        </div>
      </div>`;
  } else {
    list.innerHTML = `
      <div class="alert-item alert-low" style="animation-delay:0s">
        <div class="alert-icon">✅</div>
        <div class="alert-body">
          <div class="alert-title">${d.name}: Water quality normal</div>
          <div class="alert-meta">WQI: ${d.wqi} • All parameters within safe limits</div>
        </div>
      </div>`;
  }
}

// Close popup on map click
document.getElementById('mapContainer').addEventListener('click', (e) => {
  if (!e.target.closest('.map-marker')) {
    document.getElementById('markerPopup').classList.remove('visible');
  }
});

// ===== ALERTS PAGE =====
function renderFullAlerts() {
  const list = document.getElementById('fullAlertsList');
  if (!list) return;
  list.innerHTML = '';
  allAlerts.forEach((alert, i) => {
    const div = document.createElement('div');
    div.className = `full-alert-card ${alert.level}`;
    div.style.animationDelay = (i * 0.1) + 's';
    div.innerHTML = `
      <div class="fac-icon">${alert.icon}</div>
      <div class="fac-body">
        <div class="fac-title">${alert.title}</div>
        <div class="fac-desc">${alert.desc}</div>
        <div class="fac-meta">${alert.meta}</div>
      </div>
      <div class="fac-time">${alert.time}</div>`;
    list.appendChild(div);
  });
}

// ===== STATIONS PAGE =====
function renderStations() {
  const grid = document.getElementById('stationsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const colorMap = { safe: '#00ff88', moderate: '#ffd700', polluted: '#ff4757' };
  stationsInfo.forEach((s, i) => {
    const color = colorMap[s.status];
    const div = document.createElement('div');
    div.className = 'station-card';
    div.style.animationDelay = (i * 0.08) + 's';
    div.style.animation = 'fadeIn 0.4s ease both';
    div.style.borderLeft = `3px solid ${color}`;
    div.innerHTML = `
      <div class="station-name" style="color:${color}">${s.name}</div>
      <div class="station-wqi" style="color:${color}">${s.wqi}</div>
      <div class="station-meta">${s.desc}</div>
      <div class="station-bar"><div class="station-bar-fill" style="width:${s.wqi}%;background:${color}"></div></div>
      <div class="station-params">
        <div class="station-param"><div class="param-name">Nitrate (mg/L)</div><div class="param-val">${s.nitrate}</div></div>
        <div class="station-param"><div class="param-name">BOD (mg/L)</div><div class="param-val">${s.bod}</div></div>
        <div class="station-param"><div class="param-name">Turbidity (NTU)</div><div class="param-val">${s.turbidity}</div></div>
        <div class="station-param"><div class="param-name">pH</div><div class="param-val">${s.ph}</div></div>
      </div>`;
    grid.appendChild(div);
  });
}

// ===== FORECAST TOGGLE =====
document.getElementById('btnCurrent').addEventListener('click', function() {
  this.classList.add('active');
  document.getElementById('btnForecast').classList.remove('active');
  showForecast = false;
  updateForecastChart(activeCity || 'varanasi', false);
});
document.getElementById('btnForecast').addEventListener('click', function() {
  this.classList.add('active');
  document.getElementById('btnCurrent').classList.remove('active');
  showForecast = true;
  updateForecastChart(activeCity || 'varanasi', true);
});

// ===== SIMULATOR SLIDERS =====
function setupDashboardSliders() {
  const rs = document.getElementById('rainfallSlider');
  const fs = document.getElementById('flowSlider');
  const ds = document.getElementById('dischargeSlider');
  if (!rs) return;

  function updateImpact() {
    const r = parseInt(rs.value), f = parseInt(fs.value), d = parseInt(ds.value);
    document.getElementById('rainfallVal').textContent = `+${Math.round(r*0.6)} mm/h`;
    document.getElementById('flowVal').textContent = `${Math.round(500 + f*20).toLocaleString()} m³/s`;
    const dLabels = ['Low','Low-Med','Medium','Med-High','High'];
    document.getElementById('dischargeVal').textContent = dLabels[Math.floor(d/25)] || 'High';
    const factor = (r + d) / 200;
    const heights = [40+factor*20, 55+factor*25, 70+factor*20, 60+factor*25, 45+factor*20].map(h => Math.min(h, 95));
    ['impactB1','impactB2','impactB3','impactB4','impactB5'].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) {
        const h = heights[i];
        el.style.height = h + '%';
        if (h > 70) el.style.background = 'linear-gradient(180deg, #ff4757, rgba(255,71,87,0.3))';
        else if (h > 55) el.style.background = 'linear-gradient(180deg, #ffd700, rgba(255,215,0,0.3))';
        else el.style.background = 'linear-gradient(180deg, #00d4ff, rgba(0,212,255,0.3))';
      }
    });
    const impact = -(r * 0.08 + d * 0.06).toFixed(1);
    const rv = document.getElementById('simResultVal');
    if (rv) {
      rv.textContent = impact + ' points';
      rv.style.color = impact < -5 ? '#ff4757' : impact < -2 ? '#ffd700' : '#00ff88';
    }
  }

  rs.addEventListener('input', updateImpact);
  fs.addEventListener('input', updateImpact);
  ds.addEventListener('input', updateImpact);
}

function setupForecastSliders() {
  const rf = document.getElementById('f-rainfallSlider');
  const ff = document.getElementById('f-flowSlider');
  const df = document.getElementById('f-dischargeSlider');
  const sf = document.getElementById('f-sewageSlider');
  if (!rf) return;

  function update() {
    const r = parseInt(rf.value), f = parseInt(ff.value), d = parseInt(df.value), s = parseInt(sf.value);
    document.getElementById('f-rainfallVal').textContent = r;
    document.getElementById('f-flowVal').textContent = f.toLocaleString();
    document.getElementById('f-dischargeVal').textContent = d;
    document.getElementById('f-sewageVal').textContent = s;
    updateSimChart(r/150*100, f/5000*100, d);
  }

  [rf, ff, df, sf].forEach(el => el && el.addEventListener('input', update));
  document.getElementById('runSimBtn')?.addEventListener('click', () => {
    document.getElementById('runSimBtn').textContent = '⟳ Running...';
    setTimeout(() => { update(); document.getElementById('runSimBtn').textContent = '▶ Run Simulation'; }, 800);
  });
}

// ===== MODAL =====
function takeAction(type) {
  const modal = document.getElementById('modalOverlay');
  const title = document.getElementById('modalTitle');
  const labels = {
    'varanasi-spike': 'Emergency Response: Varanasi Pollution Spike',
    'kanpur-nitrate': 'Response Plan: Kanpur Nitrate Alert',
    'varanasi-critical': 'Critical Action: Varanasi Crisis Response',
    'kanpur-bod': 'Action Plan: Kanpur BOD Mitigation'
  };
  title.textContent = labels[type] || 'Initiating Emergency Response';
  modal.classList.add('open');
}
document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('modalOverlay').classList.remove('open');
});
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});

// ===== DYNAMIC KPI ANIMATION =====
function animateKPI(elementId, targetValue, isPercent = false, prefix = '', suffix = '') {
  const el = document.getElementById(elementId);
  if (!el) return;
  const start = parseFloat(el.textContent) || 0;
  const duration = 1500;
  const startTime = Date.now();
  const frame = () => {
    const progress = Math.min((Date.now() - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (targetValue - start) * eased;
    el.textContent = prefix + current.toFixed(isPercent ? 0 : 1) + suffix;
    if (progress < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// ===== REAL-TIME SIMULATION =====
let alertInterval;
function startRealTimeAlerts() {
  const dynamicAlerts = [
    { level: 'high', icon: '⚠', title: 'Pollution spike expected in Varanasi in 48 hours', meta: 'ETA: 48h • WQI dropping to critical levels' },
    { level: 'medium', icon: '⚠', title: 'Nitrate levels rising in Kanpur', meta: 'Nitrate: 8.7 mg/L • Trend: ↑ 18%' },
    { level: 'medium', icon: '⚠', title: 'BOD increase detected at Prayagraj', meta: 'BOD: 7.2 mg/L • Above 6.0 threshold' },
    { level: 'high', icon: '🔴', title: 'River flow surge detected – Haridwar', meta: 'Flow: 2,800 m³/s • Flood risk: Low' },
    { level: 'low', icon: '✅', title: 'Patna water quality within safe range', meta: 'WQI: 62 • All parameters normal' }
  ];
  let idx = 0;
  setTimeout(addNewAlert, 3000);
  function addNewAlert() {
    const a = dynamicAlerts[idx % dynamicAlerts.length];
    idx++;
    const list = document.getElementById('alertsList');
    if (list && document.getElementById('panel-dashboard').classList.contains('active')) {
      const div = document.createElement('div');
      div.className = `alert-item alert-${a.level}`;
      div.innerHTML = `
        <div class="alert-icon">${a.icon}</div>
        <div class="alert-body">
          <div class="alert-title">${a.title}</div>
          <div class="alert-meta">${a.meta}</div>
          <button class="action-btn" onclick="takeAction('dynamic-${idx}')">Take Action</button>
        </div>`;
      list.insertBefore(div, list.firstChild);
      if (list.children.length > 4) list.removeChild(list.lastChild);
      // Update badge
      const badge = document.getElementById('notifBadge');
      if (badge) badge.textContent = Math.min(9, parseInt(badge.textContent) + 1);
      const alertCount = document.getElementById('alert-count');
      if (alertCount) {
        const curr = parseInt(alertCount.textContent) + 1;
        alertCount.textContent = Math.min(9, curr);
      }
    }
    setTimeout(addNewAlert, 4000 + Math.random() * 3000);
  }
}

// ===== KPI LIVE UPDATES =====
function startKPIUpdates() {
  setInterval(() => {
    // WQI small fluctuation
    const wqiEl = document.getElementById('wqi-value');
    if (wqiEl) {
      const curr = parseFloat(wqiEl.textContent);
      const next = Math.max(60, Math.min(85, curr + (Math.random() - 0.5) * 1.5));
      wqiEl.textContent = next.toFixed(1);
    }
    // Confidence fluctuation
    const confEl = document.getElementById('conf-value');
    const confFill = document.getElementById('confFill');
    if (confEl) {
      const curr = parseInt(confEl.textContent);
      const next = Math.max(88, Math.min(97, curr + Math.round((Math.random()-0.5)*2)));
      confEl.textContent = next + '%';
      if (confFill) confFill.style.width = next + '%';
    }
  }, 3500);
}

// ===== FUSION ANIMATION (CSS fallback, pure DOM) =====
function setupFusion() {
  const inputs = [
    document.getElementById('fusIn1'),
    document.getElementById('fusIn2'),
    document.getElementById('fusIn3')
  ];
  let i = 0;
  setInterval(() => {
    inputs.forEach(el => el && el.classList.remove('active'));
    if (inputs[i]) inputs[i].classList.add('active');
    i = (i + 1) % 3;
  }, 1200);
}

// Add fusion layout inline to fix positioning
function layoutFusion() {
  const card = document.querySelector('.fusion-card');
  if (!card) return;
  const vis = document.getElementById('fusionVisual');
  if (!vis) return;
  vis.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:0.5rem;margin-bottom:1rem">
      <div class="fusion-input" id="fusIn1"><div class="fusion-icon">🛰️</div><div class="fusion-label">Satellite</div></div>
      <div class="fusion-input" id="fusIn2"><div class="fusion-icon">📡</div><div class="fusion-label">IoT Sensors</div></div>
      <div class="fusion-input" id="fusIn3"><div class="fusion-icon">🌦️</div><div class="fusion-label">Weather</div></div>
    </div>
    <div style="display:flex;align-items:center;gap:0.5rem;justify-content:center;margin-bottom:1rem">
      <div style="flex:1;height:2px;background:linear-gradient(90deg,transparent,#00d4ff);border-radius:2px"></div>
      <span style="color:#00d4ff;font-size:0.75rem">→→→</span>
      <div class="fusion-engine" style="width:70px;height:70px;border-radius:50%;background:radial-gradient(circle,rgba(0,212,255,0.2),rgba(0,212,255,0.05));border:2px solid #00d4ff;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(0,212,255,0.4);animation:engine-pulse 2s ease-in-out infinite">
        <span style="font-size:1.4rem">⚡</span>
        <span style="font-size:0.6rem;color:#00d4ff;font-weight:700">AI Core</span>
      </div>
      <span style="color:#00ff88;font-size:0.75rem">→→→</span>
      <div style="flex:1;height:2px;background:linear-gradient(90deg,#00ff88,transparent);border-radius:2px"></div>
    </div>
    <div style="display:flex;gap:0.6rem;justify-content:center">
      <div class="fusion-output">📊 Prediction</div>
      <div class="fusion-output">🔔 Alerts</div>
      <div class="fusion-output">📈 Reports</div>
    </div>`;
  setupFusion();
}

// ===== MAP BUTTONS =====
document.getElementById('btnTelemetry').addEventListener('click', function() {
  this.classList.add('active');
  document.getElementById('btnSatellite').classList.remove('active');
});
document.getElementById('btnSatellite').addEventListener('click', function() {
  this.classList.add('active');
  document.getElementById('btnTelemetry').classList.remove('active');
  // Toggle map appearance
  const svg = document.getElementById('riverSVG');
  if (svg) svg.style.filter = svg.style.filter ? '' : 'sepia(0.3) hue-rotate(180deg)';
});

// ===== EXPORT BUTTON =====
document.getElementById('exportBtn').addEventListener('click', function() {
  this.textContent = '⟳ GENERATING REPORT...';
  this.style.color = '#00ff88';
  setTimeout(() => {
    this.textContent = '✓ REPORT READY - EXPORT DEEP ANALYTICS';
    setTimeout(() => { this.textContent = 'EXPORT DEEP ANALYTICS'; this.style.color = ''; }, 2000);
  }, 1500);
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Animate KPIs on load
  setTimeout(() => animateKPI('wqi-value', 72.4), 300);
  setTimeout(() => animateKPI('conf-value', 92, true, '', '%'), 400);
  setTimeout(() => animateKPI('alert-count', 3, true), 500);

  // Init charts
  setTimeout(() => initForecastChart(), 200);

  // Setup sliders
  setupDashboardSliders();
  setTimeout(setupForecastSliders, 500);

  // Fusion layout
  layoutFusion();

  // Start simulations
  startRealTimeAlerts();
  startKPIUpdates();

  // Auto-select Varanasi marker on load
  setTimeout(() => {
    selectCity('varanasi', document.getElementById('marker-varanasi'));
    showForecast = true;
    updateForecastChart('varanasi', true);
    document.getElementById('btnForecast').classList.add('active');
    document.getElementById('btnCurrent').classList.remove('active');
  }, 800);
});
