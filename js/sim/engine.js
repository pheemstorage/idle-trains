// Idle Trains: Bangkok — Complete Tycoon Simulation Engine
// Handles 5-minute 7-day clock, rush hours, weather/floods, station-by-station construction,
// skywalk interchanges, train physics, breakdowns, angry passengers, Lv. 1-10 real-life businesses,
// Bangkok EV Bus endgame, Thailand Intercity Rail endgame, and auto-save / offline Baht earnings.

import {
  LINES,
  LINE_BY_ID,
  STATIONS,
  INTERCHANGES,
  STATION_NEIGHBORS,
  getCoreRailStationIds,
} from '../data/network.js';
import {
  STATION_BUILDINGS,
  getStationSevenConfig,
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

export const SAVE_KEY = 'idle_trains_bkk_save_v2';
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_DURATION_REAL_SEC = 300; // 1 in-game day = 5 real minutes at 1x speed

const WEATHER_ORDER = ['sunny', 'cloudy', 'rain', 'flood'];
export const WEATHER_META = {
  sunny:  { id: 'sunny',  label: 'Sunny Heat',      detail: '7-Eleven cold drinks +35% income' },
  cloudy: { id: 'cloudy', label: 'Tropical Breeze',  detail: 'Pleasant weather, +12% ridership' },
  rain:   { id: 'rain',   label: 'Monsoon Rain',     detail: 'Roads slow; BTS/MRT demand +35%' },
  flood:  { id: 'flood',  label: 'Bangkok Flood',    detail: 'BRT/Buses slowed 55%; BTS/MRT surge +85%' },
};

export function createInitialState() {
  const stationsState = {};
  for (const st of Object.values(STATIONS)) {
    stationsState[st.id] = {
      unlocked: Boolean(st.startOwned),
      waiting: st.startOwned ? 6 : 0,
      patience: 100,
      angry: false,
      totalServed: 0,
      transferBonus: 0,
    };
  }

  const linesState = {};
  for (const line of LINES) {
    linesState[line.id] = {
      unlocked: Boolean(line.unlockedAtStart),
      speedLevel: 1,
    };
  }

  const importedModels = {};
  for (const m of TRAIN_MODELS) {
    importedModels[m.id] = Boolean(m.unlockedAtStart);
  }

  const interchangesBuilt = {};
  for (const ic of INTERCHANGES) {
    interchangesBuilt[ic.id] = Boolean(ic.startBuilt);
  }
  // Transfer bonus for Siam's pre-connected Sukhumvit <-> Silom platform
  if (stationsState.bts_siam) stationsState.bts_siam.transferBonus = 0.22;
  if (stationsState.silom_siam) stationsState.silom_siam.transferBonus = 0.22;

  const intercityLevels = {};
  for (const city of INTERCITY_CITIES) {
    intercityLevels[city.id] = 0;
  }

  const starterTrain = {
    id: 'tr_1',
    lineId: 'bts_sukhumvit',
    modelId: 'siemens_bts',
    routeIndex: 0,
    segmentT: 0.15,
    direction: 1,
    dwellTimer: 0,
    passengers: 8,
    broken: false,
    repairing: false,
    repairProgress: 0,
    autoRepairTimer: 0,
  };

  return {
    version: 2,
    money: 2800,
    totalEarned: 2800,
    totalPassengers: 0,
    elapsedPlaySec: 0,

    // Time & 7-day calendar (dayMinute: 0..1440, start Mon 07:30 = 450)
    dayIndex: 0, // 0=Mon..6=Sun
    weekNumber: 1,
    dayMinute: 450,
    timeScale: 1, // 0, 1, 2, 4

    // Weather & Flood
    weather: 'sunny',
    nextWeather: 'cloudy',
    weatherTimer: 68, // real seconds until weather shift
    floodLevel: 0, // 0..1 animated
    rainLevel: 0,  // 0..1 animated
    lightningFlash: 0,

    // Global Upgrades
    maintenanceLevel: 1,
    crewLevel: 1,

    // World Data
    stations: stationsState,
    lines: linesState,
    constructions: {}, // stationId -> { stationId, totalTime, remainingTime }
    interchanges: interchangesBuilt,
    buildings: {}, // buildingId (including st711_<stId>) -> level (1..10)
    importedModels,
    trains: [starterTrain],
    nextTrainSeq: 2,

    // Endgame Unlocks
    masterTrainsCompleted: false,
    busesUnlocked: false,
    intercityUnlocked: false,
    intercityLevels,

    // Save Timestamp
    lastSavedAt: Date.now(),
  };
}

export class GameEngine {
  constructor(callbacks = {}) {
    this.cb = callbacks;
    this.state = createInitialState();
    this.coreRailIds = getCoreRailStationIds();
    this._saveAccum = 0;
    this._breakdownCooldown = 45; // grace period at start
    this._thunderCooldown = 8;
    this.offlineReport = null;
  }

  loadOrInit() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 2) return;

      // Merge defensively with fresh schema so newly added fields never break
      const base = createInitialState();
      this.state = {
        ...base,
        ...parsed,
        timeScale: 1, // Fixed authentic 1 day = 5 real minutes speed
        stations: { ...base.stations, ...(parsed.stations || {}) },
        lines: { ...base.lines, ...(parsed.lines || {}) },
        interchanges: { ...base.interchanges, ...(parsed.interchanges || {}) },
        importedModels: { ...base.importedModels, ...(parsed.importedModels || {}) },
        intercityLevels: { ...base.intercityLevels, ...(parsed.intercityLevels || {}) },
        buildings: { ...(parsed.buildings || {}) },
        constructions: { ...(parsed.constructions || {}) },
        trains: Array.isArray(parsed.trains) && parsed.trains.length ? parsed.trains : base.trains,
      };

      // Calculate offline idle earnings & offline construction completions
      const now = Date.now();
      const awaySec = Math.min(8 * 3600, Math.max(0, (now - (this.state.lastSavedAt || now)) / 1000));
      if (awaySec >= 15) {
        let completedCount = 0;
        for (const [stId, job] of Object.entries({ ...this.state.constructions })) {
          job.remainingTime -= awaySec;
          if (job.remainingTime <= 0) {
            this._finishStationConstruction(stId, true);
            completedCount++;
          }
        }
        const passiveRate = this.getTotalPassiveIncomePerSec();
        const trainEstRate = this.getEstimatedTrainIncomePerSec();
        const earnedOffline = Math.round((passiveRate + trainEstRate * 0.65) * awaySec);
        if (earnedOffline > 0 || completedCount > 0) {
          this.state.money += earnedOffline;
          this.state.totalEarned += earnedOffline;
          this.offlineReport = {
            awaySec: Math.round(awaySec),
            earned: earnedOffline,
            completedStations: completedCount,
          };
        }
      }
      this.state.lastSavedAt = now;
    } catch (_) {
      this.state = createInitialState();
    }
  }

  save() {
    try {
      this.state.lastSavedAt = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    } catch (_) {}
  }

  resetGame() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (_) {}
    this.state = createInitialState();
    this._breakdownCooldown = 45;
    this.offlineReport = null;
    this.cb.onFullReset?.();
  }

  // ===== TIME & RUSH HOUR HELPERS =====

  getTimeInfo() {
    const m = Math.floor(this.state.dayMinute) % 1440;
    const hour = Math.floor(m / 60);
    const min = m % 60;
    const isWeekend = this.state.dayIndex >= 5;
    const isMorningRush = !isWeekend && hour >= 7 && hour < 10;
    const isEveningRush = !isWeekend && hour >= 17 && hour < 20;
    const isMiddayHeat = hour >= 11 && hour < 16;
    const isNight = hour >= 19 || hour < 6;
    const isWeekendBoom = isWeekend && hour >= 10 && hour < 20;

    let phaseLabel = 'Off-Peak';
    if (isMorningRush) phaseLabel = 'Morning Rush';
    else if (isEveningRush) phaseLabel = 'Evening Rush';
    else if (isWeekendBoom) phaseLabel = this.state.dayIndex === 5 ? 'Saturday Market Peak' : 'Sunday Mall Peak';
    else if (isNight) phaseLabel = 'Night Service';

    return {
      dayName: DAYS_OF_WEEK[this.state.dayIndex],
      dayShort: DAYS_SHORT[this.state.dayIndex],
      weekNumber: this.state.weekNumber,
      hour,
      min,
      timeStr: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
      dayProgress: (this.state.dayMinute % 1440) / 1440,
      isWeekend,
      isMorningRush,
      isEveningRush,
      isMiddayHeat,
      isNight,
      isWeekendBoom,
      phaseLabel,
    };
  }

  setTimeScale(scale) {
    this.state.timeScale = scale;
  }

  // ===== STATION UNLOCKING & SCALING BUILD TIMES =====

  getUnlockedStationCount() {
    let n = 0;
    for (const s of Object.values(this.state.stations)) {
      if (s.unlocked) n++;
    }
    return n;
  }

  getCoreRailProgress() {
    let owned = 0;
    for (const id of this.coreRailIds) {
      if (this.state.stations[id]?.unlocked) owned++;
    }
    return { owned, total: this.coreRailIds.length, pct: Math.round((owned / this.coreRailIds.length) * 100) };
  }

  getEffectiveBuildTime(stationId) {
    const st = STATIONS[stationId];
    if (!st || st.buildTime <= 0) return 0;
    const ownedCount = this.getUnlockedStationCount();
    // Building more stations progressively increases build duration, offset by Construction Crew upgrades
    const growthFactor = 1 + Math.max(0, ownedCount - 2) * 0.018;
    const crewSpeed = 1 + (this.state.crewLevel - 1) * 0.18;
    return Math.max(6, Math.round((st.buildTime * growthFactor) / crewSpeed));
  }

  canBuildStation(stationId) {
    const st = STATIONS[stationId];
    if (!st) return false;
    const stState = this.state.stations[stationId];
    if (!stState || stState.unlocked) return false;
    if (this.state.constructions[stationId]) return false;
    if (!this.state.lines[st.lineId]?.unlocked) return false;

    const neighbors = STATION_NEIGHBORS[stationId] || [];
    return neighbors.some((nid) => this.state.stations[nid]?.unlocked);
  }

  getBuildableStations() {
    return Object.keys(STATIONS).filter((id) => this.canBuildStation(id));
  }

  startBuildStation(stationId) {
    if (!this.canBuildStation(stationId)) return { ok: false, reason: 'Locked' };
    const st = STATIONS[stationId];
    if (this.state.money < st.cost) return { ok: false, reason: 'Not enough Baht' };

    this.state.money -= st.cost;
    const totalTime = this.getEffectiveBuildTime(stationId);
    this.state.constructions[stationId] = {
      stationId,
      totalTime,
      remainingTime: totalTime,
    };
    this.cb.onBuildStart?.(stationId, totalTime);
    this.save();
    return { ok: true, totalTime };
  }

  getRushCost(stationId) {
    const job = this.state.constructions[stationId];
    const st = STATIONS[stationId];
    if (!job || !st) return 0;
    const ratio = Math.max(0.15, job.remainingTime / Math.max(1, job.totalTime));
    return Math.max(120, Math.round(st.cost * 0.45 * ratio));
  }

  rushConstruction(stationId) {
    const job = this.state.constructions[stationId];
    if (!job) return { ok: false };
    const cost = this.getRushCost(stationId);
    if (this.state.money < cost) return { ok: false, reason: 'Not enough Baht' };
    this.state.money -= cost;
    this._finishStationConstruction(stationId, false);
    this.save();
    return { ok: true };
  }

  _finishStationConstruction(stationId, silent = false) {
    delete this.state.constructions[stationId];
    const stState = this.state.stations[stationId];
    if (!stState || stState.unlocked) return;
    stState.unlocked = true;
    stState.waiting = 8;
    stState.patience = 100;
    stState.angry = false;

    const st = STATIONS[stationId];
    const line = LINE_BY_ID[st.lineId];
    // Ensure line has at least 1 train once 2+ connected stations exist
    const lineTrains = this.state.trains.filter((t) => t.lineId === line.id);
    const walk = this.getTrainWalkForLine(line.id, 0);
    if (lineTrains.length === 0 && walk.waypoints.length >= 2) {
      this._spawnTrain(line.id, line.defaultTrainModel);
    }

    if (!silent) {
      this.cb.onStationCompleted?.(stationId);
    }

    // AUTO-UNLOCK ANY CONNECTED INTERCHANGE LINE when you build a station touching another line!
    for (const ic of INTERCHANGES) {
      if (this.state.interchanges[ic.id]) continue;
      if (ic.from === stationId || ic.to === stationId) {
        this._autoConnectInterchange(ic, silent);
      }
    }

    this._checkMasterEndgameUnlocks(silent);
  }

  _autoConnectInterchange(ic, silent = false) {
    this.state.interchanges[ic.id] = true;
    const stA = STATIONS[ic.from];
    const stB = STATIONS[ic.to];
    for (const st of [stA, stB]) {
      this.state.lines[st.lineId].unlocked = true;
      if (!this.state.stations[st.id].unlocked) {
        this.state.stations[st.id].unlocked = true;
        this.state.stations[st.id].waiting = 8;
        this.state.stations[st.id].patience = 100;
      }
      this.state.stations[st.id].transferBonus = (this.state.stations[st.id].transferBonus || 0) + ic.bonus;

      const line = LINE_BY_ID[st.lineId];
      const walk = this.getTrainWalkForLine(line.id, 0);
      const count = this.state.trains.filter((t) => t.lineId === line.id).length;
      if (count === 0 && walk.waypoints.length >= 2) {
        this._spawnTrain(line.id, line.defaultTrainModel);
      }
    }
    if (!silent) {
      this.cb.onInterchangeBuilt?.(ic);
    }
  }

  _checkMasterEndgameUnlocks(silent = false) {
    if (this.state.masterTrainsCompleted) return;
    const prog = this.getCoreRailProgress();
    if (prog.owned >= prog.total) {
      this.state.masterTrainsCompleted = true;
      this.state.busesUnlocked = true;
      this.state.intercityUnlocked = true;

      // Unlock Bangkok EV City Bus network starter pair!
      this.state.lines.bkk_bus.unlocked = true;
      this.state.stations.bus_siam.unlocked = true;
      this.state.stations.bus_pratunam.unlocked = true;
      this._spawnTrain('bkk_bus', 'thai_smile_ev_bus');

      if (!silent) {
        this.cb.onMasterUnlocked?.();
      }
      this.save();
    }
  }

  // ===== INTERCHANGE SKYWALKS & TUNNELS =====

  getInterchangesForStation(stationId) {
    return INTERCHANGES.filter((ic) => ic.from === stationId || ic.to === stationId);
  }

  canBuildInterchange(interchangeId) {
    const ic = INTERCHANGES.find((x) => x.id === interchangeId);
    if (!ic || this.state.interchanges[ic.id]) return false;
    const aUnlocked = this.state.stations[ic.from]?.unlocked;
    const bUnlocked = this.state.stations[ic.to]?.unlocked;
    return Boolean(aUnlocked || bUnlocked);
  }

  buildInterchange(interchangeId) {
    const ic = INTERCHANGES.find((x) => x.id === interchangeId);
    if (!ic || !this.canBuildInterchange(ic.id)) return { ok: false };
    if (this.state.money < ic.cost) return { ok: false, reason: 'Not enough Baht' };

    this.state.money -= ic.cost;
    this.state.interchanges[ic.id] = true;

    const stA = STATIONS[ic.from];
    const stB = STATIONS[ic.to];
    for (const st of [stA, stB]) {
      this.state.lines[st.lineId].unlocked = true;
      if (!this.state.stations[st.id].unlocked) {
        this.state.stations[st.id].unlocked = true;
        this.state.stations[st.id].waiting = 7;
        this.state.stations[st.id].patience = 100;
      }
      this.state.stations[st.id].transferBonus = (this.state.stations[st.id].transferBonus || 0) + ic.bonus;

      // If this line now has 2+ unlocked stations and 0 vehicles, spawn starter vehicle
      const line = LINE_BY_ID[st.lineId];
      const walk = this.getTrainWalkForLine(line.id, 0);
      const count = this.state.trains.filter((t) => t.lineId === line.id).length;
      if (count === 0 && walk.waypoints.length >= 2) {
        this._spawnTrain(line.id, line.defaultTrainModel);
      }
    }

    this.cb.onInterchangeBuilt?.(ic);
    this._checkMasterEndgameUnlocks(false);
    this.save();
    return { ok: true, interchange: ic };
  }

  // ===== REAL-LIFE NEARBY BUILDINGS & STATION 7-ELEVEN =====

  getBuildingsForStation(stationId) {
    const st = STATIONS[stationId];
    if (!st) return [];
    const seven = getStationSevenConfig(st);
    const nearby = (STATION_BUILDINGS[stationId] || []).map((b) => ({ ...b, stationId }));
    return [seven, ...nearby];
  }

  getBuildingLevel(buildingId) {
    return this.state.buildings[buildingId] || 0;
  }

  buyOrUpgradeBuilding(stationId, buildingId) {
    if (!this.state.stations[stationId]?.unlocked) return { ok: false, reason: 'Station locked' };
    const list = this.getBuildingsForStation(stationId);
    const cfg = list.find((b) => b.id === buildingId);
    if (!cfg) return { ok: false };

    const cur = this.getBuildingLevel(buildingId);
    if (cur >= 10) return { ok: false, reason: 'Max Level' };

    const cost = getBuildingUpgradeCost(cfg.baseCost, cur);
    if (this.state.money < cost) return { ok: false, reason: 'Not enough Baht' };

    this.state.money -= cost;
    this.state.buildings[buildingId] = cur + 1;
    this.cb.onBuildingUpgraded?.(stationId, cfg, cur + 1);
    this.save();
    return { ok: true, level: cur + 1, building: cfg };
  }

  getTotalPassiveIncomePerSec() {
    const time = this.getTimeInfo();
    const hotSevenBonus = (this.state.weather === 'sunny' && time.isMiddayHeat) ? 1.35 : 1.0;
    let total = 0;

    for (const st of Object.values(STATIONS)) {
      if (!this.state.stations[st.id]?.unlocked) continue;
      const list = this.getBuildingsForStation(st.id);
      for (const b of list) {
        const lvl = this.state.buildings[b.id] || 0;
        if (lvl <= 0) continue;
        let inc = getBuildingIncome(b.baseIncome, lvl);
        if (b.category === 'seven') inc *= hotSevenBonus;
        total += inc;
      }
    }

    // Add Thailand Intercity passive payouts
    if (this.state.intercityUnlocked) {
      for (const city of INTERCITY_CITIES) {
        const lvl = this.state.intercityLevels[city.id] || 0;
        if (lvl > 0) total += getIntercityIncome(city, lvl);
      }
    }
    return total;
  }

  // ===== FLEET, SPEED UPGRADES & IMPORT TRAINS =====

  getLineSpeedUpgradeCost(lineId) {
    const ls = this.state.lines[lineId];
    if (!ls) return 0;
    const line = LINE_BY_ID[lineId];
    const base = line.baseFare * 14;
    return Math.round(base * Math.pow(1.68, ls.speedLevel - 1));
  }

  upgradeLineSpeed(lineId) {
    const ls = this.state.lines[lineId];
    if (!ls || !ls.unlocked || ls.speedLevel >= 15) return { ok: false };
    const cost = this.getLineSpeedUpgradeCost(lineId);
    if (this.state.money < cost) return { ok: false, reason: 'Not enough Baht' };
    this.state.money -= cost;
    ls.speedLevel++;
    this.cb.onUpgrade?.('speed', lineId);
    this.save();
    return { ok: true, level: ls.speedLevel };
  }

  getMaxTrainsForLine(lineId) {
    const walk = this.getTrainWalkForLine(lineId, 0);
    if (walk.waypoints.length < 2) return 0;
    const unlocked = this.getUnlockedStationsForLine(lineId).length;
    return Math.min(8, Math.max(2, Math.floor(unlocked * 0.65) + 1));
  }

  getAddTrainCost(lineId, modelId) {
    const model = TRAIN_MODEL_BY_ID[modelId];
    const count = this.state.trains.filter((t) => t.lineId === lineId).length;
    return Math.round(model.deployCost * Math.pow(1.48, count));
  }

  importTrainModel(modelId) {
    const model = TRAIN_MODEL_BY_ID[modelId];
    if (!model || this.state.importedModels[modelId]) return { ok: false };
    if (this.state.money < model.importCost) return { ok: false, reason: 'Not enough Baht' };
    this.state.money -= model.importCost;
    this.state.importedModels[modelId] = true;
    this.cb.onTrainImported?.(model);
    this.save();
    return { ok: true, model };
  }

  addTrainToLine(lineId, modelId) {
    const line = LINE_BY_ID[lineId];
    if (!line || !this.state.lines[lineId]?.unlocked) return { ok: false };
    if (!this.state.importedModels[modelId]) return { ok: false, reason: 'Import train first' };

    const curCount = this.state.trains.filter((t) => t.lineId === lineId).length;
    const maxCount = this.getMaxTrainsForLine(lineId);
    if (curCount >= maxCount) return { ok: false, reason: 'Unlock more stations on this line first' };

    const cost = this.getAddTrainCost(lineId, modelId);
    if (this.state.money < cost) return { ok: false, reason: 'Not enough Baht' };

    this.state.money -= cost;
    const tr = this._spawnTrain(lineId, modelId);
    this.cb.onTrainAdded?.(tr);
    this.save();
    return { ok: true, train: tr };
  }

  retrofitLineTrains(lineId, modelId) {
    const model = TRAIN_MODEL_BY_ID[modelId];
    if (!model || !this.state.importedModels[modelId]) return { ok: false };
    const lineTrains = this.state.trains.filter((t) => t.lineId === lineId && t.modelId !== modelId);
    if (!lineTrains.length) return { ok: false, reason: 'Already equipped' };
    const cost = Math.round(model.deployCost * 0.55 * lineTrains.length);
    if (this.state.money < cost) return { ok: false, reason: 'Not enough Baht' };
    this.state.money -= cost;
    for (const t of lineTrains) {
      t.modelId = modelId;
    }
    this.cb.onFleetRetrofitted?.(lineId, modelId);
    this.save();
    return { ok: true };
  }

  _spawnTrain(lineId, modelId) {
    const existing = this.state.trains.filter((t) => t.lineId === lineId).length;
    const tr = {
      id: `tr_${this.state.nextTrainSeq++}`,
      lineId,
      modelId,
      routeIndex: existing % Math.max(1, this.getUnlockedStationsForLine(lineId).length),
      segmentT: (existing * 0.37) % 1,
      direction: existing % 2 === 0 ? 1 : -1,
      dwellTimer: 0,
      passengers: 0,
      broken: false,
      repairing: false,
      repairProgress: 0,
      autoRepairTimer: 0,
    };
    this.state.trains.push(tr);
    return tr;
  }

  // ===== GLOBAL UPGRADES (MAINTENANCE & CREW) =====

  getMaintenanceUpgradeCost() {
    return Math.round(680 * Math.pow(1.9, this.state.maintenanceLevel - 1));
  }

  upgradeMaintenance() {
    if (this.state.maintenanceLevel >= 10) return { ok: false };
    const cost = this.getMaintenanceUpgradeCost();
    if (this.state.money < cost) return { ok: false, reason: 'Not enough Baht' };
    this.state.money -= cost;
    this.state.maintenanceLevel++;
    this.cb.onUpgrade?.('maintenance');
    this.save();
    return { ok: true };
  }

  getCrewUpgradeCost() {
    return Math.round(750 * Math.pow(1.85, this.state.crewLevel - 1));
  }

  upgradeCrew() {
    if (this.state.crewLevel >= 10) return { ok: false };
    const cost = this.getCrewUpgradeCost();
    if (this.state.money < cost) return { ok: false, reason: 'Not enough Baht' };
    this.state.money -= cost;
    this.state.crewLevel++;
    this.cb.onUpgrade?.('crew');
    this.save();
    return { ok: true };
  }

  // ===== TRAIN BREAKDOWN REPAIR (STRICTLY COSTS REAL THAI BAHT!) =====

  getRepairCost(trainId) {
    const tr = this.state.trains.find((t) => t.id === trainId);
    if (!tr) return 0;
    const line = LINE_BY_ID[tr.lineId];
    const model = TRAIN_MODEL_BY_ID[tr.modelId] || TRAIN_MODEL_BY_ID.siemens_bts;
    return Math.max(650, Math.round(line.baseFare * 16 * model.fareMult));
  }

  repairTrain(trainId) {
    const tr = this.state.trains.find((t) => t.id === trainId);
    if (!tr || !tr.broken || tr.repairing) return { ok: false };
    const cost = this.getRepairCost(trainId);
    if (this.state.money < cost) {
      return { ok: false, cost, reason: `Need ฿${cost.toLocaleString('en-US')} to repair train!` };
    }
    this.state.money -= cost;
    tr.repairing = true;
    tr.repairProgress = 0;
    this.cb.onRepairStarted?.(tr, cost);
    this.save();
    return { ok: true, cost };
  }

  // ===== INTERCITY THAILAND UPGRADES =====

  upgradeIntercityCity(cityId) {
    if (!this.state.intercityUnlocked) return { ok: false, reason: 'Finish all Bangkok train lines first' };
    const city = INTERCITY_CITIES.find((c) => c.id === cityId);
    if (!city) return { ok: false };
    const lvl = this.state.intercityLevels[cityId] || 0;
    if (lvl >= 10) return { ok: false, reason: 'Max Level' };
    const cost = getIntercityUpgradeCost(city, lvl);
    if (this.state.money < cost) return { ok: false, reason: 'Not enough Baht' };
    this.state.money -= cost;
    this.state.intercityLevels[cityId] = lvl + 1;
    this.cb.onIntercityUpgraded?.(city, lvl + 1);
    this.save();
    return { ok: true, level: lvl + 1 };
  }

  // ===== SANDBOX / TEST HELPERS (optional in Settings) =====

  grantSandboxBoost() {
    this.state.money += 500000;
    this.state.totalEarned += 500000;
    this.save();
  }

  unlockAllShowcase() {
    for (const line of LINES) {
      this.state.lines[line.id].unlocked = true;
    }
    for (const st of Object.values(STATIONS)) {
      this.state.stations[st.id].unlocked = true;
      this.state.stations[st.id].waiting = 10;
      this.state.stations[st.id].patience = 95;
    }
    for (const ic of INTERCHANGES) {
      this.state.interchanges[ic.id] = true;
    }
    this.state.constructions = {};
    this.state.masterTrainsCompleted = true;
    this.state.busesUnlocked = true;
    this.state.intercityUnlocked = true;
    // Build COCO PARC, Suankularb School & iconic landmarks!
    this.state.buildings['coco_parc'] = 3;
    this.state.buildings['st711_mrt_khlongtoei'] = 2;
    this.state.buildings['suankularb_school'] = 2;
    this.state.buildings['st711_mrt_sanamchai'] = 2;
    this.state.buildings['siam_paragon'] = 2;
    this.state.buildings['centralworld'] = 2;
    this.state.buildings['terminal_21'] = 2;
    this.state.buildings['mahanakhon'] = 2;
    this.state.buildings['iconsiam_mall'] = 2;
    for (const line of LINES) {
      const targetTrains = line.stations.length >= 10 ? 3 : 2;
      const curCount = this.state.trains.filter((t) => t.lineId === line.id).length;
      for (let i = curCount; i < targetTrains; i++) {
        this._spawnTrain(line.id, line.defaultTrainModel);
      }
      this.state.lines[line.id].speedLevel = Math.max(this.state.lines[line.id].speedLevel, 4);
    }
    this.state.maintenanceLevel = Math.max(this.state.maintenanceLevel, 4);
    this.state.money += 2500000;
    this.save();
    this.cb.onFullReset?.();
  }

  // Station train customer multiplier from Malls, Attractions, Schools, Markets, Hotels & Condos!
  getStationRidershipMultiplier(stationId) {
    const bList = this.getBuildingsForStation(stationId);
    let bonus = 0;
    for (const b of bList) {
      const lvl = this.state.buildings[b.id] || 0;
      if (lvl > 0) bonus += getBuildingRiderBoost(b.category, lvl);
    }
    return 1 + bonus;
  }

  // ===== ROUTE GEOMETRY HELPERS =====

  getUnlockedStationsForLine(lineId) {
    const line = LINE_BY_ID[lineId];
    if (!line) return [];
    const seen = new Set();
    const out = [];
    const addIfUnlocked = (id) => {
      if (!seen.has(id) && this.state.stations[id]?.unlocked) {
        seen.add(id);
        out.push(id);
      }
    };
    for (const id of line.stations) addIfUnlocked(id);
    if (line.extraBranches) {
      for (const [a, b] of line.extraBranches) {
        addIfUnlocked(a);
        addIfUnlocked(b);
      }
    }
    return out;
  }

  // Returns strictly track-connected { waypoints, isClosedLoop } so trains NEVER teleport across unbuilt gaps or branch ends!
  getTrainWalkForLine(lineId, trainSlotIndex = 0) {
    const line = LINE_BY_ID[lineId];
    if (!line) return { waypoints: [], isClosedLoop: false };

    const adj = new Map();
    const addEdge = (a, b) => {
      if (!this.state.stations[a]?.unlocked || !this.state.stations[b]?.unlocked) return;
      if (!adj.has(a)) adj.set(a, []);
      if (!adj.has(b)) adj.set(b, []);
      if (!adj.get(a).includes(b)) adj.get(a).push(b);
      if (!adj.get(b).includes(a)) adj.get(b).push(a);
    };

    for (let i = 0; i < line.stations.length - 1; i++) {
      addEdge(line.stations[i], line.stations[i + 1]);
    }
    if (line.isLoop && line.stations.length >= 3) {
      addEdge(line.stations[line.stations.length - 1], line.stations[0]);
    }
    if (line.extraBranches) {
      for (const [a, b] of line.extraBranches) {
        addEdge(a, b);
      }
    }

    // Find connected components with >= 2 stations
    const visited = new Set();
    const components = [];
    const allOrder = [...line.stations];
    if (line.extraBranches) {
      for (const [a, b] of line.extraBranches) {
        if (!allOrder.includes(a)) allOrder.push(a);
        if (!allOrder.includes(b)) allOrder.push(b);
      }
    }
    const orderIdx = new Map(allOrder.map((id, idx) => [id, idx]));

    for (const start of adj.keys()) {
      if (visited.has(start)) continue;
      const comp = [];
      const queue = [start];
      visited.add(start);
      while (queue.length) {
        const cur = queue.shift();
        comp.push(cur);
        for (const nb of adj.get(cur) || []) {
          if (!visited.has(nb)) {
            visited.add(nb);
            queue.push(nb);
          }
        }
      }
      if (comp.length >= 2) components.push(comp);
    }

    if (components.length === 0) return { waypoints: [], isClosedLoop: false };
    components.sort((a, b) => b.length - a.length || (orderIdx.get(a[0]) ?? 0) - (orderIdx.get(b[0]) ?? 0));
    const comp = components[trainSlotIndex % components.length];
    const compSet = new Set(comp);
    const mainSet = new Set(line.stations);

    // Helper: trace an unlocked spur branch starting from hub outside mainSet
    const traceBranchFrom = (hub) => {
      const spurStarts = (adj.get(hub) || []).filter((nb) => !mainSet.has(nb) && compSet.has(nb));
      if (!spurStarts.length) return [];
      const chain = [];
      let prev = hub;
      let cur = spurStarts[0];
      while (cur) {
        chain.push(cur);
        const nexts = (adj.get(cur) || []).filter((nb) => nb !== prev && compSet.has(nb));
        prev = cur;
        cur = nexts[0] || null;
      }
      return chain;
    };

    // Case 1: Full closed loop unlocked (e.g. MRT Blue 32-station ring + optional Lak Song western spur out-and-back!)
    if (line.isLoop && line.stations.every((id) => compSet.has(id))) {
      const waypoints = [];
      for (const stId of line.stations) {
        waypoints.push(stId);
        const branch = traceBranchFrom(stId);
        if (branch.length) {
          waypoints.push(...branch);
          for (let k = branch.length - 2; k >= 0; k--) waypoints.push(branch[k]);
          waypoints.push(stId);
        }
      }
      return { waypoints, isClosedLoop: true };
    }

    // Case 2: Open path or tree (partial loop or linear line)
    const endpoints = comp.filter((id) => (adj.get(id)?.length || 0) === 1);
    if (endpoints.length === 2) {
      // Simple track path — start from earliest station in line order
      endpoints.sort((a, b) => (orderIdx.get(a) ?? 0) - (orderIdx.get(b) ?? 0));
      const waypoints = [endpoints[0]];
      let prev = null;
      let cur = endpoints[0];
      while (true) {
        const next = (adj.get(cur) || []).find((nb) => nb !== prev && compSet.has(nb));
        if (!next) break;
        waypoints.push(next);
        prev = cur;
        cur = next;
      }
      return { waypoints, isClosedLoop: false };
    }

    // Tree with 3+ endpoints (e.g. partial MRT Blue crossing Tha Phra with Lak Song spur):
    // Walk shortest path between the two main-line endpoints, detouring out-and-back along any spur!
    const mainEndpoints = endpoints.filter((id) => mainSet.has(id));
    const startNode = (mainEndpoints.length >= 2 ? mainEndpoints : endpoints)
      .slice()
      .sort((a, b) => (orderIdx.get(a) ?? 0) - (orderIdx.get(b) ?? 0))[0];
    const endNode = (mainEndpoints.length >= 2 ? mainEndpoints : endpoints)
      .slice()
      .sort((a, b) => (orderIdx.get(a) ?? 0) - (orderIdx.get(b) ?? 0))[1] || comp[comp.length - 1];

    // BFS shortest path from startNode to endNode
    const parent = new Map([[startNode, null]]);
    const bfsQ = [startNode];
    while (bfsQ.length) {
      const cur = bfsQ.shift();
      if (cur === endNode) break;
      for (const nb of adj.get(cur) || []) {
        if (!parent.has(nb) && compSet.has(nb)) {
          parent.set(nb, cur);
          bfsQ.push(nb);
        }
      }
    }
    const spine = [];
    for (let cur = endNode; cur != null; cur = parent.get(cur)) spine.push(cur);
    spine.reverse();

    const waypoints = [];
    for (const stId of spine) {
      waypoints.push(stId);
      const branch = traceBranchFrom(stId);
      if (branch.length) {
        waypoints.push(...branch);
        for (let k = branch.length - 2; k >= 0; k--) waypoints.push(branch[k]);
        waypoints.push(stId);
      }
    }
    return { waypoints, isClosedLoop: false };
  }

  getEstimatedTrainIncomePerSec() {
    let est = 0;
    for (const tr of this.state.trains) {
      const line = LINE_BY_ID[tr.lineId];
      const model = TRAIN_MODEL_BY_ID[tr.modelId];
      if (!line || !model) continue;
      const unlocked = this.getUnlockedStationsForLine(tr.lineId).length;
      if (unlocked < 2) continue;
      const speedLvl = this.state.lines[tr.lineId]?.speedLevel || 1;
      est += line.baseFare * model.fareMult * (1 + (speedLvl - 1) * 0.14) * (model.capacity / 30) * 0.55;
    }
    return est;
  }

  getNetworkSatisfaction() {
    let sum = 0;
    let count = 0;
    for (const s of Object.values(this.state.stations)) {
      if (s.unlocked) {
        sum += s.patience;
        count++;
      }
    }
    return count ? Math.round(sum / count) : 100;
  }

  // ===== MAIN SIMULATION TICK =====

  step(realDt) {
    const dt = Math.min(0.1, realDt) * this.state.timeScale;
    if (dt <= 0) return;

    this.state.elapsedPlaySec += dt;

    // 1. Advance 7-day 5-minute clock (1 day = 300 real seconds at 1x)
    const minutesPerSec = 1440 / DAY_DURATION_REAL_SEC; // 4.8 in-game mins / sec
    this.state.dayMinute += dt * minutesPerSec;
    if (this.state.dayMinute >= 1440) {
      this.state.dayMinute -= 1440;
      this.state.dayIndex = (this.state.dayIndex + 1) % 7;
      if (this.state.dayIndex === 0) this.state.weekNumber++;
      this.cb.onNewDay?.(this.getTimeInfo());
    }

    const time = this.getTimeInfo();

    // 2. Weather & Bangkok Flood simulation
    this._stepWeather(dt);

    // 3. Passive Income from Lv. 1-10 Real-Life Buildings, Station 7-Elevens & Intercity
    const passivePerSec = this.getTotalPassiveIncomePerSec();
    if (passivePerSec > 0) {
      const gain = passivePerSec * dt;
      this.state.money += gain;
      this.state.totalEarned += gain;
    }

    // 4. Station Construction Timers
    for (const [stId, job] of Object.entries(this.state.constructions)) {
      // Heavy flood storms slow open-air construction slightly
      const weatherBuildFactor = this.state.weather === 'flood' ? 0.8 : 1.0;
      job.remainingTime -= dt * weatherBuildFactor;
      if (job.remainingTime <= 0) {
        this._finishStationConstruction(stId, false);
      }
    }

    // 5. Passenger Spawning & Angry Passenger Patience
    this._stepStations(dt, time);

    // 6. Train Movement, Breakdowns, Traffic Backups & Fare Collection
    this._stepTrains(dt, time);

    // 7. Periodic Auto-Save (every 8s + immediately on actions & iPad app-switch)
    this._saveAccum += realDt;
    if (this._saveAccum >= 8) {
      this._saveAccum = 0;
      this.save();
    }
  }

  _stepWeather(dt) {
    this.state.weatherTimer -= dt;
    if (this.state.weatherTimer <= 0) {
      this.state.weather = this.state.nextWeather;
      // Pick next weather realistically for tropical Bangkok
      const roll = Math.random();
      if (this.state.weather === 'flood') {
        this.state.nextWeather = roll < 0.65 ? 'rain' : 'cloudy';
      } else if (this.state.weather === 'rain') {
        this.state.nextWeather = roll < 0.42 ? 'flood' : (roll < 0.78 ? 'cloudy' : 'sunny');
      } else if (this.state.weather === 'cloudy') {
        this.state.nextWeather = roll < 0.48 ? 'rain' : 'sunny';
      } else {
        this.state.nextWeather = roll < 0.58 ? 'cloudy' : 'rain';
      }
      this.state.weatherTimer = 52 + Math.random() * 42;
      this.cb.onWeatherChanged?.(this.state.weather);
    }

    const targetRain = this.state.weather === 'flood' ? 1.0 : (this.state.weather === 'rain' ? 0.6 : 0);
    const targetFlood = this.state.weather === 'flood' ? 1.0 : (this.state.weather === 'rain' ? 0.22 : 0);
    this.state.rainLevel += (targetRain - this.state.rainLevel) * Math.min(1, dt * 0.45);
    this.state.floodLevel += (targetFlood - this.state.floodLevel) * Math.min(1, dt * 0.25);

    if (this.state.lightningFlash > 0) {
      this.state.lightningFlash = Math.max(0, this.state.lightningFlash - dt * 3.8);
    }
    if (this.state.weather === 'flood') {
      this._thunderCooldown -= dt;
      if (this._thunderCooldown <= 0) {
        this.state.lightningFlash = 1.0;
        this._thunderCooldown = 9 + Math.random() * 14;
        this.cb.onThunder?.();
      }
    }
  }

  forceWeather(weatherId) {
    if (!WEATHER_ORDER.includes(weatherId)) return;
    this.state.weather = weatherId;
    this.state.weatherTimer = 70;
    this.cb.onWeatherChanged?.(weatherId);
  }

  _stepStations(dt, time) {
    // Check which lines currently have a broken train
    const brokenLines = new Set();
    for (const tr of this.state.trains) {
      if (tr.broken) brokenLines.add(tr.lineId);
    }

    for (const st of Object.values(STATIONS)) {
      const sState = this.state.stations[st.id];
      if (!sState || !sState.unlocked) continue;
      const line = LINE_BY_ID[st.lineId];

      // Only spawn waiting passengers if line has 2+ unlocked stations
      const unlockedOnLine = this.getUnlockedStationsForLine(st.lineId).length;
      if (unlockedOnLine < 2) {
        sState.waiting = Math.min(sState.waiting, 8);
        sState.patience = 100;
        sState.angry = false;
        continue;
      }

      let mult = 1.0;
      if ((time.isMorningRush || time.isEveningRush) && st.cbd) mult *= 2.25;
      else if (time.isMorningRush || time.isEveningRush) mult *= 1.55;
      else if (time.isWeekendBoom && (st.mallHub || st.marketHub)) mult *= 1.85;
      else if (time.isNight && st.nightlife) mult *= 1.55;
      else if (time.isNight) mult *= 0.65;

      // Weather demand shift: Bangkok floods cause a MASSIVE passenger surge to BTS/MRT!
      if (this.state.weather === 'flood') {
        mult *= line.floodSensitive ? 0.55 : 1.85;
      } else if (this.state.weather === 'rain') {
        mult *= line.floodSensitive ? 0.8 : 1.35;
      } else if (this.state.weather === 'cloudy') {
        mult *= 1.12;
      }

      // Malls, Attractions, Schools & Markets drive MASSIVE extra train customers to this station!
      const bList = this.getBuildingsForStation(st.id);
      let hasStationSeven = false;
      for (const b of bList) {
        const lvl = this.state.buildings[b.id] || 0;
        if (lvl > 0 && b.isStationSeven) hasStationSeven = true;
      }
      const attractionMult = this.getStationRidershipMultiplier(st.id);
      mult *= attractionMult;

      const spawnRate = st.demand * 1.25 * mult;
      sState.waiting = Math.min(220, sState.waiting + spawnRate * dt);

      // Patience / Angry Passenger Calculation
      const crowdThreshold = hasStationSeven ? 28 : 20;
      const lineStalled = brokenLines.has(st.lineId);

      if (sState.waiting > crowdThreshold || lineStalled) {
        let drain = 0;
        if (sState.waiting > crowdThreshold) {
          drain += (sState.waiting - crowdThreshold) * 0.24;
        }
        if (lineStalled) {
          drain += 4.2;
        }
        if (hasStationSeven) drain *= 0.6; // Cold drinks & toasted sandwiches soothe commuters!
        sState.patience = Math.max(0, sState.patience - drain * dt);
      } else {
        const recov = hasStationSeven ? 7.5 : 4.2;
        sState.patience = Math.min(100, sState.patience + recov * dt);
      }

      const wasAngry = sState.angry;
      sState.angry = sState.patience < 45;
      if (sState.angry && !wasAngry) {
        this.cb.onStationAngry?.(st.id);
      }
    }
  }

  _stepTrains(dt, time) {
    this._breakdownCooldown = Math.max(0, this._breakdownCooldown - dt);

    // Count active broken trains globally & per line
    const brokenByLine = {};
    let totalBroken = 0;
    for (const tr of this.state.trains) {
      if (tr.broken) {
        totalBroken++;
        brokenByLine[tr.lineId] = (brokenByLine[tr.lineId] || 0) + 1;
      }
    }

    const lineSlotCounter = {};
    for (const tr of this.state.trains) {
      const slotIdx = lineSlotCounter[tr.lineId] || 0;
      lineSlotCounter[tr.lineId] = slotIdx + 1;
      const line = LINE_BY_ID[tr.lineId];
      const model = TRAIN_MODEL_BY_ID[tr.modelId];
      const walk = this.getTrainWalkForLine(tr.lineId, slotIdx);
      const route = walk.waypoints;
      if (!line || !model || route.length < 2) continue;

      // Clamp routeIndex safely
      if (tr.routeIndex >= route.length) tr.routeIndex = 0;

      // Handle breakdown repair progression
      if (tr.broken) {
        if (tr.repairing) {
          tr.repairProgress += dt / 1.8;
          if (tr.repairProgress >= 1) {
            tr.broken = false;
            tr.repairing = false;
            tr.repairProgress = 0;
            tr.autoRepairTimer = 0;
            this.cb.onRepairFinished?.(tr);
          }
        } else if (this.state.maintenanceLevel >= 3) {
          // Auto-mechanic dispatch at Maintenance Lv. 3+ (deducts discounted repair fee if affordable!)
          const autoDelay = Math.max(5, 16 - this.state.maintenanceLevel * 1.1);
          tr.autoRepairTimer += dt;
          if (tr.autoRepairTimer >= autoDelay) {
            const autoCost = Math.round(this.getRepairCost(tr.id) * 0.5);
            if (this.state.money >= autoCost) {
              this.state.money -= autoCost;
              tr.repairing = true;
              tr.repairProgress = 0;
              this.cb.onRepairStarted?.(tr, autoCost);
            }
          }
        }
        continue;
      }

      // Chance of random breakdown while moving
      if (this._breakdownCooldown <= 0 && totalBroken < 2 && tr.dwellTimer <= 0) {
        const maintFactor = Math.pow(0.84, this.state.maintenanceLevel - 1);
        const stormFactor = this.state.weather === 'flood' ? 1.55 : (this.state.weather === 'rain' ? 1.2 : 1.0);
        const failProbPerSec = (1 - model.reliability) * 0.045 * maintFactor * stormFactor;
        if (Math.random() < failProbPerSec * dt) {
          tr.broken = true;
          tr.repairing = false;
          tr.repairProgress = 0;
          tr.autoRepairTimer = 0;
          totalBroken++;
          brokenByLine[tr.lineId] = (brokenByLine[tr.lineId] || 0) + 1;
          this._breakdownCooldown = 26 + Math.random() * 24;
          this.cb.onTrainBreakdown?.(tr);
          continue;
        }
      }

      // Station dwell pause
      if (tr.dwellTimer > 0) {
        tr.dwellTimer -= dt;
        continue;
      }

      // Compute next waypoint along strictly track-connected route
      const nextIdx = this._getNextRouteIndex(route, walk.isClosedLoop, tr);
      const stA = STATIONS[route[tr.routeIndex]];
      const stB = STATIONS[route[nextIdx]];
      const dx = stB.x - stA.x;
      const dz = stB.z - stA.z;
      const segDist = Math.max(2.5, Math.hypot(dx, dz));

      // Compute effective speed (units / sec)
      const speedLvl = this.state.lines[tr.lineId]?.speedLevel || 1;
      let speed = 5.4 * model.speed * (1 + (speedLvl - 1) * 0.13);

      // Traffic backup if another train on the same line is broken!
      if (brokenByLine[tr.lineId] > 0) {
        speed *= 0.28;
      }
      // Monsoon Flood slows street-level BRT & EV Buses!
      if (line.floodSensitive && this.state.floodLevel > 0.15) {
        speed *= 1 - this.state.floodLevel * 0.55;
      }

      tr.segmentT += (speed * dt) / segDist;

      if (tr.segmentT >= 1) {
        tr.segmentT = 0;
        tr.routeIndex = nextIdx;
        // Reverse at ends for non-loop lines
        if (!walk.isClosedLoop) {
          if (tr.routeIndex >= route.length - 1) tr.direction = -1;
          else if (tr.routeIndex <= 0) tr.direction = 1;
        }
        tr.dwellTimer = 0.75;
        this._handleTrainArrival(tr, route[tr.routeIndex], line, model, time);
      }
    }
  }

  _getNextRouteIndex(route, isClosedLoop, tr) {
    if (isClosedLoop && route.length >= 3) {
      return (tr.routeIndex + (tr.direction >= 0 ? 1 : -1) + route.length) % route.length;
    }
    let next = tr.routeIndex + tr.direction;
    if (next >= route.length) {
      tr.direction = -1;
      next = Math.max(0, route.length - 2);
    } else if (next < 0) {
      tr.direction = 1;
      next = Math.min(route.length - 1, 1);
    }
    return next;
  }

  _handleTrainArrival(tr, stationId, line, model, time) {
    const sState = this.state.stations[stationId];
    if (!sState) return;

    // Alight previous passengers & board new ones
    const alighted = tr.passengers;
    const boarding = Math.min(model.capacity, Math.floor(sState.waiting));
    sState.waiting = Math.max(0, sState.waiting - boarding);
    tr.passengers = boarding;

    const totalHandled = Math.max(2, alighted + boarding);
    sState.totalServed += totalHandled;
    this.state.totalPassengers += totalHandled;

    // Restore station patience when serviced
    sState.patience = Math.min(100, sState.patience + 18 + Math.min(20, boarding * 0.6));
    if (sState.patience >= 50) sState.angry = false;

    // Calculate Baht fare earned! Malls & Attractions boost train ridership & destination revenue!
    const speedLvl = this.state.lines[line.id]?.speedLevel || 1;
    const speedBonus = 1 + (speedLvl - 1) * 0.08;
    const transferMult = 1 + (sState.transferBonus || 0);
    const attractionBoost = 1 + (this.getStationRidershipMultiplier(stationId) - 1) * 0.35;
    // Angry passengers drop station fare efficiency down to 55%!
    const satisfactionMult = 0.55 + 0.45 * (sState.patience / 100);
    const rushBonus = (time.isMorningRush || time.isEveningRush) ? 1.18 : 1.0;

    const fare = Math.max(
      25,
      Math.round((totalHandled * 0.62 + 1.5) * line.baseFare * model.fareMult * speedBonus * transferMult * attractionBoost * satisfactionMult * rushBonus)
    );

    this.state.money += fare;
    this.state.totalEarned += fare;

    this.cb.onTrainArrival?.(tr, stationId, fare, totalHandled);
  }

  // Helper to get exact world (x, z, heading) of any train for 3D rendering
  getTrainWorldPose(tr) {
    const line = LINE_BY_ID[tr.lineId];
    if (!line) return null;
    const sameLineTrains = this.state.trains.filter((t) => t.lineId === tr.lineId);
    const slotIdx = Math.max(0, sameLineTrains.indexOf(tr));
    const walk = this.getTrainWalkForLine(tr.lineId, slotIdx);
    const route = walk.waypoints;
    if (route.length === 0) return null;
    if (route.length === 1) {
      const st = STATIONS[route[0]];
      return { x: st.x, z: st.z, angle: 0 };
    }
    const idxA = Math.min(tr.routeIndex, route.length - 1);
    let idxB;
    if (walk.isClosedLoop && route.length >= 3) {
      idxB = (idxA + (tr.direction >= 0 ? 1 : -1) + route.length) % route.length;
    } else {
      idxB = idxA + tr.direction;
      if (idxB >= route.length) idxB = route.length - 2;
      if (idxB < 0) idxB = 1;
    }
    const stA = STATIONS[route[idxA]];
    const stB = STATIONS[route[idxB]];
    const t = Math.max(0, Math.min(1, tr.segmentT));
    const x = stA.x + (stB.x - stA.x) * t;
    const z = stA.z + (stB.z - stA.z) * t;
    const angle = Math.atan2(stB.x - stA.x, stB.z - stA.z);
    return { x, z, angle };
  }
}
