// High-Detail 3D Train, Monorail, Bus, Chao Phraya Boat & Bangkok Street Vehicle Meshes
// Features procedural multi-door/window cabin textures, rooftop HVAC pods & pantographs,
// LED headlights/taillights, rounded roofs, aerodynamic Shinkansen nose, and breakdown FX.

import * as THREE from 'three';

let cachedSideWinTex = null;
function getTrainSideTexture(bodyColor, stripeColor) {
  const key = `${bodyColor}|${stripeColor}`;
  if (!cachedSideWinTex) cachedSideWinTex = new Map();
  if (cachedSideWinTex.has(key)) return cachedSideWinTex.get(key);

  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 96;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bodyColor;
  ctx.fillRect(0, 0, 256, 96);

  // Signature horizontal transit stripe
  ctx.fillStyle = stripeColor;
  ctx.fillRect(0, 62, 256, 16);

  // Recessed sliding passenger doors & panoramic glossy cabin windows!
  const slots = [14, 72, 134, 194];
  slots.forEach((sx, i) => {
    const isDoor = i === 1 || i === 2;
    if (isDoor) {
      // Twin sliding metallic door surround
      ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
      ctx.fillRect(sx, 14, 46, 74);
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(sx + 5, 20, 16, 30);
      ctx.fillRect(sx + 25, 20, 16, 30);
      ctx.fillStyle = 'rgba(255, 245, 195, 0.35)';
      ctx.fillRect(sx + 6, 22, 14, 10);
      ctx.fillRect(sx + 26, 22, 14, 10);
    } else {
      // Wide tinted cabin window with interior highlight
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(sx, 18, 48, 34);
      ctx.fillStyle = 'rgba(186, 230, 253, 0.35)';
      ctx.fillRect(sx + 2, 20, 44, 9);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.28)';
      ctx.fillRect(sx + 4, 34, 40, 14);
    }
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedSideWinTex.set(key, tex);
  return tex;
}

function mkMat(color, opts = {}) {
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.36,
    metalness: opts.metalness ?? 0.14,
  });
  if (opts.emissive) {
    m.emissive = new THREE.Color(opts.emissive);
    m.emissiveIntensity = opts.emissiveIntensity ?? 0.65;
  }
  return m;
}

export function createVehicleMesh(model) {
  const root = new THREE.Group();

  if (model.noseStyle === 'boat') {
    buildChaoPhrayaBoat(root, model);
  } else if (model.noseStyle === 'bus') {
    buildBangkokBus(root, model);
  } else {
    buildSleekTrain(root, model);
  }

  // Breakdown FX Group (animated puffing cartoon smoke clouds + flickering orange sparks)
  const fx = new THREE.Group();
  fx.name = 'breakdownFx';
  fx.visible = false;

  const smokeMat = new THREE.MeshStandardMaterial({ color: '#64748B', roughness: 0.9, transparent: true, opacity: 0.85 });
  const sparkMat = new THREE.MeshBasicMaterial({ color: '#FACC15' });
  const smokes = [];
  for (let i = 0; i < 4; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.22 + i * 0.04, 8, 7), smokeMat);
    puff.position.set((Math.random() - 0.5) * 0.22, 0.85 + i * 0.34, (Math.random() - 0.5) * 0.22);
    puff.userData.phase = i * 1.5;
    fx.add(puff);
    smokes.push(puff);
  }
  const sparks = [];
  for (let i = 0; i < 3; i++) {
    const sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), sparkMat);
    sp.position.set((i - 1) * 0.28, 0.72, 0.1);
    sp.userData.phase = i * 2.1;
    fx.add(sp);
    sparks.push(sp);
  }
  fx.userData.smokes = smokes;
  fx.userData.sparks = sparks;
  root.add(fx);

  return root;
}

// Solid watertight extruded curved train roof running cleanly along Z!
function makeTrainRoofGeo(widthX, archH, lengthZ) {
  const halfX = widthX / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-halfX, 0);
  const segs = 10;
  for (let i = 0; i <= segs; i++) {
    const a = Math.PI - (i / segs) * Math.PI;
    shape.lineTo(Math.cos(a) * halfX, Math.sin(a) * archH);
  }
  shape.lineTo(halfX, 0);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: lengthZ, bevelEnabled: false });
  geo.translate(0, 0, -lengthZ / 2);
  return geo;
}

