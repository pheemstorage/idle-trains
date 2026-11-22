// Handcrafted High-Detail 3D Apple Maps / Architectural Cartoon Bangkok Landmarks & Stations
// Features procedural multi-floor window facade textures + twinkling night emissive maps,
// bespoke real-life Bangkok architecture (COCO PARC at Khlong Toei, Siam Paragon, CentralWorld,
// Mahanakhon, EmQuartier, ICONSIAM, Terminal 21, 7-Eleven Thailand, and upgraded BTS/MRT stations).

import * as THREE from 'three';

const matCache = new Map();
const signTexCache = new Map();
const facadeTexCache = new Map();

function mat(color, opts = {}) {
  const key = `${color}_${opts.roughness ?? 0.62}_${opts.metalness ?? 0.06}_${opts.emissive ?? ''}_${opts.transparent ?? false}_${opts.opacity ?? 1}_${opts.facade ?? ''}`;
  if (matCache.has(key)) return matCache.get(key);
  const cfg = {
    color,
    roughness: opts.roughness ?? 0.62,
    metalness: opts.metalness ?? 0.06,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
  };
  if (opts.facade) {
    const pair = getFacadeTextures(opts.facade);
    cfg.map = pair.dayMap;
    cfg.emissiveMap = pair.nightMap;
    cfg.emissive = new THREE.Color('#FFE8B0');
    cfg.emissiveIntensity = 0.0;
  } else if (opts.emissive) {
    cfg.emissive = new THREE.Color(opts.emissive);
    cfg.emissiveIntensity = opts.emissiveIntensity ?? 0.0;
  }
  const m = new THREE.MeshStandardMaterial(cfg);
  if (opts.facade || opts.emissive) {
    m.userData.nightGlow = true;
    m.userData.maxGlow = opts.maxGlow ?? (opts.facade ? 1.15 : 0.85);
  }
  matCache.set(key, m);
  return m;
}

export function getAllNightGlowMaterials() {
  const list = [];
  for (const m of matCache.values()) {
    if (m.userData.nightGlow) list.push(m);
  }
  return list;
}

// Procedural Multi-Floor Architectural Window Facade + Night Twinkling Emissive Texture Generator
function getFacadeTextures(style) {
  if (facadeTexCache.has(style)) return facadeTexCache.get(style);

  const w = 128;
  const h = 256;
  const dCan = document.createElement('canvas');
  dCan.width = w;
  dCan.height = h;
  const dc = dCan.getContext('2d');

  const nCan = document.createElement('canvas');
  nCan.width = w;
  nCan.height = h;
  const nc = nCan.getContext('2d');
  nc.fillStyle = '#000000';
  nc.fillRect(0, 0, w, h);

  let seed = style.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7);
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  if (style === 'coco_glass') {
    // Sleek A49 charcoal mullions + sky-tinted floor-to-ceiling luxury glass!
    dc.fillStyle = '#252B34';
    dc.fillRect(0, 0, w, h);
    const cols = 4;
    const rows = 14;
    const cw = w / cols;
    const rh = h / rows;
    for (let r = 0; r < rows; r++) {
      // Subtle champagne floor slab line every floor
      dc.fillStyle = r % 5 === 0 ? '#D4BE9E' : '#323A46';
      dc.fillRect(0, r * rh, w, 3);
      for (let c = 0; c < cols; c++) {
        const gx = c * cw + 3;
        const gy = r * rh + 4;
        const gw = cw - 6;
        const gh = rh - 6;
        const grad = dc.createLinearGradient(gx, gy, gx, gy + gh);
        grad.addColorStop(0, '#89C8EC');
        grad.addColorStop(1, '#4C89B5');
        dc.fillStyle = grad;
        dc.fillRect(gx, gy, gw, gh);
        // Subtle diagonal architectural reflection gleam
        dc.fillStyle = 'rgba(255,255,255,0.18)';
        dc.fillRect(gx + 2, gy + 1, gw * 0.35, gh - 2);
        // Warm realistic luxury apartment night lights
        if (rand() > 0.36) {
          nc.fillStyle = rand() > 0.3 ? '#FFDC94' : '#FFF3CC';
          nc.fillRect(gx + 1, gy + 1, gw - 2, gh - 2);
        }
      }
    }
  } else if (style === 'curtain_blue' || style === 'curtain_gold') {
    const frame = style === 'curtain_gold' ? '#C9A86A' : '#CBD5E1';
    const topCol = style === 'curtain_gold' ? '#587CA3' : '#7BC4EC';
    const botCol = style === 'curtain_gold' ? '#2A4365' : '#3B78A8';
    dc.fillStyle = frame;
    dc.fillRect(0, 0, w, h);
    const cols = 5;
    const rows = 12;
    const cw = w / cols;
    const rh = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const gx = c * cw + 2.5;
        const gy = r * rh + 3.5;
        const gw = cw - 5;
        const gh = rh - 6;
        const grad = dc.createLinearGradient(gx, gy, gx, gy + gh);
        grad.addColorStop(0, topCol);
        grad.addColorStop(1, botCol);
        dc.fillStyle = grad;
        dc.fillRect(gx, gy, gw, gh);
        if (rand() > 0.38) {
          nc.fillStyle = rand() > 0.4 ? '#FFE49E' : '#BFE8FF';
          nc.fillRect(gx + 1, gy + 1, gw - 2, gh - 2);
        }
      }
    }
  } else if (style === 'hotel_warm' || style === 'condo_ivory') {
    dc.fillStyle = style === 'hotel_warm' ? '#F8EEDB' : '#F3EFE6';
    dc.fillRect(0, 0, w, h);
    const cols = 4;
    const rows = 10;
    const cw = w / cols;
    const rh = h / rows;
    for (let r = 0; r < rows; r++) {
      // Balcony slab shadow
      dc.fillStyle = 'rgba(70, 60, 48, 0.14)';
      dc.fillRect(0, r * rh + rh - 4, w, 4);
      for (let c = 0; c < cols; c++) {
        const gx = c * cw + 5;
        const gy = r * rh + 5;
        const gw = cw - 10;
        const gh = rh - 10;
        dc.fillStyle = '#5D8FB8';
        dc.fillRect(gx, gy, gw, gh);
        dc.fillStyle = 'rgba(255,255,255,0.22)';
        dc.fillRect(gx, gy, gw, 3);
        if (rand() > 0.34) {
          nc.fillStyle = '#FFDF91';
          nc.fillRect(gx + 1, gy + 1, gw - 2, gh - 2);
        }
      }
    }
  } else if (style === 'suankularb_colonial') {
    // Authentic Suankularb Wittayalai School "Long Building" (ตึกยาว) golden-ochre neoclassical facade!
    dc.fillStyle = '#DCA842';
    dc.fillRect(0, 0, w, h);
    // Crisp white horizontal colonial cornices & plinth molding
    dc.fillStyle = '#F7F2E6';
    dc.fillRect(0, 0, w, 12);
    dc.fillRect(0, h * 0.48, w, 10);
    dc.fillRect(0, h - 14, w, 14);
    // Classical vertical pilasters + arched forest-green colonial shuttered windows!
    const cols = 4;
    const cw = w / cols;
    for (let row = 0; row < 2; row++) {
      const yBase = row === 0 ? 22 : h * 0.56;
      const wh = h * 0.34;
      for (let c = 0; c < cols; c++) {
        const cx = c * cw;
        // Pale ochre pilaster strip
        dc.fillStyle = '#E8BE68';
        dc.fillRect(cx, yBase - 6, 4, wh + 10);
        // White arched window trim
        dc.fillStyle = '#FFFDF5';
        dc.fillRect(cx + 7, yBase, cw - 14, wh);
        // Forest-green shuttered window panes
        dc.fillStyle = '#26533A';
        dc.fillRect(cx + 10, yBase + 4, cw - 20, wh - 8);
        // White inner cross-bars
        dc.fillStyle = '#E2DDD2';
        dc.fillRect(cx + cw / 2 - 1, yBase + 4, 2, wh - 8);
        dc.fillRect(cx + 10, yBase + wh * 0.48, cw - 20, 2);
        // Warm evening classroom glow
        if (rand() > 0.32) {
          nc.fillStyle = '#FFE394';
          nc.fillRect(cx + 11, yBase + 5, cw - 22, wh - 10);
        }
      }
    }
  } else {
    // Retail / mall / shophouse lively warm storefront windows
    dc.fillStyle = '#FAF5EA';
    dc.fillRect(0, 0, w, h);
    const cols = 4;
    const rows = 6;
    const cw = w / cols;
    const rh = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const gx = c * cw + 4;
        const gy = r * rh + 6;
        const gw = cw - 8;
        const gh = rh - 12;
        dc.fillStyle = '#90D0F4';
        dc.fillRect(gx, gy, gw, gh);
        dc.fillStyle = 'rgba(255,255,255,0.32)';
        dc.fillRect(gx + 2, gy + 2, gw * 0.4, gh - 4);
        if (rand() > 0.25) {
          nc.fillStyle = '#FFE9AA';
          nc.fillRect(gx + 1, gy + 1, gw - 2, gh - 2);
        }
      }
    }
  }

  const dayMap = new THREE.CanvasTexture(dCan);
  dayMap.colorSpace = THREE.SRGBColorSpace;
  dayMap.wrapS = THREE.RepeatWrapping;
  dayMap.wrapT = THREE.RepeatWrapping;

  const nightMap = new THREE.CanvasTexture(nCan);
  nightMap.colorSpace = THREE.SRGBColorSpace;
  nightMap.wrapS = THREE.RepeatWrapping;
  nightMap.wrapT = THREE.RepeatWrapping;

  const pair = { dayMap, nightMap };
  facadeTexCache.set(style, pair);
  return pair;
}

