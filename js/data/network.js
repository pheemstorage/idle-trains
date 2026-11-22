// Complete Real Bangkok Transit Network Data — True WGS84 GPS Coordinates!
// Unified gpsToWorld(lat, lon) projection keeps every station, landmark (COCO PARC,
// Suankularb Wittayalai School at 13.7434619, 100.498851), park, road & Chao Phraya bend
// in its exact real-world Bangkok geographic position!

export const SIAM_GPS = { lat: 13.7456, lon: 100.5341 };
export const SUANKULARB_GPS = { lat: 13.7434619, lon: 100.498851 };
export const COCO_PARC_GPS = { lat: 13.7224, lon: 100.5554 };

// Smooth non-linear radial GPS-to-3D projection:
// Crisp ~10.8 units/km spacing in downtown Bangkok while outer suburbs fit cleanly inside 280x280!
export function gpsToWorld(lat, lon) {
  const cosLat = Math.cos((SIAM_GPS.lat * Math.PI) / 180);
  const dxDeg = (lon - SIAM_GPS.lon) * cosLat;
  const dzDeg = -(lat - SIAM_GPS.lat); // North is -Z in Three.js
  const rawX = dxDeg * 1160;
  const rawZ = dzDeg * 1160;
  const r = Math.hypot(rawX, rawZ);
  if (r < 0.0001) return { x: 0, z: 0 };
  const compressedR = r / (1 + r / 195);
  const s = compressedR / r;
  return {
    x: Number((rawX * s).toFixed(2)),
    z: Number((rawZ * s).toFixed(2)),
  };
}

function mkSt(id, lineId, code, name, thai, lat, lon, cost, buildTime, demand, extras = {}) {
  const { x, z } = gpsToWorld(lat, lon);
  return {
    id, lineId, code, name, thai, lat, lon,
    x: Number((x + (extras.ox || 0)).toFixed(2)),
    z: Number((z + (extras.oz || 0)).toFixed(2)),
    cost, buildTime, demand, ...extras,
  };
}

