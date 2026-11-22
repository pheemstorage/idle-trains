// 3D Apple Maps Detailed City Experience (DCE) Bangkok Terrain & City Generator
// 100% aligned via unified WGS84 gpsToWorld(lat, lon) coordinates!
// Crisp white avenues & sois, aligned elevated golden expressways, organic parks with
// multi-lobe rounded Apple Maps trees, Chao Phraya + khlongs, Memorial / Rama VIII / Taksin / Rama IX
// bridges, and ~3,000+ zero-z-fighting sculpted matte-ivory 3D buildings with twinkling night windows!

import * as THREE from 'three';
import { LINES, STATIONS, CHAO_PHRAYA_POINTS, gpsToWorld, SUANKULARB_GPS } from '../data/network.js';

const MAP_CX = 8;
const MAP_CZ = -8;
const MAP_SIZE = 280; // x: [-132, 148], z: [-148, 132] — covers entire Greater Bangkok rail network!
const MIN_X = MAP_CX - MAP_SIZE / 2;
const MIN_Z = MAP_CZ - MAP_SIZE / 2;

function toCanvas(x, z, res) {
  return [
    ((x - MIN_X) / MAP_SIZE) * res,
    ((z - MIN_Z) / MAP_SIZE) * res,
  ];
}

function gpsPath(coords) {
  return coords.map(([lat, lon]) => {
    const p = gpsToWorld(lat, lon);
    return [p.x, p.z];
  });
}

// Real Bangkok Boulevard Arterials in WGS84 GPS!
const BANGKOK_ARTERIALS_GPS = [
  // Rama I -> Ploenchit -> Sukhumvit Rd -> Bang Na -> Samrong -> Kheha
  [[13.747, 100.520], [13.7456, 100.5341], [13.7441, 100.5431], [13.7431, 100.5490], [13.7406, 100.5553], [13.7370, 100.5603], [13.7305, 100.5698], [13.7242, 100.5785], [13.7195, 100.5852], [13.7057, 100.6010], [13.6682, 100.6048], [13.6461, 100.5961], [13.5750, 100.6078]],
  // Rama IV Rd (Hua Lamphong -> Sam Yan -> Si Lom -> Lumphini -> Khlong Toei COCO PARC -> Phra Khanong)
  [[13.7376, 100.5171], [13.7327, 100.5293], [13.7294, 100.5364], [13.7255, 100.5458], [13.7222, 100.5542], [13.7195, 100.5680], [13.7140, 100.5910]],
  // Phahonyothin Rd (Phaya Thai -> Victory Monument -> Ari -> Mo Chit -> Ha Yaek -> Kasetsart -> Khu Khot)
  [[13.7519, 100.5316], [13.7569, 100.5337], [13.7627, 100.5371], [13.7796, 100.5446], [13.8025, 100.5538], [13.8165, 100.5612], [13.8414, 100.5741], [13.8753, 100.5968], [13.9324, 100.6462]],
  // Ratchadaphisek / Asok Montri Rd (Lat Phrao -> Huai Khwang -> Rama 9 -> Asok -> QSNCC -> Khlong Toei -> Rama III)
  [[13.8062, 100.5734], [13.7783, 100.5736], [13.7577, 100.5653], [13.7370, 100.5603], [13.7235, 100.5602], [13.7040, 100.5500], [13.6884, 100.5174]],
  // Silom & Sathorn Boulevards -> Taksin Bridge -> Wongwian Yai -> Phetkasem -> Lak Song
  [[13.7294, 100.5364], [13.7258, 100.5250], [13.7222, 100.5160]],
  [[13.7255, 100.5458], [13.7237, 100.5294], [13.7188, 100.5141], [13.7209, 100.5026], [13.7212, 100.4953], [13.7141, 100.4766], [13.7206, 100.4577], [13.7109, 100.4095]],
  // Phetchaburi & New Phetchaburi Rd
  [[13.7540, 100.5140], [13.7520, 100.5316], [13.7510, 100.5460], [13.7491, 100.5632], [13.7429, 100.6001], [13.7376, 100.6448]],
  // Vibhavadi Rangsit Highway (Din Daeng -> Chatuchak -> Lak Si -> Don Mueang -> Rangsit)
  [[13.7640, 100.5450], [13.8040, 100.5540], [13.8415, 100.5612], [13.8868, 100.5798], [13.9132, 100.5985], [13.9905, 100.6018]],
  // Lat Phrao & Ramkhamhaeng & Airport Motorway
  [[13.8130, 100.5610], [13.8062, 100.5734], [13.7959, 100.5944], [13.7664, 100.6435]],
  [[13.7376, 100.6448], [13.7329, 100.6913], [13.7277, 100.7484], [13.6980, 100.7521]],
  // Srinagarindra Rd (Bang Kapi -> Hua Mak -> Seacon -> Si Iam -> Samrong)
  [[13.7664, 100.6435], [13.7376, 100.6448], [13.6941, 100.6475], [13.6660, 100.6441], [13.6461, 100.5961]],
  // Chaeng Watthana & Ram Inthra (Nonthaburi -> IMPACT -> Lak Si -> Wat Phra Sri -> Fashion Island -> Min Buri)
  [[13.8599, 100.5136], [13.8965, 100.5515], [13.8868, 100.5798], [13.8753, 100.5968], [13.8256, 100.6788], [13.8108, 100.7315]],
  // Rama III & Narathiwas
  [[13.7237, 100.5294], [13.7124, 100.5356], [13.6996, 100.5372], [13.6884, 100.5174], [13.6844, 100.5015]],
  // Old Town Rattanakosin: Sanam Luang -> Tri Phet Rd (SUANKULARB SCHOOL!) -> Memorial Bridge -> Yaowarat -> Charoen Krung
  [[13.7556, 100.4932], [13.7471, 100.5022], [13.7435, 100.4989], [13.7392, 100.4978]], // Tri Phet Rd past Suankularb!
  [[13.7443, 100.4947], [13.7438, 100.5085], [13.7376, 100.5171], [13.7188, 100.5141], [13.7042, 100.5032]],
  // Thonburi Charansanitwong -> Tao Poon -> Nonthaburi -> WestGate
  [[13.7296, 100.4743], [13.7518, 100.4694], [13.7767, 100.4864], [13.7988, 100.5112], [13.8063, 100.5308], [13.8485, 100.5150], [13.8794, 100.4119]],
  // Ratchadamri & Wireless Rd CBD Links
  [[13.7551, 100.5419], [13.7441, 100.5431], [13.7393, 100.5394], [13.7294, 100.5364]],
  [[13.7510, 100.5495], [13.7431, 100.5490], [13.7255, 100.5458]],
];