function makeSignTexture(text, bg, fg, accent = null) {
  const key = `${text}|${bg}|${fg}|${accent}`;
  if (signTexCache.has(key)) return signTexCache.get(key);
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 64);
  if (accent) {
    ctx.fillStyle = accent[0];
    ctx.fillRect(0, 0, 256, 10);
    ctx.fillStyle = accent[1];
    ctx.fillRect(0, 10, 256, 7);
    ctx.fillStyle = accent[2];
    ctx.fillRect(0, 54, 256, 10);
  }
  ctx.fillStyle = fg;
  ctx.font = 'bold 30px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, accent ? 34 : 33);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  signTexCache.set(key, tex);
  return tex;
}

function addBox(parent, w, h, d, x, y, z, material, cast = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addCyl(parent, rt, rb, h, segs, x, y, z, material, cast = true) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

// Watertight closed arched barrel-vault roof via ExtrudeGeometry (ZERO invisible backfaces or rotation bugs!)
// Extruded along local X (width along X, span along Z, arch rising in +Y)
function makeBarrelRoof(lengthX, spanZ, archH, material) {
  const halfZ = spanZ / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-halfZ, 0);
  const segs = 14;
  for (let i = 0; i <= segs; i++) {
    const a = Math.PI - (i / segs) * Math.PI;
    shape.lineTo(Math.cos(a) * halfZ, Math.sin(a) * archH);
  }
  shape.lineTo(halfZ, 0);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, { depth: lengthX, bevelEnabled: false });
  geo.translate(0, 0, -lengthX / 2);
  geo.rotateY(Math.PI / 2);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// Solid triangular pitched gable roof prism (extruded along local X, ridge along X, slope along Z)
function makeGableRoof(lengthX, spanZ, heightY, material) {
  const halfZ = spanZ / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-halfZ, 0);
  shape.lineTo(0, heightY);
  shape.lineTo(halfZ, 0);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: lengthX, bevelEnabled: false });
  geo.translate(0, 0, -lengthX / 2);
  geo.rotateY(Math.PI / 2);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// Sculpted rounded Apple Maps-style miniature landscape tree
function addAppleTree(parent, x, y, z, scale = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  addCyl(g, 0.055 * scale, 0.08 * scale, 0.36 * scale, 6, 0, 0.18 * scale, 0, mat('#9E8578'));
  const c1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.28 * scale, 10, 8),
    mat('#66BB6A', { roughness: 0.78 })
  );
  c1.position.y = 0.48 * scale;
  c1.scale.set(1.06, 0.9, 1.06);
  c1.castShadow = true;
  g.add(c1);
  const c2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.2 * scale, 8, 7),
    mat('#81C784', { roughness: 0.78 })
  );
  c2.position.set(0.12 * scale, 0.44 * scale, 0.09 * scale);
  g.add(c2);
  parent.add(g);
}

// ===== BESPOKE HIGH-DETAIL REAL-LIFE BANGKOK LANDMARK BUILDERS =====

// 1. COCO PARC BY DUSIT (Khlong Toei MRT) — High-Detail 37-Floor A49 Luxury Tower!
function buildCocoParc() {
  const g = new THREE.Group();
  const charcoal = mat('#272D36', { roughness: 0.44, metalness: 0.2 });
  const darkSlate = mat('#1B2028', { roughness: 0.4, metalness: 0.24 });
  const champagne = mat('#DBC5A4', { roughness: 0.38, metalness: 0.32 });
  const cocoFacade = mat('#FFFFFF', { facade: 'coco_glass', roughness: 0.22, metalness: 0.25, maxGlow: 1.2 });
  const poolMat = mat('#2DD4BF', { roughness: 0.12, metalness: 0.1, emissive: '#14B8A6', maxGlow: 0.65 });
  const poolEdge = mat('#F5EFE6', { roughness: 0.55 });
  const gardenMat = mat('#5BB85D', { roughness: 0.8 });
  const lobbyGlow = mat('#FFF7E0', { roughness: 0.2, emissive: '#FDE68A', maxGlow: 0.95 });

  // Landscaped architectural plinth & curved drop-off plaza
  addBox(g, 2.55, 0.18, 2.45, 0, 0.09, 0, mat('#ECE6DA'));
  // Sculpted Podium (Floors 1-7) with fluted charcoal facade & champagne cornice
  addBox(g, 2.1, 1.18, 1.9, 0, 0.76, -0.04, charcoal);
  addBox(g, 2.16, 0.14, 1.96, 0, 0.38, -0.04, champagne);
  // Warm glass COCO Lobby + cantilevered entry porte-cochere
  addBox(g, 1.18, 0.42, 0.28, 0, 0.39, 0.92, lobbyGlow);
  addBox(g, 1.48, 0.09, 0.56, 0, 0.65, 1.02, darkSlate);
  addBox(g, 1.44, 0.04, 0.52, 0, 0.61, 1.02, champagne);

  // Floor 8 Resort Facility Deck: Recessed Turquoise COCO Lap Pool, Sun Loungers & Garden!
  addBox(g, 2.18, 0.16, 1.98, 0, 1.42, -0.04, champagne);
  addBox(g, 1.48, 0.10, 0.54, 0, 1.54, 0.64, poolEdge);
  addBox(g, 1.32, 0.07, 0.38, 0, 1.59, 0.64, poolMat, false); // Shimmering turquoise COCO Lap Pool!
  // Glass pool balustrade
  addBox(g, 1.98, 0.16, 0.04, 0, 1.62, 0.92, mat('#BAE6FD', { transparent: true, opacity: 0.55 }), false);
  // Miniature deck planters & trees on Floor 8
  addBox(g, 0.44, 0.12, 0.44, -0.82, 1.55, 0.62, gardenMat);
  addBox(g, 0.44, 0.12, 0.44, 0.82, 1.55, 0.62, gardenMat);
  addAppleTree(g, -0.82, 1.58, 0.62, 0.46);
  addAppleTree(g, 0.82, 1.58, 0.62, 0.46);

  // Main 37-Floor Sleek Sculpted Tower with Real Floor-by-Floor Glass Curtain Wall!
  // Strictly stacked y = 1.50..5.20 with ZERO overlap into COCO Lounge!
  addBox(g, 1.46, 3.7, 1.26, 0, 3.35, -0.14, cocoFacade);
  // Streamlined curved vertical corner piers (A49 "Simplified Perfection" fluidity!)
  for (const cx of [-0.71, 0.71]) {
    for (const cz of [-0.75, 0.47]) {
      addCyl(g, 0.14, 0.14, 3.72, 12, cx, 3.36, cz, darkSlate);
    }
  }
  // Fine vertical charcoal architectural fins protruding cleanly outside glass
  for (let i = -2; i <= 2; i++) {
    addBox(g, 0.06, 3.7, 1.34, i * 0.28, 3.35, -0.14, darkSlate);
  }
  // Horizontal champagne accent floor slabs + stepped lush sky-gardens (Floors 30, 32, 35)
  addBox(g, 1.62, 0.09, 1.42, 0, 2.72, -0.14, champagne);
  addBox(g, 1.62, 0.10, 1.42, 0, 4.22, -0.14, champagne);
  addBox(g, 1.58, 0.08, 1.38, 0, 5.24, -0.14, champagne); // Clean separator slab
  addBox(g, 0.62, 0.18, 0.34, 0.44, 4.36, 0.52, gardenMat);
  addAppleTree(g, 0.46, 4.46, 0.52, 0.34);
  addBox(g, 0.62, 0.18, 0.34, -0.44, 4.74, 0.52, gardenMat);
  addAppleTree(g, -0.46, 4.84, 0.52, 0.34);

  // Floor 37: Glowing Cantilevered COCO Lounge Sky Crown (strictly above y = 5.28!)
  addBox(g, 1.4, 0.48, 1.2, 0, 5.52, -0.14, cocoFacade);
  addBox(g, 1.64, 0.14, 1.44, 0, 5.83, -0.14, darkSlate);
  addBox(g, 1.54, 0.08, 1.34, 0, 5.94, -0.14, champagne);
  addBox(g, 0.85, 0.22, 0.72, 0, 6.09, -0.18, charcoal);

  // Crisp illuminated COCO PARC architectural sign (front readable, solid back — never mirrored!)
  const signMat = new THREE.MeshBasicMaterial({
    map: makeSignTexture('COCO PARC', '#1D222A', '#F7E7CE'),
  });
  const signBoard = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.34, 0.08), [
    darkSlate, darkSlate, darkSlate, darkSlate, signMat, darkSlate,
  ]);
  signBoard.position.set(0, 6.26, 0.58);
  g.add(signBoard);

  // Lush Rama IV streetscape trees
  addAppleTree(g, -1.04, 0.16, 0.96, 0.56);
  addAppleTree(g, 1.04, 0.16, 0.96, 0.56);
  return g;
}