export const LINES = [
  {
    id: 'bts_sukhumvit',
    name: 'BTS Sukhumvit Line',
    thaiName: 'รถไฟฟ้าสายสุขุมวิท',
    shortCode: 'BTS-S',
    color: '#72B638',
    accent: '#4A821E',
    kind: 'elevated',
    vehicleCategory: 'rail',
    defaultTrainModel: 'siemens_bts',
    baseFare: 48,
    isCoreRail: true,
    unlockedAtStart: true,
    description: 'Bangkok’s iconic elevated green spine from Khu Khot through Mo Chit, Siam & Asok to Kheha.',
    stations: [
      'bts_khukhot', 'bts_korporor', 'bts_watphrasri', 'bts_kasetsart', 'bts_hayaek', 'bts_mochit',
      'bts_saphankhwai', 'bts_ari', 'bts_sanampao', 'bts_victory', 'bts_phayathai', 'bts_ratchathewi',
      'bts_siam', 'bts_chitlom', 'bts_phloenchit', 'bts_nana', 'bts_asok',
      'bts_phromphong', 'bts_thonglo', 'bts_ekkamai', 'bts_phrakhanong', 'bts_onnut',
      'bts_udomsuk', 'bts_bangna', 'bts_bearing', 'bts_samrong', 'bts_paknam', 'bts_kheha',
    ],
  },
  {
    id: 'bts_silom',
    name: 'BTS Silom Line',
    thaiName: 'รถไฟฟ้าสายสีลม',
    shortCode: 'BTS-W',
    color: '#007B66',
    accent: '#005142',
    kind: 'elevated',
    vehicleCategory: 'rail',
    defaultTrainModel: 'crrc_bts',
    baseFare: 50,
    isCoreRail: true,
    unlockedAtStart: true, // Automatically connected at Siam!
    description: 'Connects National Stadium & Siam through Silom, Sathorn, Chao Phraya River & Thonburi to Bang Wa.',
    stations: [
      'silom_natstad', 'silom_siam', 'silom_ratchadamri', 'silom_saladaeng',
      'silom_chongnonsi', 'silom_saintlouis', 'silom_surasak', 'silom_saphantaksin',
      'silom_krungthonburi', 'silom_wongwianyai', 'silom_phonimit', 'silom_talatphlu',
      'silom_wutthakat', 'silom_bangwa',
    ],
  },
  {
    id: 'bts_gold',
    name: 'BTS Gold Line',
    thaiName: 'รถไฟฟ้าสายสีทอง',
    shortCode: 'GOLD',
    color: '#D4A017',
    accent: '#996F0A',
    kind: 'monorail',
    vehicleCategory: 'rail',
    defaultTrainModel: 'innovia_apm',
    baseFare: 44,
    isCoreRail: true,
    unlockedAtStart: false,
    description: 'Riverfront automated people mover linking Krung Thon Buri directly to ICONSIAM & Khlong San.',
    stations: ['gold_ktb', 'gold_iconsiam', 'gold_khlongsan'],
  },
  {
    id: 'mrt_blue',
    name: 'MRT Blue Line',
    thaiName: 'รถไฟฟ้าสายสีน้ำเงิน',
    shortCode: 'MRT-BL',
    color: '#1D56A5',
    accent: '#123970',
    kind: 'subway',
    vehicleCategory: 'rail',
    defaultTrainModel: 'siemens_mrt',
    baseFare: 54,
    isCoreRail: true,
    unlockedAtStart: false,
    isLoop: true,
    description: 'Complete 38-station ring through Sukhumvit, Khlong Toei (COCO PARC), Silom, Sam Yot, Sanam Chai (Suankularb School), Tha Phra & Lak Song.',
    stations: [
      'mrt_sukhumvit', 'mrt_qsncc', 'mrt_khlongtoei', 'mrt_lumphini', 'mrt_silom',
      'mrt_samyan', 'mrt_hualamphong', 'mrt_watmangkon', 'mrt_samyot', 'mrt_sanamchai',
      'mrt_itsaraphap', 'mrt_thaphra', 'mrt_charan13', 'mrt_faichai', 'mrt_bangkhunnon',
      'mrt_bangyikhan', 'mrt_sirindhorn', 'mrt_bangphlat', 'mrt_bango', 'mrt_bangpho',
      'mrt_taopoon', 'mrt_bangsue', 'mrt_kamphaengphet', 'mrt_chatuchak',
      'mrt_paholyothin', 'mrt_latphrao', 'mrt_ratchada', 'mrt_sutthisan', 'mrt_huaikhwang',
      'mrt_cultural', 'mrt_rama9', 'mrt_phetchaburi',
    ],
    extraBranches: [
      ['mrt_thaphra', 'mrt_bangphai'],
      ['mrt_bangphai', 'mrt_bangwa'],
      ['mrt_bangwa', 'mrt_phetkasem48'],
      ['mrt_phetkasem48', 'mrt_phasicharoen'],
      ['mrt_phasicharoen', 'mrt_bangkae'],
      ['mrt_bangkae', 'mrt_laksong'],
    ],
  },
  {
    id: 'mrt_purple',
    name: 'MRT Purple Line',
    thaiName: 'รถไฟฟ้าสายสีม่วง',
    shortCode: 'MRT-PP',
    color: '#7A3E9D',
    accent: '#51236B',
    kind: 'elevated',
    vehicleCategory: 'rail',
    defaultTrainModel: 'jr_east_e235',
    baseFare: 52,
    isCoreRail: true,
    unlockedAtStart: false,
    description: 'Northwest elevated line from Tao Poon through Nonthaburi Civic Center & Central WestGate to Khlong Bang Phai.',
    stations: ['pp_taopoon', 'pp_wongsawang', 'pp_moph', 'pp_nonthaburi', 'pp_phranangklao', 'pp_westgate', 'pp_khlongbangphai'],
  },
  {
    id: 'mrt_yellow',
    name: 'MRT Yellow Line',
    thaiName: 'รถไฟฟ้าสายสีเหลือง',
    shortCode: 'MRT-YL',
    color: '#EAB308',
    accent: '#A16207',
    kind: 'monorail',
    vehicleCategory: 'rail',
    defaultTrainModel: 'innovia_mono_y',
    baseFare: 50,
    isCoreRail: true,
    unlockedAtStart: false,
    description: 'Eastern Bangkok monorail from Lat Phrao through Bang Kapi, Hua Mak & Seacon Square to Samrong.',
    stations: ['yl_latphrao', 'yl_chokchai4', 'yl_bangkapi', 'yl_huamak', 'yl_srinagarindra', 'yl_sriiam', 'yl_samrong'],
  },
  {
    id: 'mrt_pink',
    name: 'MRT Pink Line',
    thaiName: 'รถไฟฟ้าสายสีชมพู',
    shortCode: 'MRT-PK',
    color: '#E25397',
    accent: '#9D235F',
    kind: 'monorail',
    vehicleCategory: 'rail',
    defaultTrainModel: 'innovia_mono_p',
    baseFare: 50,
    isCoreRail: true,
    unlockedAtStart: false,
    description: 'Northern Bangkok monorail from Nonthaburi through IMPACT Chaeng Watthana, Lak Si & Fashion Island to Min Buri.',
    stations: ['pk_nonthaburi', 'pk_pakkret', 'pk_chaengwatthana', 'pk_laksi', 'pk_watphrasri', 'pk_fashion', 'pk_minburi'],
  },
  {
    id: 'arl',
    name: 'Airport Rail Link',
    thaiName: 'แอร์พอร์ต เรล ลิงก์',
    shortCode: 'ARL',
    color: '#B91C1C',
    accent: '#7F1D1D',
    kind: 'elevated',
    vehicleCategory: 'rail',
    defaultTrainModel: 'siemens_arl',
    baseFare: 72,
    isCoreRail: true,
    unlockedAtStart: false,
    description: 'All 8 stations from Phaya Thai through Makkasan straight to Suvarnabhumi International Airport.',
    stations: ['arl_phayathai', 'arl_ratchaprarop', 'arl_makkasan', 'arl_ramkhamhaeng', 'arl_huamak', 'arl_banthapchang', 'arl_latkrabang', 'arl_suvarnabhumi'],
  },
  {
    id: 'srt_red',
    name: 'SRT Red Lines',
    thaiName: 'รถไฟชานเมืองสายสีแดง',
    shortCode: 'SRT',
    color: '#8C1D24',
    accent: '#591016',
    kind: 'rail',
    vehicleCategory: 'rail',
    defaultTrainModel: 'hitachi_srt',
    baseFare: 62,
    isCoreRail: true,
    unlockedAtStart: false,
    description: 'State Railway Dark & Light Red lines from Krung Thep Aphiwat to Don Mueang Airport, Rangsit & Taling Chan.',
    stations: ['srt_talingchan', 'srt_bangbamru', 'srt_aphiwat', 'srt_chatuchak', 'srt_watsemsian', 'srt_laksi', 'srt_donmueang', 'srt_rangsit'],
  },
  {
    id: 'brt',
    name: 'Bangkok BRT',
    thaiName: 'รถโดยสารด่วนพิเศษ BRT',
    shortCode: 'BRT',
    color: '#A3BE18',
    accent: '#687C0B',
    kind: 'street',
    vehicleCategory: 'brt',
    defaultTrainModel: 'brt_ev_bus',
    baseFare: 36,
    isCoreRail: true,
    unlockedAtStart: false,
    floodSensitive: true,
    description: 'Dedicated Rama III rapid busway from Sathorn to Ratchaphruek. Slows during Bangkok monsoon floods!',
    stations: ['brt_sathorn', 'brt_technic', 'brt_nararam3', 'brt_rama3', 'brt_watdokmai', 'brt_ratchaphruek'],
  },
  {
    id: 'chao_phraya_boat',
    name: 'Chao Phraya Express Boat',
    thaiName: 'เรือด่วนเจ้าพระยา',
    shortCode: 'BOAT',
    color: '#0288D1',
    accent: '#01579B',
    kind: 'river',
    vehicleCategory: 'boat',
    defaultTrainModel: 'chao_phraya_express',
    baseFare: 45,
    isCoreRail: false,
    unlockedAtStart: false,
    description: 'Scenic orange-flag river express boats past Asiatique, Sathorn, ICONSIAM, Rajinee (Suankularb School), Wat Arun & Nonthaburi.',
    stations: ['boat_asiatique', 'boat_sathorn', 'boat_iconsiam', 'boat_siphraya', 'boat_ratchawong', 'boat_rajinee', 'boat_thatien', 'boat_phraarthit', 'boat_nonthaburi'],
  },
  {
    id: 'bkk_bus',
    name: 'Bangkok EV City Bus',
    thaiName: 'รถเมล์ไฟฟ้ากรุงเทพ',
    shortCode: 'BUS',
    color: '#1976D2',
    accent: '#0D47A1',
    kind: 'street',
    vehicleCategory: 'bus',
    defaultTrainModel: 'thai_smile_ev_bus',
    baseFare: 42,
    isCoreRail: false,
    isPostRailUnlock: true,
    floodSensitive: true,
    unlockedAtStart: false,
    description: 'Master Transit Bonus! Unlocks automatically when all Bangkok train lines are complete.',
    stations: ['bus_sanamluang', 'bus_victory', 'bus_siam', 'bus_pratunam', 'bus_asok', 'bus_khlongtoei', 'bus_ekkamai'],
  },
];

