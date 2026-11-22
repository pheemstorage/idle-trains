// Idle Trains: Bangkok — Main Bootstrap & Game Loop

import { GameEngine, WEATHER_META } from './sim/engine.js';
import { WorldRenderer } from './scene/world.js';
import { HudManager, formatBaht } from './ui/hud.js';
import { sound } from './audio.js';
import { ICONS, iconForCategory, iconForWeather } from './icons.js';
import { STATIONS, LINE_BY_ID } from './data/network.js';

let engine;
let world;
let hud;
let lastChimeAt = 0;
let lastAngryToastAt = 0;

function boot() {
  const viewport = document.getElementById('viewport');

  // Unlock procedural Web Audio on first user gesture (iOS / Safari / Chrome safe)
  const unlockOnce = () => {
    sound.unlock();
    window.removeEventListener('pointerdown', unlockOnce);
    window.removeEventListener('keydown', unlockOnce);
  };
  window.addEventListener('pointerdown', unlockOnce);
  window.addEventListener('keydown', unlockOnce);

  engine = new GameEngine({
    onBuildStart: (stationId, totalTime) => {
      sound.playBuildStart();
      const st = STATIONS[stationId];
      hud?.showToast(
        `Construction Started: ${st.name}`,
        `Crew building station (${totalTime}s at 1x speed)`,
        ICONS.crane()
      );
    },
    onStationCompleted: (stationId) => {
      sound.playStationComplete();
      const st = STATIONS[stationId];
      const line = LINE_BY_ID[st.lineId];
      const extra = st.id === 'mrt_khlongtoei'
        ? 'COCO PARC & Khlong Toei landmarks ready to unlock!'
        : `${line.name} extended — open its 7-Eleven & nearby buildings!`;
      hud?.showToast(`${st.name} (${st.thai}) Opened!`, extra, ICONS.star());
      hud?.renderInspector();
    },
    onInterchangeBuilt: (ic) => {
      sound.playSkywalkUnlock();
      const targetSt = STATIONS[ic.to];
      const targetLine = LINE_BY_ID[targetSt.lineId];
      if (targetLine.vehicleCategory === 'boat') sound.playBoatHorn();
      hud?.showToast(
        `${ic.name} Opened!`,
        `Unlocked ${targetLine.name} (+${Math.round(ic.bonus * 100)}% transfer bonus)`,
        ICONS.skywalk()
      );
    },
    onBuildingUpgraded: (stationId, cfg, level) => {
      if (cfg.category === 'seven') {
        sound.playSevenElevenChime();
      } else {
        sound.playCoin();
      }
      const st = STATIONS[stationId];
      if (level === 1) {
        hud?.showToast(
          `${cfg.name} Opened!`,
          `Built beside ${st.name} (${cfg.thai}) — passive Baht income active.`,
          iconForCategory(cfg.category)
        );
      }
    },
    onTrainImported: (model) => {
      sound.playSkywalkUnlock();
      hud?.showToast(`Imported ${model.name}`, `From ${model.origin} — deploy on any rail line!`, ICONS.importShip());
    },
    onTrainAdded: (tr) => {
      const line = LINE_BY_ID[tr.lineId];
      if (line.vehicleCategory === 'boat') sound.playBoatHorn();
      else sound.playBtsChime();
      hud?.showToast(`New Vehicle Deployed`, `Now running on ${line.name}`, ICONS.train());
    },
    onFleetRetrofitted: (lineId) => {
      sound.playRepairDone();
      const line = LINE_BY_ID[lineId];
      hud?.showToast(`Fleet Upgraded`, `All trains on ${line.name} upgraded!`, ICONS.train());
    },
    onUpgrade: () => {
      sound.playCoin();
    },
    onTrainArrival: (tr, stationId, fare) => {
      const st = STATIONS[stationId];
      if (!st || !hud) return;
      hud.spawnBahtPop(st.x, 3.1, st.z, fare);
      const now = performance.now();
      if (now - lastChimeAt > 3600) {
        lastChimeAt = now;
        const line = LINE_BY_ID[tr.lineId];
        if (line.vehicleCategory === 'boat') sound.playBoatHorn();
        else if (Math.random() < 0.4) sound.playBtsChime();
        else sound.playTrainClack();
      }
    },
    onTrainBreakdown: (tr) => {
      sound.playBreakdownAlarm();
      const line = LINE_BY_ID[tr.lineId];
      hud?.showToast(
        `Train Breakdown on ${line.shortCode}!`,
        'Click the stalled train or red alert banner to dispatch repair crew.',
        ICONS.wrench()
      );
    },
    onRepairStarted: () => {
      sound.playBuildStart();
    },
    onRepairFinished: (tr) => {
      sound.playRepairDone();
      const line = LINE_BY_ID[tr.lineId];
      hud?.showToast(`Train Repaired on ${line.shortCode}`, 'Service & traffic flow restored!', ICONS.happy());
    },
    onStationAngry: (stationId) => {
      sound.playAngryBuzz();
      const now = performance.now();
      if (now - lastAngryToastAt < 14000) return;
      lastAngryToastAt = now;
      const st = STATIONS[stationId];
      hud?.showToast(
        `Angry Passengers at ${st.name}!`,
        'Add trains, upgrade speed, repair stalls, or open a Station 7-Eleven!',
        ICONS.angry()
      );
    },
    onWeatherChanged: (weatherId) => {
      const meta = WEATHER_META[weatherId];
      hud?.showToast(`Weather: ${meta.label}`, meta.detail, iconForWeather(weatherId));
    },
    onThunder: () => {
      sound.playThunder();
    },
    onNewDay: (timeInfo) => {
      hud?.showToast(
        `${timeInfo.dayName} • Week ${timeInfo.weekNumber}`,
        timeInfo.isWeekend ? 'Weekend shopping & market crowds incoming!' : 'Weekday commuter rush hours ahead!',
        ICONS.clock()
      );
    },
    onMasterUnlocked: () => {
      sound.playStationComplete();
      hud?._updateWorldToggleLabel();
      hud?.showToast(
        'ALL BANGKOK RAIL LINES COMPLETE!',
        'Bangkok EV City Buses & Thailand Intercity Trains (Chiang Mai, Pattaya, Hua Hin, Ayutthaya, Hat Yai) unlocked!',
        ICONS.thailand()
      );
    },
    onIntercityUpgraded: (city, level) => {
      sound.playStationComplete();
      hud?.showToast(
        `${city.name} Rail Lv.${level}`,
        `${city.trainModel} generating huge intercity Baht!`,
        ICONS.thailand()
      );
    },
    onFullReset: () => {
      hud?.clearTransientEffects();
      hud?._updateWorldToggleLabel();
      hud?.renderInspector();
      hud?.renderModal();
    },
  });

  engine.loadOrInit();

  world = new WorldRenderer(viewport, (pick) => {
    sound.unlock();
    if (pick.kind === 'station') {
      sound.playTick();
      hud.selectStation(pick.id, true);
    } else if (pick.kind === 'train') {
      const tr = engine.state.trains.find((t) => t.id === pick.id);
      if (tr?.broken) {
        const res = engine.repairTrain(tr.id);
        if (!res.ok && res.reason) {
          sound.playAngryBuzz();
          hud.showToast('Not Enough Thai Baht', res.reason, ICONS.baht());
        }
      } else if (tr) {
        sound.playBtsChime();
        hud.selectedLineFilter = tr.lineId;
        hud.openModal('lines');
      }
    } else if (pick.kind === 'intercity') {
      sound.playTick();
      hud.openModal('intercity');
    }
  });

  hud = new HudManager(engine, world, sound);
  hud._updateWorldToggleLabel();

  if (engine.offlineReport) {
    hud.showOfflineModal(engine.offlineReport);
  } else if (engine.getUnlockedStationCount() === 2) {
    // Helpful onboarding welcome toast on brand-new save
    hud.showToast(
      'Welcome to Idle Trains: Bangkok!',
      'Click Siam or the glowing + Phloen Chit pad to expand toward Asok & Khlong Toei (COCO PARC)!',
      ICONS.train()
    );
  }

  // Expose debug handle cleanly for inspection/verification
  window.__IDLE_TRAINS__ = { engine, world, hud, sound, formatBaht };

  // Guaranteed Auto-Save on iPad Safari backgrounding, tab switch, or page close
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') engine.save();
  });
  window.addEventListener('pagehide', () => engine.save());
  window.addEventListener('beforeunload', () => engine.save());

  let lastTs = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const realDt = Math.min(0.1, (now - lastTs) / 1000);
    lastTs = now;

    engine.step(realDt);
    sound.setRainLevel(engine.state.rainLevel);
    world.syncWorld(engine, now / 1000, realDt);
    hud.update(now, realDt);
  }
  requestAnimationFrame(frame);
}

window.addEventListener('DOMContentLoaded', boot);