// 2. High-Detail Authentic Thailand 7-Eleven Storefront (ZERO z-fighting!)
function buildSevenEleven() {
  const g = new THREE.Group();
  const white = mat('#FFFFFF', { roughness: 0.45 });
  const green = mat('#008161', { roughness: 0.4 });
  const orange = mat('#F58220', { roughness: 0.4 });
  const red = mat('#E31837', { roughness: 0.4 });
  const interiorGlow = mat('#ECFEFF', { roughness: 0.15, emissive: '#FFF7D6', maxGlow: 1.15 });
  const shelfCol = mat('#FBBF24', { roughness: 0.65 });

  // Sidewalk curb pad & tiny safety bollards
  addBox(g, 1.6, 0.12, 1.35, 0, 0.06, 0, mat('#E5E0D5'));
  for (const bx of [-0.56, 0.56]) {
    addCyl(g, 0.03, 0.03, 0.22, 6, bx, 0.2, 0.62, mat('#F59E0B'));
  }

  // Main beveled building body (front face at z = 0.46)
  addBox(g, 1.34, 0.94, 1.02, 0, 0.58, -0.05, white);
  // Strictly layered storefront glass (z = 0.48), warm product shelves highlight (z = 0.50), mullions (z = 0.515)
  addBox(g, 1.06, 0.5, 0.04, 0, 0.41, 0.48, interiorGlow);
  addBox(g, 0.84, 0.14, 0.02, 0, 0.29, 0.505, shelfCol, false);
  addBox(g, 0.035, 0.5, 0.03, -0.18, 0.41, 0.515, mat('#475569'));
  addBox(g, 0.035, 0.5, 0.03, 0.18, 0.41, 0.515, mat('#475569'));

  // Iconic Green / Orange / Red wraparound racing stripe awning!
  addBox(g, 1.48, 0.10, 1.22, 0, 0.96, 0.04, green);
  addBox(g, 1.48, 0.08, 1.22, 0, 0.87, 0.04, orange);
  addBox(g, 1.48, 0.07, 1.22, 0, 0.79, 0.04, red);
  // White roof parapet + tiny realistic rooftop AC unit!
  addBox(g, 1.38, 0.14, 1.08, 0, 1.08, -0.04, white);
  addBox(g, 0.38, 0.18, 0.32, 0.32, 1.24, -0.18, mat('#CBD5E1'));

  // Crisp backlit 7-ELEVEN lightbox sign (readable on front, clean white on back!)
  const signTex = makeSignTexture('7-ELEVEN', '#FFFFFF', '#008161', ['#008161', '#F58220', '#E31837']);
  const signMat = new THREE.MeshBasicMaterial({ map: signTex });
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.3, 0.08), [
    white, white, white, white, signMat, white,
  ]);
  sign.position.set(0, 1.2, 0.58);
  g.add(sign);
  return g;
}

// 2b. SUANKULARB WITTAYALAI SCHOOL (155 Tri Phet Rd — Modeled directly from real-life Street View!)
//     Features the iconic 200m golden-ochre Neo-Classical "Long Building" (ตึกยาว) with arched
//     dark-green shuttered windows, central pediment archway, pitched taupe tile roof, golden
//     royal portrait pavilion, pink-and-blue (ชมพู-ฟ้า) accents, and the tall cream-and-green
//     Thai-gabled school building rising right behind it!
function buildSuankularbSchool() {
  const g = new THREE.Group();
  const ochreFacade = mat('#FFFFFF', { facade: 'suankularb_colonial', roughness: 0.48, maxGlow: 1.0 });
  const ochreSolid = mat('#DCA842', { roughness: 0.55 });
  const creamTrim = mat('#F7F2E6', { roughness: 0.5 });
  const tileRoof = mat('#827666', { roughness: 0.72 });
  const greenRoof = mat('#285B3E', { roughness: 0.62 });
  const ironGate = mat('#1E293B', { roughness: 0.4, metalness: 0.35 });
  const goldShrine = mat('#EAB308', { roughness: 0.3, metalness: 0.48 });
  const skPink = mat('#EC4899', { roughness: 0.45 });
  const skBlue = mat('#38BDF8', { roughness: 0.45 });

  // Landscaped heritage courtyard slab & lawn
  addBox(g, 3.6, 0.16, 2.75, 0, 0.08, 0, mat('#ECE5D6'));
  addBox(g, 2.9, 0.06, 1.15, 0, 0.18, -0.35, mat('#78C56E')); // Inner school yard lawn!

  // 1. Iconic Long Building (ตึกยาว) fronting Tri Phet Rd (z = +0.58)
  addBox(g, 3.25, 0.98, 0.78, 0, 0.65, 0.58, ochreFacade);
  // Crisp white top cornice molding
  addBox(g, 3.34, 0.09, 0.86, 0, 1.18, 0.58, creamTrim);
  // Solid pitched colonial hipped roof crowning the entire Long Building!
  const longRoof = makeGableRoof(3.36, 0.92, 0.42, tileRoof);
  longRoof.position.set(0, 1.22, 0.58);
  g.add(longRoof);

  // Central projecting neoclassical entrance pavilion & triangular pediment gable!
  addBox(g, 0.94, 1.06, 0.88, 0, 0.69, 0.62, ochreSolid);
  addBox(g, 0.98, 0.06, 0.92, 0, 0.72, 0.62, creamTrim); // Mid-floor white stringcourse cornice!
  addBox(g, 1.00, 0.09, 0.94, 0, 1.24, 0.62, creamTrim);
  // 2nd-floor forest-green shuttered colonial windows above the central entrance gate (just like Street View!)
  const shutterMat = mat('#214433', { roughness: 0.55 });
  for (const wx of [-0.28, -0.09, 0.09, 0.28]) {
    addBox(g, 0.12, 0.28, 0.04, wx, 0.96, 1.07, creamTrim);
    addBox(g, 0.09, 0.24, 0.04, wx, 0.96, 1.085, shutterMat);
  }
  // Front triangular pediment facing Tri Phet Rd (+Z)
  const pedShape = new THREE.Shape();
  pedShape.moveTo(-0.49, 0);
  pedShape.lineTo(0, 0.38);
  pedShape.lineTo(0.49, 0);
  pedShape.closePath();
  const pedGeo = new THREE.ExtrudeGeometry(pedShape, { depth: 0.92, bevelEnabled: false });
  pedGeo.translate(0, 0, -0.46);
  const pediment = new THREE.Mesh(pedGeo, ochreSolid);
  pediment.position.set(0, 1.28, 0.62);
  pediment.castShadow = true;
  g.add(pediment);
  // Royal crest medallion facing Tri Phet Rd (+Z)!
  const crest = addCyl(g, 0.09, 0.09, 0.05, 14, 0, 1.44, 1.1, goldShrine);
  crest.rotation.x = Math.PI / 2;
  // Central dark wrought-iron school entrance gateway arch & flanked side openings
  addBox(g, 0.36, 0.50, 0.06, 0, 0.42, 1.08, ironGate);
  addBox(g, 0.16, 0.40, 0.05, -0.32, 0.37, 1.08, ironGate);
  addBox(g, 0.16, 0.40, 0.05, 0.32, 0.37, 1.08, ironGate);
  // Signature Suankularb Pink-and-Blue (ชมพู-ฟ้า) school flags flanking gate!
  addBox(g, 0.08, 0.22, 0.04, -0.42, 0.62, 1.09, skPink);
  addBox(g, 0.08, 0.22, 0.04, 0.42, 0.62, 1.09, skBlue);

  // Ornate Golden Royal Portrait Frame out front on the left sidewalk (just like Street View!)
  addBox(g, 0.38, 0.56, 0.12, -1.02, 0.46, 1.12, goldShrine);
  addBox(g, 0.26, 0.38, 0.04, -1.02, 0.48, 1.19, creamTrim);

  // 2. Tall Cream-and-Green Thai-Gabled Modern School Building rising behind right (matching Street View!)
  const creamFacade = mat('#FFFFFF', { facade: 'hotel_warm', roughness: 0.42 });
  addBox(g, 1.38, 1.85, 0.96, 0.82, 1.08, -0.62, creamFacade);
  addBox(g, 1.48, 0.1, 1.06, 0.82, 2.04, -0.62, creamTrim);
  const thaiRoof = makeGableRoof(1.12, 1.50, 0.68, greenRoof);
  thaiRoof.rotation.y = Math.PI / 2; // Sharp Thai gable triangle facing Tri Phet Rd just like Street View!
  thaiRoof.position.set(0.82, 2.09, -0.62);
  g.add(thaiRoof);

  // Secondary West Wing classroom pavilion
  addBox(g, 1.15, 1.25, 0.82, -0.95, 0.78, -0.68, creamFacade);
  const westRoof = makeGableRoof(1.24, 0.94, 0.38, greenRoof);
  westRoof.position.set(-0.95, 1.4, -0.68);
  g.add(westRoof);

  // Crisp SUANKULARB roof plaque mounted cleanly on slim architectural posts (never floating!)
  const signTex = makeSignTexture('SUANKULARB', '#EC4899', '#FFFFFF', ['#38BDF8', '#FFFFFF', '#EC4899']);
  const signMat = new THREE.MeshBasicMaterial({ map: signTex });
  const signBoard = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.28, 0.07), [
    creamTrim, creamTrim, creamTrim, creamTrim, signMat, creamTrim,
  ]);
  signBoard.position.set(0, 1.86, 0.84);
  g.add(signBoard);
  addBox(g, 0.04, 0.28, 0.04, -0.32, 1.62, 0.84, creamTrim);
  addBox(g, 0.04, 0.28, 0.04, 0.32, 1.62, 0.84, creamTrim);

  // Lush street trees lining Tri Phet Rd right in front (like Street View!)
  addAppleTree(g, 1.56, 0.16, 1.05, 0.56);
  addAppleTree(g, -1.56, 0.16, 1.05, 0.52);
  addAppleTree(g, 0.1, 0.18, -0.35, 0.48);
  return g;
}

