// Three.js 3D Bangkok Toy-Train Diorama Renderer
// Sunlit tabletop Bangkok, Chao Phraya River, Lumphini & Benchakitti Parks,
// elevated BTS viaducts, MRT subway cuts, animated tuk-tuks/taxis, 24h lighting cycle,
// monsoon rain streaks, rising 3D floodwater plane, and smooth close-up camera focus.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  LINES,
  LINE_BY_ID,
  STATIONS,
  INTERCHANGES,
  getStationTrackAngle,
  gpsToWorld,
  SUANKULARB_GPS,
} from '../data/network.js';
import { TRAIN_MODEL_BY_ID } from '../data/trains.js';
import { buildAppleMapsBangkok } from './appleMapTerrain.js';
import {
  createBuildingMesh,
  createStationMesh,
  createConstructionCrane,
  createLockedPadMesh,
  getAllNightGlowMaterials,
} from './buildingMeshes.js';
import {
  createVehicleMesh,
  createAmbientVehicleMesh,
  animateBreakdownFx,
} from './trainMeshes.js';
import { IntercityWorld } from './intercityScene.js';

export class WorldRenderer {
  constructor(container, onPick) {
    this.container = container;
    this.onPick = onPick;
    this.worldMode = 'bangkok'; // 'bangkok' | 'intercity'
    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // Renderer (tuned for crisp 60fps on both Desktop and iPad Safari WebGL!)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.isTouchDevice ? 1.5 : 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    container.appendChild(this.renderer.domElement);

    // Scene & Camera (Luminous Apple Maps 3D Horizon!)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#DDEFFA');
    this.scene.fog = new THREE.Fog('#EAF3F8', 135, 315);

    this.camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.5, 520);
    this.camera.position.set(12, 35, 44);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.075;
    this.controls.screenSpacePanning = false; // Smooth ground-plane panning like Apple Maps!
    // Native Apple Maps iPad gestures: 1-finger pan across Bangkok, 2-finger pinch zoom & rotate!
    this.controls.touches = {
      ONE: THREE.TOUCH.PAN,
      TWO: THREE.TOUCH.DOLLY_ROTATE,
    };
    this.controls.maxPolarAngle = Math.PI * 0.445;
    this.controls.minPolarAngle = 0.22;
    this.controls.minDistance = 11;
    this.controls.maxDistance = 175;
    this.controls.target.set(8, 0, 5);
    this.controls.update();

    // Smooth camera tween target
    this.camTween = null;

    // Groups
    this.bangkokGroup = new THREE.Group();
    this.scene.add(this.bangkokGroup);

    this.intercityWorld = new IntercityWorld();
    this.scene.add(this.intercityWorld.group);

    // Dynamic entity maps
    this.stationNodes = new Map();     // stationId -> { group, mode: 'locked'|'building'|'unlocked', popT }
    this.buildingNodes = new Map();    // buildingId -> { mesh, level, popT, stationId }
    this.trackSegments = [];           // { a, b, lineId, mesh, lockedMat, unlockedMat }
    this.interchangeMeshes = new Map();// icId -> mesh
    this.trainMeshes = new Map();      // trainId -> { mesh, modelId }
    this.ambientVehicles = [];         // toy tuk-tuks, pink taxis, river boats
    this.clickableMeshes = [];

    // Lighting & Weather
    this._setupLights();
    this._buildDioramaBase();
    this._buildAllTracks();
    this._buildAmbientTraffic();
    this._buildWeatherFX();

