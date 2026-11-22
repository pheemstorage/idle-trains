// Stylized 3D Toy Diorama of Thailand — Intercity Rail World View
// Unlocks when all Bangkok rail lines are complete!

import * as THREE from 'three';
import { THAILAND_HUB, INTERCITY_CITIES } from '../data/intercity.js';

export class IntercityWorld {
  constructor() {
    this.group = new THREE.Group();
    this.group.visible = false;
    this.cityMarkers = new Map();
    this.cityTracks = new Map();
    this.intercityTrains = new Map(); // cityId -> { mesh, curve, t, dir }
    this.clickable = [];

    this._buildTerrain();
    this._buildHub();
    this._buildCities();
  }

  _buildTerrain() {
    // Crisp Apple Maps Cerulean Gulf of Thailand & Andaman Sea
    const ocean = new THREE.Mesh(
      new THREE.BoxGeometry(156, 2.2, 200),
      new THREE.MeshStandardMaterial({ color: '#74C6F7', roughness: 0.24, metalness: 0.12 })
    );
    ocean.position.set(0, -1.4, 8);
    ocean.receiveShadow = true;
    this.group.add(ocean);

    // Clean Alabaster Apple Maps Plinth Frame
    const frameMat = new THREE.MeshStandardMaterial({ color: '#E6E3DA', roughness: 0.78 });
    const fb = new THREE.Mesh(new THREE.BoxGeometry(160, 2.6, 2.2), frameMat);
    fb.position.set(0, -1.35, 108);
    this.group.add(fb);
    const ft = fb.clone();
    ft.position.set(0, -1.35, -92);
    this.group.add(ft);
    const fl = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 202), frameMat);
    fl.position.set(-79, -1.35, 8);
    this.group.add(fl);
    const fr = fl.clone();
    fr.position.set(79, -1.35, 8);
    this.group.add(fr);

    // Stylized silhouette of Thailand (Apple Maps Soft Sage & Warm Parchment Topography!)
    const shape = new THREE.Shape();
    const outline = [
      [-22, 62],  // Chiang Rai / Mae Hong Son north
      [-4, 64],
      [18, 52],   // Isan Northeast
      [34, 34],
      [32, 10],
      [22, -16],  // Pattaya / Trat east coast
      [10, -24],
      [4, -8],    // Gulf of Thailand top bay (Bangkok)
      [-6, -16],  // Phetchaburi / Hua Hin coast
      [-12, -32],
      [-8, -50],  // Surat Thani / Peninsula
      [4, -72],   // Songkhla / Hat Yai / South
      [-6, -78],
      [-16, -60], // Andaman Phuket side
      [-18, -32],
      [-24, -8],  // Kanchanaburi west
      [-26, 26],  // Tak / Chiang Mai west
    ];
    shape.moveTo(outline[0][0], outline[0][1]);
    for (let i = 1; i < outline.length; i++) {
      shape.lineTo(outline[i][0], outline[i][1]);
    }
    shape.closePath();

    // Soft coastal aqua halo around Thailand shoreline (signature Apple Maps water glow!)
    const haloGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.4, bevelEnabled: true, bevelSize: 2.2, bevelThickness: 0.2, bevelSegments: 3 });
    const halo = new THREE.Mesh(
      haloGeo,
      new THREE.MeshStandardMaterial({ color: '#B0E1FC', roughness: 0.4 })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = -0.55;
    this.group.add(halo);

    const landGeo = new THREE.ExtrudeGeometry(shape, { depth: 1.5, bevelEnabled: true, bevelSize: 0.65, bevelThickness: 0.45, bevelSegments: 3 });
    const land = new THREE.Mesh(
      landGeo,
      new THREE.MeshStandardMaterial({ color: '#DFEDD2', roughness: 0.82 })
    );
    land.rotation.x = -Math.PI / 2;
    land.position.y = -0.35;
    land.receiveShadow = true;
    land.castShadow = true;
    this.group.add(land);

    // Sculpted Northern Lanna rounded topographic hills (Apple Maps soft sage relief)
    const mtnMat = new THREE.MeshStandardMaterial({ color: '#AEDAA0', roughness: 0.82 });
    const peakMat = new THREE.MeshStandardMaterial({ color: '#94CC86', roughness: 0.82 });
    const mtns = [[-19, -54, 4.8, 5.2], [-10, -56, 4.0, 4.4], [-22, -42, 4.0, 3.8], [-4, -46, 3.6, 3.4]];
    for (const [mx, mz, r, h] of mtns) {
      const hill = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mtnMat);
      hill.scale.set(1, h / r, 1);
      hill.position.set(mx, 0.8, mz);
      hill.castShadow = true;
      hill.receiveShadow = true;
      this.group.add(hill);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(r * 0.55, 12, 8), peakMat);
      cap.scale.set(1, (h * 0.7) / (r * 0.55), 1);
      cap.position.set(mx + 0.4, 1.4, mz - 0.3);
      this.group.add(cap);
    }
  }

  _buildHub() {
    const hub = new THREE.Group();
    hub.position.set(THAILAND_HUB.x, 1.25, THAILAND_HUB.z);
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.5, 0.5, 20),
      new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.4 })
    );
    hub.add(pad);
    const hall = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 1.4, 2.2),
      new THREE.MeshStandardMaterial({ color: '#FFFBEB', roughness: 0.5 })
    );
    hall.position.y = 0.9;
    hall.castShadow = true;
    hub.add(hall);
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(3.7, 0.35, 2.5),
      new THREE.MeshStandardMaterial({ color: '#B91C1C', roughness: 0.45 })
    );
    roof.position.y = 1.75;
    hub.add(roof);
    this.group.add(hub);
  }

  _buildCities() {
    for (const city of INTERCITY_CITIES) {
      // Curved elevated toy rail line from Bangkok hub to city
      const midX = (THAILAND_HUB.x + city.x) / 2 + (city.x >= 0 ? 4 : -4);
      const midZ = (THAILAND_HUB.z + city.z) / 2;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(THAILAND_HUB.x, 1.6, THAILAND_HUB.z),
        new THREE.Vector3(midX, 1.7, midZ),
        new THREE.Vector3(city.x, 1.6, city.z),
      ]);

      const tubeMat = new THREE.MeshStandardMaterial({
        color: city.color,
        roughness: 0.45,
        transparent: true,
        opacity: 0.25,
      });
      const track = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.36, 8, false), tubeMat);
      track.castShadow = true;
      this.group.add(track);
      this.cityTracks.set(city.id, track);

      // City Diorama Hub + Miniature Iconic Landmark
      const g = new THREE.Group();
      g.position.set(city.x, 1.25, city.z);
      g.userData.intercityCityId = city.id;

      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(2.8, 3.1, 0.45, 16),
        new THREE.MeshStandardMaterial({ color: city.color, roughness: 0.45 })
      );
      base.userData.intercityCityId = city.id;
      g.add(base);
      this.clickable.push(base);

      // Landmark sculpture
      const lm = this._buildCityLandmark(city.landmarkStyle);
      lm.position.y = 0.25;
      lm.traverse((o) => { o.userData.intercityCityId = city.id; });
      g.add(lm);
      this.clickable.push(lm);

      this.group.add(g);
      this.cityMarkers.set(city.id, g);

      // Miniature Intercity Bullet / Express Train
      const train = this._buildIntercityTrain(city.color);
      train.visible = false;
      this.group.add(train);
      this.intercityTrains.set(city.id, { mesh: train, curve, t: Math.random(), dir: 1 });
    }
  }

  _buildCityLandmark(style) {
    const g = new THREE.Group();
    if (style === 'stupa') {
      const brick = new THREE.MeshStandardMaterial({ color: '#B45309', roughness: 0.7 });
      for (const [x, z, s] of [[0, 0, 1.1], [-1.1, 0.7, 0.65], [1.1, 0.7, 0.65]]) {
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * s, 0.75 * s, 2.6 * s, 8), brick);
        b.position.set(x, 1.3 * s, z);
        b.castShadow = true;
        g.add(b);
      }
    } else if (style === 'beach') {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.0, 1.2), new THREE.MeshStandardMaterial({ color: '#FFFFFF' }));
      tower.position.set(-0.6, 1.5, -0.4);
      g.add(tower);
      const paras = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.5, 8), new THREE.MeshStandardMaterial({ color: '#F97316' }));
      paras.position.set(0.95, 0.9, 0.85);
      g.add(paras);
    } else if (style === 'royal_station') {
      // Iconic Red & Cream Hua Hin Royal Wooden Railway Pavilion
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.3, 1.6), new THREE.MeshStandardMaterial({ color: '#FEF3C7' }));
      body.position.y = 0.65;
      g.add(body);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.2, 4), new THREE.MeshStandardMaterial({ color: '#DC2626' }));
      roof.position.y = 1.9;
      roof.rotation.y = Math.PI / 4;
      g.add(roof);
    } else if (style === 'mountain_temple') {
      const chedi = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.2, 8), new THREE.MeshStandardMaterial({ color: '#FACC15', metalness: 0.45, roughness: 0.25 }));
      chedi.position.y = 1.6;
      g.add(chedi);
    } else {
      // Hat Yai Clocktower
      const tower = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.2, 1.1), new THREE.MeshStandardMaterial({ color: '#F5EFE6' }));
      tower.position.y = 1.6;
      g.add(tower);
      const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.2, 12), new THREE.MeshStandardMaterial({ color: '#FACC15' }));
      clock.rotation.x = Math.PI / 2;
      clock.position.y = 2.6;
      g.add(clock);
    }
    return g;
  }

  _buildIntercityTrain(color) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.7, 2.4), new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 }));
    body.position.y = 0.45;
    body.castShadow = true;
    g.add(body);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.2, 2.44), new THREE.MeshStandardMaterial({ color }));
    stripe.position.y = 0.36;
    g.add(stripe);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 10), new THREE.MeshStandardMaterial({ color: '#FFFFFF' }));
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0.42, 1.6);
    g.add(nose);
    return g;
  }

  syncAndAnimate(state, dt) {
    if (!this.group.visible) return;
    for (const city of INTERCITY_CITIES) {
      const lvl = state.intercityLevels[city.id] || 0;
      const track = this.cityTracks.get(city.id);
      const tr = this.intercityTrains.get(city.id);
      if (track) {
        track.material.opacity = lvl > 0 ? 1.0 : 0.28;
      }
      if (tr) {
        tr.mesh.visible = lvl > 0;
        if (lvl > 0) {
          const spd = (0.14 + lvl * 0.025) * state.timeScale;
          tr.t += tr.dir * spd * dt;
          if (tr.t >= 1) { tr.t = 1; tr.dir = -1; }
          else if (tr.t <= 0) { tr.t = 0; tr.dir = 1; }
          const pos = tr.curve.getPoint(tr.t);
          const tan = tr.curve.getTangent(tr.t);
          tr.mesh.position.copy(pos);
          tr.mesh.rotation.y = Math.atan2(tan.x * tr.dir, tan.z * tr.dir);
        }
      }
    }
  }
}