// 3. Siam Paragon (Detailed multi-wing luxury atrium + fountain plaza!)
function buildSiamParagon() {
  const g = new THREE.Group();
  const cream = mat('#F7F1E5');
  const slate = mat('#2C3A4E', { roughness: 0.42 });
  const facade = mat('#FFFFFF', { facade: 'curtain_blue', roughness: 0.22, metalness: 0.25 });
  const gold = mat('#E0AA28', { roughness: 0.32, metalness: 0.45 });
  const water = mat('#4FC3F7', { roughness: 0.12, emissive: '#0284C7', maxGlow: 0.45 });

  addBox(g, 2.85, 0.16, 2.35, 0, 0.08, 0, mat('#ECE6DA'));
  // Stepped main mall wings
  addBox(g, 2.5, 1.62, 1.68, 0, 0.96, -0.18, cream);
  addBox(g, 2.02, 1.44, 1.76, 0, 0.94, -0.16, facade);
  // Grand cantilevered entrance canopy + fluted pillars
  for (const px of [-0.7, 0.7]) {
    addCyl(g, 0.08, 0.09, 1.4, 8, px, 0.85, 0.78, cream);
  }
  addBox(g, 1.85, 0.14, 0.55, 0, 1.54, 0.76, slate);
  addBox(g, 2.62, 0.2, 1.84, 0, 1.86, -0.18, slate);
  // Golden Paragon roof crest + rooftop skylight drum
  addBox(g, 1.38, 0.32, 0.22, 0, 2.1, 0.62, gold);
  addCyl(g, 0.58, 0.65, 0.26, 16, 0, 2.08, -0.22, facade);
  // Multi-tier Parc Paragon fountain
  addCyl(g, 0.48, 0.52, 0.12, 16, 0, 0.2, 0.92, mat('#FFFFFF'));
  addCyl(g, 0.38, 0.4, 0.14, 16, 0, 0.23, 0.92, water);
  addCyl(g, 0.08, 0.14, 0.32, 10, 0, 0.4, 0.92, mat('#E0F2FE'));
  addAppleTree(g, -1.14, 0.15, 0.88, 0.55);
  addAppleTree(g, 1.14, 0.15, 0.88, 0.55);
  return g;
}

// 4. CentralWorld + Iconic Arched Centara Grand Tower!
function buildCentralWorld() {
  const g = new THREE.Group();
  const white = mat('#FFFFFF', { roughness: 0.45 });
  const facade = mat('#FFFFFF', { facade: 'curtain_blue', roughness: 0.2, metalness: 0.22 });
  const screen = mat('#F97316', { roughness: 0.2, emissive: '#FB923C', maxGlow: 1.0 });

  addBox(g, 2.95, 0.16, 2.25, 0, 0.08, 0, mat('#ECE6DA'));
  // Sweeping CentralWorld horizontal mall
  addBox(g, 2.65, 1.48, 1.45, 0, 0.88, -0.2, white);
  addBox(g, 2.38, 1.18, 1.5, 0, 0.88, -0.2, facade);
  // Signature panoramic glowing CTW plaza screen
  addBox(g, 1.32, 0.74, 0.12, 0.15, 0.98, 0.56, screen);
  // Iconic Centara Grand Tower with curved white halo arch behind!
  addBox(g, 1.05, 3.0, 0.92, -0.68, 2.35, -0.35, facade);
  addBox(g, 1.14, 0.16, 1.0, -0.68, 3.88, -0.35, white);
  const arch = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.07, 8, 18, Math.PI), mat('#F8FAFC', { emissive: '#38BDF8', maxGlow: 0.85 }));
  arch.position.set(-0.68, 3.95, -0.35);
  g.add(arch);
  addAppleTree(g, 1.15, 0.15, 0.78, 0.52);
  addAppleTree(g, -1.15, 0.15, 0.78, 0.52);
  return g;
}

// 5. Terminal 21 (Aviation Hall + Grande Centre Point Tower)
function buildTerminal21() {
  const g = new THREE.Group();
  const white = mat('#FFFFFF');
  const navy = mat('#1E3A8A');
  const facade = mat('#FFFFFF', { facade: 'curtain_blue', roughness: 0.2, metalness: 0.25 });

  addBox(g, 2.45, 0.16, 2.2, 0, 0.08, 0, mat('#E8E4DA'));
  addBox(g, 2.05, 1.58, 1.7, 0, 0.94, 0, white);
  addBox(g, 1.82, 1.28, 1.76, 0, 0.92, 0, facade);
  // Sweeping aviation wing overhang
  addBox(g, 2.42, 0.16, 1.94, 0, 1.76, 0, navy);
  addBox(g, 2.28, 0.08, 1.82, 0, 1.86, 0, white);
  // Upper Grande Centre Point sculpted tower
  addBox(g, 1.18, 2.65, 1.08, 0, 3.15, -0.15, facade);
  for (const cx of [-0.58, 0.58]) {
    addBox(g, 0.12, 2.7, 1.14, cx, 3.15, -0.15, white);
  }
  addBox(g, 1.38, 0.26, 0.24, 0, 4.58, 0.35, mat('#0284C7', { emissive: '#38BDF8', maxGlow: 0.95 }));
  return g;
}

// 6. King Power Mahanakhon (Iconic Pixelated Spiral Skyscraper!)
function buildMahanakhon() {
  const g = new THREE.Group();
  const facade = mat('#FFFFFF', { facade: 'curtain_blue', roughness: 0.18, metalness: 0.38 });
  const steel = mat('#2F475E', { roughness: 0.32, metalness: 0.42 });
  const pixelGlow = mat('#F59E0B', { roughness: 0.22, emissive: '#FBBF24', maxGlow: 1.0 });

  addBox(g, 2.25, 0.18, 2.25, 0, 0.09, 0, mat('#E5E2D9'));
  addBox(g, 1.38, 5.65, 1.38, 0, 2.98, 0, facade);
  // Crisp structural corner mullions
  for (const cx of [-0.68, 0.68]) {
    for (const cz of [-0.68, 0.68]) {
      addBox(g, 0.12, 5.65, 0.12, cx, 2.98, cz, steel);
    }
  }
  // Signature pixelated spiral glass balconies wrapping up the skyscraper!
  for (let i = 0; i < 15; i++) {
    const angle = i * 0.54;
    const y = 0.72 + i * 0.34;
    const r = 0.67;
    addBox(g, 0.36, 0.24, 0.36, Math.cos(angle) * r, y, Math.sin(angle) * r, pixelGlow);
  }
  // Glowing glass skywalk observation tray
  addBox(g, 1.56, 0.18, 1.56, 0, 5.9, 0, pixelGlow);
  addBox(g, 0.75, 0.08, 0.48, 0, 5.92, 0.9, mat('#7DD3FC', { transparent: true, opacity: 0.72 }));
  return g;
}

