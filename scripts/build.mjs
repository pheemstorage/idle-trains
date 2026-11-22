// Static production build for Render / static CDN hosting
// Copies index.html, css/, js/, and self-hosted Three.js ESM files into dist/
// Rewrites importmap to ./vendor/three/ so no host ever blocks /node_modules/

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// 1. Copy css/, js/, icons/, and manifest.webmanifest
copyDir(path.join(root, 'css'), path.join(dist, 'css'));
copyDir(path.join(root, 'js'), path.join(dist, 'js'));
copyDir(path.join(root, 'icons'), path.join(dist, 'icons'));
fs.copyFileSync(path.join(root, 'manifest.webmanifest'), path.join(dist, 'manifest.webmanifest'));

// 2. Copy self-hosted Three.js ESM runtime into dist/vendor/three/
const vendorThree = path.join(dist, 'vendor', 'three');
fs.mkdirSync(path.join(vendorThree, 'controls'), { recursive: true });
fs.copyFileSync(
  path.join(root, 'node_modules', 'three', 'build', 'three.module.js'),
  path.join(vendorThree, 'three.module.js')
);
fs.copyFileSync(
  path.join(root, 'node_modules', 'three', 'build', 'three.core.js'),
  path.join(vendorThree, 'three.core.js')
);
fs.copyFileSync(
  path.join(root, 'node_modules', 'three', 'examples', 'jsm', 'controls', 'OrbitControls.js'),
  path.join(vendorThree, 'controls', 'OrbitControls.js')
);

// 3. Copy index.html with production ./vendor/three/ importmap
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html
  .replace('./node_modules/three/build/three.module.js', './vendor/three/three.module.js')
  .replace('./node_modules/three/examples/jsm/', './vendor/three/');
fs.writeFileSync(path.join(dist, 'index.html'), html, 'utf8');

console.log('Built production static bundle into dist/ successfully.');