// Every single station positioned via real Bangkok WGS84 GPS coordinates!
const STATION_LIST = [
  // === BTS SUKHUMVIT LINE (28 stations — full core + extensions) ===
  mkSt('bts_siam',        'bts_sukhumvit', 'CEN', 'Siam',                  'สยาม',                 13.7456, 100.5341, 0,     0,   1.6,  { cbd: true, mallHub: true, interchangeHub: true, startOwned: true }),
  mkSt('bts_chitlom',     'bts_sukhumvit', 'E1',  'Chit Lom',              'ชิดลม',                13.7441, 100.5431, 0,     0,   1.45, { cbd: true, mallHub: true, startOwned: true }),
  mkSt('bts_phloenchit',  'bts_sukhumvit', 'E2',  'Phloen Chit',           'เพลินจิต',              13.7431, 100.5490, 950,   10,  1.3,  { cbd: true }),
  mkSt('bts_nana',        'bts_sukhumvit', 'E3',  'Nana',                  'นานา',                 13.7406, 100.5553, 1650,  14,  1.35, { nightlife: true }),
  mkSt('bts_asok',        'bts_sukhumvit', 'E4',  'Asok',                  'อโศก',                 13.7370, 100.5603, 2800,  20,  1.75, { cbd: true, mallHub: true, interchangeHub: true }),
  mkSt('bts_phromphong',  'bts_sukhumvit', 'E5',  'Phrom Phong',           'พร้อมพงษ์',             13.7305, 100.5698, 4500,  26,  1.5,  { mallHub: true }),
  mkSt('bts_thonglo',     'bts_sukhumvit', 'E6',  'Thong Lo',              'ทองหล่อ',              13.7242, 100.5785, 6800,  34,  1.4,  { nightlife: true }),
  mkSt('bts_ekkamai',     'bts_sukhumvit', 'E7',  'Ekkamai',               'เอกมัย',                13.7195, 100.5852, 9200,  40,  1.3),
  mkSt('bts_phrakhanong', 'bts_sukhumvit', 'E8',  'Phra Khanong',          'พระโขนง',              13.7152, 100.5914, 12500, 46,  1.25),
  mkSt('bts_onnut',       'bts_sukhumvit', 'E9',  'On Nut',                'อ่อนนุช',               13.7057, 100.6010, 16500, 54,  1.35),
  mkSt('bts_udomsuk',     'bts_sukhumvit', 'E12', 'Udom Suk',              'อุดมสุข',               13.6800, 100.6096, 21000, 62,  1.25),
  mkSt('bts_bangna',      'bts_sukhumvit', 'E13', 'Bang Na',               'บางนา',                13.6682, 100.6048, 26000, 70,  1.25),
  mkSt('bts_bearing',     'bts_sukhumvit', 'E14', 'Bearing',               'แบริ่ง',                13.6611, 100.6020, 32000, 78,  1.25),
  mkSt('bts_samrong',     'bts_sukhumvit', 'E15', 'Samrong',               'สำโรง',                13.6461, 100.5961, 39000, 88,  1.4,  { interchangeHub: true }),
  mkSt('bts_paknam',      'bts_sukhumvit', 'E19', 'Pak Nam',               'ปากน้ำ',                13.5998, 100.5978, 48000, 98,  1.25),
  mkSt('bts_kheha',       'bts_sukhumvit', 'E23', 'Kheha',                 'เคหะฯ',                13.5750, 100.6078, 58000, 110, 1.3),

  mkSt('bts_ratchathewi', 'bts_sukhumvit', 'N1',  'Ratchathewi',           'ราชเทวี',               13.7519, 100.5316, 1100,  12,  1.25),
  mkSt('bts_phayathai',   'bts_sukhumvit', 'N2',  'Phaya Thai',            'พญาไท',                13.7569, 100.5337, 2600,  22,  1.55, { interchangeHub: true }),
  mkSt('bts_victory',     'bts_sukhumvit', 'N3',  'Victory Monument',      'อนุสาวรีย์ชัยสมรภูมิ',    13.7627, 100.5371, 4200,  28,  1.6,  { cbd: true }),
  mkSt('bts_sanampao',    'bts_sukhumvit', 'N4',  'Sanam Pao',             'สนามเป้า',              13.7725, 100.5421, 6200,  34,  1.25),
  mkSt('bts_ari',         'bts_sukhumvit', 'N5',  'Ari',                   'อารีย์',                13.7796, 100.5446, 8600,  40,  1.35),
  mkSt('bts_saphankhwai', 'bts_sukhumvit', 'N7',  'Saphan Khwai',          'สะพานควาย',            13.7936, 100.5497, 11800, 48,  1.35),
  mkSt('bts_mochit',      'bts_sukhumvit', 'N8',  'Mo Chit',               'หมอชิต',               13.8025, 100.5538, 15500, 58,  1.8,  { marketHub: true, interchangeHub: true }),
  mkSt('bts_hayaek',      'bts_sukhumvit', 'N9',  'Ha Yaek Lat Phrao',     'ห้าแยกลาดพร้าว',        13.8165, 100.5612, 21000, 68,  1.6,  { mallHub: true, interchangeHub: true }),
  mkSt('bts_kasetsart',   'bts_sukhumvit', 'N13', 'Kasetsart University',  'มหาวิทยาลัยเกษตรศาสตร์', 13.8414, 100.5741, 29000, 80,  1.4),
  mkSt('bts_watphrasri',  'bts_sukhumvit', 'N17', 'Wat Phra Sri Mahathat', 'วัดพระศรีมหาธาตุ',       13.8753, 100.5968, 39000, 92,  1.5,  { interchangeHub: true }),
  mkSt('bts_korporor',    'bts_sukhumvit', 'N23', 'Yaek Kor Por Aor',      'แยก คปอ.',              13.9255, 100.6254, 49000, 104, 1.3),
  mkSt('bts_khukhot',     'bts_sukhumvit', 'N24', 'Khu Khot',              'คูคต',                 13.9324, 100.6462, 62000, 118, 1.3),

  // === BTS SILOM LINE (ALL 14 REAL STATIONS!) ===
  mkSt('silom_siam',          'bts_silom', 'CEN', 'Siam (Silom)',       'สยาม (สายสีลม)',  13.7456, 100.5341, 0,     0,   1.4,  { cbd: true, mallHub: true, startOwned: true, oz: 2.2 }),
  mkSt('silom_natstad',       'bts_silom', 'W1',  'National Stadium',   'สนามกีฬาแห่งชาติ', 13.7465, 100.5290, 2200,  18,  1.4,  { mallHub: true }),
  mkSt('silom_ratchadamri',   'bts_silom', 'S1',  'Ratchadamri',        'ราชดำริ',         13.7393, 100.5394, 2400,  20,  1.3,  { cbd: true }),
  mkSt('silom_saladaeng',     'bts_silom', 'S2',  'Sala Daeng',         'ศาลาแดง',        13.7285, 100.5342, 4800,  32,  1.65, { cbd: true, interchangeHub: true }),
  mkSt('silom_chongnonsi',    'bts_silom', 'S3',  'Chong Nonsi',        'ช่องนนทรี',       13.7237, 100.5294, 7200,  40,  1.6,  { cbd: true, interchangeHub: true }),
  mkSt('silom_saintlouis',    'bts_silom', 'S4',  'Saint Louis',        'เซนต์หลุยส์',     13.7216, 100.5245, 9600,  46,  1.3,  { cbd: true }),
  mkSt('silom_surasak',       'bts_silom', 'S5',  'Surasak',            'สุรศักดิ์',        13.7192, 100.5194, 12400, 52,  1.3),
  mkSt('silom_saphantaksin',  'bts_silom', 'S6',  'Saphan Taksin',      'สะพานตากสิน',    13.7188, 100.5141, 16500, 60,  1.65, { interchangeHub: true }),
  mkSt('silom_krungthonburi', 'bts_silom', 'S7',  'Krung Thon Buri',    'กรุงธนบุรี',       13.7209, 100.5026, 21000, 68,  1.45, { interchangeHub: true }),
  mkSt('silom_wongwianyai',   'bts_silom', 'S8',  'Wongwian Yai',       'วงเวียนใหญ่',     13.7212, 100.4953, 25500, 74,  1.35),
  mkSt('silom_phonimit',      'bts_silom', 'S9',  'Pho Nimit',          'โพธิ์นิมิตร',      13.7191, 100.4860, 29500, 80,  1.25),
  mkSt('silom_talatphlu',     'bts_silom', 'S10', 'Talat Phlu',         'ตลาดพลู',        13.7141, 100.4766, 34000, 88,  1.4,  { interchangeHub: true }),
  mkSt('silom_wutthakat',     'bts_silom', 'S11', 'Wutthakat',          'วุฒากาศ',        13.7132, 100.4690, 39000, 94,  1.3),
  mkSt('silom_bangwa',        'bts_silom', 'S12', 'Bang Wa',            'บางหว้า',         13.7206, 100.4577, 46000, 102, 1.5,  { interchangeHub: true }),

  // === BTS GOLD LINE (ALL 3 REAL STATIONS!) ===
  mkSt('gold_ktb',       'bts_gold', 'G1', 'Krung Thon Buri (Gold)',    'กรุงธนบุรี (สีทอง)',   13.7209, 100.5026, 0,     0,  1.2, { ox: 0.4, oz: -2.2 }),
  mkSt('gold_iconsiam',  'bts_gold', 'G2', 'Charoen Nakhon (ICONSIAM)', 'เจริญนคร (ไอคอนสยาม)', 13.7267, 100.5091, 24000, 58, 1.95, { mallHub: true, interchangeHub: true }),
  mkSt('gold_khlongsan', 'bts_gold', 'G3', 'Khlong San',                'คลองสาน',             13.7305, 100.5082, 31000, 68, 1.3),

  // === MRT BLUE LINE (ALL 38 REAL STATIONS — INCLUDING KHLONG TOEI COCO PARC & SANAM CHAI SUANKULARB SCHOOL!) ===
  mkSt('mrt_sukhumvit',     'mrt_blue', 'BL22', 'Sukhumvit',             'สุขุมวิท',                 13.7370, 100.5603, 0,     0,   1.65, { cbd: true, oz: 2.3 }),
  mkSt('mrt_qsncc',         'mrt_blue', 'BL23', 'Queen Sirikit NCC',     'ศูนย์การประชุมแห่งชาติสิริกิติ์', 13.7235, 100.5602, 4200,  22,  1.5,  { cbd: true }),
  mkSt('mrt_khlongtoei',    'mrt_blue', 'BL24', 'Khlong Toei',           'คลองเตย',                 13.7222, 100.5542, 5800,  28,  1.75, { cbd: true, featured: true }),
  mkSt('mrt_lumphini',      'mrt_blue', 'BL25', 'Lumphini',              'ลุมพินี',                  13.7255, 100.5458, 7600,  34,  1.6,  { cbd: true }),
  mkSt('mrt_silom',         'mrt_blue', 'BL26', 'Si Lom',                'สีลม',                    13.7294, 100.5364, 9800,  40,  1.7,  { cbd: true, interchangeHub: true }),
  mkSt('mrt_samyan',        'mrt_blue', 'BL27', 'Sam Yan',               'สามย่าน',                 13.7327, 100.5293, 12400, 46,  1.5,  { mallHub: true }),
  mkSt('mrt_hualamphong',   'mrt_blue', 'BL28', 'Hua Lamphong',          'หัวลำโพง',                13.7376, 100.5171, 15500, 52,  1.55),
  mkSt('mrt_watmangkon',    'mrt_blue', 'BL29', 'Wat Mangkon',           'วัดมังกร',                13.7438, 100.5085, 18500, 58,  1.75, { marketHub: true }),
  mkSt('mrt_samyot',        'mrt_blue', 'BL30', 'Sam Yot',               'สามยอด',                  13.7471, 100.5022, 21500, 64,  1.55),
  mkSt('mrt_sanamchai',     'mrt_blue', 'BL31', 'Sanam Chai',            'สนามไชย',                13.7443, 100.4947, 25000, 70,  1.85, { featured: true, interchangeHub: true }),
  mkSt('mrt_itsaraphap',    'mrt_blue', 'BL32', 'Itsaraphap',            'อิสรภาพ',                 13.7365, 100.4853, 28500, 76,  1.35),
  mkSt('mrt_thaphra',       'mrt_blue', 'BL01', 'Tha Phra',              'ท่าพระ',                  13.7296, 100.4743, 33000, 84,  1.5,  { interchangeHub: true }),
  mkSt('mrt_charan13',      'mrt_blue', 'BL02', 'Charan 13',             'จรัญฯ 13',                13.7405, 100.4706, 36000, 88,  1.25),
  mkSt('mrt_faichai',       'mrt_blue', 'BL03', 'Fai Chai',              'ไฟฉาย',                  13.7518, 100.4694, 39000, 92,  1.25),
  mkSt('mrt_bangkhunnon',   'mrt_blue', 'BL04', 'Bang Khun Non',         'บางขุนนนท์',              13.7634, 100.4742, 42000, 96,  1.35),
  mkSt('mrt_bangyikhan',    'mrt_blue', 'BL05', 'Bang Yi Khan',          'บางยี่ขัน',                13.7767, 100.4864, 45000, 100, 1.3),
  mkSt('mrt_sirindhorn',    'mrt_blue', 'BL06', 'Sirindhorn',            'สิรินธร',                 13.7858, 100.4949, 48000, 104, 1.3),
  mkSt('mrt_bangphlat',     'mrt_blue', 'BL07', 'Bang Phlat',            'บางพลัด',                 13.7924, 100.5042, 51000, 108, 1.25),
  mkSt('mrt_bango',         'mrt_blue', 'BL08', 'Bang O',                'บางอ้อ',                  13.7988, 100.5112, 54000, 112, 1.25),
  mkSt('mrt_bangpho',       'mrt_blue', 'BL09', 'Bang Pho',              'บางโพ',                   13.8062, 100.5221, 57000, 116, 1.3),
  mkSt('mrt_taopoon',       'mrt_blue', 'BL10', 'Tao Poon',              'เตาปูน',                  13.8063, 100.5308, 61000, 120, 1.6,  { interchangeHub: true }),
  mkSt('mrt_bangsue',       'mrt_blue', 'BL11', 'Bang Sue',              'บางซื่อ',                 13.8027, 100.5389, 55000, 114, 1.8,  { interchangeHub: true }),
  mkSt('mrt_kamphaengphet', 'mrt_blue', 'BL12', 'Kamphaeng Phet',        'กำแพงเพชร',               13.7988, 100.5484, 34000, 82,  1.6,  { marketHub: true }),
  mkSt('mrt_chatuchak',     'mrt_blue', 'BL13', 'Chatuchak Park',        'สวนจตุจักร',               13.8025, 100.5538, 28000, 74,  1.75, { marketHub: true, interchangeHub: true, ox: 2.3 }),
  mkSt('mrt_paholyothin',   'mrt_blue', 'BL14', 'Phahon Yothin',         'พหลโยธิน',                13.8130, 100.5610, 23500, 68,  1.55, { mallHub: true }),
  mkSt('mrt_latphrao',      'mrt_blue', 'BL15', 'Lat Phrao',             'ลาดพร้าว',                13.8062, 100.5734, 19500, 62,  1.55, { interchangeHub: true }),
  mkSt('mrt_ratchada',      'mrt_blue', 'BL16', 'Ratchadaphisek',        'รัชดาภิเษก',               13.7988, 100.5747, 17000, 56,  1.35),
  mkSt('mrt_sutthisan',     'mrt_blue', 'BL17', 'Sutthisan',             'สุทธิสาร',                13.7897, 100.5742, 14800, 52,  1.35),
  mkSt('mrt_huaikhwang',    'mrt_blue', 'BL18', 'Huai Khwang',           'ห้วยขวาง',                13.7783, 100.5736, 12800, 46,  1.5,  { nightlife: true }),
  mkSt('mrt_cultural',      'mrt_blue', 'BL19', 'Thailand Cultural Ctr', 'ศูนย์วัฒนธรรมฯ',           13.7657, 100.5700, 10800, 42,  1.5,  { mallHub: true }),
  mkSt('mrt_rama9',         'mrt_blue', 'BL20', 'Phra Ram 9',            'พระราม 9',                13.7577, 100.5653, 8200,  34,  1.7,  { cbd: true, mallHub: true }),
  mkSt('mrt_phetchaburi',   'mrt_blue', 'BL21', 'Phetchaburi',           'เพชรบุรี',                 13.7491, 100.5632, 5200,  24,  1.55, { cbd: true, interchangeHub: true }),
  // MRT Blue Western Branch (Tha Phra -> Bang Wa -> Lak Song!)
  mkSt('mrt_bangphai',      'mrt_blue', 'BL33', 'Bang Phai',             'บางไผ่',                  13.7244, 100.4658, 38000, 90,  1.25),
  mkSt('mrt_bangwa',        'mrt_blue', 'BL34', 'Bang Wa (MRT)',         'บางหว้า (MRT)',            13.7206, 100.4577, 43000, 96,  1.45, { oz: -2.2 }),
  mkSt('mrt_phetkasem48',   'mrt_blue', 'BL35', 'Phetkasem 48',          'เพชรเกษม 48',             13.7160, 100.4488, 48000, 102, 1.25),
  mkSt('mrt_phasicharoen',  'mrt_blue', 'BL36', 'Phasi Charoen',         'ภาษีเจริญ',               13.7131, 100.4368, 53000, 108, 1.45, { mallHub: true }),
  mkSt('mrt_bangkae',       'mrt_blue', 'BL37', 'Bang Khae',             'บางแค',                   13.7124, 100.4227, 58000, 114, 1.35),
  mkSt('mrt_laksong',       'mrt_blue', 'BL38', 'Lak Song',              'หลักสอง',                 13.7109, 100.4095, 65000, 122, 1.55, { mallHub: true }),

  // === MRT PURPLE LINE ===
  mkSt('pp_taopoon',        'mrt_purple', 'PP16', 'Tao Poon (Purple)',       'เตาปูน (สีม่วง)',       13.8063, 100.5308, 0,     0,   1.35, { ox: -2.1, oz: -1.6 }),
  mkSt('pp_wongsawang',     'mrt_purple', 'PP14', 'Wong Sawang',             'วงศ์สว่าง',             13.8295, 100.5276, 48000, 90,  1.3),
  mkSt('pp_moph',           'mrt_purple', 'PP12', 'Ministry of Health',      'กระทรวงสาธารณสุข',      13.8485, 100.5150, 54000, 98,  1.35),
  mkSt('pp_nonthaburi',     'mrt_purple', 'PP11', 'Nonthaburi Civic Ctr',    'ศูนย์ราชการนนทบุรี',     13.8599, 100.5136, 62000, 108, 1.6,  { interchangeHub: true }),
  mkSt('pp_phranangklao',   'mrt_purple', 'PP08', 'Phra Nang Klao Bridge',   'สะพานพระนั่งเกล้า',     13.8698, 100.4831, 69000, 118, 1.35),
  mkSt('pp_westgate',       'mrt_purple', 'PP02', 'Talad Bang Yai (WestGate)','ตลาดบางใหญ่',          13.8794, 100.4119, 78000, 128, 1.65, { mallHub: true }),
  mkSt('pp_khlongbangphai', 'mrt_purple', 'PP01', 'Khlong Bang Phai',        'คลองบางไผ่',            13.8965, 100.4079, 88000, 138, 1.35),

  // === MRT YELLOW LINE (MONORAIL) ===
  mkSt('yl_latphrao',      'mrt_yellow', 'YL01', 'Lat Phrao (Monorail)', 'ลาดพร้าว (สีเหลือง)', 13.8062, 100.5734, 0,     0,   1.35, { ox: 2.3 }),
  mkSt('yl_chokchai4',     'mrt_yellow', 'YL04', 'Chok Chai 4',          'โชคชัย 4',           13.7959, 100.5944, 29000, 68,  1.35),
  mkSt('yl_bangkapi',      'mrt_yellow', 'YL08', 'Bang Kapi',            'บางกะปิ',            13.7664, 100.6435, 36000, 78,  1.55, { mallHub: true }),
  mkSt('yl_huamak',        'mrt_yellow', 'YL11', 'Hua Mak (Yellow)',     'หัวหมาก (สีเหลือง)',  13.7376, 100.6448, 44000, 88,  1.55, { interchangeHub: true, ox: 2.2 }),
  mkSt('yl_srinagarindra', 'mrt_yellow', 'YL16', 'Suan Luang Rama IX',   'สวนหลวง ร.9',        13.6941, 100.6475, 52000, 98,  1.5,  { mallHub: true }),
  mkSt('yl_sriiam',        'mrt_yellow', 'YL17', 'Si Iam (Bang Na-Trat)','ศรีเอี่ยม',           13.6660, 100.6441, 60000, 108, 1.35),
  mkSt('yl_samrong',       'mrt_yellow', 'YL23', 'Samrong (Yellow)',     'สำโรง (สีเหลือง)',    13.6461, 100.5961, 68000, 118, 1.45, { ox: 2.4 }),

  // === MRT PINK LINE (MONORAIL) ===
  mkSt('pk_nonthaburi',     'mrt_pink', 'PK01', 'Nonthaburi (Pink)',       'ศูนย์ราชการฯ (สีชมพู)', 13.8599, 100.5136, 56000, 96,  1.4,  { oz: -2.2 }),
  mkSt('pk_pakkret',        'mrt_pink', 'PK06', 'Pak Kret Bypass',         'เลี่ยงเมืองปากเกร็ด',   13.9022, 100.5262, 52000, 92,  1.35),
  mkSt('pk_chaengwatthana', 'mrt_pink', 'PK11', 'Chaeng Watthana / IMPACT','แจ้งวัฒนะ / อิมแพ็ค',   13.8965, 100.5515, 48000, 88,  1.65),
  mkSt('pk_laksi',          'mrt_pink', 'PK14', 'Lak Si (Pink)',           'หลักสี่ (สีชมพู)',      13.8868, 100.5798, 44000, 84,  1.5,  { interchangeHub: true }),
  mkSt('pk_watphrasri',     'mrt_pink', 'PK16', 'Wat Phra Sri (Pink)',     'วัดพระศรีฯ (สีชมพู)',   13.8753, 100.5968, 0,     0,   1.4,  { ox: 2.3 }),
  mkSt('pk_fashion',        'mrt_pink', 'PK23', 'Fashion Island',          'แฟชั่นไอส์แลนด์',        13.8256, 100.6788, 62000, 110, 1.6,  { mallHub: true }),
  mkSt('pk_minburi',        'mrt_pink', 'PK30', 'Min Buri',                'มีนบุรี',               13.8108, 100.7315, 76000, 128, 1.4),

  // === AIRPORT RAIL LINK (ALL 8 REAL STATIONS!) ===
  mkSt('arl_phayathai',    'arl', 'A8', 'Phaya Thai (ARL)',    'พญาไท (ARL)',        13.7569, 100.5337, 0,     0,   1.55, { ox: 2.2, oz: -0.8 }),
  mkSt('arl_ratchaprarop', 'arl', 'A7', 'Ratchaprarop',        'ราชปรารภ',           13.7551, 100.5419, 8500,  32,  1.5,  { marketHub: true }),
  mkSt('arl_makkasan',     'arl', 'A6', 'Makkasan City Air',   'มักกะสัน',            13.7510, 100.5612, 14500, 46,  1.7,  { interchangeHub: true }),
  mkSt('arl_ramkhamhaeng', 'arl', 'A5', 'Ramkhamhaeng',        'รามคำแหง',           13.7429, 100.6001, 22000, 60,  1.5),
  mkSt('arl_huamak',       'arl', 'A4', 'Hua Mak (ARL)',       'หัวหมาก (ARL)',       13.7376, 100.6448, 32000, 74,  1.6,  { interchangeHub: true }),
  mkSt('arl_banthapchang', 'arl', 'A3', 'Ban Thap Chang',      'บ้านทับช้าง',         13.7329, 100.6913, 42000, 88,  1.35),
  mkSt('arl_latkrabang',   'arl', 'A2', 'Lat Krabang',         'ลาดกระบัง',           13.7277, 100.7484, 54000, 102, 1.45),
  mkSt('arl_suvarnabhumi', 'arl', 'A1', 'Suvarnabhumi Airport','ท่าอากาศยานสุวรรณภูมิ', 13.6980, 100.7521, 78000, 138, 2.5,  { interchangeHub: true }),

  // === SRT RED LINES (DARK RED & LIGHT RED RAILWAYS) ===
  mkSt('srt_aphiwat',    'srt_red', 'RN01', 'Krung Thep Aphiwat', 'สถานีกลางกรุงเทพอภิวัฒน์', 13.8040, 100.5418, 0,     0,   1.95, { interchangeHub: true, oz: -2.2 }),
  mkSt('srt_chatuchak',  'srt_red', 'RN02', 'Chatuchak (SRT)',    'จตุจักร (สายสีแดง)',      13.8203, 100.5542, 42000, 80,  1.45),
  mkSt('srt_watsemsian', 'srt_red', 'RN03', 'Wat Samian Nari',    'วัดเสมียนนารี',           13.8415, 100.5612, 48000, 88,  1.35),
  mkSt('srt_laksi',      'srt_red', 'RN06', 'Lak Si (SRT)',       'หลักสี่ (สายสีแดง)',      13.8868, 100.5798, 56000, 98,  1.55, { interchangeHub: true, oz: -2.2 }),
  mkSt('srt_donmueang',  'srt_red', 'RN08', 'Don Mueang Airport', 'สนามบินดอนเมือง',         13.9132, 100.5985, 74000, 126, 2.25),
  mkSt('srt_rangsit',    'srt_red', 'RN10', 'Rangsit',            'รังสิต',                  13.9905, 100.6018, 92000, 148, 1.6,  { mallHub: true }),
  mkSt('srt_bangbamru',  'srt_red', 'RW02', 'Bang Bamru',         'บางบำหรุ',                13.7924, 100.4795, 48000, 90,  1.35),
  mkSt('srt_talingchan', 'srt_red', 'RW03', 'Taling Chan',        'ตลิ่งชัน',                13.7885, 100.4435, 62000, 108, 1.4,  { marketHub: true }),

  // === BANGKOK BRT (RAMA III DEDICATED BUSWAY) ===
  mkSt('brt_sathorn',     'brt', 'B1',  'Sathorn (BRT)',        'สาทร (BRT)',          13.7224, 100.5300, 0,     0,  1.35, { cbd: true, oz: 2.0 }),
  mkSt('brt_technic',     'brt', 'B3',  'Technic Krungthep',    'เทคนิคกรุงเทพ',        13.7124, 100.5356, 11000, 34, 1.25),
  mkSt('brt_nararam3',    'brt', 'B5',  'Nara-Ram III',         'นราราม 3',            13.6996, 100.5372, 15500, 42, 1.3),
  mkSt('brt_rama3',       'brt', 'B7',  'Charoen Rat (Rama III)','เจริญราษฎร์ (พระราม 3)', 13.6884, 100.5174, 21000, 50, 1.5,  { mallHub: true }),
  mkSt('brt_watdokmai',   'brt', 'B9',  'Wat Dokmai',           'วัดดอกไม้',            13.6844, 100.5015, 26500, 58, 1.25),
  mkSt('brt_ratchaphruek','brt', 'B12', 'Ratchaphruek (BRT)',   'ราชพฤกษ์ (BRT)',       13.7141, 100.4766, 32000, 68, 1.4,  { oz: 2.2 }),

  // === CHAO PHRAYA EXPRESS BOAT (INCLUDING RAJINEE PIER RIGHT BY SUANKULARB SCHOOL!) ===
  mkSt('boat_asiatique',  'chao_phraya_boat', 'S3',  'Asiatique Pier',     'ท่าเอเชียทีค',      13.7042, 100.5032, 18000, 42, 1.7,  { mallHub: true, nightlife: true }),
  mkSt('boat_sathorn',    'chao_phraya_boat', 'CEN', 'Sathorn Central Pier','ท่าสาทร (ตากสิน)', 13.7188, 100.5122, 0,     0,  1.65),
  mkSt('boat_iconsiam',   'chao_phraya_boat', 'N2',  'ICONSIAM Pier',      'ท่าไอคอนสยาม',     13.7267, 100.5108, 16500, 38, 1.9,  { mallHub: true }),
  mkSt('boat_siphraya',   'chao_phraya_boat', 'N3',  'Si Phraya Pier',     'ท่าสี่พระยา',       13.7302, 100.5130, 21000, 46, 1.4),
  mkSt('boat_ratchawong', 'chao_phraya_boat', 'N5',  'Ratchawong Pier',    'ท่าราชวงศ์',        13.7383, 100.5042, 26000, 54, 1.5,  { marketHub: true }),
  mkSt('boat_rajinee',    'chao_phraya_boat', 'N7',  'Rajinee / Memorial Pier','ท่าราชินี (ปากคลอง)', 13.7426, 100.4945, 30000, 60, 1.65, { marketHub: true }),
  mkSt('boat_thatien',    'chao_phraya_boat', 'N8',  'Tha Tien (Wat Arun)','ท่าเตียน (วัดอรุณ)',13.7463, 100.4912, 34000, 66, 1.9),
  mkSt('boat_phraarthit', 'chao_phraya_boat', 'N13', 'Phra Arthit Pier',   'ท่าพระอาทิตย์',     13.7634, 100.4944, 41000, 76, 1.6,  { nightlife: true }),
  mkSt('boat_nonthaburi', 'chao_phraya_boat', 'N30', 'Nonthaburi Pier',    'ท่าน้ำนนทบุรี',     13.8424, 100.4908, 52000, 90, 1.5),

  // === ENDGAME BONUS: BANGKOK EV CITY BUSES ===
  mkSt('bus_sanamluang', 'bkk_bus', 'B-01',  'Sanam Luang Bus Hub',  'ท่ารถสนามหลวง',       13.7556, 100.4932, 32000, 34, 1.65),
  mkSt('bus_victory',    'bkk_bus', 'B-08',  'Victory Mon. Bus Ring','เกาะพญาไท อนุสาวรีย์ฯ',13.7642, 100.5382, 28000, 30, 1.8 ),
  mkSt('bus_siam',       'bkk_bus', 'B-15',  'Siam Square Bus Stop', 'ป้ายสยามสแควร์',      13.7440, 100.5345, 0,     0,  1.85),
  mkSt('bus_pratunam',   'bkk_bus', 'B-73',  'Pratunam Market Stop', 'ป้ายประตูน้ำ',        13.7506, 100.5405, 25000, 26, 1.75, { marketHub: true }),
  mkSt('bus_asok',       'bkk_bus', 'B-38',  'Asok Montri Bus Stop', 'ป้ายอโศกมนตรี',       13.7392, 100.5612, 28000, 30, 1.7 ),
  mkSt('bus_khlongtoei', 'bkk_bus', 'B-47',  'Khlong Toei Rama IV',  'ป้ายคลองเตย พระราม 4',13.7204, 100.5562, 32000, 34, 1.7 ),
  mkSt('bus_ekkamai',    'bkk_bus', 'B-511', 'Ekkamai Bus Terminal', 'ขนส่งเอกมัย',         13.7198, 100.5844, 38000, 40, 1.85),
];