// 7. EmQuartier (Offset Curved Terraced Helix + Hanging Tropical Gardens)
function buildEmQuartier() {
  const g = new THREE.Group();
  const white = mat('#FFFFFF', { roughness: 0.4 });
  const facade = mat('#FFFFFF', { facade: 'curtain_blue', roughness: 0.2 });
  const green = mat('#52B756', { roughness: 0.78 });

  addBox(g, 2.55, 0.16, 2.3, 0, 0.08, 0, mat('#ECE6DA'));
  for (let i = 0; i < 4; i++) {
    const offX = i % 2 === 0 ? -0.2 : 0.2;
    addCyl(g, 1.08 - i * 0.06, 1.12 - i * 0.06, 0.48, 20, offX, 0.4 + i * 0.5, 0, white);
    addCyl(g, 1.0 - i * 0.06, 1.02 - i * 0.06, 0.34, 20, offX, 0.4 + i * 0.5, 0, facade);
    addBox(g, 0.56, 0.16, 0.38, offX + 0.62, 0.66 + i * 0.5, 0.42, green);
    addAppleTree(g, offX + 0.62, 0.72 + i * 0.5, 0.42, 0.34);
  }
  return g;
}

// 8. ICONSIAM (Pleated Golden Origami Riverfront + Magnolias Crown Tower)
function buildIconSiam() {
  const g = new THREE.Group();
  const gold = mat('#DCA924', { roughness: 0.28, metalness: 0.48 });
  const facade = mat('#FFFFFF', { facade: 'curtain_gold', roughness: 0.18, metalness: 0.35 });
  const ivory = mat('#FFFBF2');

  addBox(g, 2.95, 0.16, 2.35, 0, 0.08, 0, ivory);
  addBox(g, 2.55, 1.72, 1.68, 0, 0.98, 0, ivory);
  addBox(g, 2.36, 1.48, 1.74, 0, 0.98, 0, facade);
  for (let i = -3; i <= 3; i++) {
    const fin = addBox(g, 0.13, 1.88, 0.32, i * 0.34, 1.06, 0.86, gold);
    fin.rotation.y = i % 2 === 0 ? 0.36 : -0.36;
  }
  addBox(g, 2.66, 0.2, 1.8, 0, 1.94, 0, gold);
  // Magnolias Waterfront curved luxury tower behind
  addBox(g, 0.98, 3.85, 0.98, -0.58, 3.62, -0.28, facade);
  addCyl(g, 0.28, 0.64, 0.72, 8, -0.58, 5.9, -0.28, gold);
  return g;
}

// 9. Dusit Central Park (Terraced Gold Towers + Thai Spire Crown + Roof Park)
function buildDusitPark() {
  const g = new THREE.Group();
  const gold = mat('#D8B03C', { roughness: 0.34, metalness: 0.38 });
  const cream = mat('#FAF2E3');
  const facade = mat('#FFFFFF', { facade: 'curtain_gold', roughness: 0.22 });
  const park = mat('#66BB6A', { roughness: 0.8 });

  addBox(g, 2.6, 0.16, 2.3, 0, 0.08, 0, cream);
  addBox(g, 2.25, 0.9, 1.82, 0, 0.58, 0, cream);
  addBox(g, 2.12, 0.14, 1.7, 0, 1.08, 0, park);
  addAppleTree(g, 0.65, 1.15, 0.55, 0.42);
  addAppleTree(g, -0.75, 1.15, 0.55, 0.42);
  // Main hotel tower with signature golden Thai spire crown
  addBox(g, 0.98, 3.25, 0.92, -0.44, 2.68, -0.1, facade);
  addBox(g, 1.06, 0.16, 1.0, -0.44, 4.34, -0.1, cream);
  addCyl(g, 0.03, 0.28, 0.98, 8, -0.44, 4.9, -0.1, gold);
  // Second sculptural residential tower
  addBox(g, 0.9, 2.55, 0.9, 0.58, 2.32, 0.12, facade);
  addBox(g, 0.98, 0.14, 0.98, 0.58, 3.64, 0.12, gold);
  return g;
}

// 10. QSNCC / BITEC / IMPACT Convention Hall
function buildQsncc() {
  const g = new THREE.Group();
  const bronze = mat('#A67B4B', { roughness: 0.4, metalness: 0.32 });
  const cream = mat('#F7F1E8');
  const facade = mat('#FFFFFF', { facade: 'retail', roughness: 0.22 });

  addBox(g, 2.85, 0.16, 2.2, 0, 0.08, 0, mat('#ECE6DA'));
  addBox(g, 2.48, 1.1, 1.72, 0, 0.68, 0, cream);
  addBox(g, 2.24, 0.84, 1.78, 0, 0.66, 0, facade);
  addBox(g, 2.78, 0.18, 2.0, 0, 1.28, 0, bronze);
  addBox(g, 2.24, 0.16, 1.52, 0, 1.5, 0, bronze);
  addAppleTree(g, -1.2, 0.15, 0.82, 0.52);
  addAppleTree(g, 1.2, 0.15, 0.82, 0.52);
  return g;
}

// 11. One Bangkok (Sculpted Multi-Tower Complex)
function buildOneBangkok() {
  const g = new THREE.Group();
  const ivory = mat('#F8F5EE');
  const facade = mat('#FFFFFF', { facade: 'curtain_blue', roughness: 0.2, metalness: 0.25 });
  const green = mat('#66BB6A', { roughness: 0.8 });

  addBox(g, 2.7, 0.16, 2.4, 0, 0.08, 0, ivory);
  addBox(g, 2.3, 0.14, 2.0, 0, 0.2, 0, green);
  const towers = [
    [-0.66, 4.1, -0.32, 0.86],
    [0.58, 3.3, -0.15, 0.8],
    [0.02, 2.45, 0.56, 0.74],
  ];
  for (const [x, h, z, w] of towers) {
    addBox(g, w, h, w, x, h / 2 + 0.15, z, facade);
    addBox(g, w * 1.06, 0.14, w * 1.06, x, h + 0.2, z, ivory);
  }
  return g;
}

// 12. Park Origin Thonglor (Trio of sleek towers + Skybridge)
function buildParkOrigin() {
  const g = new THREE.Group();
  const charcoal = mat('#334155', { roughness: 0.42 });
  const champagne = mat('#E5C9A1', { roughness: 0.38 });
  const facade = mat('#FFFFFF', { facade: 'coco_glass', roughness: 0.22 });

  addBox(g, 2.5, 0.16, 2.2, 0, 0.08, 0, mat('#ECE6DA'));
  addBox(g, 0.72, 3.6, 0.72, -0.68, 1.92, 0, facade);
  addBox(g, 0.78, 0.14, 0.78, -0.68, 3.76, 0, charcoal);
  addBox(g, 0.72, 4.3, 0.72, 0.04, 2.28, -0.2, facade);
  addBox(g, 0.78, 0.14, 0.78, 0.04, 4.46, -0.2, champagne);
  addBox(g, 0.68, 3.2, 0.68, 0.74, 1.72, 0.15, facade);
  // Signature high glass skybridge + pool
  addBox(g, 1.72, 0.26, 0.38, 0.04, 2.86, 0.0, mat('#7DD3FC', { roughness: 0.18, emissive: '#FEF08A', maxGlow: 0.75 }));
  return g;
}

// 13. Ashton Asoke (Faceted Dark Bronze Supertall)
function buildAshtonAsoke() {
  const g = new THREE.Group();
  const bronze = mat('#3A2F2B', { roughness: 0.38, metalness: 0.3 });
  const facade = mat('#FFFFFF', { facade: 'coco_glass', roughness: 0.2 });

  addBox(g, 2.1, 0.16, 2.0, 0, 0.08, 0, mat('#E5DFD2'));
  addBox(g, 1.34, 4.65, 1.16, 0, 2.46, 0, facade);
  for (const cx of [-0.66, 0.66]) {
    addBox(g, 0.1, 4.7, 1.22, cx, 2.46, 0, bronze);
  }
  addBox(g, 1.42, 0.18, 1.24, 0, 4.86, 0, mat('#D8B57C'));
  return g;
}

// 14. Mandarin Oriental (Colonial Cream & Terracotta Riverside Palace)
function buildMandarinOriental() {
  const g = new THREE.Group();
  const cream = mat('#FFF8EA');
  const roof = mat('#C45A40', { roughness: 0.68 });
  const facade = mat('#FFFFFF', { facade: 'hotel_warm', roughness: 0.32 });

  addBox(g, 2.6, 0.16, 2.1, 0, 0.08, 0, mat('#D2ECC9'));
  addBox(g, 2.15, 1.12, 1.28, 0, 0.7, 0.26, facade);
  const hip = new THREE.Mesh(new THREE.ConeGeometry(1.62, 0.68, 4), roof);
  hip.position.set(0, 1.58, 0.26);
  hip.rotation.y = Math.PI / 4;
  hip.castShadow = true;
  g.add(hip);
  addBox(g, 1.48, 2.5, 0.9, -0.25, 1.4, -0.5, facade);
  addBox(g, 1.56, 0.14, 0.98, -0.25, 2.68, -0.5, cream);
  addAppleTree(g, 0.98, 0.16, 0.75, 0.52);
  return g;
}