export const BANGKOK_ARTERIALS = BANGKOK_ARTERIALS_GPS.map(gpsPath);

// Iconic Golden Expressways in real Bangkok GPS
const EXPRESSWAYS_GPS = [
  // Chalerm Maha Nakhon (Bang Na -> Khlong Toei Port -> Ploenchit edge -> Din Daeng -> Vibhavadi)
  [[13.668, 100.606], [13.706, 100.592], [13.714, 100.562], [13.721, 100.551], [13.739, 100.551], [13.758, 100.552], [13.778, 100.553], [13.840, 100.562], [13.913, 100.598]],
  // Si Rat Expressway (Makkasan -> Victory -> Uruphong -> Hua Lamphong -> Sathorn -> Rama IX Bridge)
  [[13.746, 100.635], [13.751, 100.585], [13.754, 100.553], [13.763, 100.532], [13.755, 100.522], [13.735, 100.520], [13.718, 100.519], [13.694, 100.516], [13.682, 100.518]],
];
const EXPRESSWAYS = EXPRESSWAYS_GPS.map(gpsPath);

// Bangkok Khlongs (Canals) in GPS
const KHLONGS = [
  gpsPath([[13.752, 100.506], [13.750, 100.524], [13.749, 100.542], [13.748, 100.565], [13.745, 100.595], [13.760, 100.640]]),
  gpsPath([[13.764, 100.502], [13.754, 100.512], [13.742, 100.516], [13.733, 100.514]]),
];

// Real Organic Bangkok Parks positioned via GPS!
function mkPark(name, lat, lon, rx, rz, treeCount, lake) {
  const { x, z } = gpsToWorld(lat, lon);
  return { name, x, z, rx, rz, treeCount, lake };
}
const ORGANIC_PARKS = [
  mkPark('Lumphini Park',    13.7314, 100.5414, 4.7, 3.8, 66, { dx: 0.2, dz: 0.2, rx: 1.7, rz: 1.25 }),
  mkPark('Benchakitti Park', 13.7294, 100.5582, 3.9, 4.3, 62, { dx: -0.2, dz: 0.3, rx: 1.35, rz: 1.85 }),
  mkPark('Chatuchak Park',   13.8065, 100.5565, 6.2, 4.4, 82, { dx: -0.8, dz: -0.2, rx: 2.0, rz: 1.35 }),
  mkPark('Sanam Luang',      13.7546, 100.4932, 2.7, 3.6, 26, null),
  mkPark('Bang Kachao',      13.6890, 100.5640, 14.5, 10.5, 220, { dx: -1.8, dz: 0.8, rx: 2.8, rz: 1.8 }),
  mkPark('Suan Luang Rama IX', 13.6880, 100.6635, 7.2, 5.4, 78, { dx: 0.5, dz: 0, rx: 2.2, rz: 1.6 }),
];

// Delicate, understated Apple Maps Cartographic Labels positioned via GPS!
function mkLabel(text, lat, lon, size, opts = {}) {
  const { x, z } = gpsToWorld(lat, lon);
  return { text, x, z, size, ...opts };
}
const DISTRICT_LABELS = [
  mkLabel('S I A M', 13.7420, 100.5335, 12),
  mkLabel('S U K H U M V I T', 13.7345, 100.5730, 12),
  mkLabel('K H L O N G  T O E I', 13.7160, 100.5570, 11),
  mkLabel('S I L O M  •  S A T H O R N', 13.7245, 100.5260, 11),
  mkLabel('Y A O W A R A T', 13.7405, 100.5095, 11),
  mkLabel('R A T T A N A K O S I N', 13.7515, 100.4965, 10),
  mkLabel('R A M A  I X', 13.7580, 100.5740, 11),
  mkLabel('C H A T U C H A K', 13.8005, 100.5500, 11),
  mkLabel('T H O N B U R I', 13.7245, 100.4830, 12),
  mkLabel('B A N G  S U E', 13.8080, 100.5370, 11),
  mkLabel('N O N T H A B U R I', 13.8540, 100.5000, 11),
  mkLabel('B A N G  N A', 13.6680, 100.6180, 11),
  mkLabel('Bang Kachao', 13.6890, 100.5640, 13, { park: true }),
  mkLabel('Lumphini Park', 13.7314, 100.5414, 10, { park: true }),
  mkLabel('Benchakitti Park', 13.7294, 100.5582, 10, { park: true }),
  mkLabel('Chao Phraya River', 13.7760, 100.5040, 11, { river: true, rot: -1.1 }),
];

function drawSmoothPolyline(ctx, pts, res) {
  if (pts.length < 2) return;
  const cpts = pts.map(([x, z]) => toCanvas(x, z, res));
  ctx.beginPath();
  ctx.moveTo(cpts[0][0], cpts[0][1]);
  for (let i = 1; i < cpts.length - 1; i++) {
    const mx = (cpts[i][0] + cpts[i + 1][0]) / 2;
    const my = (cpts[i][1] + cpts[i + 1][1]) / 2;
    ctx.quadraticCurveTo(cpts[i][0], cpts[i][1], mx, my);
  }
  const last = cpts[cpts.length - 1];
  ctx.lineTo(last[0], last[1]);
  ctx.stroke();
}