export const STATIONS = Object.fromEntries(STATION_LIST.map((s) => [s.id, s]));

// Physical 3D Skywalks / Transfer Tunnels connecting lines!
// AUTOMATICALLY unlock & construct as soon as you build either connecting station!
export const INTERCHANGES = [
  { id: 'ic_siam',        from: 'bts_siam',           to: 'silom_siam',         name: 'Siam Cross-Platform Skywalk', cost: 0, type: 'skywalk', bonus: 0.22, startBuilt: true },
  { id: 'ic_asok',        from: 'bts_asok',           to: 'mrt_sukhumvit',      name: 'Asok–Sukhumvit Skywalk',      cost: 0, type: 'skywalk', bonus: 0.25 },
  { id: 'ic_saladaeng',   from: 'silom_saladaeng',    to: 'mrt_silom',          name: 'Sala Daeng–Si Lom Skywalk',   cost: 0, type: 'skywalk', bonus: 0.22 },
  { id: 'ic_phayathai',   from: 'bts_phayathai',      to: 'arl_phayathai',      name: 'Phaya Thai ARL Skywalk',      cost: 0, type: 'skywalk', bonus: 0.25 },
  { id: 'ic_chongnonsi',  from: 'silom_chongnonsi',   to: 'brt_sathorn',        name: 'Chong Nonsi–BRT Skywalk',     cost: 0, type: 'skywalk', bonus: 0.20 },
  { id: 'ic_makkasan',    from: 'mrt_phetchaburi',    to: 'arl_makkasan',       name: 'Phetchaburi–Makkasan Link',   cost: 0, type: 'skywalk', bonus: 0.22 },
  { id: 'ic_taksin_boat', from: 'silom_saphantaksin', to: 'boat_sathorn',       name: 'Sathorn Pier Walkway',        cost: 0, type: 'pier',    bonus: 0.24 },
  { id: 'ic_sanam_boat',  from: 'mrt_sanamchai',      to: 'boat_rajinee',       name: 'Sanam Chai–Rajinee Pier Link',cost: 0, type: 'pier',    bonus: 0.22 },
  { id: 'ic_ktb_gold',    from: 'silom_krungthonburi',to: 'gold_ktb',           name: 'Krung Thon Buri Gold Link',   cost: 0, type: 'skywalk', bonus: 0.20 },
  { id: 'ic_iconsiam_b',  from: 'gold_iconsiam',      to: 'boat_iconsiam',      name: 'ICONSIAM Riverfront Pier',    cost: 0, type: 'pier',    bonus: 0.26 },
  { id: 'ic_mochit',      from: 'bts_mochit',         to: 'mrt_chatuchak',      name: 'Mo Chit–Chatuchak Link',      cost: 0, type: 'skywalk', bonus: 0.22 },
  { id: 'ic_hayaek',      from: 'bts_hayaek',         to: 'mrt_paholyothin',    name: 'Ha Yaek Lat Phrao Skywalk',   cost: 0, type: 'skywalk', bonus: 0.20 },
  { id: 'ic_latphrao_y',  from: 'mrt_latphrao',       to: 'yl_latphrao',        name: 'Lat Phrao Monorail Transfer', cost: 0, type: 'skywalk', bonus: 0.22 },
  { id: 'ic_huamak_y',    from: 'arl_huamak',         to: 'yl_huamak',          name: 'Hua Mak ARL–Yellow Link',     cost: 0, type: 'skywalk', bonus: 0.20 },
  { id: 'ic_samrong_y',   from: 'bts_samrong',        to: 'yl_samrong',         name: 'Samrong Skywalk',             cost: 0, type: 'skywalk', bonus: 0.20 },
  { id: 'ic_talatphlu',   from: 'silom_talatphlu',    to: 'brt_ratchaphruek',   name: 'Talat Phlu–BRT Link',         cost: 0, type: 'skywalk', bonus: 0.18 },
  { id: 'ic_bangwa',      from: 'silom_bangwa',       to: 'mrt_bangwa',         name: 'Bang Wa Skywalk',             cost: 0, type: 'skywalk', bonus: 0.20 },
  { id: 'ic_taopoon',     from: 'mrt_taopoon',        to: 'pp_taopoon',         name: 'Tao Poon Blue–Purple Hall',   cost: 0, type: 'skywalk', bonus: 0.24 },
  { id: 'ic_bangsue',     from: 'mrt_bangsue',        to: 'srt_aphiwat',        name: 'Bang Sue–Aphiwat Concourse',  cost: 0, type: 'tunnel',  bonus: 0.30 },
  { id: 'ic_watphrasri',  from: 'bts_watphrasri',     to: 'pk_watphrasri',      name: 'Wat Phra Sri Pink Link',      cost: 0, type: 'skywalk', bonus: 0.22 },
  { id: 'ic_nonthaburi',  from: 'pp_nonthaburi',      to: 'pk_nonthaburi',      name: 'Nonthaburi Civic Skywalk',    cost: 0, type: 'skywalk', bonus: 0.20 },
  { id: 'ic_laksi',       from: 'srt_laksi',          to: 'pk_laksi',           name: 'Lak Si Rail–Monorail Link',   cost: 0, type: 'skywalk', bonus: 0.20 },
];