function buildSleekTrain(root, model) {
  const bodyMat = mkMat(model.bodyColor, { roughness: 0.3 });
  const stripeMat = mkMat(model.stripeColor, { roughness: 0.32 });
  const roofMat = mkMat(model.roofColor, { roughness: 0.45 });
  const accentMat = mkMat(model.accentColor, { roughness: 0.38 });
  const sideTex = getTrainSideTexture(model.bodyColor, model.stripeColor);
  const sideMat = new THREE.MeshStandardMaterial({
    map: sideTex,
    roughness: 0.28,
    metalness: 0.15,
  });
  const winMat = mkMat('#0F172A', { roughness: 0.12, metalness: 0.4, emissive: '#FEF08A', emissiveIntensity: 0.22 });
  const headlightMat = mkMat('#FEF9C3', { emissive: '#FDE047', emissiveIntensity: 1.15 });
  const taillightMat = mkMat('#EF4444', { emissive: '#EF4444', emissiveIntensity: 0.95 });
  const bogieMat = mkMat('#334155', { roughness: 0.65 });
  const hvacMat = mkMat('#E2E8F0', { roughness: 0.48 });

  const carCount = Math.min(3, model.cars || 3);
  const carLen = model.noseStyle === 'bullet' ? 1.24 : 1.08;
  const gap = 0.11;
  const totalLen = carCount * carLen + (carCount - 1) * gap;
  const startZ = -totalLen / 2 + carLen / 2;

  const carMats = [sideMat, sideMat, roofMat, bogieMat, bodyMat, bodyMat];

  for (let i = 0; i < carCount; i++) {
    const z = startZ + i * (carLen + gap);
    const isFront = i === carCount - 1;
    const isRear = i === 0;
    const car = new THREE.Group();
    car.position.set(0, 0, z);

    // Main sculpted carriage with crisp multi-window/door texture on sides!
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.54, carLen), carMats);
    body.position.y = 0.43;
    body.castShadow = true;
    car.add(body);

    // FIXED: Solid watertight curved aerodynamic train roof crown aligned cleanly along Z!
    const roofCrown = new THREE.Mesh(makeTrainRoofGeo(0.66, 0.13, carLen * 0.98), roofMat);
    roofCrown.position.y = 0.70;
    roofCrown.castShadow = true;
    car.add(roofCrown);

    // Twin rooftop AC / HVAC pods sitting cleanly on top of the curved crown
    for (const hz of [-0.26, 0.26]) {
      const ac = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.075, 0.24), hvacMat);
      ac.position.set(0, 0.84, hz);
      car.add(ac);
    }

    // Center car overhead pantograph arm for rail/bullet models!
    if (i === 1 && model.noseStyle !== 'monorail') {
      const panto = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.12), bogieMat);
      panto.position.set(0, 0.93, 0);
      car.add(panto);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.18), bogieMat);
      arm.position.set(0, 0.86, 0);
      arm.rotation.x = 0.35;
      car.add(arm);
    }

    // Undercarriage bogie + wheel discs
    const bogie = new THREE.Mesh(
      new THREE.BoxGeometry(model.noseStyle === 'monorail' ? 0.54 : 0.46, 0.16, carLen * 0.82),
      bogieMat
    );
    bogie.position.y = 0.12;
    car.add(bogie);

    // Aerodynamic Front & Rear Cabs
    if (isFront || isRear) {
      const dir = isFront ? 1 : -1;
      if (model.noseStyle === 'bullet') {
        // Sleek duck-billed Shinkansen N700S nose!
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.72, 14), bodyMat);
        nose.rotation.x = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        nose.scale.set(0.95, 1, 0.68);
        nose.position.set(0, 0.38, dir * (carLen / 2 + 0.33));
        nose.castShadow = true;
        car.add(nose);
        const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.18, 0.28), winMat);
        cockpit.position.set(0, 0.54, dir * (carLen / 2 + 0.14));
        cockpit.rotation.x = dir * 0.42;
        car.add(cockpit);
        const bStripe = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.09, 0.42), stripeMat);
        bStripe.position.set(0, 0.32, dir * (carLen / 2 + 0.18));
        car.add(bStripe);
      } else if (model.noseStyle === 'aero' || model.noseStyle === 'sloped' || model.noseStyle === 'rounded') {
        const nose = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.48, 0.3), bodyMat);
        nose.position.set(0, 0.39, dir * (carLen / 2 + 0.12));
        nose.rotation.x = dir * 0.2;
        car.add(nose);
        const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.24, 0.1), winMat);
        frontGlass.position.set(0, 0.52, dir * (carLen / 2 + 0.21));
        frontGlass.rotation.x = dir * 0.24;
        car.add(frontGlass);
        const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.11, 0.1), accentMat);
        skirt.position.set(0, 0.2, dir * (carLen / 2 + 0.2));
        car.add(skirt);
      } else {
        const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.26, 0.06), winMat);
        frontGlass.position.set(0, 0.52, dir * (carLen / 2 + 0.01));
        car.add(frontGlass);
        const destLed = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.07, 0.07), mkMat('#F59E0B', { emissive: '#FBBF24', emissiveIntensity: 0.9 }));
        destLed.position.set(0, 0.67, dir * (carLen / 2 + 0.01));
        car.add(destLed);
        const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.12, 0.08), accentMat);
        bumper.position.set(0, 0.21, dir * (carLen / 2 + 0.02));
        car.add(bumper);
      }

      // Glowing Headlights (front) & Red Tail Lamps (rear)
      const lampMat = isFront ? headlightMat : taillightMat;
      const zOff = carLen / 2 + (model.noseStyle === 'bullet' ? 0.38 : 0.12);
      for (const lx of [-0.21, 0.21]) {
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), lampMat);
        lamp.position.set(lx, 0.28, dir * zOff);
        car.add(lamp);
      }
    }

    // Articulated accordion gangway connector
    if (i < carCount - 1) {
      const joint = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.46, gap + 0.08), bogieMat);
      joint.position.set(0, 0.43, z + carLen / 2 + gap / 2);
      root.add(joint);
    }

    root.add(car);
  }
}