// 15. Hua Lamphong Heritage Barrel-Vault Dome (FIXED watertight ExtrudeGeometry!)
function buildHuaLamphong() {
  const g = new THREE.Group();
  const cream = mat('#F7ECD6');
  const terracotta = mat('#B45309');
  const glass = mat('#93C5FD', { roughness: 0.18, emissive: '#FDE68A', maxGlow: 0.95 });

  addBox(g, 2.6, 0.16, 2.15, 0, 0.08, 0, mat('#E8E4DA'));
  addBox(g, 2.22, 1.0, 1.65, 0, 0.66, 0, cream);
  // Solid watertight arched vault running along Z, facing front +Z!
  const vault = makeBarrelRoof(1.66, 2.1, 0.95, terracotta);
  vault.rotation.y = Math.PI / 2;
  vault.position.set(0, 1.16, 0);
  g.add(vault);
  const arch = new THREE.Mesh(new THREE.CircleGeometry(0.76, 20, 0, Math.PI), glass);
  arch.position.set(0, 1.16, 0.86);
  g.add(arch);
  return g;
}

// 16. Krung Thep Aphiwat Central Terminal
function buildAphiwat() {
  const g = new THREE.Group();
  const silver = mat('#E8ECF0', { roughness: 0.36, metalness: 0.25 });
  const red = mat('#991B1B');
  const facade = mat('#FFFFFF', { facade: 'curtain_blue', roughness: 0.22 });

  addBox(g, 3.0, 0.18, 2.2, 0, 0.09, 0, mat('#DDD8CE'));
  addBox(g, 2.7, 1.2, 1.72, 0, 0.75, 0, silver);
  addBox(g, 2.45, 0.9, 1.78, 0, 0.72, 0, facade);
  addBox(g, 2.86, 0.22, 1.92, 0, 1.44, 0, red);
  addCyl(g, 0.36, 0.36, 0.18, 18, 0, 1.54, 0.9, mat('#FDE047', { emissive: '#FACC15', maxGlow: 0.95 }));
  return g;
}

// 17. Victory Monument Obelisk
function buildVictoryMon() {
  const g = new THREE.Group();
  const stone = mat('#F3ECE0');
  const bronze = mat('#78350F');
  const grass = mat('#81C784');

  addCyl(g, 1.2, 1.24, 0.18, 24, 0, 0.09, 0, grass);
  addCyl(g, 0.56, 0.74, 0.44, 10, 0, 0.39, 0, stone);
  addCyl(g, 0.16, 0.38, 2.65, 5, 0, 1.82, 0, stone);
  addCyl(g, 0.02, 0.16, 0.48, 5, 0, 3.32, 0, bronze);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.09, 10, 28), mat('#FFFFFF'));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.74;
  g.add(ring);
  return g;
}

// 18. Chatuchak Weekend Market
function buildChatuchak() {
  const g = new THREE.Group();
  addBox(g, 2.7, 0.14, 2.38, 0, 0.07, 0, mat('#EAE2D5'));
  const roofColors = ['#EA580C', '#0284C7', '#16A34A', '#EAB308', '#E11D48', '#7C3AED'];
  const spots = [[-0.8, -0.64], [0.8, -0.64], [-0.8, 0.64], [0.8, 0.64], [-0.8, 0], [0.8, 0]];
  spots.forEach(([sx, sz], i) => {
    addBox(g, 0.74, 0.42, 0.52, sx, 0.32, sz, mat('#FFFBEB'));
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.54, 0.36, 4), mat(roofColors[i % roofColors.length]));
    roof.position.set(sx, 0.69, sz);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);
  });
  addBox(g, 0.48, 1.75, 0.48, 0, 0.96, 0, mat('#FEF3C7'));
  addBox(g, 0.6, 0.24, 0.6, 0, 1.82, 0, mat('#D97706'));
  addBox(g, 0.3, 0.3, 0.54, 0, 1.5, 0, mat('#FFFFFF', { emissive: '#FEF08A', maxGlow: 0.95 }));
  return g;
}

// 19. Jodd Fairs Night Market White Peaked Tents
function buildJoddFairs() {
  const g = new THREE.Group();
  addBox(g, 2.6, 0.14, 2.28, 0, 0.07, 0, mat('#E2DDD4'));
  const tentMat = mat('#FFFFFF', { emissive: '#FDE68A', maxGlow: 0.65 });
  for (let gx = -1; gx <= 1; gx++) {
    for (let gz = -1; gz <= 1; gz++) {
      const x = gx * 0.74;
      const z = gz * 0.66;
      addBox(g, 0.52, 0.32, 0.48, x, 0.28, z, mat('#FEF3C7', { emissive: '#FDBA74', maxGlow: 0.85 }));
      const peak = new THREE.Mesh(new THREE.ConeGeometry(0.43, 0.44, 4), tentMat);
      peak.position.set(x, 0.64, z);
      peak.rotation.y = Math.PI / 4;
      peak.castShadow = true;
      g.add(peak);
    }
  }
  return g;
}

// 20. Chinatown Yaowarat Shophouses & Neon Paddles
function buildChinatown() {
  const g = new THREE.Group();
  const red = mat('#DC2626');
  const gold = mat('#FACC15', { emissive: '#FDE047', maxGlow: 0.95 });
  const facade = mat('#FFFFFF', { facade: 'retail', roughness: 0.4 });
  const neonPink = mat('#EC4899', { emissive: '#F472B6', maxGlow: 1.0 });

  addBox(g, 2.38, 0.14, 1.9, 0, 0.07, 0, mat('#E7DDD0'));
  addBox(g, 1.92, 1.32, 1.28, 0, 0.76, 0, facade);
  addBox(g, 2.2, 0.16, 1.54, 0, 1.48, 0, red);
  addBox(g, 1.6, 0.28, 1.08, 0, 1.7, 0, red);
  addBox(g, 1.74, 0.1, 1.18, 0, 1.88, 0, gold);
  addBox(g, 0.12, 0.82, 0.34, -0.82, 0.9, 0.8, neonPink);
  addBox(g, 0.12, 0.72, 0.34, 0.76, 0.84, 0.8, gold);
  return g;
}

// 21. Thai Golden Temple / Wat Arun / Grand Palace
function buildTempleGold() {
  const g = new THREE.Group();
  const gold = mat('#F59E0B', { roughness: 0.22, metalness: 0.58, emissive: '#FDE047', maxGlow: 0.65 });
  const white = mat('#FFFDF8');
  const roofRed = mat('#B91C1C');

  addBox(g, 2.5, 0.18, 2.28, 0, 0.09, 0, white);
  addCyl(g, 0.58, 0.82, 0.68, 12, 0, 0.52, 0, white);
  addCyl(g, 0.38, 0.58, 0.88, 12, 0, 1.26, 0, gold);
  addCyl(g, 0.04, 0.34, 1.55, 12, 0, 2.45, 0, gold);
  addBox(g, 0.88, 0.56, 0.7, 0.8, 0.46, 0.56, white);
  const gable = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.58, 4), roofRed);
  gable.position.set(0.8, 1.02, 0.56);
  gable.rotation.y = Math.PI / 4;
  g.add(gable);
  return g;
}

// 22. Suvarnabhumi / Don Mueang Airport
function buildAirport() {
  const g = new THREE.Group();
  const facade = mat('#FFFFFF', { facade: 'curtain_blue', roughness: 0.18, metalness: 0.35 });
  const silver = mat('#E8EDF2', { roughness: 0.35, metalness: 0.35 });

  addBox(g, 3.1, 0.16, 2.28, 0, 0.08, 0, mat('#DCD8CE'));
  addBox(g, 2.65, 0.86, 1.24, 0, 0.57, 0.2, facade);
  addBox(g, 2.86, 0.14, 1.48, 0, 1.06, 0.2, silver);
  addCyl(g, 0.18, 0.28, 2.75, 14, -0.96, 1.52, -0.56, silver);
  addCyl(g, 0.44, 0.28, 0.44, 14, -0.96, 3.04, -0.56, facade);
  addCyl(g, 0.48, 0.48, 0.12, 14, -0.96, 3.3, -0.56, mat('#EF4444', { emissive: '#F87171', maxGlow: 0.95 }));
  return g;
}