export const LINE_BY_ID = Object.fromEntries(LINES.map((l) => [l.id, l]));

export const STATION_NEIGHBORS = {};
for (const stId of Object.keys(STATIONS)) {
  STATION_NEIGHBORS[stId] = [];
}
for (const line of LINES) {
  const arr = line.stations;
  for (let i = 0; i < arr.length - 1; i++) {
    STATION_NEIGHBORS[arr[i]].push(arr[i + 1]);
    STATION_NEIGHBORS[arr[i + 1]].push(arr[i]);
  }
  if (line.isLoop && arr.length > 2) {
    STATION_NEIGHBORS[arr[0]].push(arr[arr.length - 1]);
    STATION_NEIGHBORS[arr[arr.length - 1]].push(arr[0]);
  }
  if (line.extraBranches) {
    for (const [a, b] of line.extraBranches) {
      STATION_NEIGHBORS[a].push(b);
      STATION_NEIGHBORS[b].push(a);
    }
  }
}

export function getCoreRailStationIds() {
  return Object.values(STATIONS)
    .filter((s) => LINE_BY_ID[s.lineId].isCoreRail)
    .map((s) => s.id);
}

// Compute real track tangent orientation for any station so 3D station platforms align along their rails!
export function getStationTrackAngle(stationId) {
  const st = STATIONS[stationId];
  const nbs = STATION_NEIGHBORS[stationId] || [];
  if (!st || !nbs.length) return 0;
  let dx = 0;
  let dz = 0;
  if (nbs.length >= 2) {
    const a = STATIONS[nbs[0]];
    const b = STATIONS[nbs[1]];
    dx = b.x - a.x;
    dz = b.z - a.z;
  } else {
    const a = STATIONS[nbs[0]];
    dx = a.x - st.x;
    dz = a.z - st.z;
  }
  if (Math.hypot(dx, dz) < 0.01) return 0;
  // Station platform length is built along local X axis -> rotate so local X points along (dx, dz)!
  return Math.atan2(-dz, dx);
}

// Real Chao Phraya River centerline GPS coordinates (Nonthaburi -> Rama VIII -> Wat Arun -> ICONSIAM -> Taksin -> Asiatique -> Bang Kachao -> Pak Nam!)
const CHAO_PHRAYA_GPS = [
  [13.912, 100.491], [13.868, 100.483], [13.842, 100.489], [13.809, 100.514],
  [13.788, 100.510], [13.769, 100.497], [13.758, 100.489], [13.745, 100.490],
  [13.739, 100.498], [13.731, 100.512], [13.722, 100.513], [13.704, 100.502],
  [13.688, 100.507], [13.683, 100.532], [13.702, 100.556], [13.707, 100.585],
  [13.675, 100.592], [13.628, 100.588], [13.595, 100.591],
];

export const CHAO_PHRAYA_POINTS = CHAO_PHRAYA_GPS.map(([lat, lon]) => {
  const { x, z } = gpsToWorld(lat, lon);
  return [x, z];
});