function drawExactCurveSamples(ctx, sampleVecs, res) {
  if (sampleVecs.length < 2) return;
  ctx.beginPath();
  const [sx, sy] = toCanvas(sampleVecs[0].x, sampleVecs[0].z, res);
  ctx.moveTo(sx, sy);
  for (let i = 1; i < sampleVecs.length; i++) {
    const [px, py] = toCanvas(sampleVecs[i].x, sampleVecs[i].z, res);
    ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function drawOrganicParkPath(ctx, p, res) {
  const [cx, cy] = toCanvas(p.x, p.z, res);
  const rx = (p.rx / MAP_SIZE) * res;
  const ry = (p.rz / MAP_SIZE) * res;
  ctx.beginPath();
  const steps = 28;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const wobble = 1 + Math.sin(a * 3 + p.x) * 0.08 + Math.cos(a * 5 + p.z) * 0.05;
    const px = cx + Math.cos(a) * rx * wobble;
    const py = cy + Math.sin(a) * ry * wobble;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function createMapTexturesAndMask(expresswayCurves, isCompactGpu = false) {
  const res = isCompactGpu ? 1536 : 2048;
  const maskRes = 512;

  const dayCanvas = document.createElement('canvas');
  dayCanvas.width = res;
  dayCanvas.height = res;
  const ctx = dayCanvas.getContext('2d');

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = maskRes;
  maskCanvas.height = maskRes;
  const mctx = maskCanvas.getContext('2d');
  mctx.fillStyle = '#000000';
  mctx.fillRect(0, 0, maskRes, maskRes);

  // 1. Base luminous warm Apple Maps ivory urban surface
  ctx.fillStyle = '#F2F0E8';
  ctx.fillRect(0, 0, res, res);

  // Outer lush sage metropolitan fringe
  const fringeGrad = ctx.createRadialGradient(res * 0.48, res * 0.52, res * 0.25, res * 0.5, res * 0.52, res * 0.6);
  fringeGrad.addColorStop(0, 'rgba(242, 240, 232, 0)');
  fringeGrad.addColorStop(0.74, 'rgba(224, 238, 212, 0.52)');
  fringeGrad.addColorStop(1, 'rgba(196, 224, 182, 0.92)');
  ctx.fillStyle = fringeGrad;
  ctx.fillRect(0, 0, res, res);

  // 2. Soft Warm Commercial / Shopping District Zones (GPS aligned!)
  const commercialZones = [
    [13.745, 100.539, 13, 6.5],  // Siam - Chit Lom - Ploenchit
    [13.736, 100.562, 10, 7.5],  // Asok - Phrom Phong
    [13.726, 100.532, 11, 7.5],  // Silom - Sathorn
    [13.758, 100.566, 9, 9.5],   // Phra Ram 9
    [13.743, 100.506, 9, 5.5],   // Yaowarat - Old Town
    [13.727, 100.509, 6, 6.5],   // ICONSIAM
    [13.722, 100.555, 8, 5.5],   // Khlong Toei / COCO PARC
    [13.698, 100.752, 11, 8],    // Suvarnabhumi
  ];
  ctx.fillStyle = '#F7EFE1';
  for (const [lat, lon, rx, rz] of commercialZones) {
    const p = gpsToWorld(lat, lon);
    const [cx, cy] = toCanvas(p.x, p.z, res);
    ctx.beginPath();
    ctx.ellipse(cx, cy, (rx / MAP_SIZE) * res, (rz / MAP_SIZE) * res, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Secondary Bangkok Soi Grid
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  mctx.lineCap = 'round';
  mctx.lineJoin = 'round';

  ctx.strokeStyle = '#E5E2D8';
  ctx.lineWidth = 3.6;
  mctx.strokeStyle = '#FF0000';
  mctx.lineWidth = 1.4;
  for (let sx = -76; sx <= 98; sx += 11.5) {
    const pts = [[sx, -94], [sx + 1.1, -30], [sx - 0.8, 30], [sx + 1.4, 78]];
    drawSmoothPolyline(ctx, pts, res);
    drawSmoothPolyline(mctx, pts, maskRes);
  }
  for (let sz = -94; sz <= 78; sz += 11.5) {
    const pts = [[-78, sz], [-14, sz + 0.9], [36, sz - 0.8], [102, sz + 1.1]];
    drawSmoothPolyline(ctx, pts, res);
    drawSmoothPolyline(mctx, pts, maskRes);
  }
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.0;
  for (let sx = -76; sx <= 98; sx += 11.5) {
    drawSmoothPolyline(ctx, [[sx, -94], [sx + 1.1, -30], [sx - 0.8, 30], [sx + 1.4, 78]], res);
  }
  for (let sz = -94; sz <= 78; sz += 11.5) {
    drawSmoothPolyline(ctx, [[-78, sz], [-14, sz + 0.9], [36, sz - 0.8], [102, sz + 1.1]], res);
  }

  // 4. Organic Apple Maps Parks
  for (const p of ORGANIC_PARKS) {
    drawOrganicParkPath(mctx, p, maskRes);
    mctx.fillStyle = '#FF9900';
    mctx.fill();

    drawOrganicParkPath(ctx, p, res);
    ctx.fillStyle = '#BBE5AA';
    ctx.fill();
    ctx.strokeStyle = '#9ED58A';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    const [cx, cy] = toCanvas(p.x, p.z, res);
    ctx.strokeStyle = '#EDEAE0';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(cx, cy, (p.rx * 0.68 / MAP_SIZE) * res, (p.rz * 0.68 / MAP_SIZE) * res, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (p.lake) {
      const [lx, ly] = toCanvas(p.x + p.lake.dx, p.z + p.lake.dz, res);
      ctx.fillStyle = '#7AC9F7';
      ctx.strokeStyle = '#A9DFFB';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.ellipse(lx, ly, (p.lake.rx / MAP_SIZE) * res, (p.lake.rz / MAP_SIZE) * res, 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const [mlx, mly] = toCanvas(p.x + p.lake.dx, p.z + p.lake.dz, maskRes);
      mctx.fillStyle = '#FF00FF';
      mctx.beginPath();
      mctx.ellipse(mlx, mly, (p.lake.rx * 1.15 / MAP_SIZE) * maskRes, (p.lake.rz * 1.15 / MAP_SIZE) * maskRes, 0.25, 0, Math.PI * 2);
      mctx.fill();
    }
  }

  // 5. Chao Phraya River & Khlongs (soft Apple Maps aqua halo!)
  const riverCurveSamples = new THREE.CatmullRomCurve3(
    CHAO_PHRAYA_POINTS.map(([x, z]) => new THREE.Vector3(x, 0, z))
  ).getPoints(140);

  ctx.strokeStyle = '#B5E3FC';
  ctx.lineWidth = 74;
  drawExactCurveSamples(ctx, riverCurveSamples, res);
  ctx.strokeStyle = '#72C4F6';
  ctx.lineWidth = 60;
  drawExactCurveSamples(ctx, riverCurveSamples, res);
  ctx.strokeStyle = '#60B7ED';
  ctx.lineWidth = 36;
  drawExactCurveSamples(ctx, riverCurveSamples, res);

  mctx.strokeStyle = '#FF00FF';
  mctx.lineWidth = 18;
  drawExactCurveSamples(mctx, riverCurveSamples, maskRes);

  ctx.strokeStyle = '#86CFF8';
  ctx.lineWidth = 8;
  mctx.strokeStyle = '#FF00FF';
  mctx.lineWidth = 3.5;
  for (const kh of KHLONGS) {
    drawSmoothPolyline(ctx, kh, res);
    drawSmoothPolyline(mctx, kh, maskRes);
  }

  // 6. Major Apple Maps Bangkok Arterials (pure white boulevards + subtle curbs)
  ctx.strokeStyle = '#D5D1C7';
  ctx.lineWidth = 15;
  mctx.strokeStyle = '#FF0000';
  mctx.lineWidth = 4.0;
  for (const road of BANGKOK_ARTERIALS) {
    drawSmoothPolyline(ctx, road, res);
    drawSmoothPolyline(mctx, road, maskRes);
  }
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 11.5;
  for (const road of BANGKOK_ARTERIALS) {
    drawSmoothPolyline(ctx, road, res);
  }
  ctx.save();
  ctx.strokeStyle = '#E6E3DA';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([7, 9]);
  for (const road of BANGKOK_ARTERIALS) {
    drawSmoothPolyline(ctx, road, res);
  }
  ctx.restore();

  // Victory Monument roundabout at real GPS!
  const vmPos = gpsToWorld(13.7649, 100.5383);
  const [vmx, vmy] = toCanvas(vmPos.x, vmPos.z, res);
  ctx.beginPath();
  ctx.arc(vmx, vmy, 14, 0, Math.PI * 2);
  ctx.strokeStyle = '#D5D1C7';
  ctx.lineWidth = 11;
  ctx.stroke();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 8;
  ctx.stroke();

  // 7. Expressways along EXACT CatmullRomCurve3 samples
  for (const samples of expresswayCurves) {
    ctx.strokeStyle = 'rgba(218, 173, 74, 0.55)';
    ctx.lineWidth = 11;
    drawExactCurveSamples(ctx, samples, res);
    ctx.strokeStyle = '#FCE196';
    ctx.lineWidth = 7.5;
    drawExactCurveSamples(ctx, samples, res);

    mctx.strokeStyle = '#FF0000';
    mctx.lineWidth = 3.8;
    drawExactCurveSamples(mctx, samples, maskRes);
  }

  // 8. Reserve station platforms, transit viaduct corridors & Suankularb School campus so NO background block clips a station or track!
  mctx.strokeStyle = '#FF0000';
  mctx.lineCap = 'round';
  mctx.lineWidth = (2.2 / MAP_SIZE) * maskRes;
  for (const line of LINES) {
    if (line.kind === 'river') continue;
    const drawMaskSeg = (idA, idB) => {
      const a = STATIONS[idA];
      const b = STATIONS[idB];
      if (!a || !b) return;
      const [ax, ay] = toCanvas(a.x, a.z, maskRes);
      const [bx, by] = toCanvas(b.x, b.z, maskRes);
      mctx.beginPath();
      mctx.moveTo(ax, ay);
      mctx.lineTo(bx, by);
      mctx.stroke();
    };
    for (let i = 0; i < line.stations.length - 1; i++) {
      drawMaskSeg(line.stations[i], line.stations[i + 1]);
    }
    if (line.isLoop && line.stations.length >= 3) {
      drawMaskSeg(line.stations[line.stations.length - 1], line.stations[0]);
    }
    if (line.extraBranches) {
      for (const [a, b] of line.extraBranches) drawMaskSeg(a, b);
    }
  }

  mctx.fillStyle = '#FF0000';
  for (const st of Object.values(STATIONS)) {
    const [sx, sy] = toCanvas(st.x, st.z, maskRes);
    mctx.beginPath();
    mctx.arc(sx, sy, (2.7 / MAP_SIZE) * maskRes, 0, Math.PI * 2);
    mctx.fill();
  }
  // Reserve Suankularb Wittayalai School campus ground (pink-cream heritage courtyard!)
  const skWorld = gpsToWorld(SUANKULARB_GPS.lat, SUANKULARB_GPS.lon);
  const [skx, sky] = toCanvas(skWorld.x, skWorld.z, res);
  ctx.fillStyle = '#F7EFE0';
  ctx.strokeStyle = '#E5D3B3';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(skx - 18, sky - 13, 36, 26, 5);
  ctx.fill();
  ctx.stroke();
  const [mskx, msky] = toCanvas(skWorld.x, skWorld.z, maskRes);
  mctx.beginPath();
  mctx.arc(mskx, msky, (3.1 / MAP_SIZE) * maskRes, 0, Math.PI * 2);
  mctx.fill();

  // 9. Delicate, understated Apple Maps Cartographic Labels
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const lbl of DISTRICT_LABELS) {
    const [lx, ly] = toCanvas(lbl.x, lbl.z, res);
    ctx.save();
    ctx.translate(lx, ly);
    if (lbl.rot) ctx.rotate(lbl.rot);
    ctx.font = `700 ${lbl.size}px "Avenir Next", "SF Pro Display", "Helvetica Neue", sans-serif`;
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3.2;
    if (lbl.river) {
      ctx.strokeStyle = 'rgba(114, 196, 246, 0.85)';
      ctx.fillStyle = 'rgba(25, 96, 146, 0.85)';
    } else if (lbl.park) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fillStyle = '#2F6F38';
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fillStyle = 'rgba(112, 106, 97, 0.8)';
    }
    ctx.strokeText(lbl.text, 0, 0);
    ctx.fillText(lbl.text, 0, 0);
    ctx.restore();
  }

  const dayTex = new THREE.CanvasTexture(dayCanvas);
  dayTex.colorSpace = THREE.SRGBColorSpace;
  dayTex.anisotropy = 16;

  const maskData = mctx.getImageData(0, 0, maskRes, maskRes).data;
  return { dayTex, maskData, maskRes };
}

function getDistrictMaxHeight(x, z) {
  const hubGps = [
    [13.745, 100.538, 5.4, 17],  // Siam / Chit Lom / Wireless
    [13.736, 100.562, 6.4, 19],  // Asok / Phrom Phong
    [13.725, 100.532, 6.8, 19],  // Silom / Sathorn Financial Towers
    [13.722, 100.555, 4.9, 14],  // Khlong Toei / COCO PARC
    [13.758, 100.566, 5.6, 16],  // Phra Ram 9
    [13.724, 100.579, 5.0, 15],  // Thong Lor / Ekkamai
    [13.727, 100.509, 4.5, 12],  // Charoen Nakhon Riverfront
    [13.814, 100.561, 4.3, 16],  // Ladprao / Chatuchak
  ];
  let h = 1.15;
  for (const [lat, lon, maxH, rad] of hubGps) {
    const p = gpsToWorld(lat, lon);
    const d = Math.hypot(x - p.x, z - p.z);
    if (d < rad) {
      const f = Math.pow(1 - d / rad, 1.35);
      h = Math.max(h, 1.15 + f * maxH);
    }
  }
  // Keep historic Rattanakosin / Suankularb School / Old Town authentic low-rise height!
  const oldTown = gpsToWorld(13.748, 100.498);
  if (Math.hypot(x - oldTown.x, z - oldTown.z) < 12) {
    h = Math.min(h, 1.7);
  }
  return h;
}

// Single zero-z-fighting architectural facade + twinkling night emissive map for all background towers!
function makeAppleCityFacadeTextures() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 64, 128);

  const n = document.createElement('canvas');
  n.width = 64;
  n.height = 128;
  const nctx = n.getContext('2d');
  nctx.fillStyle = '#000000';
  nctx.fillRect(0, 0, 64, 128);

  const rows = 10;
  const rh = 128 / rows;
  let s = 91;
  const r2 = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

  for (let r = 0; r < rows; r++) {
    ctx.fillStyle = 'rgba(130, 145, 162, 0.16)';
    ctx.fillRect(4, r * rh + 4, 56, rh - 6);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
    for (let x = 14; x < 56; x += 14) {
      ctx.fillRect(x, r * rh + 3, 2, rh - 4);
    }
    // Delicate warm night windows baked right onto the building (ZERO coplanar box z-fighting!)
    for (let col = 0; col < 4; col++) {
      if (r2() > 0.56) {
        nctx.fillStyle = r2() > 0.4 ? '#FFE49E' : '#FFF4CC';
        nctx.fillRect(6 + col * 14, r * rh + 5, 9, rh - 8);
      }
    }
  }
  const dayMap = new THREE.CanvasTexture(c);
  dayMap.colorSpace = THREE.SRGBColorSpace;
  dayMap.wrapS = THREE.RepeatWrapping;
  dayMap.wrapT = THREE.RepeatWrapping;

  const nightMap = new THREE.CanvasTexture(n);
  nightMap.colorSpace = THREE.SRGBColorSpace;
  nightMap.wrapS = THREE.RepeatWrapping;
  nightMap.wrapT = THREE.RepeatWrapping;
  return { dayMap, nightMap };
}

export function buildAppleMapsBangkok(parentGroup, opts = {}) {
  const isCompactGpu = Boolean(opts.isCompactGpu);
  const expCurveObjs = EXPRESSWAYS.map((pts) =>
    new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0.78, z)))
  );
  const expSamples = expCurveObjs.map((c) => c.getPoints(90));

  const { dayTex, maskData, maskRes } = createMapTexturesAndMask(expSamples, isCompactGpu);

  const sampleMask = (x, z) => {
    const [u, v] = toCanvas(x, z, maskRes);
    const ix = Math.floor(u);
    const iy = Math.floor(v);
    if (ix < 2 || iy < 2 || ix >= maskRes - 2 || iy >= maskRes - 2) return { blocked: true, park: false, water: false };
    const idx = (iy * maskRes + ix) * 4;
    return {
      blocked: maskData[idx] > 40,
      park: maskData[idx + 1] > 40 && maskData[idx + 2] < 40,
      water: maskData[idx + 2] > 40,
    };
  };

  // 1. High-Resolution Apple Maps Ground Surface Plane
  const mapMat = new THREE.MeshStandardMaterial({
    map: dayTex,
    roughness: 0.92,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE), mapMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(MAP_CX, 0, MAP_CZ);
  ground.receiveShadow = true;
  parentGroup.add(ground);

  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(MAP_SIZE + 2, 3.2, MAP_SIZE + 2),
    new THREE.MeshStandardMaterial({ color: '#E6E3DA', roughness: 0.85 })
  );
  slab.position.set(MAP_CX, -1.66, MAP_CZ);
  parentGroup.add(slab);

  // 2. Shimmering Chao Phraya 3D Water Surface Ribbon
  const riverPts = CHAO_PHRAYA_POINTS.map(([x, z]) => new THREE.Vector3(x, 0.03, z));
  const riverCurve = new THREE.CatmullRomCurve3(riverPts);
  const riverSamples = riverCurve.getPoints(150);
  const rPos = [];
  const rIdx = [];
  const halfW = 3.8;
  for (let i = 0; i < riverSamples.length; i++) {
    const p = riverSamples[i];
    const next = riverSamples[Math.min(riverSamples.length - 1, i + 1)];
    const prev = riverSamples[Math.max(0, i - 1)];
    const tx = next.x - prev.x;
    const tz = next.z - prev.z;
    const len = Math.hypot(tx, tz) || 1;
    const nx = -tz / len;
    const nz = tx / len;
    rPos.push(p.x - nx * halfW, 0.03, p.z - nz * halfW);
    rPos.push(p.x + nx * halfW, 0.03, p.z + nz * halfW);
    if (i < riverSamples.length - 1) {
      const a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
      rIdx.push(a, c, b, b, c, d);
    }
  }
  const riverGeo = new THREE.BufferGeometry();
  riverGeo.setAttribute('position', new THREE.Float32BufferAttribute(rPos, 3));
  riverGeo.setIndex(rIdx);
  riverGeo.computeVertexNormals();
  const riverMat = new THREE.MeshStandardMaterial({
    color: '#6AC4F7',
    roughness: 0.16,
    metalness: 0.18,
    transparent: true,
    opacity: 0.82,
  });
  const riverMesh = new THREE.Mesh(riverGeo, riverMat);
  riverMesh.receiveShadow = true;
  parentGroup.add(riverMesh);

  // 3. Sleek Aligned Elevated 3D Golden-Cream Bangkok Expressways
  const expDeckMat = new THREE.MeshStandardMaterial({ color: '#FCE29B', roughness: 0.55 });
  const expPierMat = new THREE.MeshStandardMaterial({ color: '#E8E5DC', roughness: 0.72 });
  for (const curve of expCurveObjs) {
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 84, 0.26, 6, false), expDeckMat);
    tube.scale.set(1, 0.2, 1);
    tube.position.y = 0.48;
    tube.castShadow = true;
    tube.receiveShadow = true;
    parentGroup.add(tube);

    for (let t = 0.04; t <= 0.96; t += 0.07) {
      const p = curve.getPoint(t);
      const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.62, 6), expPierMat);
      pier.position.set(p.x, 0.31, p.z);
      parentGroup.add(pier);
    }
  }

  // 4. Sculpted Iconic Bangkok Bridges at REAL GPS Positions!
  const rama8Pos = gpsToWorld(13.7689, 100.4969);
  addRama8Bridge(parentGroup, rama8Pos.x, rama8Pos.z);
  const memPos = gpsToWorld(13.7392, 100.4974); // Memorial Bridge (สะพานพุทธ) right beside Suankularb School!
  addMemorialBridge(parentGroup, memPos.x, memPos.z, 9.8, 0.35);
  const taksinPos = gpsToWorld(13.7191, 100.5112);
  addCableBridge(parentGroup, taksinPos.x, taksinPos.z, 9.8, 0.05);
  const rama9Pos = gpsToWorld(13.6820, 100.5180);
  addRama9Bridge(parentGroup, rama9Pos.x, rama9Pos.z);

  // 5. DENSE ~3,000+ ZERO-Z-FIGHTING MATTE-IVORY APPLE MAPS 3D CITY BUILDINGS!
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const bldgData = [];
  const capData = [];

  for (let gx = -92; gx <= 110; gx += 1.9) {
    for (let gz = -104; gz <= 88; gz += 1.9) {
      const distCenter = Math.hypot((gx - 6) * 0.9, (gz + 4) * 0.9);
      const densityProb = distCenter < 48 ? 0.94 : (distCenter < 80 ? 0.56 : 0.22);
      if (rand() > densityProb) continue;

      const x = gx + (rand() - 0.5) * 0.72;
      const z = gz + (rand() - 0.5) * 0.72;
      const w = 0.8 + rand() * 0.96;
      const d = 0.8 + rand() * 0.96;

      const hw = w * 0.44;
      const hd = d * 0.44;
      if (
        sampleMask(x, z).blocked ||
        sampleMask(x - hw, z - hd).blocked ||
        sampleMask(x + hw, z - hd).blocked ||
        sampleMask(x - hw, z + hd).blocked ||
        sampleMask(x + hw, z + hd).blocked
      ) continue;

      const maxH = getDistrictMaxHeight(x, z);
      const tallRoll = rand();
      const h = tallRoll > 0.74
        ? 1.3 + rand() * maxH
        : 0.65 + rand() * Math.min(2.4, maxH * 0.56);

      const rotY = (Math.floor(rand() * 4) * Math.PI) / 2 + (rand() - 0.5) * 0.04;
      const bEntry = { x, z, w, h, d, rotY, tone: rand(), capIdx: -1, hidden: false };
      bldgData.push(bEntry);

      if (h > 1.1 && rand() > 0.24) {
        bEntry.capIdx = capData.length;
        capData.push({
          x, z,
          w: w * (0.58 + rand() * 0.22),
          h: 0.16 + rand() * 0.34,
          d: d * (0.58 + rand() * 0.22),
          y: h,
          rotY,
        });
      }
    }
  }

  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const { dayMap, nightMap } = makeAppleCityFacadeTextures();
  const cityMat = new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    map: dayMap,
    emissiveMap: nightMap,
    emissive: new THREE.Color('#FFE4A0'),
    emissiveIntensity: 0.0,
    roughness: 0.72,
    metalness: 0.05,
  });
  const cityInst = new THREE.InstancedMesh(boxGeo, cityMat, Math.max(1, bldgData.length));
  cityInst.castShadow = true;
  cityInst.receiveShadow = true;

  const palette = [
    new THREE.Color('#FFFFFF'),
    new THREE.Color('#FAF8F4'),
    new THREE.Color('#F4F1EA'),
    new THREE.Color('#EFECE4'),
    new THREE.Color('#F7F3EC'),
    new THREE.Color('#ECE8DF'),
  ];
  const dummy = new THREE.Object3D();
  for (let i = 0; i < bldgData.length; i++) {
    const b = bldgData[i];
    dummy.position.set(b.x, b.h / 2, b.z);
    dummy.rotation.set(0, b.rotY, 0);
    dummy.scale.set(b.w, b.h, b.d);
    dummy.updateMatrix();
    cityInst.setMatrixAt(i, dummy.matrix);
    cityInst.setColorAt(i, palette[Math.floor(b.tone * palette.length) % palette.length]);
  }
  cityInst.instanceMatrix.needsUpdate = true;
  if (cityInst.instanceColor) cityInst.instanceColor.needsUpdate = true;
  parentGroup.add(cityInst);

  // Rooftop Mechanical Penthouse / Setback Caps (strictly stacked at y = h, zero overlap!)
  const capMat = new THREE.MeshStandardMaterial({ color: '#E2DED5', roughness: 0.8 });
  const capInst = new THREE.InstancedMesh(boxGeo, capMat, Math.max(1, capData.length));
  capInst.receiveShadow = true;
  for (let i = 0; i < capData.length; i++) {
    const c = capData[i];
    dummy.position.set(c.x, c.y + c.h / 2, c.z);
    dummy.rotation.set(0, c.rotY, 0);
    dummy.scale.set(c.w, c.h, c.d);
    dummy.updateMatrix();
    capInst.setMatrixAt(i, dummy.matrix);
  }
  capInst.instanceMatrix.needsUpdate = true;
  parentGroup.add(capInst);

  // 6. ~1,150 EXPLICITLY POPULATED LUSH SCULPTED APPLE MAPS TREES
  const trees = [];
  for (const p of ORGANIC_PARKS) {
    let placed = 0;
    let tries = 0;
    while (placed < p.treeCount && tries < p.treeCount * 6) {
      tries++;
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 0.92;
      const tx = p.x + Math.cos(a) * p.rx * r;
      const tz = p.z + Math.sin(a) * p.rz * r;
      if (sampleMask(tx, tz).water) continue;
      trees.push({ x: tx, z: tz, scale: 0.62 + rand() * 0.56, tone: rand() });
      placed++;
    }
  }
  for (const road of BANGKOK_ARTERIALS.slice(0, 7)) {
    for (let i = 0; i < road.length - 1; i++) {
      const [x1, z1] = road[i];
      const [x2, z2] = road[i + 1];
      const len = Math.hypot(x2 - x1, z2 - z1);
      const nx = -(z2 - z1) / (len || 1);
      const nz = (x2 - x1) / (len || 1);
      const steps = Math.max(1, Math.floor(len / 4.6));
      for (let k = 1; k < steps; k++) {
        const t = k / steps;
        const bx = x1 + (x2 - x1) * t;
        const bz = z1 + (z2 - z1) * t;
        for (const side of [-1, 1]) {
          const tx = bx + nx * side * 1.4;
          const tz = bz + nz * side * 1.4;
          if (!sampleMask(tx, tz).water && rand() < 0.5) {
            trees.push({ x: tx, z: tz, scale: 0.48 + rand() * 0.28, tone: rand() });
          }
        }
      }
    }
  }
  for (let i = 0; i < 600 && trees.length < 1150; i++) {
    const tx = -98 + rand() * 215;
    const tz = -110 + rand() * 200;
    const m = sampleMask(tx, tz);
    if (!m.blocked && !m.water && Math.hypot(tx - 6, tz + 4) > 52) {
      trees.push({ x: tx, z: tz, scale: 0.68 + rand() * 0.58, tone: rand() });
    }
  }

  const trunkGeo = new THREE.CylinderGeometry(0.055, 0.085, 0.42, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#9E8578', roughness: 0.9 });
  const crownGeo = new THREE.SphereGeometry(0.42, 10, 8);
  const crownMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.78 });

  const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, Math.max(1, trees.length));
  const crownInst = new THREE.InstancedMesh(crownGeo, crownMat, Math.max(1, trees.length * 2));
  crownInst.castShadow = true;
  crownInst.receiveShadow = true;

  const treePalette = [
    new THREE.Color('#77C66E'),
    new THREE.Color('#64BA5C'),
    new THREE.Color('#8ED581'),
    new THREE.Color('#53AA4F'),
  ];
  for (let i = 0; i < trees.length; i++) {
    const t = trees[i];
    const col = treePalette[Math.floor(t.tone * treePalette.length) % treePalette.length];

    dummy.position.set(t.x, 0.2 * t.scale, t.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(t.scale, t.scale, t.scale);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(t.x, 0.62 * t.scale, t.z);
    dummy.scale.set(t.scale * 1.06, t.scale * 0.92, t.scale * 1.06);
    dummy.updateMatrix();
    crownInst.setMatrixAt(i * 2, dummy.matrix);
    crownInst.setColorAt(i * 2, col);

    dummy.position.set(t.x + 0.16 * t.scale, 0.54 * t.scale, t.z + 0.12 * t.scale);
    dummy.scale.set(t.scale * 0.75, t.scale * 0.72, t.scale * 0.75);
    dummy.updateMatrix();
    crownInst.setMatrixAt(i * 2 + 1, dummy.matrix);
    crownInst.setColorAt(i * 2 + 1, col);
  }
  trunkInst.instanceMatrix.needsUpdate = true;
  crownInst.instanceMatrix.needsUpdate = true;
  if (crownInst.instanceColor) crownInst.instanceColor.needsUpdate = true;
  parentGroup.add(trunkInst);
  parentGroup.add(crownInst);

  // Dynamic parcel clearing when a Hero Landmark / 7-Eleven is built or grows larger!
  const zeroMat = new THREE.Matrix4().makeScale(0, 0, 0);
  const clearCityBlocksAround = (px, pz, radius = 1.65) => {
    let changedCity = false;
    let changedCap = false;
    for (let i = 0; i < bldgData.length; i++) {
      const b = bldgData[i];
      if (b.hidden) continue;
      if (Math.hypot(b.x - px, b.z - pz) < radius) {
        b.hidden = true;
        cityInst.setMatrixAt(i, zeroMat);
        changedCity = true;
        if (b.capIdx >= 0) {
          capInst.setMatrixAt(b.capIdx, zeroMat);
          changedCap = true;
        }
      }
    }
    if (changedCity) cityInst.instanceMatrix.needsUpdate = true;
    if (changedCap) capInst.instanceMatrix.needsUpdate = true;
  };

  const restoreAllCityBlocks = () => {
    for (let i = 0; i < bldgData.length; i++) {
      const b = bldgData[i];
      if (!b.hidden) continue;
      b.hidden = false;
      dummy.position.set(b.x, b.h / 2, b.z);
      dummy.rotation.set(0, b.rotY, 0);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.updateMatrix();
      cityInst.setMatrixAt(i, dummy.matrix);
      if (b.capIdx >= 0) {
        const c = capData[b.capIdx];
        dummy.position.set(c.x, c.y + c.h / 2, c.z);
        dummy.rotation.set(0, c.rotY, 0);
        dummy.scale.set(c.w, c.h, c.d);
        dummy.updateMatrix();
        capInst.setMatrixAt(b.capIdx, dummy.matrix);
      }
    }
    cityInst.instanceMatrix.needsUpdate = true;
    capInst.instanceMatrix.needsUpdate = true;
  };

  return {
    riverCurve,
    riverMat,
    mapMat,
    cityMat,
    capMat,
    expDeckMat,
    clearCityBlocksAround,
    restoreAllCityBlocks,
    buildingCount: bldgData.length,
    treeCount: trees.length,
    roadRoutes: BANGKOK_ARTERIALS.slice(0, 8),
  };
}