    // Pointer picking (distinguish click from drag)
    this.raycaster = new THREE.Raycaster();
    this.pointerDownPos = { x: 0, y: 0 };
    this._bindEvents();
  }

  _setupLights() {
    // High-key architectural Apple Maps daylight bounce (bright alabaster sunlit faces + soft cool shadow faces)
    this.hemiLight = new THREE.HemisphereLight('#FFFFFF', '#D8D6CE', 1.04);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight('#FFFBF0', 1.32);
    this.sunLight.position.set(62, 92, 48);
    this.sunLight.castShadow = true;
    const shadowSize = this.isTouchDevice ? 1024 : 2048;
    this.sunLight.shadow.mapSize.set(shadowSize, shadowSize);
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 280;
    const d = 118;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0006;
    this.scene.add(this.sunLight);
  }

  _buildDioramaBase() {
    // Full 3D Apple Maps Detailed City Experience Bangkok terrain, road grid, parks,
    // Chao Phraya river, bridges, dense matte-ivory architectural buildings & rounded trees!
    this.appleMap = buildAppleMapsBangkok(this.bangkokGroup, { isCompactGpu: this.isTouchDevice });
    this.riverCurve = this.appleMap.riverCurve;
    this.riverMat = this.appleMap.riverMat;
    this.roadRoutes = this.appleMap.roadRoutes;

    // Permanent heritage campus of Suankularb Wittayalai School right at exact GPS (13.7434619, 100.498851)!
    // Visible on the map immediately, and seamlessly upgrades & grows bigger when player invests at MRT Sanam Chai!
    const skPos = gpsToWorld(SUANKULARB_GPS.lat, SUANKULARB_GPS.lon);
    this.heritageSuankularb = createBuildingMesh('suankularb_school', 1);
    this.heritageSuankularb.position.set(skPos.x, 0, skPos.z);
    this.heritageSuankularb.traverse((o) => {
      o.userData.pickKind = 'station';
      o.userData.pickId = 'mrt_sanamchai';
    });
    this.bangkokGroup.add(this.heritageSuankularb);
    this.appleMap.clearCityBlocksAround(skPos.x, skPos.z, 2.5);
  }

  _buildAllTracks() {
    const pillarMat = new THREE.MeshStandardMaterial({ color: '#E8E5DC', roughness: 0.65 });
    const whiteDeckMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.45 });
    const trackGroup = new THREE.Group();
    this.bangkokGroup.add(trackGroup);

    const addSeg = (line, idA, idB) => {
      const stA = STATIONS[idA];
      const stB = STATIONS[idB];
      if (!stA || !stB) return;

      const dx = stB.x - stA.x;
      const dz = stB.z - stA.z;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const mx = (stA.x + stB.x) / 2;
      const mz = (stA.z + stB.z) / 2;

      const isElevated = line.kind === 'elevated' || line.kind === 'monorail';
      const y = isElevated ? 1.44 : (line.kind === 'river' ? 0.08 : 0.14);
      const width = line.kind === 'monorail' ? 0.36 : (line.kind === 'river' ? 0.24 : 0.54);
      const height = isElevated ? 0.16 : 0.08;

      const unlockedMat = new THREE.MeshStandardMaterial({
        color: line.color,
        roughness: 0.35,
        metalness: 0.08,
      });
      const lockedMat = new THREE.MeshStandardMaterial({
        color: line.color,
        roughness: 0.75,
        transparent: true,
        opacity: line.kind === 'river' ? 0.18 : 0.26,
      });

      const segGroup = new THREE.Group();
      const beam = new THREE.Mesh(new THREE.BoxGeometry(width, height, len), lockedMat);
      beam.position.set(mx, isElevated ? y + 0.06 : y, mz);
      beam.rotation.y = angle;
      beam.castShadow = isElevated;
      beam.receiveShadow = true;
      segGroup.add(beam);

      // Sleek white architectural concrete deck + slender piers under elevated tracks (shown once unlocked!)
      const piers = [];
      if (isElevated) {
        const deck = new THREE.Mesh(new THREE.BoxGeometry(width + 0.3, 0.16, len), whiteDeckMat);
        deck.position.set(mx, y - 0.04, mz);
        deck.rotation.y = angle;
        deck.castShadow = true;
        deck.receiveShadow = true;
        deck.visible = false;
        segGroup.add(deck);
        piers.push(deck);

        const steps = Math.max(1, Math.floor(len / 5.5));
        for (let k = 1; k < steps; k++) {
          const t = k / steps;
          const p = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.38, 8), pillarMat);
          p.position.set(stA.x + dx * t, 0.69, stA.z + dz * t);
          p.castShadow = true;
          p.visible = false;
          segGroup.add(p);
          piers.push(p);
        }
      }

      trackGroup.add(segGroup);
      this.trackSegments.push({ a: idA, b: idB, lineId: line.id, beam, piers, unlockedMat, lockedMat });
    };

    for (const line of LINES) {
      for (let i = 0; i < line.stations.length - 1; i++) {
        addSeg(line, line.stations[i], line.stations[i + 1]);
      }
      if (line.isLoop) {
        addSeg(line, line.stations[line.stations.length - 1], line.stations[0]);
      }
      if (line.extraBranches) {
        for (const [a, b] of line.extraBranches) {
          addSeg(line, a, b);
        }
      }
    }

    // Pre-build physical 3D Skywalk / Transfer Tunnel meshes (hidden until built!)
    const skywalkGlass = new THREE.MeshStandardMaterial({ color: '#E0F2FE', roughness: 0.2, metalness: 0.2, emissive: '#FEF08A', emissiveIntensity: 0.25 });
    const skywalkFrame = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.45 });
    for (const ic of INTERCHANGES) {
      const a = STATIONS[ic.from];
      const b = STATIONS[ic.to];
      if (!a || !b) continue;
      const len = Math.max(1.2, Math.hypot(b.x - a.x, b.z - a.z));
      const angle = Math.atan2(b.x - a.x, b.z - a.z);

      const bridge = new THREE.Group();
      bridge.position.set((a.x + b.x) / 2, ic.type === 'tunnel' ? 0.25 : 1.55, (a.z + b.z) / 2);
      bridge.rotation.y = angle;

      const tube = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.48, len), skywalkGlass);
      tube.castShadow = true;
      bridge.add(tube);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.12, len + 0.15), skywalkFrame);
      roof.position.y = 0.28;
      bridge.add(roof);
      bridge.visible = false;

      this.bangkokGroup.add(bridge);
      this.interchangeMeshes.set(ic.id, bridge);
    }
  }

  _buildAmbientTraffic() {
    // 18 Miniature Bangkok Tuk-Tuks & Pink/Green-Yellow Taxis cruising roads!
    const kinds = ['tuktuk', 'taxi_pink', 'taxi_green'];
    for (let i = 0; i < 18; i++) {
      const route = this.roadRoutes[i % this.roadRoutes.length];
      const mesh = createAmbientVehicleMesh(kinds[i % kinds.length]);
      this.bangkokGroup.add(mesh);
      this.ambientVehicles.push({
        kind: 'road',
        mesh,
        route,
        segIdx: i % (route.length - 1),
        t: (i * 0.23) % 1,
        dir: i % 2 === 0 ? 1 : -1,
        speed: 3.8 + (i % 4) * 0.7,
      });
    }
    // 5 Ambient miniature riverboats along the Chao Phraya
    for (let i = 0; i < 5; i++) {
      const boat = new THREE.Group();
      const hull = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.2, 1.15), new THREE.MeshStandardMaterial({ color: '#FFF7ED' }));
      hull.position.y = 0.14;
      boat.add(hull);
      const top = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.72), new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? '#0284C7' : '#EA580C' }));
      top.position.y = 0.34;
      boat.add(top);
      this.bangkokGroup.add(boat);
      this.ambientVehicles.push({
        kind: 'river',
        mesh: boat,
        t: i / 5,
        dir: i % 2 === 0 ? 1 : -1,
        speed: 0.018 + (i % 3) * 0.005,
      });
    }
  }

  _buildWeatherFX() {
    // 1. Rising Translucent 3D Floodwater Plane over Bangkok roads & BRT!
    this.floodMat = new THREE.MeshStandardMaterial({
      color: '#38BDF8',
      roughness: 0.15,
      metalness: 0.18,
      transparent: true,
      opacity: 0.0,
    });
    this.floodPlane = new THREE.Mesh(new THREE.PlaneGeometry(278, 278), this.floodMat);
    this.floodPlane.rotation.x = -Math.PI / 2;
    this.floodPlane.position.set(8, -0.25, -8);
    this.floodPlane.visible = false;
    this.bangkokGroup.add(this.floodPlane);

    // 2. Animated 3D Monsoon Rain Streaks (LineSegments around camera!)
    const dropCount = 700;
    const positions = new Float32Array(dropCount * 6);
    this.rainDropsMeta = [];
    for (let i = 0; i < dropCount; i++) {
      const rx = (Math.random() - 0.5) * 140;
      const ry = Math.random() * 65;
      const rz = (Math.random() - 0.5) * 140;
      this.rainDropsMeta.push({ x: rx, y: ry, z: rz, v: 42 + Math.random() * 18 });
      positions[i * 6 + 0] = rx;
      positions[i * 6 + 1] = ry;
      positions[i * 6 + 2] = rz;
      positions[i * 6 + 3] = rx - 0.25;
      positions[i * 6 + 4] = ry - 2.1;
      positions[i * 6 + 5] = rz;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.rainMat = new THREE.LineBasicMaterial({ color: '#E0F2FE', transparent: true, opacity: 0.0 });
    this.rainLines = new THREE.LineSegments(rainGeo, this.rainMat);
    this.rainLines.visible = false;
    this.scene.add(this.rainLines);
  }

  _bindEvents() {
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', (e) => {
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
      this.camTween = null; // user manual drag cancels camera glide cleanly
    });

    el.addEventListener('pointerup', (e) => {
      const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
      if (dist > 6) return; // drag, not click

      const rect = el.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      this.raycaster.setFromCamera(mouse, this.camera);

      if (this.worldMode === 'intercity') {
        const hits = this.raycaster.intersectObjects(this.intercityWorld.clickable, true);
        if (hits.length) {
          let obj = hits[0].object;
          while (obj && !obj.userData.intercityCityId) obj = obj.parent;
          if (obj?.userData.intercityCityId) {
            this.onPick?.({ kind: 'intercity', cityId: obj.userData.intercityCityId });
          }
        }
        return;
      }

      // Check clickable trains & stations
      const hits = this.raycaster.intersectObjects(this.clickableMeshes, true);
      if (hits.length) {
        let obj = hits[0].object;
        while (obj && !obj.userData.pickKind) obj = obj.parent;
        if (obj?.userData.pickKind) {
          this.onPick?.({ kind: obj.userData.pickKind, id: obj.userData.pickId });
        }
      }
    });

    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  // ===== WORLD MODE & CAMERA GLIDES =====

  setWorldMode(mode) {
    this.worldMode = mode;
    this.bangkokGroup.visible = mode === 'bangkok';
    this.intercityWorld.group.visible = mode === 'intercity';

    if (mode === 'intercity') {
      this._glideCamera(new THREE.Vector3(0, 146, 128), new THREE.Vector3(0, 1, 8), 0.75);
    } else {
      this.resetCamera();
    }
  }

  focusStation(stationId) {
    const st = STATIONS[stationId];
    if (!st) return;
    if (this.worldMode !== 'bangkok') this.setWorldMode('bangkok');
    // Swoop down into a charming close-up neighborhood diorama angle!
    const target = new THREE.Vector3(st.x, 0.9, st.z);
    const pos = new THREE.Vector3(st.x + 8.5, 14.5, st.z + 15.5);
    this._glideCamera(pos, target, 0.7);
  }

  resetCamera() {
    this._glideCamera(new THREE.Vector3(12, 35, 44), new THREE.Vector3(8, 0, 5), 0.7);
  }

  _glideCamera(toPos, toTarget, duration = 0.7) {
    this.camTween = {
      fromPos: this.camera.position.clone(),
      fromTarget: this.controls.target.clone(),
      toPos,
      toTarget,
      t: 0,
      duration,
    };
  }

  // ===== SYNC ENGINE STATE TO 3D SCENE =====

  syncWorld(engine, timeSec, dt) {
    const state = engine.state;

    // 1. Camera glide
    if (this.camTween) {
      this.camTween.t += Math.min(0.05, dt) / this.camTween.duration;
      const e = 1 - Math.pow(1 - Math.min(1, this.camTween.t), 3);
      this.camera.position.lerpVectors(this.camTween.fromPos, this.camTween.toPos, e);
      this.controls.target.lerpVectors(this.camTween.fromTarget, this.camTween.toTarget, e);
      if (this.camTween.t >= 1) this.camTween = null;
    }
    this.controls.update();

    // 2. Dynamic 24-hour Sky/Sun/Night-Window Lighting + Flood Lightning!
    this._updateLightingAndWeather(engine, timeSec, dt);

    if (this.worldMode === 'intercity') {
      this.intercityWorld.syncAndAnimate(state, dt);
      this.renderer.render(this.scene, this.camera);
      return;
    }

    // 3. Sync Tracks & Skywalks
    for (const seg of this.trackSegments) {
      const bothUnlocked = state.stations[seg.a]?.unlocked && state.stations[seg.b]?.unlocked;
      const targetMat = bothUnlocked ? seg.unlockedMat : seg.lockedMat;
      if (seg.beam.material !== targetMat) {
        seg.beam.material = targetMat;
        for (const p of seg.piers) p.visible = bothUnlocked;
      }
    }
    for (const ic of INTERCHANGES) {
      const m = this.interchangeMeshes.get(ic.id);
      if (m) m.visible = Boolean(state.interchanges[ic.id]);
    }

    // 4. Sync Stations (Unlocked / Building Crane / Adjacent Buildable Pad)
    let clickablesDirty = false;
    for (const st of Object.values(STATIONS)) {
      const sState = state.stations[st.id];
      const job = state.constructions[st.id];
      const isBuildable = engine.canBuildStation(st.id);

      let desiredMode = 'hidden';
      if (sState.unlocked) desiredMode = 'unlocked';
      else if (job) desiredMode = 'building';
      else if (isBuildable) desiredMode = 'buildable';

      let node = this.stationNodes.get(st.id);
      if (!node || node.mode !== desiredMode) {
        if (node) {
          this.bangkokGroup.remove(node.group);
          this.stationNodes.delete(st.id);
          clickablesDirty = true;
        }
        if (desiredMode !== 'hidden') {
          const line = LINE_BY_ID[st.lineId];
          let group;
          if (desiredMode === 'unlocked') {
            group = createStationMesh(st, line);
          } else if (desiredMode === 'building') {
            group = createConstructionCrane();
          } else {
            group = createLockedPadMesh(line.color);
          }
          group.position.set(st.x, 0, st.z);
          if (desiredMode === 'unlocked') {
            // Align station platform lengthwise along its real transit line track!
            group.rotation.y = getStationTrackAngle(st.id);
          }
          group.traverse((o) => {
            o.userData.pickKind = 'station';
            o.userData.pickId = st.id;
          });
          this.bangkokGroup.add(group);
          node = { group, mode: desiredMode, popT: 0 };
          this.stationNodes.set(st.id, node);
          clickablesDirty = true;
        }
      }

      // Animate crane, pulse ring, or elastic pop-in!
      if (node) {
        if (node.popT < 1) {
          node.popT = Math.min(1, node.popT + dt * 3.5);
          const s = 0.25 + 0.75 * (1 + Math.sin(node.popT * Math.PI * 0.65) * 0.14 * (1 - node.popT));
          node.group.scale.set(s, s, s);
          if (node.popT >= 1) node.group.scale.set(1, 1, 1);
        }
        if (node.mode === 'building' && job) {
          const jib = node.group.getObjectByName('craneJib');
          if (jib) jib.rotation.y = Math.sin(timeSec * 1.1 + st.x) * 0.9;
          const scaf = node.group.getObjectByName('scaffold');
          if (scaf) {
            const pct = Math.max(0.1, 1 - job.remainingTime / Math.max(1, job.totalTime));
            scaf.scale.y = pct;
            scaf.position.y = 0.15 + pct * 0.65;
          }
        } else if (node.mode === 'buildable') {
          const ring = node.group.getObjectByName('pulseRing');
          if (ring) {
            const p = 1 + Math.sin(timeSec * 3.8 + st.x) * 0.16;
            ring.scale.set(p, p, 1);
          }
        }
      }
    }

    // 5. Sync Real-Life Nearby Buildings & Station 7-Elevens!
    for (const st of Object.values(STATIONS)) {
      if (!state.stations[st.id]?.unlocked) continue;
      const bList = engine.getBuildingsForStation(st.id);
      for (const b of bList) {
        const lvl = state.buildings[b.id] || 0;
        const existing = this.buildingNodes.get(b.id);
        if (lvl > 0 && (!existing || existing.level !== lvl)) {
          if (existing) {
            this.bangkokGroup.remove(existing.mesh);
            clickablesDirty = true;
          }
          const mesh = createBuildingMesh(b.archType, lvl);
          mesh.position.set(st.x + b.dx, 0, st.z + b.dz);
          mesh.traverse((o) => {
            o.userData.pickKind = 'station';
            o.userData.pickId = st.id;
          });
          this.bangkokGroup.add(mesh);
          // Hide base heritage copy once player upgrades Suankularb School directly
          if (b.id === 'suankularb_school' && this.heritageSuankularb) {
            this.heritageSuankularb.visible = false;
          }
          this.appleMap?.clearCityBlocksAround(st.x + b.dx, st.z + b.dz, 1.65 + (lvl - 1) * 0.11);
          this.buildingNodes.set(b.id, { mesh, level: lvl, popT: 0, stationId: st.id });
          clickablesDirty = true;
        }
      }
    }
    // Remove buildings if game was reset
    let anyRemoved = false;
    for (const [bId, entry] of [...this.buildingNodes.entries()]) {
      if (!state.buildings[bId]) {
        this.bangkokGroup.remove(entry.mesh);
        this.buildingNodes.delete(bId);
        if (bId === 'suankularb_school' && this.heritageSuankularb) {
          this.heritageSuankularb.visible = true;
        }
        clickablesDirty = true;
        anyRemoved = true;
      } else {
        if (entry.popT < 1) {
          entry.popT = Math.min(1, entry.popT + dt * 3.4);
          const ease = 1 - Math.pow(1 - entry.popT, 3);
          entry.mesh.position.y = (1 - ease) * -1.8;
        } else {
          entry.mesh.position.y = 0;
        }
        // Spin Asiatique Ferris Wheel if built!
        entry.mesh.traverse((o) => {
          if (o.userData.spinWheel) o.rotation.z += dt * 0.45 * state.timeScale;
        });
      }
    }
    if (anyRemoved && this.buildingNodes.size === 0) {
      this.appleMap?.restoreAllCityBlocks();
    }

    // 6. Sync Trains / Monorails / BRT / Chao Phraya Boats / Bangkok EV Buses!
    const activeTrainIds = new Set();
    for (const tr of state.trains) {
      activeTrainIds.add(tr.id);
      const pose = engine.getTrainWorldPose(tr);
      if (!pose) continue;

      let entry = this.trainMeshes.get(tr.id);
      if (!entry || entry.modelId !== tr.modelId) {
        if (entry) {
          this.bangkokGroup.remove(entry.mesh);
          clickablesDirty = true;
        }
        const model = TRAIN_MODEL_BY_ID[tr.modelId] || TRAIN_MODEL_BY_ID.siemens_bts;
        const mesh = createVehicleMesh(model);
        mesh.traverse((o) => {
          o.userData.pickKind = 'train';
          o.userData.pickId = tr.id;
        });
        this.bangkokGroup.add(mesh);
        entry = { mesh, modelId: tr.modelId };
        this.trainMeshes.set(tr.id, entry);
        clickablesDirty = true;
      }

      const line = LINE_BY_ID[tr.lineId];
      const baseY = (line.kind === 'elevated' || line.kind === 'monorail') ? 1.56 : (line.kind === 'river' ? 0.08 : 0.16);
      // Gentle playful toy bounce while moving
      const bob = tr.broken ? 0 : (line.kind === 'river'
        ? Math.sin(timeSec * 3.5 + pose.x) * 0.05
        : Math.abs(Math.sin(timeSec * 9 + pose.x)) * 0.03);

      entry.mesh.position.set(pose.x, baseY + bob, pose.z);
      entry.mesh.rotation.y = pose.angle;
      animateBreakdownFx(entry.mesh, timeSec, tr.broken);
    }
    for (const [tid, entry] of [...this.trainMeshes.entries()]) {
      if (!activeTrainIds.has(tid)) {
        this.bangkokGroup.remove(entry.mesh);
        this.trainMeshes.delete(tid);
        clickablesDirty = true;
      }
    }

    if (clickablesDirty) {
      this._rebuildClickables();
    }

    // 7. Animate Ambient Toy Tuk-Tuks, Taxis & River Boats!
    this._animateAmbientTraffic(state, dt, timeSec);

    this.renderer.render(this.scene, this.camera);
  }

  _rebuildClickables() {
    this.clickableMeshes = [];
    if (this.heritageSuankularb && this.heritageSuankularb.visible) {
      this.clickableMeshes.push(this.heritageSuankularb);
    }
    for (const node of this.stationNodes.values()) this.clickableMeshes.push(node.group);
    for (const entry of this.trainMeshes.values()) this.clickableMeshes.push(entry.mesh);
    for (const entry of this.buildingNodes.values()) this.clickableMeshes.push(entry.mesh);
  }

  _animateAmbientTraffic(state, dt, timeSec) {
    const simDt = dt * Math.max(0.25, state.timeScale);
    // Tuk-tuks & Bangkok taxis visibly crawl during monsoon floods!
    const floodRoadMult = 1 - state.floodLevel * 0.68;

    for (const v of this.ambientVehicles) {
      if (v.kind === 'road') {
        const a = v.route[v.segIdx];
        const b = v.route[v.segIdx + 1];
        const dist = Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1]));
        v.t += (v.dir * v.speed * floodRoadMult * simDt) / dist;
        if (v.t >= 1) {
          if (v.segIdx < v.route.length - 2) { v.segIdx++; v.t = 0; }
          else { v.dir = -1; v.t = 1; }
        } else if (v.t <= 0) {
          if (v.segIdx > 0) { v.segIdx--; v.t = 1; }
          else { v.dir = 1; v.t = 0; }
        }
        const pa = v.route[v.segIdx];
        const pb = v.route[v.segIdx + 1];
        const x = pa[0] + (pb[0] - pa[0]) * v.t;
        const z = pa[1] + (pb[1] - pa[1]) * v.t;
        const ang = Math.atan2((pb[0] - pa[0]) * v.dir, (pb[1] - pa[1]) * v.dir);
        v.mesh.position.set(x, 0.06 + state.floodLevel * 0.14, z);
        v.mesh.rotation.y = ang;
      } else {
        v.t += v.dir * v.speed * simDt;
        if (v.t >= 0.98) { v.t = 0.98; v.dir = -1; }
        if (v.t <= 0.02) { v.t = 0.02; v.dir = 1; }
        const pos = this.riverCurve.getPoint(v.t);
        const tan = this.riverCurve.getTangent(v.t);
        v.mesh.position.set(pos.x, 0.06 + Math.sin(timeSec * 3 + v.t * 10) * 0.03, pos.z);
        v.mesh.rotation.y = Math.atan2(tan.x * v.dir, tan.z * v.dir);
      }
    }
  }

  _updateLightingAndWeather(engine, timeSec, dt) {
    const state = engine.state;
    const { dayProgress } = engine.getTimeInfo(); // 0..1 across 24 hours
    // Sun elevation: noon (0.5) = +1, midnight (0/1) = -1
    const sunAngle = (dayProgress - 0.25) * Math.PI * 2;
    const sunElev = Math.sin(sunAngle); // -1..+1
    const daylight = THREE.MathUtils.clamp((sunElev + 0.18) / 0.72, 0, 1);
    const sunsetFactor = THREE.MathUtils.clamp(1 - Math.abs(sunElev - 0.05) * 4.2, 0, 1);
    const nightFactor = 1 - daylight;

    // Sky color interpolation: Crisp Apple Maps Sky -> Warm Golden Hour -> Apple Maps Night Slate -> Monsoon Storm
    const skyDay = new THREE.Color('#DDEFFA');
    const skySunset = new THREE.Color('#FBC89D');
    const skyNight = new THREE.Color('#141E33');
    const skyStorm = new THREE.Color('#74879B');

    const sky = skyNight.clone().lerp(skyDay, daylight);
    sky.lerp(skySunset, sunsetFactor * 0.55);
    sky.lerp(skyStorm, state.rainLevel * 0.55);

    // Lightning flash!
    if (state.lightningFlash > 0.05) {
      sky.lerp(new THREE.Color('#F8FAFC'), state.lightningFlash * 0.85);
    }

    this.scene.background.copy(sky);
    this.scene.fog.color.copy(sky);

    // Sun position & Apple Maps crisp architectural lighting
    this.sunLight.position.set(
      Math.cos(sunAngle) * 95,
      Math.max(24, Math.sin(sunAngle) * 95),
      46
    );
    const sunCol = new THREE.Color('#FFFBF0').lerp(new THREE.Color('#FB923C'), sunsetFactor * 0.65);
    this.sunLight.color.copy(sunCol);
    this.sunLight.intensity = (0.35 + daylight * 1.02) * (1 - state.rainLevel * 0.32) + state.lightningFlash * 1.6;
    this.hemiLight.intensity = 0.45 + daylight * 0.62;

    // Smooth Apple Maps Day <-> Night Mode Architectural Surface Tint!
    if (this.appleMap) {
      const dayWhite = new THREE.Color('#FFFFFF');
      const nightMapCol = new THREE.Color('#4A5C7A');
      const nightCityCol = new THREE.Color('#5A6D8E');
      const nightCapCol = new THREE.Color('#3F506B');
      this.appleMap.mapMat.color.copy(dayWhite).lerp(nightMapCol, nightFactor * 0.85);
      this.appleMap.cityMat.color.copy(dayWhite).lerp(nightCityCol, nightFactor * 0.85);
      this.appleMap.cityMat.emissiveIntensity = nightFactor * 0.72;
      this.appleMap.capMat.color.copy(new THREE.Color('#E3DFD6')).lerp(nightCapCol, nightFactor * 0.85);
      this.appleMap.riverMat.color.copy(new THREE.Color('#6AC4F7')).lerp(new THREE.Color('#1D3D63'), nightFactor * 0.8);
    }

    // Warm Bangkok Night Window Glow on COCO PARC, 7-Eleven, malls & hotels!
    const glowAmt = THREE.MathUtils.clamp(nightFactor * 1.05 + state.rainLevel * 0.22, 0, 1);
    for (const m of getAllNightGlowMaterials()) {
      m.emissiveIntensity = glowAmt * (m.userData.maxGlow || 0.8);
    }

    // Rising 3D Floodwater Plane!
    if (state.floodLevel > 0.02) {
      this.floodPlane.visible = true;
      this.floodPlane.position.y = -0.05 + state.floodLevel * 0.34 + Math.sin(timeSec * 2.2) * 0.015;
      this.floodMat.opacity = state.floodLevel * 0.52;
    } else {
      this.floodPlane.visible = false;
    }

    // River shimmer
    this.riverMat.roughness = 0.2 + Math.sin(timeSec * 2.4) * 0.04;

    // 3D Monsoon Rain Streaks
    if (state.rainLevel > 0.05) {
      this.rainLines.visible = true;
      this.rainMat.opacity = state.rainLevel * 0.55;
      const posArr = this.rainLines.geometry.attributes.position.array;
      const cx = this.controls.target.x;
      const cz = this.controls.target.z;
      for (let i = 0; i < this.rainDropsMeta.length; i++) {
        const d = this.rainDropsMeta[i];
        d.y -= d.v * dt * (0.7 + state.rainLevel * 0.6);
        if (d.y < 0) d.y = 55 + Math.random() * 14;
        const wx = cx + d.x;
        const wz = cz + d.z;
        posArr[i * 6 + 0] = wx;
        posArr[i * 6 + 1] = d.y;
        posArr[i * 6 + 2] = wz;
        posArr[i * 6 + 3] = wx - 0.35;
        posArr[i * 6 + 4] = d.y - 2.4;
        posArr[i * 6 + 5] = wz;
      }
      this.rainLines.geometry.attributes.position.needsUpdate = true;
    } else {
      this.rainLines.visible = false;
    }
  }

  // Project 3D world point to 2D viewport pixel for HUD markers / floating Baht pops
  projectPoint(x, y, z) {
    const v = new THREE.Vector3(x, y, z);
    v.project(this.camera);
    if (v.z > 1) return null;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    return {
      x: (v.x * 0.5 + 0.5) * w,
      y: (-v.y * 0.5 + 0.5) * h,
      dist: this.camera.position.distanceTo(new THREE.Vector3(x, y, z)),
    };
  }
}
