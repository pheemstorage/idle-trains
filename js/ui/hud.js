// Idle Trains: Bangkok — Tactile Playful Toy-Train HUD & Overlay Manager
// Strictly zero emojis — uses handcrafted animated SVG icons throughout.

import { ICONS, iconForCategory, iconForWeather } from '../icons.js';
import {
  LINES,
  LINE_BY_ID,
  STATIONS,
  STATION_NEIGHBORS,
} from '../data/network.js';
import {
  getBuildingUpgradeCost,
  getBuildingIncome,
  getBuildingRiderBoost,
} from '../data/buildings.js';
import { TRAIN_MODELS, TRAIN_MODEL_BY_ID } from '../data/trains.js';
import {
  INTERCITY_CITIES,
  getIntercityUpgradeCost,
  getIntercityIncome,
} from '../data/intercity.js';
import { WEATHER_META } from '../sim/engine.js';

export function formatBaht(n) {
  const v = Math.floor(n || 0);
  if (v >= 1_000_000_000) return `฿${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `฿${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 100_000) return `฿${(v / 1_000).toFixed(1)}K`;
  return `฿${v.toLocaleString('en-US')}`;
}

export function formatSecs(sec) {
  const s = Math.max(0, Math.ceil(sec));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${String(r).padStart(2, '0')}s`;
}

export class HudManager {
  constructor(engine, world, sound) {
    this.engine = engine;
    this.world = world;
    this.sound = sound;

    this.selectedStationId = null;
    this.selectedIntercityId = null;
    this.activeModal = null; // 'lines' | 'import' | 'ops' | 'intercity' | 'settings' | null
    this.selectedLineFilter = 'bts_sukhumvit';
    this.selectedImportModel = 'siemens_bts';

    this.floatingPops = []; // { x, y, z, text, bornAt, duration, color }
    this.stationPins = new Map();
    this.trainPins = new Map();
    this.intercityPins = new Map();

    this._lastInspectorRefresh = 0;
    this._lastModalRefresh = 0;

    this._cacheDom();
    this._renderStaticIcons();
    this._bindEvents();
  }

  _cacheDom() {
    this.elMoney = document.getElementById('hud-money');
    this.elIncomeRate = document.getElementById('hud-rate');
    this.elDay = document.getElementById('hud-day');
    this.elTime = document.getElementById('hud-time');
    this.elPhase = document.getElementById('hud-phase');
    this.elWeatherIcon = document.getElementById('hud-weather-icon');
    this.elWeatherLabel = document.getElementById('hud-weather-label');
    this.elWeatherNext = document.getElementById('hud-weather-next');
    this.elSatIcon = document.getElementById('hud-sat-icon');
    this.elSatVal = document.getElementById('hud-sat-val');
    this.elProgressText = document.getElementById('hud-progress-text');
    this.elProgressFill = document.getElementById('hud-progress-fill');
    this.elSoundBtn = document.getElementById('btn-sound');
    this.elAlertBar = document.getElementById('alert-ribbon');

    this.elInspector = document.getElementById('station-inspector');
    this.elInspectorBody = document.getElementById('inspector-body');
    this.elModal = document.getElementById('modal-overlay');
    this.elModalTitle = document.getElementById('modal-title');
    this.elModalBody = document.getElementById('modal-body');
    this.elWorldOverlays = document.getElementById('world-overlays');
    this.elFloatingPops = document.getElementById('floating-pops');
    this.elToastStack = document.getElementById('toast-stack');
    this.elWorldToggle = document.getElementById('btn-world-mode');
    this.elOfflineModal = document.getElementById('offline-modal');
    this.elOfflineBody = document.getElementById('offline-body');
  }

  _renderStaticIcons() {
    document.getElementById('brand-icon').innerHTML = ICONS.train();
    document.getElementById('baht-icon').innerHTML = ICONS.baht();
    document.getElementById('clock-icon').innerHTML = ICONS.clock();
    document.getElementById('btn-home-cam').innerHTML = ICONS.homeCam();

    document.getElementById('dock-lines-icon').innerHTML = ICONS.map();
    document.getElementById('dock-import-icon').innerHTML = ICONS.importShip();
    document.getElementById('dock-ops-icon').innerHTML = ICONS.wrench();
    document.getElementById('dock-intercity-icon').innerHTML = ICONS.thailand();
    document.getElementById('inspector-close').innerHTML = ICONS.close();
    document.getElementById('modal-close').innerHTML = ICONS.close();

    this.updateSoundIcon();
  }

  updateSoundIcon() {
    this.elSoundBtn.innerHTML = this.sound.muted ? ICONS.soundOff() : ICONS.soundOn();
    this.elSoundBtn.title = this.sound.muted ? 'Unmute Sound (M)' : 'Mute Sound (M)';
  }

  _bindEvents() {
    this.elSoundBtn.addEventListener('click', () => {
      this.sound.toggleMute();
      this.updateSoundIcon();
    });

    document.getElementById('btn-home-cam').addEventListener('click', () => {
      this.sound.unlock();
      this.sound.playTick();
      if (this.world.worldMode !== 'bangkok') {
        this.world.setWorldMode('bangkok');
        this._updateWorldToggleLabel();
      }
      this.world.resetCamera();
      this.closeInspector();
    });

    // Bottom Dock Buttons
    document.getElementById('dock-lines').addEventListener('click', () => {
      this.sound.unlock();
      this.sound.playTick();
      this.openModal('lines');
    });
    document.getElementById('dock-import').addEventListener('click', () => {
      this.sound.unlock();
      this.sound.playTick();
      this.openModal('import');
    });
    document.getElementById('dock-ops').addEventListener('click', () => {
      this.sound.unlock();
      this.sound.playTick();
      this.openModal('ops');
    });
    this.elWorldToggle.addEventListener('click', () => {
      this.sound.unlock();
      this.sound.playTick();
      if (this.engine.state.intercityUnlocked) {
        const nextMode = this.world.worldMode === 'bangkok' ? 'intercity' : 'bangkok';
        this.world.setWorldMode(nextMode);
        this.closeInspector();
        this._updateWorldToggleLabel();
        if (nextMode === 'intercity') {
          this.openModal('intercity');
        } else {
          this.closeModal();
        }
      } else {
        this.openModal('intercity');
      }
    });

    document.getElementById('inspector-close').addEventListener('click', () => {
      this.sound.playTick();
      this.closeInspector();
    });

    document.getElementById('modal-close').addEventListener('click', () => {
      this.sound.playTick();
      this.closeModal();
    });
    this.elModal.addEventListener('click', (e) => {
      if (e.target === this.elModal) this.closeModal();
    });

    document.getElementById('offline-claim-btn').addEventListener('click', () => {
      this.sound.unlock();
      this.sound.playCoin();
      this.elOfflineModal.classList.add('hidden');
    });

    // Global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'm' || e.key === 'M') {
        this.sound.toggleMute();
        this.updateSoundIcon();
      } else if (e.key === 'Escape') {
        this.closeModal();
        this.closeInspector();
      }
    });
  }

  _updateWorldToggleLabel() {
    const labelEl = this.elWorldToggle.querySelector('.dock-label');
    if (this.world.worldMode === 'intercity') {
      labelEl.textContent = 'Bangkok Map';
    } else {
      labelEl.textContent = this.engine.state.intercityUnlocked ? 'Thailand Map' : 'Intercity';
    }
  }

  clearTransientEffects() {
    this.elToastStack.innerHTML = '';
    for (const p of this.floatingPops) p.el.remove();
    this.floatingPops = [];
    this._lastAlertSig = '';
    this.elAlertBar.innerHTML = '';
  }

  // ===== TOASTS & FLOATING 3D BAHT POPS =====

  showToast(title, subtitle = '', iconHtml = ICONS.star()) {
    const el = document.createElement('div');
    el.className = 'toast-card';
    el.innerHTML = `
      <div class="toast-icon">${iconHtml}</div>
      <div class="toast-copy">
        <div class="toast-title">${title}</div>
        ${subtitle ? `<div class="toast-sub">${subtitle}</div>` : ''}
      </div>
    `;
    this.elToastStack.appendChild(el);
    while (this.elToastStack.children.length > 4) {
      this.elToastStack.firstChild.remove();
    }
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 350);
    }, 4200);
  }

  showOfflineModal(report) {
    if (!report) return;
    this.elOfflineBody.innerHTML = `
      <div class="offline-stat-row">
        <span>Time Away</span>
        <strong>${formatSecs(report.awaySec)}</strong>
      </div>
      <div class="offline-stat-row">
        <span>Idle Baht Collected</span>
        <strong class="baht-val">${formatBaht(report.earned)}</strong>
      </div>
      ${report.completedStations > 0 ? `
      <div class="offline-stat-row">
        <span>Stations Completed</span>
        <strong>${report.completedStations}</strong>
      </div>` : ''}
    `;
    this.elOfflineModal.classList.remove('hidden');
  }

  spawnBahtPop(x, y, z, amount) {
    if (this.floatingPops.length > 26) this.floatingPops.shift();
    const div = document.createElement('div');
    div.className = 'baht-pop';
    div.innerHTML = `${ICONS.baht('sm')}<span>+${formatBaht(amount)}</span>`;
    this.elFloatingPops.appendChild(div);
    this.floatingPops.push({
      x, y, z,
      el: div,
      age: 0,
      dur: 1.35,
    });
  }

  // ===== STATION CLOSE-UP INSPECTOR =====

  selectStation(stationId, focusCam = true) {
    if (!STATIONS[stationId]) return;
    this.selectedStationId = stationId;
    this.elInspector.classList.remove('hidden');
    document.body.classList.add('inspector-open');
    if (focusCam) {
      this.world.focusStation(stationId);
    }
    this.renderInspector();
  }

  closeInspector() {
    this.selectedStationId = null;
    this.elInspector.classList.add('hidden');
    document.body.classList.remove('inspector-open');
  }

  renderInspector() {
    if (!this.selectedStationId) return;
    const st = STATIONS[this.selectedStationId];
    const line = LINE_BY_ID[st.lineId];
    const sState = this.engine.state.stations[st.id];
    const job = this.engine.state.constructions[st.id];
    const canBuild = this.engine.canBuildStation(st.id);

    let html = `
      <div class="st-header" style="--line-color: ${line.color}; --line-accent: ${line.accent}">
        <div class="st-code-pill">${st.code}</div>
        <div class="st-title-wrap">
          <div class="st-name-en">${st.name}</div>
          <div class="st-name-th">${st.thai}</div>
          <div class="st-line-tag">${line.name} • ${line.thaiName}</div>
        </div>
      </div>
    `;

    // Case 1: Under Construction
    if (job) {
      const pct = Math.min(100, Math.round((1 - job.remainingTime / Math.max(1, job.totalTime)) * 100));
      const rushCost = this.engine.getRushCost(st.id);
      const canRush = this.engine.state.money >= rushCost;
      html += `
        <div class="card-block building-card">
          <div class="card-row">
            <div class="card-icon-lg">${ICONS.crane()}</div>
            <div class="card-info">
              <div class="card-heading">Station Under Construction</div>
              <div class="card-sub">Finishing in <strong>${formatSecs(job.remainingTime)}</strong> (${pct}%)</div>
            </div>
          </div>
          <div class="progress-track"><div class="progress-fill amber" style="width:${pct}%"></div></div>
          <button class="toy-btn amber full" data-action="rush-station" data-id="${st.id}" ${canRush ? '' : 'disabled'}>
            Rush Construction Crew (${formatBaht(rushCost)})
          </button>
        </div>
      `;
    }
    // Case 2: Locked Station (Adjacent buildable or future locked)
    else if (!sState.unlocked) {
      const buildTime = this.engine.getEffectiveBuildTime(st.id);
      const canAfford = this.engine.state.money >= st.cost;
      const previewBuildings = this.engine.getBuildingsForStation(st.id);
      const touchingIcs = this.engine.getInterchangesForStation(st.id);
      const unlockLineNames = touchingIcs
        .map((ic) => {
          const otherId = ic.from === st.id ? ic.to : ic.from;
          return LINE_BY_ID[STATIONS[otherId].lineId]?.name;
        })
        .filter((n) => n && n !== line.name);

      html += `
        <div class="card-block">
          <div class="card-heading">Expand ${line.shortCode} to ${st.name}</div>
          <div class="meta-chips">
            <span class="chip">${ICONS.baht('xs')} Cost: ${formatBaht(st.cost)}</span>
            <span class="chip">${ICONS.crane('xs')} Build Time: ${formatSecs(buildTime)}</span>
          </div>
          ${unlockLineNames.length ? `
            <div class="ic-card" style="--ic-col:${line.color}; margin-top:2px">
              <div class="ic-top">
                <span class="mini-ic">${ICONS.skywalk('sm')}</span>
                <div class="ic-copy">
                  <div class="ic-title">Auto-Connects Line!</div>
                  <div class="ic-sub">Building ${st.name} automatically unlocks <strong>${unlockLineNames.join(', ')}</strong>!</div>
                </div>
              </div>
            </div>
          ` : ''}
          ${canBuild ? `
            <button class="toy-btn green full" data-action="build-station" data-id="${st.id}" ${canAfford ? '' : 'disabled'}>
              Construct Station (${formatBaht(st.cost)})
            </button>
          ` : `
            <div class="locked-note">Build an adjacent station along ${line.name} first!</div>
          `}
          <div class="section-label">Real-Life Landmarks Available Here</div>
          <div class="preview-list">
            ${previewBuildings.map((b) => `
              <div class="preview-item ${b.featured ? 'featured' : ''}">
                <span class="mini-ic">${iconForCategory(b.category)}</span>
                <span>${b.name}</span>
                ${b.featured ? '<span class="feat-badge">SIGNATURE</span>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    // Case 3: Unlocked Operational Station!
    else {
      const moodColor = sState.patience >= 70 ? '#16A34A' : (sState.patience >= 45 ? '#D97706' : '#DC2626');
      const riderMult = this.engine.getStationRidershipMultiplier(st.id);
      html += `
        <div class="stats-grid-3">
          <div class="mini-stat">
            <div class="mini-stat-ic">${ICONS.passengers('sm')}</div>
            <div class="mini-stat-val">${Math.floor(sState.waiting)}</div>
            <div class="mini-stat-lbl">Waiting</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-ic">${sState.angry ? ICONS.angry('sm') : ICONS.happy('sm')}</div>
            <div class="mini-stat-val" style="color:${moodColor}">${Math.round(sState.patience)}%</div>
            <div class="mini-stat-lbl">${sState.angry ? 'Angry!' : 'Mood'}</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-ic">${ICONS.star('sm')}</div>
            <div class="mini-stat-val">${riderMult.toFixed(2)}x</div>
            <div class="mini-stat-lbl">Rider Pull</div>
          </div>
        </div>
      `;

      // Auto-connected Line Interchanges & Skywalks
      const ics = this.engine.getInterchangesForStation(st.id);
      if (ics.length) {
        html += `<div class="section-label">Connected Transit Lines</div>`;
        for (const ic of ics) {
          const otherId = ic.from === st.id ? ic.to : ic.from;
          const otherSt = STATIONS[otherId];
          const otherLine = LINE_BY_ID[otherSt.lineId];
          html += `
            <div class="ic-card" style="--ic-col:${otherLine.color}">
              <div class="ic-top">
                <span class="mini-ic">${ICONS.skywalk()}</span>
                <div class="ic-copy">
                  <div class="ic-title">${ic.name}</div>
                  <div class="ic-sub">Connected to <strong>${otherLine.name}</strong> (+${Math.round(ic.bonus * 100)}% transfer fares)</div>
                </div>
              </div>
              <button class="toy-btn ghost sm" data-action="focus-station" data-id="${otherId}">Jump to ${otherSt.name}</button>
            </div>
          `;
        }
      }

      // Next Adjacent Station-by-Station Expansion Quick Strip!
      const neighbors = (STATION_NEIGHBORS[st.id] || []).filter((nid) => !this.engine.state.stations[nid].unlocked);
      if (neighbors.length) {
        html += `<div class="section-label">Next Adjacent Stations to Build</div>`;
        for (const nid of neighbors) {
          const nst = STATIONS[nid];
          const nJob = this.engine.state.constructions[nid];
          const nTime = this.engine.getEffectiveBuildTime(nid);
          const canAfford = this.engine.state.money >= nst.cost;
          html += `
            <div class="next-st-row">
              <div>
                <div class="next-st-name">${nst.code} ${nst.name} <span class="th-inline">${nst.thai}</span></div>
                <div class="next-st-meta">${nJob ? `Building: ${formatSecs(nJob.remainingTime)}` : `Build time: ${formatSecs(nTime)}`}</div>
              </div>
              ${nJob
                ? `<button class="toy-btn amber sm" data-action="focus-station" data-id="${nid}">View Crane</button>`
                : `<button class="toy-btn green sm" data-action="build-station" data-id="${nid}" ${canAfford ? '' : 'disabled'}>${formatBaht(nst.cost)}</button>`
              }
            </div>
          `;
        }
      }

      // Real-Life Nearby Buildings + Station 7-Eleven (Independent Lv. 1..10 Passive Income + Train Riders!)
      const bList = this.engine.getBuildingsForStation(st.id);
      html += `<div class="section-label">Station 7-Eleven & Real-Life Nearby Buildings</div>`;
      for (const b of bList) {
        const lvl = this.engine.getBuildingLevel(b.id);
        const curIncome = getBuildingIncome(b.baseIncome, lvl);
        const nextIncome = lvl < 10 ? getBuildingIncome(b.baseIncome, lvl + 1) : curIncome;
        const curRiderPct = Math.round(getBuildingRiderBoost(b.category, lvl) * 100);
        const nextRiderPct = Math.round(getBuildingRiderBoost(b.category, Math.min(10, lvl + 1)) * 100);
        const cost = getBuildingUpgradeCost(b.baseCost, lvl);
        const canAfford = this.engine.state.money >= cost;
        const cardCls = b.isStationSeven ? 'seven-card' : (b.featured ? 'featured-card' : '');

        html += `
          <div class="biz-card ${cardCls}">
            <div class="biz-left">
              <div class="biz-icon">${iconForCategory(b.category)}</div>
              <div class="biz-meta">
                <div class="biz-name">
                  ${b.name}
                  ${b.featured ? '<span class="feat-badge">REAL LIFE</span>' : ''}
                  ${b.isStationSeven ? '<span class="seven-badge">CALMS RIDERS</span>' : ''}
                </div>
                <div class="biz-th">${b.thai}</div>
                <div class="biz-inc">
                  ${lvl > 0
                    ? `Lv. <strong>${lvl}/10</strong> • <strong>${formatBaht(curIncome)}/s</strong> • <strong>+${curRiderPct}%</strong> Train Riders`
                    : `Unbuilt • <strong>${formatBaht(nextIncome)}/s</strong> • <strong>+${nextRiderPct}%</strong> Train Riders`
                  }
                </div>
              </div>
            </div>
            <div class="biz-right">
              ${lvl >= 10
                ? `<span class="max-pill">MAX</span>`
                : `<button class="toy-btn ${lvl === 0 ? 'green' : 'gold'} sm" data-action="upgrade-biz" data-station="${st.id}" data-biz="${b.id}" ${canAfford ? '' : 'disabled'}>
                    ${lvl === 0 ? 'Open' : `Lv.${lvl + 1}`} ${formatBaht(cost)}
                   </button>`
              }
            </div>
          </div>
        `;
      }
    }

    this.elInspectorBody.innerHTML = html;
    this._bindInspectorActions();
  }

  _bindInspectorActions() {
    this.elInspectorBody.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.sound.unlock();
        const act = btn.dataset.action;
        if (act === 'build-station') {
          const res = this.engine.startBuildStation(btn.dataset.id);
          if (res.ok) {
            this.selectStation(btn.dataset.id, true);
          }
        } else if (act === 'rush-station') {
          const res = this.engine.rushConstruction(btn.dataset.id);
          if (res.ok) this.renderInspector();
        } else if (act === 'build-ic') {
          const res = this.engine.buildInterchange(btn.dataset.id);
          if (res.ok) this.renderInspector();
        } else if (act === 'focus-station') {
          this.sound.playTick();
          this.selectStation(btn.dataset.id, true);
        } else if (act === 'upgrade-biz') {
          const res = this.engine.buyOrUpgradeBuilding(btn.dataset.station, btn.dataset.biz);
          if (res.ok) this.renderInspector();
        }
      });
    });
  }

  // ===== MODALS: LINES, IMPORT TRAINS, OPS/DEPOT, INTERCITY, SETTINGS =====

  openModal(name) {
    this.activeModal = name;
    this.elModal.classList.remove('hidden');
    this.renderModal();
  }

  closeModal() {
    this.activeModal = null;
    this.elModal.classList.add('hidden');
  }

  renderModal() {
    if (!this.activeModal) return;
    if (this.activeModal === 'lines') this._renderLinesModal();
    else if (this.activeModal === 'import') this._renderImportModal();
    else if (this.activeModal === 'ops') this._renderOpsModal();
    else if (this.activeModal === 'intercity') this._renderIntercityModal();
  }

  _renderLinesModal() {
    this.elModalTitle.innerHTML = `${ICONS.map('sm')}<span>Bangkok Transit Lines & Fleet Dispatch</span>`;

    // Line selector pills
    const tabsHtml = LINES.map((l) => {
      const unlocked = this.engine.state.lines[l.id].unlocked;
      const ownedCount = this.engine.getUnlockedStationsForLine(l.id).length;
      const uniqueIds = new Set([...l.stations, ...(l.extraBranches ? l.extraBranches.flat() : [])]);
      const totalCount = uniqueIds.size;
      const active = this.selectedLineFilter === l.id;
      return `
        <button class="line-tab ${active ? 'active' : ''} ${unlocked ? '' : 'locked'}"
                style="--line-col:${l.color}"
                data-modal-act="select-line" data-id="${l.id}">
          <span class="dot"></span>
          <span>${l.shortCode}</span>
          <span class="cnt">${ownedCount}/${totalCount}</span>
        </button>
      `;
    }).join('');

    const line = LINE_BY_ID[this.selectedLineFilter];
    const ls = this.engine.state.lines[line.id];
    const lineTrains = this.engine.state.trains.filter((t) => t.lineId === line.id);
    const maxTrains = this.engine.getMaxTrainsForLine(line.id);
    const speedCost = this.engine.getLineSpeedUpgradeCost(line.id);

    // Choose compatible imported models for this line
    const compatModels = TRAIN_MODELS.filter((m) =>
      m.category === line.vehicleCategory && this.engine.state.importedModels[m.id]
    );
    if (!compatModels.find((m) => m.id === this.selectedImportModel)) {
      this.selectedImportModel = compatModels[0]?.id || line.defaultTrainModel;
    }
    const chosenModel = TRAIN_MODEL_BY_ID[this.selectedImportModel] || TRAIN_MODEL_BY_ID[line.defaultTrainModel];
    const addTrainCost = this.engine.getAddTrainCost(line.id, chosenModel.id);

    const allLineStations = [...line.stations];
    if (line.extraBranches) {
      for (const [, b] of line.extraBranches) {
        if (!allLineStations.includes(b)) allLineStations.push(b);
      }
    }

    this.elModalBody.innerHTML = `
      <div class="line-tabs-wrap">${tabsHtml}</div>
      <div class="line-detail-card" style="--line-col:${line.color}">
        <div class="line-detail-head">
          <div>
            <h3>${line.name} <span class="th-inline">${line.thaiName}</span></h3>
            <p>${line.description}</p>
          </div>
          <span class="line-status-pill ${ls.unlocked ? 'open' : ''}">
            ${ls.unlocked ? 'OPERATIONAL' : (line.isPostRailUnlock ? 'FINISH ALL TRAINS' : 'BUILD SKYWALK TO UNLOCK')}
          </span>
        </div>

        ${ls.unlocked ? `
          <div class="line-controls-grid">
            <div class="ctrl-box">
              <div class="ctrl-top">${ICONS.speed('sm')}<span>Train Speed Lv. <strong>${ls.speedLevel}/15</strong></span></div>
              <div class="ctrl-sub">+${(ls.speedLevel - 1) * 13}% Speed • +${(ls.speedLevel - 1) * 8}% Fare Bonus</div>
              <button class="toy-btn gold full" data-modal-act="upgrade-speed" data-id="${line.id}" ${ls.speedLevel >= 15 || this.engine.state.money < speedCost ? 'disabled' : ''}>
                ${ls.speedLevel >= 15 ? 'MAX SPEED' : `Upgrade Speed (${formatBaht(speedCost)})`}
              </button>
            </div>

            <div class="ctrl-box">
              <div class="ctrl-top">${ICONS.train('sm')}<span>Active Fleet: <strong>${lineTrains.length}/${maxTrains}</strong></span></div>
              <div class="ctrl-sub">Model to deploy:</div>
              <select class="toy-select" id="line-model-select">
                ${compatModels.map((m) => `
                  <option value="${m.id}" ${m.id === chosenModel.id ? 'selected' : ''}>
                    ${m.name} (Spd ${m.speed}x • Cap ${m.capacity})
                  </option>
                `).join('')}
              </select>
              <div class="btn-row">
                <button class="toy-btn green" data-modal-act="add-train" data-id="${line.id}"
                        ${lineTrains.length >= maxTrains || this.engine.state.money < addTrainCost ? 'disabled' : ''}>
                  Add Vehicle (${formatBaht(addTrainCost)})
                </button>
                ${line.vehicleCategory === 'rail' && lineTrains.some((t) => t.modelId !== chosenModel.id) ? `
                  <button class="toy-btn blue" data-modal-act="retrofit-line" data-id="${line.id}">
                    Swap All to Model
                  </button>` : ''}
              </div>
            </div>
          </div>
        ` : ''}

        <div class="section-label">Stations on ${line.name} (Click any station to zoom in!)</div>
        <div class="station-chip-grid">
          ${allLineStations.map((stId) => {
            const st = STATIONS[stId];
            const stS = this.engine.state.stations[stId];
            const job = this.engine.state.constructions[stId];
            const buildable = this.engine.canBuildStation(stId);
            const cls = stS.unlocked ? 'unlocked' : (job ? 'building' : (buildable ? 'buildable' : 'locked'));
            return `
              <button class="st-grid-btn ${cls}" data-modal-act="jump-station" data-id="${stId}">
                <span class="st-g-code">${st.code}</span>
                <span class="st-g-name">${st.name}${st.featured ? ' (COCO PARC)' : ''}</span>
                <span class="st-g-state">${stS.unlocked ? (stS.angry ? 'ANGRY' : 'OPEN') : (job ? formatSecs(job.remainingTime) : (buildable ? formatBaht(st.cost) : 'LOCKED'))}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const sel = document.getElementById('line-model-select');
    if (sel) {
      sel.addEventListener('change', () => {
        this.selectedImportModel = sel.value;
        this.renderModal();
      });
    }

    this.elModalBody.querySelectorAll('[data-modal-act]').forEach((b) => {
      b.addEventListener('click', () => {
        this.sound.unlock();
        const act = b.dataset.modalAct;
        const id = b.dataset.id;
        if (act === 'select-line') {
          this.sound.playTick();
          this.selectedLineFilter = id;
          this.renderModal();
        } else if (act === 'upgrade-speed') {
          if (this.engine.upgradeLineSpeed(id).ok) this.renderModal();
        } else if (act === 'add-train') {
          if (this.engine.addTrainToLine(id, this.selectedImportModel).ok) this.renderModal();
        } else if (act === 'retrofit-line') {
          const res = this.engine.retrofitLineTrains(id, this.selectedImportModel);
          if (res.ok) this.renderModal();
          else if (res.reason) this.showToast('Cannot Swap Fleet', res.reason, ICONS.wrench());
        } else if (act === 'jump-station') {
          this.sound.playTick();
          this.closeModal();
          this.selectStation(id, true);
        }
      });
    });
  }

  _renderImportModal() {
    this.elModalTitle.innerHTML = `${ICONS.importShip('sm')}<span>Import Real-World Trains</span>`;
    const railModels = TRAIN_MODELS.filter((m) => m.category === 'rail');

    this.elModalBody.innerHTML = `
      <p class="modal-intro">Import real trains from Germany, Japan, France, Switzerland, Canada & China. Once imported, deploy them on any Bangkok rail line in the Lines drawer!</p>
      <div class="import-grid">
        ${railModels.map((m) => {
          const owned = this.engine.state.importedModels[m.id];
          const canAfford = this.engine.state.money >= m.importCost;
          return `
            <div class="import-card ${owned ? 'owned' : ''}">
              <div class="import-swatch" style="background:${m.bodyColor}; border-bottom: 6px solid ${m.stripeColor}; border-top: 4px solid ${m.accentColor}">
                <span class="origin-tag">${m.origin}</span>
              </div>
              <div class="import-body">
                <div class="import-name">${m.name}</div>
                <div class="import-desc">${m.description}</div>
                <div class="import-stats">
                  <span>Speed <strong>${m.speed.toFixed(2)}x</strong></span>
                  <span>Cap <strong>${m.capacity}</strong></span>
                  <span>Rel <strong>${Math.round(m.reliability * 100)}%</strong></span>
                  <span>Fare <strong>${m.fareMult.toFixed(2)}x</strong></span>
                </div>
                ${owned
                  ? `<div class="owned-pill">IMPORTED & READY</div>`
                  : `<button class="toy-btn blue full" data-import-id="${m.id}" ${canAfford ? '' : 'disabled'}>
                      Import License (${formatBaht(m.importCost)})
                     </button>`
                }
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.elModalBody.querySelectorAll('[data-import-id]').forEach((b) => {
      b.addEventListener('click', () => {
        this.sound.unlock();
        if (this.engine.importTrainModel(b.dataset.importId).ok) {
          this.renderModal();
        }
      });
    });
  }

  _renderOpsModal() {
    this.elModalTitle.innerHTML = `${ICONS.wrench('sm')}<span>Maintenance Depot, Crew & Master Progress</span>`;
    const s = this.engine.state;
    const maintCost = this.engine.getMaintenanceUpgradeCost();
    const crewCost = this.engine.getCrewUpgradeCost();
    const prog = this.engine.getCoreRailProgress();

    this.elModalBody.innerHTML = `
      <div class="ops-grid">
        <div class="card-block">
          <div class="card-row">
            <div class="card-icon-lg">${ICONS.wrench()}</div>
            <div class="card-info">
              <div class="card-heading">Maintenance Depot Lv. ${s.maintenanceLevel}/10</div>
              <div class="card-sub">Reduces random train breakdowns. At <strong>Lv. 3+</strong>, mechanics automatically dispatch to stalled trains!</div>
            </div>
          </div>
          <button class="toy-btn gold full" id="btn-up-maint" ${s.maintenanceLevel >= 10 || s.money < maintCost ? 'disabled' : ''}>
            ${s.maintenanceLevel >= 10 ? 'MAX LEVEL' : `Upgrade Maintenance (${formatBaht(maintCost)})`}
          </button>
        </div>

        <div class="card-block">
          <div class="card-row">
            <div class="card-icon-lg">${ICONS.crane()}</div>
            <div class="card-info">
              <div class="card-heading">Construction Crew Lv. ${s.crewLevel}/10</div>
              <div class="card-sub">Speeds up station construction timers across Bangkok (+${(s.crewLevel - 1) * 18}% faster building!).</div>
            </div>
          </div>
          <button class="toy-btn green full" id="btn-up-crew" ${s.crewLevel >= 10 || s.money < crewCost ? 'disabled' : ''}>
            ${s.crewLevel >= 10 ? 'MAX LEVEL' : `Hire Extra Crew (${formatBaht(crewCost)})`}
          </button>
        </div>
      </div>

      <div class="card-block master-card">
        <div class="card-heading">Bangkok Master Rail Completion (${prog.owned}/${prog.total} Rail Stations • ${prog.pct}%)</div>
        <div class="progress-track"><div class="progress-fill green" style="width:${prog.pct}%"></div></div>
        <div class="card-sub">
          Complete all 10 Bangkok rail & BRT lines to unlock:
          <strong>1) Bangkok EV City Bus Network</strong> + <strong>2) Thailand Intercity Trains</strong> (Ayutthaya, Pattaya, Hua Hin, Chiang Mai, Hat Yai)!
        </div>
        <div class="meta-chips" style="margin-top:8px">
          <span class="chip">${ICONS.boat('xs')} Chao Phraya Boats: Build Saphan Taksin or ICONSIAM Pier</span>
          <span class="chip">${ICONS.bus('xs')} Bangkok EV Buses: ${s.busesUnlocked ? 'UNLOCKED!' : 'Finish all train lines'}</span>
          <span class="chip">${ICONS.thailand('xs')} Intercity Thailand: ${s.intercityUnlocked ? 'UNLOCKED!' : 'Finish all train lines'}</span>
        </div>
      </div>

      <div class="card-block">
        <div class="card-heading">Quick Jump to Real-Life Landmarks</div>
        <div class="card-sub">Auto-save is always active — your empire saves automatically every few seconds & whenever you leave the tab.</div>
        <div class="btn-row wrap" style="margin-top:4px">
          <button class="toy-btn ghost sm" data-jump="bts_siam">Siam (Siam Paragon)</button>
          <button class="toy-btn ghost sm" data-jump="bts_chitlom">Chit Lom (CentralWorld ฿500K)</button>
          <button class="toy-btn gold sm" data-jump="mrt_khlongtoei">Khlong Toei (COCO PARC)</button>
          <button class="toy-btn gold sm" data-jump="mrt_sanamchai">Sanam Chai (Suankularb School)</button>
          <button class="toy-btn ghost sm" data-jump="silom_chongnonsi">Chong Nonsi (Mahanakhon)</button>
          <button class="toy-btn ghost sm" data-jump="gold_iconsiam">ICONSIAM</button>
        </div>
      </div>

      <div class="card-block">
        <div class="card-heading">Weather Preview & Empire Tools</div>
        <div class="btn-row wrap" style="margin-top:4px">
          <button class="toy-btn ghost sm" data-weather="sunny">Sunny</button>
          <button class="toy-btn ghost sm" data-weather="rain">Monsoon Rain</button>
          <button class="toy-btn blue sm" data-weather="flood">Trigger Bangkok Flood</button>
          <button class="toy-btn amber sm" id="btn-sandbox-cash">Sandbox +฿500K</button>
          <button class="toy-btn green sm" id="btn-sandbox-all">Unlock Full Bangkok</button>
          <button class="toy-btn red sm" id="btn-reset-save">Reset Empire</button>
        </div>
      </div>
    `;

    document.getElementById('btn-up-maint')?.addEventListener('click', () => {
      this.sound.unlock();
      if (this.engine.upgradeMaintenance().ok) this.renderModal();
    });
    document.getElementById('btn-up-crew')?.addEventListener('click', () => {
      this.sound.unlock();
      if (this.engine.upgradeCrew().ok) this.renderModal();
    });
    document.getElementById('btn-reset-save')?.addEventListener('click', () => {
      if (confirm('Reset your entire Idle Trains Bangkok empire and start fresh at Siam?')) {
        this.engine.resetGame();
        this.closeModal();
        this.closeInspector();
        this.world.setWorldMode('bangkok');
        this._updateWorldToggleLabel();
      }
    });
    document.getElementById('btn-sandbox-cash')?.addEventListener('click', () => {
      this.engine.grantSandboxBoost();
      this.sound.playCoin();
      this.showToast('Sandbox Grant Added', '+฿500,000 Baht deposited!', ICONS.baht());
      this.renderModal();
    });
    document.getElementById('btn-sandbox-all')?.addEventListener('click', () => {
      this.engine.unlockAllShowcase();
      this.sound.playStationComplete();
      this.closeModal();
      this._updateWorldToggleLabel();
      this.showToast('Full Bangkok Showcase Unlocked', 'All rail lines, COCO PARC, Boats, EV Buses & Thailand Intercity ready!', ICONS.thailand());
    });
    this.elModalBody.querySelectorAll('[data-weather]').forEach((b) => {
      b.addEventListener('click', () => {
        this.engine.forceWeather(b.dataset.weather);
        this.sound.playTick();
      });
    });
    this.elModalBody.querySelectorAll('[data-jump]').forEach((b) => {
      b.addEventListener('click', () => {
        this.sound.playTick();
        this.closeModal();
        this.selectStation(b.dataset.jump, true);
      });
    });
  }

  _renderIntercityModal() {
    this.elModalTitle.innerHTML = `${ICONS.thailand('sm')}<span>Thailand Intercity Rail Network</span>`;
    const unlocked = this.engine.state.intercityUnlocked;
    const prog = this.engine.getCoreRailProgress();

    this.elModalBody.innerHTML = `
      ${!unlocked ? `
        <div class="card-block master-card">
          <div class="card-heading">Complete All Bangkok Train Lines to Unlock Intercity Rail & City Buses!</div>
          <div class="card-sub">Current Bangkok Rail Progress: <strong>${prog.owned} / ${prog.total} stations (${prog.pct}%)</strong></div>
          <div class="progress-track"><div class="progress-fill green" style="width:${prog.pct}%"></div></div>
        </div>
      ` : `
        <div class="intercity-top-bar">
          <span>Dispatch High-Speed & SRT Trains across Thailand from Krung Thep Aphiwat!</span>
          <button class="toy-btn blue sm" id="btn-toggle-3d-th">
            ${this.world.worldMode === 'intercity' ? 'Return to Bangkok 3D' : 'View 3D Thailand Map'}
          </button>
        </div>
      `}
      <div class="import-grid">
        ${INTERCITY_CITIES.map((city) => {
          const lvl = this.engine.state.intercityLevels[city.id] || 0;
          const cost = getIntercityUpgradeCost(city, lvl);
          const curInc = getIntercityIncome(city, lvl);
          const nextInc = getIntercityIncome(city, lvl + 1);
          const canBuy = unlocked && lvl < 10 && this.engine.state.money >= cost;
          return `
            <div class="import-card ${lvl > 0 ? 'owned' : ''}">
              <div class="import-swatch" style="background:${city.color}; color:#FFF">
                <span class="origin-tag">${city.region}</span>
              </div>
              <div class="import-body">
                <div class="import-name">${city.name} <span class="th-inline">${city.thai}</span></div>
                <div class="import-desc">${city.description}</div>
                <div class="import-stats">
                  <span>Train <strong>${city.trainModel}</strong></span>
                  <span>Income <strong>${lvl > 0 ? `${formatBaht(curInc)}/s` : `Next ${formatBaht(nextInc)}/s`}</strong></span>
                </div>
                ${lvl >= 10
                  ? `<div class="owned-pill">MAX LV. 10</div>`
                  : `<button class="toy-btn green full" data-ic-city="${city.id}" ${canBuy ? '' : 'disabled'}>
                      ${!unlocked ? 'Locked (Finish Bangkok)' : (lvl === 0 ? `Launch Route (${formatBaht(cost)})` : `Upgrade Lv.${lvl + 1} (${formatBaht(cost)})`)}
                     </button>`
                }
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    document.getElementById('btn-toggle-3d-th')?.addEventListener('click', () => {
      this.sound.playTick();
      const next = this.world.worldMode === 'intercity' ? 'bangkok' : 'intercity';
      this.world.setWorldMode(next);
      this._updateWorldToggleLabel();
      this.closeModal();
    });

    this.elModalBody.querySelectorAll('[data-ic-city]').forEach((b) => {
      b.addEventListener('click', () => {
        this.sound.unlock();
        if (this.engine.upgradeIntercityCity(b.dataset.icCity).ok) {
          this.renderModal();
        }
      });
    });
  }

  // ===== PER-FRAME HUD & 3D PROJECTED OVERLAY UPDATE =====

  update(nowMs, dt) {
    const s = this.engine.state;
    const time = this.engine.getTimeInfo();

    // 1. Top Bar Numbers & Clock
    this.elMoney.textContent = formatBaht(s.money);
    const totalRate = Math.round(this.engine.getTotalPassiveIncomePerSec() + this.engine.getEstimatedTrainIncomePerSec());
    this.elIncomeRate.textContent = `+${formatBaht(totalRate)}/s`;

    this.elDay.textContent = `${time.dayShort} • Wk ${time.weekNumber}`;
    this.elTime.textContent = time.timeStr;
    this.elPhase.textContent = time.phaseLabel;
    this.elPhase.className = `phase-pill ${time.isMorningRush || time.isEveningRush ? 'rush' : (time.isWeekendBoom ? 'weekend' : '')}`;

    // Weather pill
    const weatherKey = `${s.weather}_${time.isNight ? 'n' : 'd'}`;
    if (this._lastWeatherKey !== weatherKey) {
      this._lastWeatherKey = weatherKey;
      this.elWeatherIcon.innerHTML = iconForWeather(s.weather, time.isNight);
      this.elWeatherLabel.textContent = WEATHER_META[s.weather].label;
      this.elWeatherLabel.title = WEATHER_META[s.weather].detail;
    }
    this.elWeatherNext.textContent = `Next: ${WEATHER_META[s.nextWeather].label}`;

    // Satisfaction & Master Progress
    const sat = this.engine.getNetworkSatisfaction();
    this.elSatVal.textContent = `${sat}%`;
    const satMood = sat < 65 ? 'angry' : 'happy';
    if (this._lastSatMood !== satMood) {
      this._lastSatMood = satMood;
      this.elSatIcon.innerHTML = satMood === 'angry' ? ICONS.angry('sm') : ICONS.happy('sm');
    }

    const prog = this.engine.getCoreRailProgress();
    this.elProgressText.textContent = `${prog.owned}/${prog.total} Rail`;
    this.elProgressFill.style.width = `${prog.pct}%`;

    // 2. Alert Ribbon (Broken Trains & Angry Stations!)
    this._updateAlerts();

    // 3. Refresh open Inspector / Modal smoothly at ~2.5Hz so countdowns & Baht affordability stay live
    if (this.selectedStationId && nowMs - this._lastInspectorRefresh > 400) {
      this._lastInspectorRefresh = nowMs;
      this.renderInspector();
    }
    if (this.activeModal && nowMs - this._lastModalRefresh > 750) {
      this._lastModalRefresh = nowMs;
      // Avoid rebuilding if user is actively interacting with a <select>
      if (document.activeElement?.tagName !== 'SELECT') {
        this.renderModal();
      }
    }

    // 4. Update 3D-Projected Floating Pins & Baht Pops!
    this._updateProjectedOverlays(dt);
  }

  _updateAlerts() {
    const brokenTrains = this.engine.state.trains.filter((t) => t.broken);
    const angryStations = Object.values(STATIONS).filter((st) => this.engine.state.stations[st.id]?.angry);

    const sig = `${brokenTrains.map((t) => `${t.id}:${t.repairing}:${this.engine.state.money >= this.engine.getRepairCost(t.id)}`).join(',')}|${angryStations.map((s) => s.id).join(',')}|${this.engine.state.weather}`;
    if (this._lastAlertSig === sig) return;
    this._lastAlertSig = sig;

    let html = '';
    for (const tr of brokenTrains) {
      const line = LINE_BY_ID[tr.lineId];
      const cost = this.engine.getRepairCost(tr.id);
      const canPay = this.engine.state.money >= cost;
      html += `
        <button class="alert-chip danger" data-alert-repair="${tr.id}" ${!tr.repairing && !canPay ? 'style="opacity:0.75"' : ''}>
          ${ICONS.wrench('sm')}
          <span>${tr.repairing ? `Repairing train on ${line.shortCode}...` : `Train Broken on ${line.shortCode}! Fix: ${formatBaht(cost)}${canPay ? '' : ' (Low Baht)'}`}</span>
        </button>
      `;
    }
    if (angryStations.length) {
      const first = angryStations[0];
      html += `
        <button class="alert-chip warn" data-alert-station="${first.id}">
          ${ICONS.angry('sm')}
          <span>${angryStations.length === 1 ? `Angry riders at ${first.name}!` : `${angryStations.length} stations have angry riders!`}</span>
        </button>
      `;
    }
    if (this.engine.state.weather === 'flood') {
      html += `
        <div class="alert-chip flood">
          ${ICONS.flood('sm')}
          <span>Bangkok Flood! BRT & roads slowed — BTS/MRT demand +85%</span>
        </div>
      `;
    }

    this.elAlertBar.innerHTML = html;
    this.elAlertBar.querySelectorAll('[data-alert-repair]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.sound.unlock();
        const res = this.engine.repairTrain(btn.dataset.alertRepair);
        if (!res.ok && res.reason) {
          this.sound.playAngryBuzz();
          this.showToast('Not Enough Thai Baht', res.reason, ICONS.baht());
        }
      });
    });
    this.elAlertBar.querySelectorAll('[data-alert-station]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.sound.unlock();
        this.sound.playTick();
        this.selectStation(btn.dataset.alertStation, true);
      });
    });
  }

  _updateProjectedOverlays(dt) {
    // Update floating Baht pickup pops
    for (let i = this.floatingPops.length - 1; i >= 0; i--) {
      const p = this.floatingPops[i];
      p.age += dt;
      if (p.age >= p.dur || this.world.worldMode !== 'bangkok') {
        p.el.remove();
        this.floatingPops.splice(i, 1);
        continue;
      }
      const proj = this.world.projectPoint(p.x, p.y + p.age * 2.4, p.z);
      if (!proj) {
        p.el.style.display = 'none';
      } else {
        p.el.style.display = 'flex';
        p.el.style.transform = `translate3d(${proj.x}px, ${proj.y}px, 0) translate(-50%, -50%)`;
        p.el.style.opacity = String(Math.max(0, 1 - Math.pow(p.age / p.dur, 2)));
      }
    }

    // Intercity mode pins
    if (this.world.worldMode === 'intercity') {
      for (const el of this.stationPins.values()) el.style.display = 'none';
      for (const el of this.trainPins.values()) el.style.display = 'none';
      this._updateIntercityPins();
      return;
    } else {
      for (const el of this.intercityPins.values()) el.style.display = 'none';
    }

    // Station Pins (Buildable adjacent pads, Active Cranes, Angry Badges, and Nearby Labels)
    // Sort by priority & distance, and keep pins out of the Top HUD & Bottom Dock safe zones!
    const state = this.engine.state;
    const camDist = this.world.camera.position.distanceTo(this.world.controls.target);
    const safeTop = 90;
    const safeBottom = window.innerHeight - 96;
    const safeRight = this.selectedStationId ? window.innerWidth - 398 : window.innerWidth - 16;

    const candidates = [];
    for (const st of Object.values(STATIONS)) {
      const sState = state.stations[st.id];
      const job = state.constructions[st.id];
      const buildable = this.engine.canBuildStation(st.id);

      const shouldShow =
        Boolean(job) ||
        Boolean(sState.angry) ||
        buildable ||
        (sState.unlocked && (st.featured || st.interchangeHub || st.id === this.selectedStationId || camDist < 52));

      if (!shouldShow) {
        const old = this.stationPins.get(st.id);
        if (old) old.style.display = 'none';
        continue;
      }

      const yOff = job ? 3.9 : (sState.unlocked ? 2.8 : 1.0);
      const proj = this.world.projectPoint(st.x, yOff, st.z);
      if (!proj || proj.x < 24 || proj.x > safeRight || proj.y < safeTop || proj.y > safeBottom) {
        const old = this.stationPins.get(st.id);
        if (old) old.style.display = 'none';
        continue;
      }

      let prio = 1;
      if (st.id === this.selectedStationId) prio = 5;
      else if (job) prio = 4;
      else if (sState.angry) prio = 3;
      else if (buildable) prio = 2.5;
      else if (st.featured) prio = 2;

      candidates.push({ st, sState, job, buildable, proj, prio });
    }

    // Prioritize highest-priority & closest pins (max 12 visible at once) + 2D screen de-overlap pass!
    candidates.sort((a, b) => (b.prio - a.prio) || (a.proj.dist - b.proj.dist));
    const visibleSet = new Set();
    const placedBoxes = [];
    const maxPins = 12;

    for (let i = 0; i < candidates.length; i++) {
      const { st, sState, job, buildable, proj } = candidates[i];
      if (i >= maxPins && st.id !== this.selectedStationId && !job) {
        const old = this.stationPins.get(st.id);
        if (old) old.style.display = 'none';
        continue;
      }
      visibleSet.add(st.id);
      const line = LINE_BY_ID[st.lineId];

      let el = this.stationPins.get(st.id);
      if (!el) {
        el = document.createElement('button');
        el.className = 'world-pin';
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.sound.unlock();
          this.sound.playTick();
          this.selectStation(st.id, true);
        });
        this.elWorldOverlays.appendChild(el);
        this.stationPins.set(st.id, el);
      }

      // Gently nudge overlapping 2D pins apart vertically so adjacent hubs (Siam/Nat Stadium, Sanam Chai/Rajinee) stay crisp!
      let px = proj.x;
      let py = proj.y;
      const halfW = buildable ? 96 : (st.featured ? 88 : 68);
      const pinH = 29;
      for (let attempt = 0; attempt < 4; attempt++) {
        const hit = placedBoxes.find((b) => Math.abs(px - b.x) < (halfW + b.halfW) * 0.84 && Math.abs(py - b.y) < pinH);
        if (!hit) break;
        const nudgeUp = py - pinH >= safeTop;
        py = nudgeUp ? hit.y - pinH : hit.y + pinH;
      }
      placedBoxes.push({ x: px, y: py, halfW });

      el.style.display = 'flex';
      el.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -100%)`;

      // Update pin visual state only when content changes
      let modeKey;
      if (job) {
        const pct = Math.round((1 - job.remainingTime / Math.max(1, job.totalTime)) * 100);
        modeKey = `job_${Math.ceil(job.remainingTime)}_${pct}`;
        if (el.dataset.key !== modeKey) {
          el.dataset.key = modeKey;
          el.className = 'world-pin pin-building';
          el.innerHTML = `${ICONS.crane('xs')}<span>${st.name} ${formatSecs(job.remainingTime)}</span><div class="pin-bar"><i style="width:${pct}%"></i></div>`;
        }
      } else if (sState.angry) {
        modeKey = `angry_${Math.round(sState.patience / 5)}`;
        if (el.dataset.key !== modeKey) {
          el.dataset.key = modeKey;
          el.className = 'world-pin pin-angry';
          el.innerHTML = `${ICONS.angry('sm')}<span>${st.name} (${Math.round(sState.patience)}%)</span>`;
        }
      } else if (buildable) {
        modeKey = `build_${st.cost}`;
        if (el.dataset.key !== modeKey) {
          el.dataset.key = modeKey;
          el.className = 'world-pin pin-buildable';
          el.style.setProperty('--pin-col', line.color);
          el.innerHTML = `<span class="pin-plus">+</span><span>${st.name} • ${formatBaht(st.cost)}</span>`;
        }
      } else {
        const showCoco = st.id === 'mrt_khlongtoei' && (state.buildings['coco_parc'] || 0) > 0;
        const showSk = st.id === 'mrt_sanamchai';
        const suffix = showCoco ? ' • COCO PARC' : (showSk ? ' • Suankularb' : '');
        modeKey = `open_${st.id === this.selectedStationId}_${suffix}`;
        if (el.dataset.key !== modeKey) {
          el.dataset.key = modeKey;
          el.className = `world-pin pin-station ${st.id === this.selectedStationId ? 'selected' : ''}`;
          el.style.setProperty('--pin-col', line.color);
          el.innerHTML = `<span class="pin-code">${st.code}</span><span>${st.name}${suffix}</span>`;
        }
      }
    }

    // Broken Train Clickable Repair Pins right above stalled smoking trains!
    const brokenIds = new Set();
    for (const tr of state.trains) {
      if (!tr.broken) continue;
      brokenIds.add(tr.id);
      const pose = this.engine.getTrainWorldPose(tr);
      if (!pose) continue;
      const proj = this.world.projectPoint(pose.x, 3.1, pose.z);
      let el = this.trainPins.get(tr.id);
      if (!proj) {
        if (el) el.style.display = 'none';
        continue;
      }
      if (!el) {
        el = document.createElement('button');
        el.className = 'world-pin pin-broken';
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.sound.unlock();
          const res = this.engine.repairTrain(tr.id);
          if (!res.ok && res.reason) {
            this.sound.playAngryBuzz();
            this.showToast('Not Enough Thai Baht', res.reason, ICONS.baht());
          }
        });
        this.elWorldOverlays.appendChild(el);
        this.trainPins.set(tr.id, el);
      }
      el.style.display = 'flex';
      el.style.transform = `translate3d(${proj.x}px, ${proj.y}px, 0) translate(-50%, -100%)`;
      const rCost = this.engine.getRepairCost(tr.id);
      const key = `${tr.repairing ? 'rep' : 'brk'}_${rCost}`;
      if (el.dataset.key !== key) {
        el.dataset.key = key;
        el.innerHTML = `${ICONS.wrench('sm')}<span>${tr.repairing ? 'Fixing...' : `Fix ${formatBaht(rCost)}`}</span>`;
      }
    }
    for (const [tid, el] of [...this.trainPins.entries()]) {
      if (!brokenIds.has(tid)) {
        el.remove();
        this.trainPins.delete(tid);
      }
    }
  }

  _updateIntercityPins() {
    for (const city of INTERCITY_CITIES) {
      const proj = this.world.projectPoint(city.x, 5.2, city.z);
      let el = this.intercityPins.get(city.id);
      if (!proj) {
        if (el) el.style.display = 'none';
        continue;
      }
      if (!el) {
        el = document.createElement('button');
        el.className = 'world-pin pin-station';
        el.style.setProperty('--pin-col', city.color);
        el.addEventListener('click', () => {
          this.sound.unlock();
          this.sound.playTick();
          this.openModal('intercity');
        });
        this.elWorldOverlays.appendChild(el);
        this.intercityPins.set(city.id, el);
      }
      const lvl = this.engine.state.intercityLevels[city.id] || 0;
      el.style.display = 'flex';
      el.style.transform = `translate3d(${proj.x}px, ${proj.y}px, 0) translate(-50%, -100%)`;
      const key = `${lvl}`;
      if (el.dataset.key !== key) {
        el.dataset.key = key;
        el.innerHTML = `<span class="pin-code">${lvl > 0 ? `Lv.${lvl}` : 'NEW'}</span><span>${city.name} • ${city.thai}</span>`;
      }
    }
  }
}