// 23. Asiatique Riverfront + Spinning Ferris Wheel
function buildAsiatique() {
  const g = new THREE.Group();
  const brick = mat('#B45309');
  const cream = mat('#FEF3C7');
  addBox(g, 2.68, 0.16, 2.08, 0, 0.08, 0, mat('#ECE6DA'));
  addBox(g, 1.55, 0.74, 1.18, -0.45, 0.52, 0.2, brick);
  addBox(g, 1.64, 0.16, 1.26, -0.45, 0.94, 0.2, cream);
  const wheelHolder = new THREE.Group();
  wheelHolder.position.set(0.7, 1.72, -0.1);
  const wheel = new THREE.Mesh(
    new THREE.TorusGeometry(0.98, 0.075, 10, 24),
    mat('#FFFFFF', { emissive: '#38BDF8', maxGlow: 0.95 })
  );
  wheelHolder.add(wheel);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const pod = addBox(wheelHolder, 0.17, 0.17, 0.17, Math.cos(a) * 0.98, Math.sin(a) * 0.98, 0, mat('#F59E0B', { emissive: '#FDE047', maxGlow: 0.9 }));
    pod.castShadow = false;
  }
  wheelHolder.userData.spinWheel = true;
  g.add(wheelHolder);
  addBox(g, 0.1, 1.7, 0.12, 0.7, 0.88, 0.16, mat('#475569'));
  return g;
}

// ===== UPGRADED ARCHITECTURAL TEMPLATES WITH REAL WINDOW FACADES & ROOFTOP DETAILS =====

function buildGenericArch(archType) {
  const g = new THREE.Group();
  const condoFacade = mat('#FFFFFF', { facade: 'condo_ivory', roughness: 0.35 });
  const hotelFacade = mat('#FFFFFF', { facade: 'hotel_warm', roughness: 0.35 });
  const glassFacade = mat('#FFFFFF', { facade: 'curtain_blue', roughness: 0.22, metalness: 0.25 });
  const retailFacade = mat('#FFFFFF', { facade: 'retail', roughness: 0.35 });

  switch (archType) {
    case 'condo_sleek': {
      const accent = mat('#334155');
      addBox(g, 2.0, 0.14, 1.9, 0, 0.07, 0, mat('#E5E0D5'));
      addBox(g, 1.65, 0.65, 1.45, 0, 0.44, 0, mat('#F1ECE2')); // Podium
      addBox(g, 1.24, 3.15, 1.16, 0, 2.25, -0.05, condoFacade);
      addBox(g, 1.32, 0.16, 1.24, 0, 3.88, -0.05, accent);
      addBox(g, 0.72, 0.1, 0.38, 0, 0.82, 0.56, mat('#2DD4BF', { emissive: '#14B8A6', maxGlow: 0.4 })); // Podium pool
      addAppleTree(g, -0.78, 0.14, 0.68, 0.46);
      break;
    }
    case 'condo_twin': {
      const ivory = mat('#F7F3EA');
      const teal = mat('#0F766E');
      addBox(g, 2.28, 0.14, 1.88, 0, 0.07, 0, mat('#E7E0D3'));
      addBox(g, 1.94, 0.6, 1.42, 0, 0.42, 0, ivory);
      addBox(g, 0.8, 2.95, 0.84, -0.5, 2.05, 0, condoFacade);
      addBox(g, 0.8, 2.52, 0.84, 0.5, 1.84, 0, condoFacade);
      addBox(g, 0.88, 0.12, 0.92, -0.5, 3.56, 0, teal);
      addBox(g, 0.88, 0.12, 0.92, 0.5, 3.14, 0, teal);
      break;
    }
    case 'hotel_grand': {
      const gold = mat('#D97706', { roughness: 0.35, metalness: 0.35 });
      addBox(g, 2.38, 0.16, 2.08, 0, 0.08, 0, mat('#ECE6DA'));
      addBox(g, 2.02, 1.96, 1.44, 0, 1.12, 0, hotelFacade);
      addBox(g, 2.14, 0.2, 1.56, 0, 2.18, 0, gold);
      addBox(g, 0.96, 0.12, 0.58, 0, 0.52, 0.86, gold); // Porte-cochere
      addAppleTree(g, -0.94, 0.15, 0.8, 0.5);
      addAppleTree(g, 0.94, 0.15, 0.8, 0.5);
      break;
    }
    case 'hotel_tower': {
      const copper = mat('#B45309', { roughness: 0.38, metalness: 0.3 });
      addBox(g, 2.08, 0.15, 1.98, 0, 0.08, 0, mat('#E7E2D7'));
      addBox(g, 1.44, 3.0, 1.28, 0, 1.65, 0, hotelFacade);
      addBox(g, 1.54, 0.22, 1.38, 0, 3.24, 0, copper);
      addBox(g, 0.65, 0.22, 0.6, 0, 3.45, 0, mat('#CBD5E1'));
      break;
    }
    case 'embassy': {
      const white = mat('#FFFFFF');
      addBox(g, 2.48, 0.15, 2.08, 0, 0.08, 0, mat('#E6E2D9'));
      addBox(g, 2.18, 1.35, 1.5, 0, 0.82, 0, glassFacade);
      addBox(g, 2.26, 0.14, 1.58, 0, 1.54, 0, white);
      addBox(g, 1.06, 2.6, 0.98, 0.38, 2.25, -0.1, glassFacade);
      addBox(g, 1.14, 0.14, 1.06, 0.38, 3.6, -0.1, white);
      break;
    }
    case 'mall_glass': {
      const sky = mat('#0284C7');
      addBox(g, 2.42, 0.15, 2.0, 0, 0.08, 0, mat('#E6E2D9'));
      addBox(g, 2.1, 1.48, 1.52, 0, 0.88, 0, glassFacade);
      addBox(g, 2.22, 0.18, 1.62, 0, 1.68, 0, sky);
      addBox(g, 1.05, 0.24, 0.88, 0, 1.88, 0, mat('#FFFFFF'));
      break;
    }
    case 'mall_modern': {
      const coral = mat('#F97316');
      addBox(g, 2.38, 0.15, 1.98, 0, 0.08, 0, mat('#ECE6DA'));
      addBox(g, 2.02, 1.34, 1.48, 0, 0.8, 0, retailFacade);
      addBox(g, 2.16, 0.22, 1.6, 0, 1.56, 0, coral);
      break;
    }
    case 'restaurant': {
      const awning = mat('#DC2626');
      addBox(g, 1.88, 0.12, 1.66, 0, 0.06, 0, mat('#ECE6DA'));
      addBox(g, 1.5, 0.96, 1.18, 0, 0.58, 0, retailFacade);
      addBox(g, 1.68, 0.2, 1.38, 0, 1.14, 0.06, awning);
      addAppleTree(g, -0.8, 0.12, 0.6, 0.44);
      break;
    }
    case 'shophouse': {
      const colors = ['#FDBA74', '#FEF08A', '#86EFAC'];
      addBox(g, 2.02, 0.12, 1.62, 0, 0.06, 0, mat('#E5E0D5'));
      for (let i = -1; i <= 1; i++) {
        addBox(g, 0.58, 1.24, 1.12, i * 0.6, 0.72, 0, mat(colors[i + 1]));
        addBox(g, 0.44, 0.42, 1.16, i * 0.6, 0.38, 0, mat('#FEF3C7', { emissive: '#FDE047', maxGlow: 0.9 }));
        addBox(g, 0.6, 0.12, 0.34, i * 0.6, 0.68, 0.66, mat('#EA580C'));
      }
      break;
    }
    case 'market_tent': {
      addBox(g, 2.28, 0.12, 2.0, 0, 0.06, 0, mat('#ECE5D8'));
      const palette = ['#EA580C', '#0EA5E9', '#22C55E', '#EAB308'];
      const coords = [[-0.56, -0.46], [0.56, -0.46], [-0.56, 0.46], [0.56, 0.46]];
      coords.forEach(([x, z], idx) => {
        addBox(g, 0.74, 0.4, 0.64, x, 0.29, z, mat('#FFFBEB', { emissive: '#FDE68A', maxGlow: 0.65 }));
        const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.56, 0.4, 4), mat(palette[idx]));
        canopy.position.set(x, 0.67, z);
        canopy.rotation.y = Math.PI / 4;
        canopy.castShadow = true;
        g.add(canopy);
      });
      break;
    }
    default: {
      addBox(g, 1.6, 1.45, 1.4, 0, 0.72, 0, condoFacade);
    }
  }
  return g;
}