function buildBangkokBus(root, model) {
  const bodyMat = mkMat(model.bodyColor, { roughness: 0.32 });
  const roofMat = mkMat(model.roofColor, { roughness: 0.4 });
  const sideTex = getTrainSideTexture(model.bodyColor, model.stripeColor);
  const sideMat = new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.3 });
  const winMat = mkMat('#0F172A', { roughness: 0.15, emissive: '#FEF08A', emissiveIntensity: 0.25 });
  const wheelMat = mkMat('#1F2937', { roughness: 0.8 });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.64, 1.62),
    [sideMat, sideMat, roofMat, wheelMat, bodyMat, bodyMat]
  );
  body.position.y = 0.46;
  body.castShadow = true;
  root.add(body);

  // Curved front windshield + LED route number header
  const frontWin = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.32, 0.06), winMat);
  frontWin.position.set(0, 0.54, 0.82);
  root.add(frontWin);
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.07), mkMat('#F59E0B', { emissive: '#FBBF24', emissiveIntensity: 1.0 }));
  led.position.set(0, 0.72, 0.82);
  root.add(led);

  // EV Battery / AC Rooftop Pod
  const roofPod = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.13, 1.12), roofMat);
  roofPod.position.set(0, 0.84, -0.05);
  root.add(roofPod);

  for (const wx of [-0.34, 0.34]) {
    for (const wz of [-0.5, 0.5]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.11, 12), wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, 0.16, wz);
      root.add(w);
    }
  }
  const lampMat = mkMat('#FEF08A', { emissive: '#FDE047', emissiveIntensity: 1.1 });
  for (const lx of [-0.22, 0.22]) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), lampMat);
    l.position.set(lx, 0.28, 0.83);
    root.add(l);
  }
}