function addRama8Bridge(parent, x, z) {
  const g = new THREE.Group();
  g.position.set(x, 0.1, z);
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(11.2, 0.26, 1.3),
    new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.5 })
  );
  deck.position.y = 1.35;
  deck.castShadow = true;
  g.add(deck);
  const goldMat = new THREE.MeshStandardMaterial({ color: '#EAB308', roughness: 0.35, metalness: 0.25 });
  const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 5.2, 8), goldMat);
  pylon.position.set(-2.7, 2.6, 0);
  pylon.rotation.z = -0.18;
  pylon.castShadow = true;
  g.add(pylon);
  const cableMat = new THREE.MeshBasicMaterial({ color: '#FDE047' });
  for (let i = 0; i < 5; i++) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.2 + i * 0.72, 4), cableMat);
    c.position.set(-1.0 + i * 0.95, 2.85 - i * 0.22, 0);
    c.rotation.z = 0.68 + i * 0.12;
    g.add(c);
  }
  parent.add(g);
}

function addRama9Bridge(parent, x, z) {
  const g = new THREE.Group();
  g.position.set(x, 0.1, z);
  g.rotation.y = 0.15;
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(12.2, 0.28, 1.35),
    new THREE.MeshStandardMaterial({ color: '#FCE29B', roughness: 0.5 })
  );
  deck.position.y = 1.48;
  deck.castShadow = true;
  g.add(deck);
  const pylonMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.4 });
  for (const px of [-3.2, 3.2]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.0, 0.3), pylonMat);
    p.position.set(px, 2.0, 0);
    p.castShadow = true;
    g.add(p);
  }
  parent.add(g);
}