export function createBuildingMesh(archType, level = 1) {
  let group;
  switch (archType) {
    case 'coco_parc':         group = buildCocoParc(); break;
    case 'seven_eleven':      group = buildSevenEleven(); break;
    case 'suankularb_school': group = buildSuankularbSchool(); break;
    case 'siam_paragon':      group = buildSiamParagon(); break;
    case 'centralworld':      group = buildCentralWorld(); break;
    case 'terminal21':        group = buildTerminal21(); break;
    case 'mahanakhon':        group = buildMahanakhon(); break;
    case 'emquartier':        group = buildEmQuartier(); break;
    case 'iconsiam':          group = buildIconSiam(); break;
    case 'dusit_park':        group = buildDusitPark(); break;
    case 'qsncc':             group = buildQsncc(); break;
    case 'one_bangkok':       group = buildOneBangkok(); break;
    case 'park_origin':       group = buildParkOrigin(); break;
    case 'ashton_asoke':      group = buildAshtonAsoke(); break;
    case 'mandarin_ori':      group = buildMandarinOriental(); break;
    case 'hualamphong':       group = buildHuaLamphong(); break;
    case 'aphiwat':           group = buildAphiwat(); break;
    case 'victory_mon':       group = buildVictoryMon(); break;
    case 'chatuchak':         group = buildChatuchak(); break;
    case 'jodd_fairs':        group = buildJoddFairs(); break;
    case 'chinatown':         group = buildChinatown(); break;
    case 'temple_gold':       group = buildTempleGold(); break;
    case 'airport':           group = buildAirport(); break;
    case 'asiatique':         group = buildAsiatique(); break;
    default:                  group = buildGenericArch(archType); break;
  }

  // Upgrading a building makes it VISIBLY BIGGER & TALLER every level (Lv. 1 -> Lv. 10)!
  const lvl = Math.min(10, Math.max(1, level));
  const horizontalTypes = new Set([
    'seven_eleven', 'suankularb_school', 'market_tent', 'chatuchak', 'jodd_fairs',
    'hualamphong', 'qsncc', 'asiatique', 'restaurant', 'shophouse',
  ]);
  if (horizontalTypes.has(archType)) {
    const uni = 0.85 + (lvl - 1) * 0.072; // Grows up to 1.50x in every dimension at Lv. 10!
    group.scale.set(uni, uni, uni);
  } else {
    const xz = 0.84 + (lvl - 1) * 0.056;  // Wider footprint up to 1.34x
    const y = 0.80 + (lvl - 1) * 0.118;   // Dramatically taller skyline tower up to 1.86x at Lv. 10!
    group.scale.set(xz, y, xz);
  }
  return group;
}

// ===== UPGRADED ARCHITECTURAL 3D BANGKOK STATIONS (FIXED WATERTIGHT ROOFS!) =====

export function createStationMesh(station, line) {
  const g = new THREE.Group();
  const lineMat = mat(line.color, { roughness: 0.36 });
  const accentMat = mat(line.accent, { roughness: 0.45 });
  const concrete = mat('#ECE8DF', { roughness: 0.65 });
  const white = mat('#FFFFFF', { roughness: 0.38 });
  const glass = mat('#BAE6FD', { roughness: 0.16, metalness: 0.25, emissive: '#FEF08A', maxGlow: 0.85 });

  if (line.kind === 'elevated' || line.kind === 'monorail') {
    for (const px of [-0.85, 0.85]) {
      addCyl(g, 0.22, 0.28, 1.38, 10, px, 0.69, 0, concrete);
    }
    // Concourse & platform deck (length along local X so rotation.y aligns lengthwise with tracks!)
    addBox(g, 2.55, 0.22, 1.48, 0, 1.41, 0, concrete);
    addBox(g, 2.62, 0.16, 1.54, 0, 1.55, 0, lineMat);
    // Illuminated platform screen walls + structural ribs
    addBox(g, 2.24, 0.54, 1.24, 0, 1.9, 0, glass);
    for (const rx of [-0.96, 0, 0.96]) {
      addBox(g, 0.1, 0.58, 1.44, rx, 1.92, 0, white);
    }
    // FIXED: Solid watertight curved barrel-vault roof via ExtrudeGeometry!
    const roofVault = makeBarrelRoof(2.74, 1.66, 0.34, white);
    roofVault.position.set(0, 2.21, 0);
    g.add(roofVault);
    addBox(g, 2.56, 0.08, 0.24, 0, 2.57, 0, lineMat);
    // Covered escalator stair entry on sidewalk
    addBox(g, 0.54, 0.72, 0.62, 0, 0.36, 1.0, accentMat);
    addBox(g, 0.6, 0.1, 0.68, 0, 0.76, 1.0, white);
  } else if (line.kind === 'subway') {
    addBox(g, 2.25, 0.16, 1.8, 0, 0.08, 0, concrete);
    addBox(g, 1.85, 0.62, 1.32, 0, 0.46, 0, white);
    addBox(g, 1.66, 0.46, 1.38, 0, 0.48, 0, glass);
    // FIXED: Solid watertight arched MRT glass skylight canopy!
    const dome = makeBarrelRoof(2.0, 1.46, 0.3, lineMat);
    dome.position.set(0, 0.78, 0);
    g.add(dome);
    // Iconic tall Bangkok MRT blue/gold entrance totem sign
    addBox(g, 0.22, 1.85, 0.22, -1.1, 0.95, 0.72, accentMat);
    addBox(g, 0.44, 0.36, 0.28, -1.1, 1.72, 0.72, lineMat);
    addBox(g, 0.46, 0.08, 0.3, -1.1, 1.94, 0.72, mat('#FACC15', { emissive: '#FDE047', maxGlow: 0.9 }));
  } else if (line.kind === 'river') {
    addBox(g, 2.35, 0.22, 1.52, 0, 0.22, 0, mat('#B07D48'));
    for (const px of [-0.92, 0.92]) {
      for (const pz of [-0.56, 0.56]) {
        addCyl(g, 0.055, 0.055, 0.88, 6, px, 0.7, pz, white);
      }
    }
    addBox(g, 2.28, 0.16, 1.48, 0, 1.18, 0, lineMat);
    const hip = makeGableRoof(2.3, 1.52, 0.42, mat('#EA580C'));
    hip.position.set(0, 1.26, 0);
    g.add(hip);
  } else if (line.kind === 'street') {
    addBox(g, 2.25, 0.16, 1.2, 0, 0.08, 0, concrete);
    addBox(g, 1.92, 0.62, 0.88, 0, 0.44, 0, glass);
    addBox(g, 2.36, 0.18, 1.3, 0, 0.86, 0, lineMat);
    addBox(g, 0.18, 1.38, 0.18, 1.06, 0.7, 0.5, accentMat);
  } else {
    addBox(g, 2.68, 0.28, 1.54, 0, 0.22, 0, concrete);
    addBox(g, 2.38, 0.76, 1.24, 0, 0.74, 0, glass);
    addBox(g, 2.8, 0.2, 1.62, 0, 1.22, 0, lineMat);
    const srtRoof = makeBarrelRoof(2.74, 1.54, 0.26, white);
    srtRoof.position.set(0, 1.32, 0);
    g.add(srtRoof);
  }
  return g;
}

export function createConstructionCrane() {
  const g = new THREE.Group();
  const yellow = mat('#FACC15', { roughness: 0.4 });
  const darkYellow = mat('#CA8A04', { roughness: 0.48 });
  const orange = mat('#EA580C');
  const concrete = mat('#E5E0D5');

  addBox(g, 2.45, 0.18, 1.75, 0, 0.09, 0, concrete);
  for (const cx of [-1.02, 1.02]) {
    for (const cz of [-0.7, 0.7]) {
      addCyl(g, 0.03, 0.12, 0.28, 6, cx, 0.3, cz, orange);
    }
  }
  const scaffold = new THREE.Mesh(
    new THREE.BoxGeometry(1.78, 1.35, 1.18),
    new THREE.MeshStandardMaterial({ color: '#FDE047', transparent: true, opacity: 0.44 })
  );
  scaffold.position.set(0, 0.75, 0);
  scaffold.name = 'scaffold';
  g.add(scaffold);

  addBox(g, 0.26, 3.25, 0.26, -0.82, 1.7, -0.52, yellow);
  const jib = new THREE.Group();
  jib.position.set(-0.82, 3.3, -0.52);
  jib.name = 'craneJib';
  addBox(jib, 2.65, 0.2, 0.22, 0.86, 0, 0, yellow);
  addBox(jib, 0.54, 0.32, 0.34, -0.58, 0.02, 0, darkYellow);
  addBox(jib, 0.05, 1.18, 0.05, 1.56, -0.62, 0, mat('#334155'));
  addBox(jib, 0.62, 0.18, 0.22, 1.56, -1.26, 0, orange);
  g.add(jib);
  return g;
}

export function createLockedPadMesh(lineColor) {
  const g = new THREE.Group();
  const padMat = new THREE.MeshStandardMaterial({
    color: lineColor,
    transparent: true,
    opacity: 0.38,
    roughness: 0.55,
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.06, 0.16, 20), padMat);
  base.position.y = 0.09;
  g.add(base);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.98, 1.24, 28),
    new THREE.MeshBasicMaterial({ color: lineColor, side: THREE.DoubleSide, transparent: true, opacity: 0.78 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.19;
  ring.name = 'pulseRing';
  g.add(ring);
  return g;
}