function buildChaoPhrayaBoat(root, model) {
  const hullMat = mkMat(model.bodyColor, { roughness: 0.35 });
  const stripeMat = mkMat(model.stripeColor, { roughness: 0.38 });
  const canopyMat = mkMat(model.roofColor, { roughness: 0.5 });
  const woodMat = mkMat('#B07D48', { roughness: 0.75 });
  const wakeMat = new THREE.MeshBasicMaterial({ color: '#E0F2FE', transparent: true, opacity: 0.78 });

  const hull = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.32, 1.72), hullMat);
  hull.position.y = 0.2;
  hull.castShadow = true;
  root.add(hull);

  const bow = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.62, 4), hullMat);
  bow.rotation.x = Math.PI / 2;
  bow.rotation.y = Math.PI / 4;
  bow.position.set(0, 0.22, 1.12);
  root.add(bow);

  const band = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.12, 1.75), stripeMat);
  band.position.y = 0.16;
  root.add(band);

  // Wooden passenger deck & benches
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.06, 1.38), woodMat);
  deck.position.set(0, 0.38, -0.02);
  root.add(deck);

  // Iconic Orange-Flag arched roof canopy
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.09, 1.32), canopyMat);
  canopy.position.set(0, 0.72, -0.05);
  canopy.castShadow = true;
  root.add(canopy);
  for (const px of [-0.29, 0.29]) {
    for (const pz of [-0.58, 0.0, 0.48]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.36, 6), hullMat);
      post.position.set(px, 0.53, pz);
      root.add(post);
    }
  }
  const flag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.24, 0.34), mkMat('#EA580C'));
  flag.position.set(0, 0.88, -0.7);
  root.add(flag);

  const wake = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.45), wakeMat);
  wake.rotation.x = -Math.PI / 2;
  wake.position.set(0, 0.04, -1.52);
  wake.name = 'boatWake';
  root.add(wake);
}

// Detailed Miniature Bangkok Tuk-Tuk & Iconic Hot-Pink / Yellow-Green Taxis
export function createAmbientVehicleMesh(kind = 'tuktuk') {
  const g = new THREE.Group();
  const wheelMat = mkMat('#1F2937', { roughness: 0.85 });
  const winMat = mkMat('#1E293B', { roughness: 0.2 });

  if (kind === 'tuktuk') {
    const blue = mkMat('#1D4ED8');
    const yellow = mkMat('#FACC15');
    const canopy = mkMat('#0284C7');
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.64), blue);
    body.position.y = 0.22;
    body.castShadow = true;
    g.add(body);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.09, 0.66), yellow);
    trim.position.y = 0.14;
    g.add(trim);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.08, 0.56), canopy);
    roof.position.y = 0.54;
    g.add(roof);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), mkMat('#FEF08A', { emissive: '#FDE047', emissiveIntensity: 1.0 }));
    lamp.position.set(0, 0.24, 0.34);
    g.add(lamp);
  } else {
    const isPink = kind === 'taxi_pink';
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.82), mkMat(isPink ? '#EC4899' : '#16A34A'));
    body.position.y = 0.19;
    body.castShadow = true;
    g.add(body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.44), mkMat(isPink ? '#F472B6' : '#FACC15'));
    cabin.position.y = 0.38;
    g.add(cabin);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.12, 0.38), winMat);
    glass.position.y = 0.38;
    g.add(glass);
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.09), mkMat('#FFFFFF', { emissive: '#FEF08A', emissiveIntensity: 0.95 }));
    sign.position.y = 0.5;
    g.add(sign);
    for (const wx of [-0.23, 0.23]) {
      for (const wz of [-0.25, 0.25]) {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 8), wheelMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(wx, 0.09, wz);
        g.add(w);
      }
    }
  }
  return g;
}

export function animateBreakdownFx(vehicleMesh, timeSec, isBroken) {
  const fx = vehicleMesh.getObjectByName('breakdownFx');
  if (!fx) return;
  fx.visible = isBroken;
  if (!isBroken) return;

  for (const puff of fx.userData.smokes) {
    const cycle = (timeSec * 1.4 + puff.userData.phase) % 2.4;
    const t = cycle / 2.4;
    puff.position.y = 0.85 + t * 1.75;
    const sc = 0.55 + Math.sin(t * Math.PI) * 0.9;
    puff.scale.set(sc, sc, sc);
  }
  for (const sp of fx.userData.sparks) {
    const flash = Math.sin(timeSec * 16 + sp.userData.phase);
    sp.visible = flash > 0.15;
    sp.rotation.y = timeSec * 8;
    sp.position.y = 0.68 + Math.abs(Math.sin(timeSec * 10 + sp.userData.phase)) * 0.55;
  }
}