// Iconic Memorial Bridge (สะพานพุทธ — Phra Phuttha Yodfa) right beside Suankularb Wittayalai School:
// Heritage forest-green steel truss arches, concrete river piers, and cream deck balustrades!
function addMemorialBridge(parent, x, z, len, rotY) {
  const g = new THREE.Group();
  g.position.set(x, 0.08, z);
  g.rotation.y = rotY;
  const deckMat = new THREE.MeshStandardMaterial({ color: '#F7F3EA', roughness: 0.52 });
  const greenSteel = new THREE.MeshStandardMaterial({ color: '#2F6F4E', roughness: 0.44, metalness: 0.25 });
  const pierMat = new THREE.MeshStandardMaterial({ color: '#E2DDD2', roughness: 0.7 });

  const deck = new THREE.Mesh(new THREE.BoxGeometry(len, 0.24, 1.35), deckMat);
  deck.position.y = 1.12;
  deck.castShadow = true;
  g.add(deck);

  for (const px of [-3.4, -1.2, 1.2, 3.4]) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.1, 1.48), pierMat);
    pier.position.set(px, 0.55, 0);
    pier.castShadow = true;
    g.add(pier);
  }
  // Twin heritage green steel truss arches along both sides of the bridge!
  for (const ax of [-2.3, 0, 2.3]) {
    for (const sz of [-0.62, 0.62]) {
      const arch = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 6, 14, Math.PI), greenSteel);
      arch.position.set(ax, 1.22, sz);
      arch.castShadow = true;
      g.add(arch);
    }
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 1.32), greenSteel);
    cross.position.set(ax, 2.28, 0);
    g.add(cross);
  }
  parent.add(g);
}

function addCableBridge(parent, x, z, len, rotY) {
  const g = new THREE.Group();
  g.position.set(x, 0.08, z);
  g.rotation.y = rotY;
  const whiteMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.5 });
  const pierMat = new THREE.MeshStandardMaterial({ color: '#E2DDD2', roughness: 0.68 });
  const railMat = new THREE.MeshStandardMaterial({ color: '#CBD5E1', roughness: 0.45 });

  const deck = new THREE.Mesh(new THREE.BoxGeometry(len, 0.24, 1.28), whiteMat);
  deck.position.y = 1.18;
  deck.castShadow = true;
  g.add(deck);
  for (const sz of [-0.6, 0.6]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.14, 0.07), railMat);
    rail.position.set(0, 1.34, sz);
    g.add(rail);
  }
  for (const px of [-3.2, 0, 3.2]) {
    const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.16, 8), pierMat);
    pier.position.set(px, 0.58, 0);
    g.add(pier);
  }
  parent.add(g);
}
