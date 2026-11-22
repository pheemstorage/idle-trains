# Idle Trains: Bangkok

A 3D Apple Maps-inspired Bangkok transit tycoon game built with Three.js, Web Audio API procedural sound effects, and real Bangkok rail, BRT, river boat, and EV bus lines.

## Features
- **142 Real Bangkok Stations across 12 Lines** positioned using real WGS84 GPS coordinates: BTS Sukhumvit, BTS Silom, BTS Gold, MRT Blue (all 38 stations), MRT Purple, MRT Yellow, MRT Pink, Airport Rail Link (all 8 stations), SRT Red Lines, Bangkok BRT, Chao Phraya Express Boat, plus Endgame Bangkok EV City Buses & Thailand Intercity Rail.
- **Station-by-Station Expansion & Auto-Connecting Lines:** Scaling construction timers with 3D cranes, and automatic skywalk/tunnel line unlocks whenever you reach an interchange station.
- **Real-Life Bangkok Landmarks & 7-Elevens:** Every station features a Station 7-Eleven plus 3–5 nearby real-life buildings (including CentralWorld at `฿500,000`, COCO PARC by Dusit at MRT Khlong Toei, and Suankularb Wittayalai School at 155 Tri Phet Rd) that visibly grow bigger in 3D when upgraded (Lv. 1–10) and pull more train riders to your stations.
- **7-Day Calendar (1 Day = 5 Real Minutes), Weather & Floods, Breakdowns & Angry Commuters:** Paid train repairs in Thai Baht (`฿`), Web Audio SFX, silent auto-save, and iPad touch optimization.

## Local Development
```bash
npm install
npm start
# Open http://localhost:8099
```

## Production Build (Render Static Site)
```bash
npm ci && npm run build
# Static files output to ./dist (configured via render.yaml)
```
