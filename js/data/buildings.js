// Real-Life Bangkok Nearby Buildings & Station 7-Eleven Catalog
// Realistic tycoon Baht pricing (CentralWorld = ฿500,000, flagship malls/attractions ฿460K-฿850K,
// condos/hotels ฿160K-฿480K, Suankularb Wittayalai School at exact GPS 13.7434619, 100.498851,
// COCO PARC by Dusit at Khlong Toei, and Station 7-Elevens everywhere!).
// Malls & attractions generate massive extra train customers to their station!

import { STATIONS, gpsToWorld, SUANKULARB_GPS, COCO_PARC_GPS } from './network.js';

// Compute exact world offsets for pinned GPS landmarks
const skPos = gpsToWorld(SUANKULARB_GPS.lat, SUANKULARB_GPS.lon);
const sanamSt = STATIONS.mrt_sanamchai;
const SK_DX = Number((skPos.x - sanamSt.x).toFixed(2));
const SK_DZ = Number((skPos.z - sanamSt.z).toFixed(2));

const cpPos = gpsToWorld(COCO_PARC_GPS.lat, COCO_PARC_GPS.lon);
const ktSt = STATIONS.mrt_khlongtoei;
// Place COCO PARC cleanly beside Khlong Toei MRT exit on its true Rama IV side
const CP_DX = Number((cpPos.x - ktSt.x + 1.9).toFixed(2));
const CP_DZ = Number((cpPos.z - ktSt.z - 2.3).toFixed(2));

// Category pricing & train customer boost tiers
const CATEGORY_PRICE_MULT = {
  mall: 500000,
  attraction: 420000,
  school: 320000,
  hotel: 260000,
  condo: 220000,
  market: 115000,
  restaurant: 48000,
  seven: 28000,
};

// Train customer ridership boost contributed by each building!
export function getBuildingRiderBoost(category, level) {
  if (level <= 0) return 0;
  switch (category) {
    case 'mall':       return 0.65 + (level - 1) * 0.22; // Huge shopper crowds!
    case 'attraction': return 0.60 + (level - 1) * 0.20; // Major Bangkok tourist draw!
    case 'school':     return 0.58 + (level - 1) * 0.19; // Huge daily student commuters!
    case 'market':     return 0.50 + (level - 1) * 0.16; // Bustling market traffic!
    case 'hotel':      return 0.34 + (level - 1) * 0.11;
    case 'condo':      return 0.32 + (level - 1) * 0.11;
    case 'restaurant': return 0.22 + (level - 1) * 0.08;
    case 'seven':      return 0.14 + (level - 1) * 0.05;
    default:           return 0.20 + (level - 1) * 0.07;
  }
}

// Helper for crisp readable building definition
function b(id, name, thai, category, archType, baseCost, dx, dz, extras = {}) {
  // Income scales cleanly with price (~0.75%-1.1% per second so big investments pay off handsomely!)
  const baseIncome = extras.baseIncome ?? Math.max(25, Math.round(baseCost * 0.0082));
  return { id, name, thai, category, archType, baseCost, baseIncome, dx, dz, ...extras };
}

export const STATION_BUILDINGS = {
  // ===== BTS SUKHUMVIT LINE =====
  bts_siam: [
    b('siam_paragon',     'Siam Paragon',           'สยามพารากอน',          'mall',       'siam_paragon', 550000, -3.2, -2.9, { featured: true }),
    b('siam_kempinski',   'Siam Kempinski Hotel',   'สยามเคมปินสกี้',        'hotel',      'hotel_grand',  420000,  2.4, -4.1),
    b('siam_square_one',  'Siam Square One',        'สยามสแควร์วัน',         'mall',       'mall_modern',  340000,  2.9,  3.1),
    b('siam_inter_food',  'Inter Restaurant Siam',  'ร้านอาหารอินเตอร์ สยาม', 'restaurant', 'shophouse',    14000,  -3.5,  2.7),
  ],
  bts_chitlom: [
    b('centralworld',     'CentralWorld',           'เซ็นทรัลเวิลด์',         'mall',       'centralworld', 500000, -2.9, -3.4, { featured: true }), // EXACT ฿500,000!
    b('grand_hyatt',      'Grand Hyatt Erawan',     'แกรนด์ ไฮแอท เอราวัณ',  'hotel',      'hotel_grand',  380000, -2.9,  3.1),
    b('central_chitlom',  'Central Chidlom',        'เซ็นทรัล ชิดลม',        'mall',       'mall_glass',   390000,  2.9, -2.8),
    b('scope_langsuan',   'SCOPE Langsuan Condo',   'สโคป หลังสวน',          'condo',      'condo_sleek',  295000,  2.8,  3.2),
  ],
  bts_phloenchit: [
    b('central_embassy',  'Central Embassy',        'เซ็นทรัล เอ็มบาสซี',     'mall',       'embassy',      480000, -2.7, -3.1),
    b('park_hyatt_bkk',   'Park Hyatt Bangkok',     'พาร์ค ไฮแอท กรุงเทพ',   'hotel',      'hotel_tower',  390000,  2.6, -3.2),
    b('noble_ploenchit',  'Noble Ploenchit Condo',  'โนเบิล เพลินจิต',        'condo',      'condo_twin',   275000,  2.9,  2.9),
    b('namsaah_ploen',    'Ploenchit Thai Kitchen', 'ครัวเพลินจิต',           'restaurant', 'restaurant',   26000,  -2.9,  2.8),
  ],
  bts_nana: [
    b('hyatt_regency_s13','Hyatt Regency Sukhumvit','ไฮแอท รีเจนซี สุขุมวิท', 'hotel',      'hotel_tower',  340000,  2.7, -3.2),
    b('q_sukhumvit',      'Q Sukhumvit Condo',      'คิว สุขุมวิท',           'condo',      'condo_sleek',  285000, -2.8, -2.9),
    b('nana_charcoal',    'Nana Charcoal Grill',    'นานา กริลล์',            'restaurant', 'restaurant',   34000,   2.6,  3.0),
    b('nana_711_soi11',   '7-Eleven Sukhumvit Soi 11','เซเว่น ซอย 11',        'seven',      'seven_eleven', 22000,  -2.7,  2.8),
  ],
  bts_asok: [
    b('terminal_21',      'Terminal 21 Asok',       'เทอร์มินอล 21 อโศก',     'mall',       'terminal21',   460000, -2.9, -3.3, { featured: true }),
    b('ashton_asoke',     'Ashton Asoke Condo',     'แอชตัน อโศก',            'condo',      'ashton_asoke', 320000,  2.9, -3.1),
    b('grande_centre_t21','Grande Centre Point T21','แกรนด์ เซนเตอร์ พอยต์',  'hotel',      'hotel_grand',  360000, -3.1,  2.8),
    b('pier21_food',      'Pier 21 Food Court',     'เพียร์ 21 ฟู้ดคอร์ท',     'restaurant', 'restaurant',   45000,   3.1,  2.6),
  ],
  bts_phromphong: [
    b('emquartier',       'EmQuartier',             'เอ็มควอเทียร์',           'mall',       'emquartier',   520000, -2.9, -3.2, { featured: true }),
    b('emporium',         'The Emporium',           'ดิ เอ็มโพเรียม',          'mall',       'mall_glass',   470000, -2.8,  3.2),
    b('the_marque_s39',   'Marque Sukhumvit Condo', 'มาร์ค สุขุมวิท',         'condo',      'condo_sleek',  310000,  2.9, -2.9),
    b('rung_rueang_nood', 'Rung Rueang Pork Noodle','ก๋วยเตี๋ยวหมูรุ่งเรือง',  'restaurant', 'shophouse',    38000,   2.8,  3.0),
  ],
  bts_thonglo: [
    b('park_origin_tl',   'Park Origin Thonglor',   'พาร์ค ออริจิ้น ทองหล่อ',  'condo',      'park_origin',  340000,  2.7, -3.4),
    b('marriott_s57',     'Bangkok Marriott S57',   'แมริออท สุขุมวิท 57',    'hotel',      'hotel_tower',  365000, -2.9, -3.0),
    b('mae_varee_mango',  'Mae Varee Mango Sticky Rice','แม่วารี ข้าวเหนียวมะม่วง','restaurant','shophouse',  48000,  -2.8,  2.9),
    b('the_commons_tl',   'theCOMMONS Thonglor',    'เดอะ คอมมอนส์ ทองหล่อ',   'mall',       'mall_modern',  290000,  2.9,  2.9),
  ],
  bts_ekkamai: [
    b('gateway_ekkamai',  'Gateway Ekamai',         'เกตเวย์ เอกมัย',          'mall',       'mall_modern',  360000, -2.9,  2.9),
    b('rhythm_ekkamai',   'Rhythm Ekkamai Condo',   'ริทึ่ม เอกมัย',           'condo',      'condo_sleek',  260000,  2.8, -3.1),
    b('wattana_panich',   'Wattana Panich Beef Stew','วัฒนาพานิช เอกมัย',     'restaurant', 'shophouse',    42000,  -2.8, -2.8),
    b('somerset_ekkamai', 'Somerset Ekamai Hotel',  'ซัมเมอร์เซ็ท เอกมัย',     'hotel',      'hotel_tower',  295000,  2.9,  2.8),
  ],
  bts_phrakhanong: [
    b('w_district_pk',    'W District Sky Market',  'ดับเบิลยู ดิสทริค',       'market',     'jodd_fairs',   135000, -2.9,  2.9),
    b('life_sukhumvit48', 'Life Sukhumvit 48 Condo','ไลฟ์ สุขุมวิท 48',        'condo',      'condo_twin',   230000,  2.9, -2.8),
    b('summer_hill_pk',   'Summer Hill Plaza',      'ซัมเมอร์ ฮิลล์',          'mall',       'mall_modern',  270000, -2.9, -2.8),
  ],
  bts_onnut: [
    b('century_onnut',    'Century Movie Plaza On Nut','เซ็นจูรี่ อ่อนนุช',    'mall',       'mall_modern',  320000, -2.8, -3.0),
    b('ideo_mobi_onnut',  'Ideo Mobi Sukhumvit',    'ไอดีโอ โมบิ สุขุมวิท',    'condo',      'condo_twin',   245000,  2.9, -2.8),
    b('avani_sukhumvit',  'Avani Sukhumvit Hotel',  'อวานี สุขุมวิท',          'hotel',      'hotel_tower',  290000,  2.8,  3.1),
    b('onnut_market',     'On Nut Night Market',    'ตลาดนัดอ่อนนุช',          'market',     'market_tent',  98000,  -2.9,  3.0),
  ],
  bts_udomsuk: [
    b('one_udomsuk',      'One Udomsuk Plaza',      'วัน อุดมสุข',             'mall',       'mall_modern',  285000, -2.9, -2.8),
    b('ideo_mix_udomsuk', 'Ideo Blucove Sukhumvit', 'ไอดีโอ อุดมสุข',          'condo',      'condo_sleek',  235000,  2.9,  2.8),
    b('udomsuk_walk',     'Udomsuk Walk Night Food','อุดมสุข วอล์ค',           'market',     'market_tent',  110000, -2.8,  2.9),
  ],
  bts_bangna: [
    b('bitec_bangna',     'BITEC Bangna Exhibition','ไบเทค บางนา',             'attraction', 'qsncc',        460000, -3.2,  2.8),
    b('the_coast_bangna', 'The Coast Bangkok Condo','เดอะ โคสต์ บางนา',        'condo',      'condo_twin',   260000,  2.9, -3.0),
    b('brighton_bangna',  'Brighton Hotel Bangkok', 'โรงแรมไบรท์ตัน บางนา',    'hotel',      'hotel_grand',  275000, -2.8, -3.1),
  ],
  bts_bearing: [
    b('lasalle_avenue',   'Lasalle’s Avenue Mall',  'ลาซาล อเวนิว',            'mall',       'mall_modern',  310000,  2.9, -2.8),
    b('knightsbridge_br', 'KnightsBridge Bearing',  'ไนท์บริดจ์ แบริ่ง',        'condo',      'condo_sleek',  250000, -2.9,  2.8),
    b('bearing_711',      '7-Eleven Sukhumvit 107', 'เซเว่น ซอยแบริ่ง',        'seven',      'seven_eleven', 42000,   2.8,  2.8),
  ],
  bts_samrong: [
    b('imperial_samrong', 'Imperial World Samrong', 'อิมพีเรียล สำโรง',        'mall',       'mall_modern',  390000, -3.0, -2.9),
    b('metropolis_sam',   'The Metropolis Samrong', 'เดอะ เมโทรโพลิส สำโรง',   'condo',      'condo_sleek',  275000,  2.9,  3.0),
    b('samrong_market',   'Samrong Center Market',  'ตลาดเอี่ยมเจริญ สำโรง',    'market',     'market_tent',  135000, -2.9,  3.0),
  ],
  bts_paknam: [
    b('samutprakan_twr',  'Samut Prakan Observation Tower','หอชมเมืองสมุทรปราการ','attraction','victory_mon', 420000, -3.0,  2.8),
    b('paknam_market',    'Pak Nam Fresh Market',   'ตลาดปากน้ำ',              'market',     'market_tent',  140000,  2.9, -2.8),
    b('paknam_condo',     'Pause Condo Sukhumvit 115','พอส คอนโด ปากน้ำ',      'condo',      'condo_sleek',  240000,  2.9,  2.8),
  ],
  bts_kheha: [
    b('miami_bangpu',     'Miami Bayside Bangpu',   'ไมอามี่ บางปู',           'mall',       'mall_modern',  380000, -3.0,  2.8),
    b('sailom_bangpu',    'Sailom Bangpu Seafood',  'สายลม บางปู',             'restaurant', 'restaurant',   120000,  2.9,  2.9),
    b('origin_samut',     'Origin Plug & Play Samut','ออริจิ้น สมุทรปราการ',   'condo',      'condo_sleek',  260000,  2.8, -3.0),
  ],

  bts_ratchathewi: [
    b('asia_hotel_bkk',   'Asia Hotel Bangkok',     'โรงแรมเอเชีย กรุงเทพ',    'hotel',      'hotel_grand',  210000, -2.9,  2.6),
    b('ideo_q_ratcha',    'Ideo Q Ratchathewi',     'ไอดีโอ คิว ราชเทวี',      'condo',      'condo_sleek',  195000,  2.8, -2.7),
    b('coco_walk_food',   'Co-Co Walk Dining Lane', 'โคโค่วอล์ค ราชเทวี',      'restaurant', 'restaurant',   24000,   2.8,  2.6),
  ],
  bts_phayathai: [
    b('the_unicorn_pt',   'Eastin Grand Phayathai', 'อีสติน แกรนด์ พญาไท',     'hotel',      'hotel_tower',  330000, -3.0, -2.7),
    b('ideo_q_pt',        'Ideo Q Phayathai Condo', 'ไอดีโอ คิว พญาไท',        'condo',      'condo_sleek',  240000, -2.9,  2.9),
    b('factory_coffee',   'Factory Coffee Bangkok', 'แฟคทอรี่ คอฟฟี่',         'restaurant', 'shophouse',    32000,   2.9,  2.6),
  ],
  bts_victory: [
    b('victory_obelisk',  'Victory Monument Plaza', 'อนุสาวรีย์ชัยสมรภูมิ',     'attraction', 'victory_mon',  360000, -3.0, -2.8),
    b('center_one_vm',    'Center One Mall',        'เซ็นเตอร์วัน',             'mall',       'mall_modern',  330000,  2.9, -2.6),
    b('pullman_kingpower','Pullman King Power Hotel','พูลแมน คิง เพาเวอร์',     'hotel',      'hotel_grand',  355000,  3.1,  2.9),
    b('boat_noodle_alley','Victory Boat Noodle Alley','ก๋วยเตี๋ยวเรืออนุสาวรีย์ฯ','restaurant','shophouse',   36000,  -2.9,  2.9),
  ],
  bts_sanampao: [
    b('the_seasons_sp',   'The Seasons Mall',       'เดอะ ซีซั่นส์ มอลล์',     'mall',       'mall_modern',  290000,  2.9, -2.7),
    b('rhythm_phahol',    'The Monument Sanampao',  'เดอะ โมนูเมนต์ สนามเป้า', 'condo',      'condo_sleek',  265000, -2.9, -2.7),
    b('sanampao_711',     '7-Eleven Sanam Pao',     'เซเว่น สนามเป้า',         'seven',      'seven_eleven', 34000,  -2.8,  2.7),
  ],
  bts_ari: [
    b('la_villa_ari',     'La Villa Ari',           'ลา วิลล่า อารีย์',        'mall',       'mall_modern',  320000,  2.8, -2.7),
    b('noble_reform_ari', 'Noble Reform Ari Condo', 'โนเบิล รีฟอร์ม อารีย์',    'condo',      'condo_sleek',  255000, -2.9, -2.8),
    b('josh_hotel_ari',   'Josh Hotel Ari',         'จอช โฮเทล อารีย์',        'hotel',      'hotel_tower',  240000, -2.8,  2.9),
    b('lay_lao_ari',      'Lay Lao Isan Seafood',   'เล ลาว อารีย์',           'restaurant', 'restaurant',   44000,   2.9,  2.8),
  ],
  bts_saphankhwai: [
    b('bigc_saphankhwai', 'Big C Saphan Khwai',     'บิ๊กซี สะพานควาย',        'mall',       'mall_modern',  330000,  2.9, -2.7),
    b('the_line_sk',      'The Editor Saphan Khwai','ดิ เอดิเตอร์ สะพานควาย',  'condo',      'condo_sleek',  255000, -2.9,  2.8),
    b('pradipat_roast',   'Pradipat Roast Pork',    'หมูแดงประดิพัทธ์',        'restaurant', 'shophouse',    42000,  -2.8, -2.7),
  ],
  bts_mochit: [
    b('chatuchak_mkt',    'Chatuchak Weekend Market','ตลาดนัดจตุจักร',          'market',     'chatuchak',    380000, -3.2,  2.9, { featured: true }),
    b('the_line_jj',      'The Line Jatujak-Mochit','เดอะ ไลน์ จตุจักร',       'condo',      'condo_twin',   310000,  2.8, -3.1),
    b('mochit_711',       '7-Eleven Chatuchak Gate','เซเว่น ประตูจตุจักร',     'seven',      'seven_eleven', 44000,  -3.1, -2.8),
  ],
  bts_hayaek: [
    b('central_ladprao',  'Central Ladprao',        'เซ็นทรัล ลาดพร้าว',       'mall',       'centralworld', 490000, -3.1, -2.9),
    b('centara_ladprao',  'Centara Grand Ladprao',  'เซ็นทารา แกรนด์ ลาดพร้าว','hotel',      'hotel_grand',  375000,  2.9, -3.0),
    b('life_ladprao',     'Life Ladprao Condo',     'ไลฟ์ ลาดพร้าว',           'condo',      'condo_twin',   285000, -2.9,  2.9),
  ],
  bts_kasetsart: [
    b('maruay_garden',    'Maruay Garden Hotel',    'โรงแรมมารวย การ์เด้น',    'hotel',      'hotel_tower',  295000,  2.9, -2.8),
    b('kave_ku_condo',    'Premio Quinto Kaset Condo','พรีมิโอ ควินโต เกษตร',  'condo',      'condo_sleek',  260000, -2.9, -2.7),
    b('ku_canteen',       'Kaset Fair Campus Market','ตลาดเกษตรแฟร์',          'school',     'market_tent',  210000, -2.9,  2.9),
  ],
  bts_watphrasri: [
    b('knightsbridge_ps', 'KnightsBridge Phaholyothin','ไนท์บริดจ์ พหลโยธิน', 'condo',      'condo_sleek',  275000, -2.9, -2.8),
    b('yingcharoen_mkt',  'Ying Charoen Fresh Market','ตลาดยิ่งเจริญ',         'market',     'market_tent',  165000, -2.9,  2.9),
    b('maxvalu_laksi',    'Phahol Thai Eatery',     'ร้านอาหารวัดพระศรีฯ',     'restaurant', 'restaurant',   68000,   2.8,  2.8),
  ],
  bts_korporor: [
    b('airforce_museum',  'Royal Thai Air Force Museum','พิพิธภัณฑ์กองทัพอากาศ','attraction', 'airport',      390000, -3.0, -2.8),
    b('kave_saimai',      'Chapter One Phahol',     'แชปเตอร์วัน พหลโยธิน',    'condo',      'condo_sleek',  260000,  2.9,  2.8),
    b('korporor_711',     '7-Eleven Kor Por Aor',   'เซเว่น แยก คปอ.',         'seven',      'seven_eleven', 48000,   2.9, -2.7),
  ],
  bts_khukhot: [
    b('nue_cross_kk',     'Nue Cross Khu Khot Condo','นิว ครอส คูคต',          'condo',      'condo_twin',   285000,  2.9, -2.9),
    b('saveone_go_mkt',   'Save One Go Night Market','ตลาดเซฟวันโก',           'market',     'jodd_fairs',   195000, -3.0,  2.8),
    b('khukhot_711',      '7-Eleven Khu Khot Plaza','เซเว่น คูคต',             'seven',      'seven_eleven', 52000,   2.8,  2.8),
  ],

  // ===== BTS SILOM LINE =====
  silom_siam: [
    b('siam_center',      'Siam Center',            'สยามเซ็นเตอร์',           'mall',       'mall_glass',   440000, -2.8,  2.7),
    b('novotel_siam',     'Novotel Bangkok Siam Sq','โนโวเทล สยามสแควร์',     'hotel',      'hotel_tower',  310000,  2.8,  2.7),
    b('siam_discovery',   'Siam Discovery Center',  'สยามดิสคัฟเวอรี่',        'mall',       'mall_modern',  410000, -3.2, -2.1),
  ],
  silom_natstad: [
    b('mbk_center',       'MBK Center',             'มาบุญครอง (MBK)',        'mall',       'centralworld', 470000,  2.9,  2.8),
    b('pathumwan_princ',  'Pathumwan Princess Hotel','ปทุมวัน ปริ๊นเซส',      'hotel',      'hotel_grand',  340000, -2.9,  2.7),
    b('bacc_gallery',     'BACC Art & Culture Ctr', 'หอศิลปวัฒนธรรมกรุงเทพฯ', 'attraction', 'mall_modern',  290000,  2.6, -2.9),
  ],
  silom_ratchadamri: [
    b('st_regis_bkk',     'The St. Regis Bangkok',  'เดอะ เซนต์ รีจิส',       'hotel',      'hotel_grand',  430000,  2.9, -2.8),
    b('waldorf_astoria',  'Waldorf Astoria Bangkok','วอลดอร์ฟ แอสโทเรีย',     'hotel',      'hotel_tower',  450000, -2.9, -2.8),
    b('magnolias_ratch',  'Magnolias Ratchadamri',  'แมกโนเลียส์ ราชดำริ',     'condo',      'condo_sleek',  350000,  2.8,  2.9),
  ],
  silom_saladaeng: [
    b('silom_complex',    'Silom Complex',          'สีลม คอมเพล็กซ์',         'mall',       'mall_glass',   430000, -2.9, -2.8),
    b('crowne_plaza_lm',  'Crowne Plaza Lumpini',   'คราวน์ พลาซ่า ลุมพินี',   'hotel',      'hotel_tower',  350000,  2.9, -2.8),
    b('saladaeng_one',    'Saladaeng One Condo',    'ศาลาแดง วัน',             'condo',      'condo_sleek',  315000, -2.8,  2.9),
    b('somtum_convent',   'Hai Somtum Convent',     'ไฮส้มตำ คอนแวนต์',        'restaurant', 'shophouse',    42000,   2.7,  2.9),
  ],
  silom_chongnonsi: [
    b('mahanakhon',       'King Power Mahanakhon',  'คิง เพาเวอร์ มหานคร',     'attraction', 'mahanakhon',   650000, -2.9, -3.2, { featured: true }),
    b('w_bangkok',        'W Bangkok Hotel',        'โรงแรมดับเบิ้ลยู กรุงเทพ', 'hotel',      'hotel_tower',  390000,  3.0, -2.8),
    b('ritz_res_maha',    'Ritz-Carlton Residences','เดอะ ริทซ์-คาร์ลตัน',    'condo',      'condo_sleek',  440000,  2.9,  2.7),
    b('deanjel_cn',       'Dean & DeLuca Mahanakhon','ดีน แอนด์ เดลูก้า',     'restaurant', 'restaurant',   58000,  -3.0,  2.6),
  ],
  silom_saintlouis: [
    b('ascent_sathorn',   'The Bangkok Sathorn Condo','เดอะ แบงค็อค สาทร',    'condo',      'condo_twin',   320000, -2.8, -2.9),
    b('eastin_sathorn',   'Eastin Grand Sathorn',   'อีสติน แกรนด์ สาทร',      'hotel',      'hotel_grand',  360000,  2.8, -2.9),
    b('blue_elephant',    'Blue Elephant Heritage', 'บลู เอเลเฟ่นท์ สาทร',     'restaurant', 'restaurant',   88000,   2.7,  2.9),
  ],
  silom_surasak: [
    b('mode_sathorn_ht',  'Mode Sathorn Hotel',     'โหมด สาทร โฮเทล',         'hotel',      'hotel_tower',  330000, -2.9, -2.8),
    b('bangkok_christian','Bangkok Christian College','โรงเรียนกรุงเทพคริสเตียน','school',   'hotel_grand',  280000,  2.9,  2.7),
    b('surasak_711',      '7-Eleven South Sathorn', 'เซเว่น สาทรใต้',          'seven',      'seven_eleven', 38000,  -2.8,  2.8),
  ],
  silom_saphantaksin: [
    b('mandarin_oriental','Mandarin Oriental Bangkok','แมนดาริน โอเรียนเต็ล',  'hotel',      'mandarin_ori', 520000,  2.8, -3.1),
    b('shangri_la_bkk',   'Shangri-La Bangkok',     'แชงกรี-ลา กรุงเทพ',       'hotel',      'hotel_grand',  460000,  2.8,  3.0),
    b('prajak_duck',      'Prachak Roasted Duck',   'ประจักษ์เป็ดย่าง บางรัก', 'restaurant', 'shophouse',    55000,  -2.8, -2.9),
    b('robinson_bangrak', 'Robinson Bangrak',       'โรบินสัน บางรัก',         'mall',       'mall_modern',  350000, -2.9,  2.9),
  ],
  silom_krungthonburi: [
    b('ideo_sathorn_tk',  'Ideo Mobi Sathorn Condo','ไอดีโอ โมบิ สาทร',        'condo',      'condo_sleek',  275000, -2.9, -2.8),
    b('sena_fest_ktb',    'Sena Fest Mall',         'เสนาเฟสท์',               'mall',       'mall_modern',  340000,  2.9,  2.9),
    b('peninsula_bkk',    'The Peninsula Bangkok',  'เดอะ เพนนินซูลา กรุงเทพ', 'hotel',      'hotel_grand',  450000,  2.9, -2.8),
  ],
  silom_wongwianyai: [
    b('nyx_wongwian',     'NyE by Sansiri Condo',   'นายน์ บาย แสนสิริ',       'condo',      'condo_twin',   260000, -2.9, -2.8),
    b('somsak_pu_ob',     'Somsak Pu Ob Claypot',   'สมศักดิ์ปูอบ วงเวียนใหญ่','restaurant', 'shophouse',    52000,   2.8,  2.9),
    b('wongwian_711',     '7-Eleven Krung Thon Rd', 'เซเว่น วงเวียนใหญ่',      'seven',      'seven_eleven', 40000,  -2.9,  2.8),
  ],
  silom_phonimit: [
    b('aspire_sathorn_pn','Aspire Sathorn-Taksin',  'แอสปาย สาทร-ตากสิน',      'condo',      'condo_sleek',  240000, -2.9, -2.7),
    b('phonimit_noodle',  'Pho Nimit Roasted Pork', 'ข้าวหมูแดงโพธิ์นิมิตร',    'restaurant', 'shophouse',    45000,   2.9,  2.7),
    b('phonimit_711',     '7-Eleven Ratchaphruek Rd','เซเว่น โพธิ์นิมิตร',     'seven',      'seven_eleven', 38000,  -2.8,  2.7),
  ],
  silom_talatphlu: [
    b('the_mall_thaphra', 'The Mall Lifestore Thapra','เดอะมอลล์ ท่าพระ',      'mall',       'centralworld', 460000, -2.9, -3.0),
    b('aspire_sathorn_tp','Aspire Sathorn-Thapra',  'แอสปาย สาทร-ท่าพระ',      'condo',      'condo_sleek',  255000,  2.9, -2.9),
    b('talatphlu_food',   'Talat Phlu Heritage Eats','ตลาดพลู ของอร่อย',       'market',     'market_tent',  145000, -2.8,  2.9),
  ],
  silom_wutthakat: [
    b('tempo_grand_wk',   'Tempo Grand Sathorn-Wutthakat','เทมโป แกรนด์ วุฒากาศ','condo',   'condo_twin',   255000, -2.9, -2.7),
    b('wutthakat_plaza',  'Wutthakat Market Plaza', 'ตลาดวุฒากาศ',             'market',     'market_tent',  120000,  2.9,  2.7),
    b('wutthakat_711',    '7-Eleven Wutthakat Soi 1','เซเว่น วุฒากาศ',         'seven',      'seven_eleven', 42000,  -2.9,  2.7),
  ],
  silom_bangwa: [
    b('the_president_bw', 'The President Sathorn-Ratch','เดอะ เพรสซิเดนท์ บางหว้า','condo', 'condo_twin',   270000, -3.0,  2.8),
    b('seacon_bangkae',   'Seacon Bangkae Plaza',   'ซีคอน บางแค',             'mall',       'mall_modern',  420000,  2.9,  2.9),
    b('bangwa_khonkaen',  'Bang Wa Pork Leg House', 'ขาหมูบางหว้า',            'restaurant', 'shophouse',    56000,  -2.9, -2.9),
  ],

  // ===== BTS GOLD LINE =====
  gold_ktb: [
    b('hive_taksin',      'Hive Taksin Condo',      'ไฮฟ์ ตากสิน',             'condo',      'condo_sleek',  260000, -2.9, -2.5),
    b('the_river_condo',  'The River by Raimon Land','เดอะ ริเวอร์ คอนโด',     'condo',      'condo_twin',   360000,  2.8, -2.7),
    b('ktb_gold_711',     '7-Eleven Charoen Nakhon','เซเว่น เจริญนคร',         'seven',      'seven_eleven', 42000,  -2.8,  2.6),
  ],
  gold_iconsiam: [
    b('iconsiam_mall',    'ICONSIAM Riverfront',    'ไอคอนสยาม',               'mall',       'iconsiam',     680000, -3.1, -2.9, { featured: true }),
    b('magnolias_wf',     'Magnolias Waterfront Res','แมกโนเลียส์ วอเตอร์ฟรอนท์','condo',   'condo_sleek',  460000, -3.2,  2.9),
    b('millennium_hilton','Millennium Hilton Bangkok','มิลเลนเนียม ฮิลตัน',    'hotel',      'hotel_tower',  395000,  2.9, -2.9),
    b('sooksiam_food',    'SOOKSIAM Indoor Market', 'สุขสยาม',                 'attraction', 'market_tent',  290000,  2.9,  2.8),
  ],
  gold_khlongsan: [
    b('lhong_1919',       'LHONG 1919 Courtyard',   'ล้ง 1919',                'attraction', 'chinatown',    310000,  2.8, -2.7),
    b('jam_factory',      'The Jam Factory Cafe',   'เดอะ แจม แฟคตอรี่',       'restaurant', 'restaurant',   95000,  -2.9,  2.7),
    b('khlongsan_711',    '7-Eleven Khlong San Pier','เซเว่น คลองสาน',         'seven',      'seven_eleven', 42000,  -2.9, -2.7),
  ],

  // ===== MRT BLUE LINE (KHLONG TOEI COCO PARC & SANAM CHAI SUANKULARB WITTAYALAI SCHOOL!) =====
  mrt_sukhumvit: [
    b('interchange_21',   'Interchange 21 Tower',   'อินเตอร์เชนจ์ 21',        'mall',       'mall_glass',   380000,  2.9,  2.7),
    b('westin_sukhumvit', 'The Westin Grande Sukhumvit','เดอะ เวสทิน สุขุมวิท','hotel',      'hotel_grand',  360000, -2.9,  2.7),
    b('el_gaucho_asok',   'El Gaucho Asok Steakhouse','เอล กาวโช อโศก',       'restaurant', 'restaurant',   65000,   3.1, -2.4),
  ],
  mrt_qsncc: [
    b('qsncc_hall',       'Queen Sirikit Convention Ctr','ศูนย์ประชุมฯ สิริกิติ์','attraction','qsncc',      540000, -3.2, -2.9),
    b('modena_fraser',    'Modena by Fraser Hotel', 'โมเดนา บาย เฟรเซอร์',     'hotel',      'hotel_tower',  290000,  2.9, -2.7),
    b('fyi_center_food',  'FYI Center Dining Court','เอฟวายไอ เซ็นเตอร์',      'restaurant', 'mall_glass',   95000,   2.9,  2.8),
    b('the_parq_condo',   'The PARQ Life Mall',     'เดอะ ปาร์ค',              'mall',       'mall_modern',  420000, -3.0,  2.9),
  ],
  // MANDATORY REAL-LIFE LANDMARK: COCO PARC at MRT Khlong Toei!
  mrt_khlongtoei: [
    b('coco_parc',        'COCO PARC by Dusit',     'โคโค่ พาร์ค คลองเตย',     'condo',      'coco_parc',    280000, CP_DX, CP_DZ, { featured: true }),
    b('khlongtoei_mkt',   'Khlong Toei Fresh Market','ตลาดคลองเตย',            'market',     'market_tent',  145000,  3.1,  2.8),
    b('seekers_finders',  'Seekers Finders Rama IV Hotel','ซีคเกอร์ส ไฟน์เดอร์ส','hotel',    'hotel_tower',  240000, -3.0,  2.9),
    b('tivoli_hotel_kt',  'The Tivoli Hotel Bangkok','เดอะ ทิโวลี่ พระราม 4',  'hotel',      'hotel_grand',  220000, -3.0, -2.8),
    b('khlongtoei_711',   '7-Eleven Rama IV Khlong Toei','เซเว่น พระราม 4 คลองเตย','seven',  'seven_eleven', 28000,   0.4,  3.4),
  ],
  mrt_lumphini: [
    b('one_bangkok',      'One Bangkok Retail & Towers','วัน แบงค็อก',         'mall',       'one_bangkok',  750000, -3.1, -3.0, { featured: true }),
    b('so_bangkok',       'SO/ Bangkok Hotel',      'โซ แบงคอก',               'hotel',      'hotel_tower',  390000, -2.9,  2.9),
    b('pinnacle_lumpini', 'Pinnacle Lumpinee Hotel','พินนาเคิล ลุมพินี',       'hotel',      'hotel_grand',  260000,  2.9,  2.8),
    b('life_one_wire',    'Life One Wireless Condo','ไลฟ์ วัน ไวร์เลส',        'condo',      'condo_sleek',  310000,  2.9, -2.9),
  ],
  mrt_silom: [
    b('dusit_central_pk', 'Dusit Central Park',     'ดุสิต เซ็นทรัล พาร์ค',    'hotel',      'dusit_park',   480000,  2.9, -3.1, { featured: true }),
    b('silom_edge',       'Silom Edge 24h Mall',    'สีลม เอจ',                'mall',       'mall_modern',  360000, -2.9,  2.8),
    b('ashton_silom',     'Ashton Silom Condo',     'แอชตัน สีลม',             'condo',      'condo_sleek',  340000,  2.9,  2.8),
  ],
  mrt_samyan: [
    b('samyan_mitrtown',  'Samyan Mitrtown',        'สามย่าน มิตรทาวน์',       'mall',       'mall_glass',   460000, -3.0, -2.9),
    b('mandarin_samyan',  'Mandarin Hotel Samyan',  'โรงแรมแมนดาริน สามย่าน',  'hotel',      'hotel_grand',  320000,  2.9,  2.8),
    b('ideo_q_chula',     'Ideo Q Chula-Samyan',    'ไอดีโอ คิว จุฬา-สามย่าน', 'condo',      'condo_twin',   310000, -2.9,  2.9),
    b('jeh_o_chula',      'Jeh O Chula Midnight Eats','เจ๊โอว ข้าวต้มเป็ด',    'restaurant', 'shophouse',    54000,   2.9, -2.8),
  ],
  mrt_hualamphong: [
    b('hualamphong_dome', 'Hua Lamphong Heritage Hall','สถานีรถไฟหัวลำโพง',   'attraction', 'hualamphong',  440000, -3.0, -3.0),
    b('bangkok_centre_ht','Bangkok Centre Hotel',   'บางกอก เซ็นเตอร์ โฮเทล',  'hotel',      'hotel_grand',  270000,  2.9,  2.8),
    b('jeh_nui_noodle',   'Hua Lamphong Roasted Pork','ข้าวหมูแดงหัวลำโพง',    'restaurant', 'shophouse',    48000,  -2.9,  2.9),
  ],
  mrt_watmangkon: [
    b('yaowarat_street',  'Yaowarat Chinatown Eats','เยาวราช สตรีทฟู้ด',       'attraction', 'chinatown',    410000, -3.0,  2.9),
    b('shanghai_mansion', 'Shanghai Mansion Hotel', 'เซี่ยงไฮ้ แมนชั่น',       'hotel',      'chinatown',    310000,  2.9, -2.9),
    b('i_m_chinatown',    'I’m Chinatown Mall',     'แอม ไชน่าทาวน์',          'mall',       'mall_modern',  350000, -2.9, -2.9),
    b('kuay_jab_nayu',    'Nai Ek Roll Noodles',    'ก๋วยจั๊บนายเอ็ก เยาวราช', 'restaurant', 'shophouse',    56000,   2.9,  2.8),
  ],
  mrt_samyot: [
    b('mega_plaza_sy',    'Mega Plaza Saphan Lek',  'เมก้า พลาซ่า สะพานเหล็ก', 'mall',       'mall_modern',  360000,  2.9, -2.7),
    b('old_siam_plaza',   'The Old Siam Plaza',     'ดิ โอลด์ สยาม พลาซ่า',    'mall',       'mandarin_ori', 380000, -2.8,  2.7),
    b('on_lok_yun',       'On Lok Yun Heritage Cafe','ออน ล็อก หยุ่น',         'restaurant', 'shophouse',    64000,   2.8,  2.8),
  ],
  // MANDATORY REAL-LIFE LANDMARK: SUANKULARB WITTAYALAI SCHOOL at EXACT GPS (13.7434619, 100.498851)!
  mrt_sanamchai: [
    b('suankularb_school','Suankularb Wittayalai School','โรงเรียนสวนกุหลาบวิทยาลัย','school','suankularb_school', 320000, SK_DX, SK_DZ, { featured: true }),
    b('grand_palace_vw',  'Grand Palace & Museum Siam','พระบรมมหาราชวัง',      'attraction', 'temple_gold',  620000, -3.0, -3.1, { featured: true }),
    b('pak_khlong_mkt',   'Pak Khlong Flower Market','ปากคลองตลาด',            'market',     'market_tent',  175000,  1.2,  3.2),
    b('sala_rattanakosin','Sala Rattanakosin Hotel','ศาลารัตนโกสินทร์',        'hotel',      'hotel_grand',  360000, -3.1,  2.8),
  ],
  mrt_itsaraphap: [
    b('wat_arun_cafe',    'Wat Arun Riverside Bistro','คาเฟ่วัดอรุณ',          'attraction', 'temple_gold',  390000,  2.9, -2.8),
    b('chapter_one_its',  'The Privacy Itsaraphap', 'เดอะ ไพรเวซี่ อิสรภาพ',   'condo',      'condo_sleek',  250000, -2.9,  2.8),
    b('itsaraphap_711',   '7-Eleven Itsaraphap Rd', 'เซเว่น อิสรภาพ',          'seven',      'seven_eleven', 42000,  -2.8, -2.8),
  ],
  mrt_thaphra: [
    b('ideo_thaphra',     'Ideo Thaphra Interchange','ไอดีโอ ท่าพระ',          'condo',      'condo_twin',   265000, -2.9, -2.8),
    b('whizdom_tp',       'Parkland Phetkasem Condo','พาร์คแลนด์ เพชรเกษม',    'condo',      'condo_sleek',  250000,  2.9,  2.8),
    b('thaphra_noodle',   'Tha Phra Crispy Pork Rice','ข้าวหมูกรอบท่าพระ',     'restaurant', 'shophouse',    52000,  -2.9,  2.9),
  ],
  mrt_charan13: [
    b('chapter_c13',      'The Tree Charan 30 Condo','เดอะ ทรี จรัญฯ',         'condo',      'condo_sleek',  240000, -2.9, -2.7),
    b('homepro_charan',   'HomePro Charansanitwong','โฮมโปร จรัญสนิทวงศ์',     'mall',       'mall_modern',  310000,  2.9,  2.7),
    b('charan13_711',     '7-Eleven Charan 13',     'เซเว่น จรัญฯ 13',         'seven',      'seven_eleven', 42000,  -2.8,  2.8),
  ],
  mrt_faichai: [
    b('faichai_mkt',      'Fai Chai Fresh Market',  'ตลาดไฟฉาย',               'market',     'market_tent',  140000, -2.9,  2.8),
    b('lumpini_fc',       'Lumpini Suite Pinklao',  'ลุมพินี สวีท ไฟฉาย',      'condo',      'condo_sleek',  245000,  2.9, -2.7),
    b('faichai_eats',     'Phannok Road Kitchen',   'ครัวพรานนก ไฟฉาย',        'restaurant', 'restaurant',   62000,   2.8,  2.7),
  ],
  mrt_bangkhunnon: [
    b('ideo_charan70',    'Ideo Charan 70 Riverview','ไอดีโอ จรัญฯ 70',        'condo',      'condo_sleek',  255000, -2.9, -2.8),
    b('nainoo_bkn',       'Bang Khun Non Boat Noodles','ก๋วยเตี๋ยวเรือบางขุนนนท์','restaurant','shophouse',   56000,   2.9,  2.7),
    b('makro_charan',     'Makro Charansanitwong',  'แม็คโคร จรัญสนิทวงศ์',    'mall',       'mall_modern',  340000, -2.9,  2.8),
  ],
  mrt_bangyikhan: [
    b('pata_pinklao',     'Pata Pinklao Plaza',     'พาต้า ปิ่นเกล้า',         'mall',       'mall_modern',  330000, -2.9,  2.8),
    b('rama8_condo',      'Brix Condo Charan 64',   'บริกซ์ คอนโด จรัญ 64',    'condo',      'condo_sleek',  245000,  2.9, -2.8),
    b('byk_711',          '7-Eleven Bang Yi Khan',  'เซเว่น บางยี่ขัน',        'seven',      'seven_eleven', 44000,   2.8,  2.8),
  ],
  mrt_sirindhorn: [
    b('tang_hua_seng',    'Tang Hua Seng Thonburi', 'ตั้งฮั่วเส็ง ธนบุรี',      'mall',       'mall_modern',  325000, -2.9, -2.7),
    b('royal_river_ht',   'The Royal River Hotel',  'โรงแรมรอยัล ริเวอร์',     'hotel',      'hotel_grand',  295000,  2.9,  2.7),
    b('sirindhorn_cnd',   'Chapter One Flow Bangpo','แชปเตอร์วัน สิรินธร',     'condo',      'condo_sleek',  250000, -2.8,  2.8),
  ],
  mrt_bangphlat: [
    b('meet_mall_bp',     'Lotus Charansanitwong',  'โลตัส บางพลัด',           'mall',       'mall_modern',  310000, -2.9,  2.7),
    b('the_tree_rio',     'The Tree Rio Bang-Aor',  'เดอะ ทรี ริโอ บางพลัด',   'condo',      'condo_twin',   265000,  2.9, -2.7),
    b('bp_river_cafe',    'Bang Phlat Riverside Cafe','คาเฟ่ริมน้ำบางพลัด',    'restaurant', 'restaurant',   64000,   2.8,  2.8),
  ],
  mrt_bango: [
    b('yanhee_plaza',     'Charan 90 Wellness Plaza','พลาซ่าบางอ้อ',           'mall',       'mall_glass',   320000, -2.9, -2.7),
    b('plum_bango',       'Elio Del Nest Bang O',   'พลัม คอนโด บางอ้อ',       'condo',      'condo_sleek',  245000,  2.9,  2.7),
    b('bango_711',        '7-Eleven Bang O Station','เซเว่น สถานีบางอ้อ',      'seven',      'seven_eleven', 44000,  -2.8,  2.8),
  ],
  mrt_bangpho: [
    b('gateway_bangsue',  'Gateway at Bangsue',     'เกตเวย์ แอท บางซื่อ',     'mall',       'mall_modern',  410000,  2.9, -2.9),
    b('the_tree_bangpho', 'The Tree Bang Po Station','เดอะ ทรี บางโพ',         'condo',      'condo_sleek',  260000, -2.9,  2.8),
    b('bangpho_wood',     'Bang Pho Riverside Seafood','ครัวบางโพ ริมน้ำ',     'restaurant', 'restaurant',   72000,  -2.9, -2.8),
  ],
  mrt_taopoon: [
    b('rich_park_tp',     'Rich Park @ Taopoon',    'ริชพาร์ค เตาปูน',         'condo',      'condo_twin',   275000,  2.9,  2.8),
    b('taopoon_market',   'Tao Poon Fresh Market',  'ตลาดเตาปูน',              'market',     'market_tent',  150000, -2.9,  2.9),
    b('taopoon_711',      '7-Eleven Tao Poon Jct',  'เซเว่น แยกเตาปูน',        'seven',      'seven_eleven', 46000,   2.9, -2.8),
  ],
  mrt_bangsue: [
    b('scg_hq_bangsue',   'SCG Experience & Plaza', 'เอสซีจี บางซื่อ',         'mall',       'mall_glass',   390000,  2.9,  2.9),
    b('ideo_mobi_bs',     'Ideo Mobi Bangsue Grand','ไอดีโอ โมบิ บางซื่อ',     'condo',      'condo_sleek',  285000, -2.9,  2.8),
    b('bangsue_junction', 'Bang Sue Junction Vintage','ตึกแดง บางซื่อจังชั่น', 'mall',       'mall_modern',  355000,  2.9, -2.8),
  ],
  mrt_kamphaengphet: [
    b('or_tor_kor_mkt',   'Or Tor Kor Gourmet Market','ตลาด อ.ต.ก.',           'market',     'chatuchak',    260000, -3.0,  2.9),
    b('mixt_chatuchak',   'Mixt Chatuchak Mall',    'มิกซ์ จตุจักร',           'mall',       'mall_modern',  360000,  2.9, -2.8),
    b('otk_durian',       'Or Tor Kor Durian Pavilion','ทุเรียนพรีเมียม อ.ต.ก.','restaurant','shophouse',    75000,   2.9,  2.8),
  ],
  mrt_chatuchak: [
    b('the_saint_jj',     'The Saint Residences',   'เดอะ เซนต์ เรสซิเดนเซส',  'condo',      'condo_twin',   295000,  2.9,  2.8),
    b('bazaars_jj_hotel', 'Best Western Chatuchak', 'เบสท์ เวสเทิร์น จตุจักร', 'hotel',      'hotel_tower',  290000,  2.9, -2.8),
    b('jj_mall_plaza',    'JJ Mall Chatuchak',      'เจเจ มอลล์ จตุจักร',      'mall',       'mall_modern',  355000, -2.9,  2.8),
  ],
  mrt_paholyothin: [
    b('union_mall',       'Union Mall Ladprao',     'ยูเนี่ยน มอลล์',           'mall',       'mall_modern',  420000,  2.9,  2.9),
    b('the_line_phahon',  'The Line Phahon-Pradipat','เดอะ ไลน์ พหลฯ',         'condo',      'condo_sleek',  285000, -2.9,  2.8),
    b('union_food_lane',  'Ladprao Soi 1 Street Food','สตรีทฟู้ด ลาดพร้าว ซอย 1','restaurant','shophouse',   56000,   2.9, -2.8),
  ],
  mrt_latphrao: [
    b('gourmet_mkt_lp',   'Gourmet Market Lat Phrao','กูร์เมต์ มาร์เก็ต ลาดพร้าว','mall',    'mall_glass',   350000, -2.9, -2.8),
    b('life_ladprao_val', 'Life Ladprao Valley',    'ไลฟ์ ลาดพร้าว แวลลีย์',   'condo',      'condo_sleek',  290000, -2.9,  2.9),
    b('bazaar_hotel_lp',  'The Bazaar Hotel Bangkok','เดอะ บาซาร์ โฮเทล',      'hotel',      'hotel_grand',  310000,  2.9,  2.8),
  ],
  mrt_ratchada: [
    b('olympia_thai_tw',  'Olympia Thai Tower Plaza','โอลิมเปียไทย พลาซ่า',    'mall',       'mall_glass',   325000, -2.9, -2.7),
    b('rhythm_ratchada2', 'Rhythm Ratchada Condo',  'ริทึ่ม รัชดา',            'condo',      'condo_twin',   265000,  2.9,  2.7),
    b('ratchada_711',     '7-Eleven Ratchada 20',   'เซเว่น รัชดา 20',         'seven',      'seven_eleven', 42000,  -2.8,  2.7),
  ],
  mrt_sutthisan: [
    b('muangthai_plaza',  'Muang Thai Phatra Complex','เมืองไทย-ภัทร คอมเพล็กซ์','mall',     'mall_glass',   340000, -2.9, -2.7),
    b('swissotel_sutt',   'The Emerald Ratchada',   'โรงแรมดิ เอมเมอรัลด์',    'hotel',      'hotel_grand',  310000,  2.9,  2.7),
    b('sutthisan_mkt',    'Sutthisan Night Eats',   'ตลาดสุทธิสาร',            'market',     'market_tent',  130000,  2.8, -2.7),
  ],
  mrt_huaikhwang: [
    b('huaikhwang_night', 'Huai Khwang Night Market','ตลาดนัดห้วยขวาง',        'market',     'jodd_fairs',   220000, -3.0,  2.8),
    b('swissotel_bkk',    'Swissotel Bangkok Ratchada','สวิสโฮเต็ล รัชดา',     'hotel',      'hotel_grand',  360000,  2.9, -2.8),
    b('xt_huaikhwang',    'XT Huaikhwang Condo',    'เอ็กซ์ที ห้วยขวาง',       'condo',      'condo_twin',   285000, -2.9, -2.8),
  ],
  mrt_cultural: [
    b('the_street_ratch', 'The Street Ratchada 24h','เดอะ สตรีท รัชดา',        'mall',       'mall_modern',  410000,  2.9, -2.8),
    b('esplanade_ratch',  'Esplanade Cineplex',     'เอสพลานาด รัชดา',         'mall',       'mall_glass',   385000, -2.9, -2.8),
    b('the_one_ratchada', 'The One Ratchada Night Mkt','ดิ วัน รัชดา',         'market',     'jodd_fairs',   235000,  2.9,  2.9),
  ],
  mrt_rama9: [
    b('jodd_fairs_r9',    'Jodd Fairs Rama 9',      'จ๊อดแฟร์ พระราม 9',       'attraction', 'jodd_fairs',   340000,  3.1,  2.9, { featured: true }),
    b('central_rama9',    'Central Rama 9',         'เซ็นทรัล พระราม 9',       'mall',       'centralworld', 485000, -3.0, -2.9),
    b('grand_mercure_f',  'Grand Mercure Fortune',  'แกรนด์ เมอร์เคียว ฟอร์จูน','hotel',     'hotel_grand',  345000, -2.9,  2.9),
    b('ashton_asoke_r9',  'Ashton Asoke-Rama 9',    'แอชตัน อโศก-พระราม 9',    'condo',      'ashton_asoke', 350000,  2.9, -2.9),
  ],
  mrt_phetchaburi: [
    b('singha_complex',   'Singha Complex',         'สิงห์ คอมเพล็กซ์',         'mall',       'mall_glass',   410000,  2.9, -2.8),
    b('life_asoke_hype',  'Life Asoke Condo',       'ไลฟ์ อโศก',               'condo',      'condo_twin',   275000, -2.9, -2.7),
    b('lancaster_bkk',    'Lancaster Bangkok Hotel','โรงแรมแลงคาสเตอร์',       'hotel',      'hotel_tower',  310000,  2.9,  2.8),
  ],
  // MRT Blue Western Branch (BL33 - BL38)
  mrt_bangphai: [
    b('bangphai_condo',   'The Key Phetkasem Condo','เดอะ คีย์ บางไผ่',        'condo',      'condo_sleek',  245000, -2.9, -2.7),
    b('bangphai_eats',    'Bang Phai Duck Noodles', 'เป็ดย่างบางไผ่',          'restaurant', 'shophouse',    52000,   2.9,  2.7),
    b('bangphai_711',     '7-Eleven Phetkasem 21',  'เซเว่น เพชรเกษม 21',      'seven',      'seven_eleven', 42000,  -2.8,  2.7),
  ],
  mrt_bangwa: [
    b('supalai_bw',       'Supalai Park Ratchaphruek','ศุภาลัย ปาร์ค ราชพฤกษ์','condo',      'condo_sleek',  260000, -2.9, -2.8),
    b('bangwa_711_mrt',   '7-Eleven Phetkasem 33',  'เซเว่น เพชรเกษม 33',      'seven',      'seven_eleven', 44000,   2.9, -2.7),
    b('phetkasem_noodle', 'Phetkasem Duck Noodle',  'ก๋วยเตี๋ยวเป็ดเพชรเกษม',   'restaurant', 'shophouse',    54000,  -2.8,  2.7),
  ],
  mrt_phetkasem48: [
    b('supalai_pk48',     'Supalai Veranda Phetkasem','ศุภาลัย เวอเรนด้า 48',  'condo',      'condo_twin',   255000, -2.9, -2.7),
    b('pk48_market',      'Phetkasem 48 Fresh Market','ตลาดเพชรเกษม 48',       'market',     'market_tent',  130000,  2.9,  2.7),
    b('pk48_711',         '7-Eleven Phetkasem 48',  'เซเว่น เพชรเกษม 48',      'seven',      'seven_eleven', 42000,   2.8, -2.7),
  ],
  mrt_phasicharoen: [
    b('seacon_pc_mall',   'Seacon Bangkae Mall',    'ซีคอน บางแค (ภาษีเจริญ)', 'mall',       'centralworld', 460000, -3.0, -2.8),
    b('the_prodigy_pc',   'The Prodigy Phetkasem',  'เดอะ พรอดิจี้ เพชรเกษม',  'condo',      'condo_sleek',  265000,  2.9,  2.8),
    b('pc_food_court',    'Seacon Street Kitchen',  'สตรีทคิทเช่น ภาษีเจริญ',  'restaurant', 'restaurant',   68000,   2.8, -2.7),
  ],
  mrt_bangkae: [
    b('bangkae_market',   'Bang Khae Fresh Market', 'ตลาดบางแค',               'market',     'market_tent',  165000, -2.9,  2.8),
    b('fuse_sense_bk',    'Fuse Sense Bangkae Condo','ฟิวส์ เซนเซ่ บางแค',     'condo',      'condo_sleek',  255000,  2.9, -2.7),
    b('bangkae_711',      '7-Eleven Bang Khae Jct', 'เซเว่น แยกบางแค',         'seven',      'seven_eleven', 44000,   2.8,  2.8),
  ],
  mrt_laksong: [
    b('themall_bangkae',  'The Mall Lifestore Bangkae','เดอะมอลล์ บางแค',      'mall',       'centralworld', 495000, -3.0, -2.9),
    b('parkland_ls',      'The Parkland Phetkasem', 'เดอะ พาร์คแลนด์ หลักสอง', 'condo',      'condo_twin',   275000,  2.9,  2.8),
    b('laksong_711',      '7-Eleven Lak Song Hub',  'เซเว่น หลักสอง',          'seven',      'seven_eleven', 48000,  -2.9,  2.8),
  ],

  // ===== MRT PURPLE LINE =====
  pp_taopoon: [
    b('chapter_one_tp',   'Chapter One Shine Bangpo','แชปเตอร์วัน ชายน์',      'condo',      'condo_sleek',  255000, -2.9, -2.7),
    b('taopoon_mansion',  'The Stage Taopoon Condo','เดอะ สเตจ เตาปูน',        'condo',      'condo_twin',   265000,  2.9, -2.8),
    b('taopoon_noodles',  'Taopoon Beef Noodle',    'ก๋วยเตี๋ยวเนื้อเตาปูน',    'restaurant', 'shophouse',    56000,  -2.9,  2.7),
  ],
  pp_wongsawang: [
    b('bigc_wongsawang',  'Big C Wong Sawang Mall', 'บิ๊กซี วงศ์สว่าง',        'mall',       'mall_modern',  340000, -2.9, -2.7),
    b('ideo_wongsawang',  'Ideo Mobi Wongsawang',   'ไอดีโอ โมบิ วงศ์สว่าง',   'condo',      'condo_sleek',  255000,  2.9,  2.7),
    b('ws_711',           '7-Eleven Wong Sawang',   'เซเว่น วงศ์สว่าง',        'seven',      'seven_eleven', 44000,  -2.8,  2.8),
  ],
  pp_moph: [
    b('knightsbridge_ti', 'KnightsBridge Tiwanon',  'ไนท์บริดจ์ ติวานนท์',     'condo',      'condo_sleek',  265000, -2.9, -2.8),
    b('big_c_tiwanon',    'Big C Tiwanon Plaza',    'บิ๊กซี ติวานนท์',          'mall',       'mall_modern',  330000,  2.9,  2.8),
    b('moph_cafe',        'Tiwanon Garden Bistro',  'สวนอาหารติวานนท์',         'restaurant', 'restaurant',   68000,  -2.9,  2.8),
  ],
  pp_nonthaburi: [
    b('esplanade_ngam',   'Esplanade Ngamwongwan',  'เอสพลานาด งามวงศ์วาน',    'mall',       'mall_glass',   410000, -2.9,  2.9),
    b('the_politan_nont', 'The Politan Rive Condo', 'เดอะ โพลิแทน รีฟ',        'condo',      'condo_twin',   295000, -2.9, -2.9),
    b('grand_richmond',   'Grand Richmond Hotel',   'แกรนด์ ริชมอนด์ โฮเทล',   'hotel',      'hotel_grand',  320000,  2.9,  2.8),
  ],
  pp_phranangklao: [
    b('politan_aqua',     'The Politan Aqua River', 'เดอะ โพลิแทน อควา',       'condo',      'condo_twin',   285000, -2.9, -2.7),
    b('ton_sak_mkt',      'Ton Sak Market Nonthaburi','ตลาดต้นสัก นนทบุรี',    'market',     'market_tent',  150000,  2.9,  2.7),
    b('pnk_711',          '7-Eleven Phra Nang Klao','เซเว่น พระนั่งเกล้า',     'seven',      'seven_eleven', 44000,  -2.8,  2.8),
  ],
  pp_westgate: [
    b('central_westgate', 'Central WestGate & IKEA','เซ็นทรัล เวสต์เกต',       'mall',       'centralworld', 520000, -3.1, -3.0),
    b('plum_westgate',    'Plum Condo Central Station','พลัม คอนโด เวสต์เกต',  'condo',      'condo_twin',   295000,  2.9,  2.9),
    b('bangyai_night_mkt','Bang Yai Night Market',  'ตลาดบางใหญ่ไนท์บาร์ซาร์', 'market',     'market_tent',  185000, -2.9,  2.9),
  ],
  pp_khlongbangphai: [
    b('origin_bangyai',   'Origin Plug & Play Nonthaburi','ออริจิ้น บางใหญ่',  'condo',      'condo_sleek',  275000,  2.9, -2.8),
    b('kbp_711',          '7-Eleven Khlong Bang Phai','เซเว่น คลองบางไผ่',     'seven',      'seven_eleven', 48000,  -2.9,  2.8),
    b('bangphai_krua',    'Krua Rim Khlong Seafood','ครัวริมคลองบางไผ่',       'restaurant', 'restaurant',   82000,   2.9,  2.8),
  ],

  // ===== MRT YELLOW LINE =====
  yl_latphrao: [
    b('ideo_ladprao5',    'Ideo Ladprao 5 Condo',   'ไอดีโอ ลาดพร้าว 5',       'condo',      'condo_sleek',  265000,  2.9, -2.7),
    b('ratchada_suite_lp','The Quarter Ratchada',   'เดอะ ควอเตอร์ รัชดา',     'hotel',      'hotel_tower',  295000,  2.9,  2.7),
    b('suan_lum_night',   'Suan Lum Night Bazaar',  'สวนลุมไนท์บาซาร์ รัชดา',  'market',     'market_tent',  165000, -2.8,  2.8),
  ],
  yl_chokchai4: [
    b('chokchai4_food',   'Chok Chai 4 Night Eats', 'ตลาดโต้รุ่งโชคชัย 4',     'market',     'market_tent',  155000, -2.9,  2.8),
    b('kave_chokchai4',   'Modiz Ladprao 18 Condo', 'โมดิซ โชคชัย 4',          'condo',      'condo_sleek',  255000,  2.9, -2.7),
    b('chokchai4_711',    '7-Eleven Chok Chai 4',   'เซเว่น โชคชัย 4',         'seven',      'seven_eleven', 42000,  -2.8, -2.7),
  ],
  yl_bangkapi: [
    b('themall_bangkapi', 'The Mall Lifestore Bangkapi','เดอะมอลล์ บางกะปิ',   'mall',       'centralworld', 490000, -3.0, -2.9),
    b('tawanna_market',   'Tawanna Square Market',  'ตะวันนา บางกะปิ',         'market',     'market_tent',  185000,  2.9, -2.8),
    b('niche_id_bkp',     'Lumpini Center Happyland','ลุมพินี บางกะปิ',        'condo',      'condo_twin',   260000, -2.9,  2.9),
  ],
  yl_huamak: [
    b('the_nine_hm',      'MaxValu & Pattanakarn Sq','พัฒนาการ สแควร์',        'mall',       'mall_modern',  345000,  2.9,  2.8),
    b('lumpini_huamak',   'Lumpini Place Srinakarin','ลุมพินี ศรีนครินทร์',    'condo',      'condo_sleek',  270000,  2.9, -2.8),
    b('huamak_711_yl',    '7-Eleven Srinakarin 16', 'เซเว่น ศรีนครินทร์ 16',   'seven',      'seven_eleven', 46000,  -2.9,  2.7),
  ],
  yl_srinagarindra: [
    b('seacon_square',    'Seacon Square Srinakarin','ซีคอนสแควร์ ศรีนครินทร์','mall',       'centralworld', 510000, -3.0, -2.9),
    b('train_night_mkt',  'Train Night Market Srinakarin','ตลาดนัดรถไฟ ศรีนครินทร์','attraction','jodd_fairs', 320000, 3.0,  2.8),
    b('dusit_princess_sr','Dusit Princess Srinakarin','ดุสิต ปริ๊นเซส ศรีนครินทร์','hotel',  'hotel_grand',  340000, -2.9,  2.9),
  ],
  yl_sriiam: [
    b('central_bangna',   'Central Bangna Mall',    'เซ็นทรัล บางนา',          'mall',       'centralworld', 480000, -3.0, -2.8),
    b('novotel_bangna',   'Novotel Bangkok Bangna', 'โนโวเทล บางนา',           'hotel',      'hotel_grand',  330000,  2.9,  2.8),
    b('sriiam_condo',     'Niche Mono Bangna Condo','นิช โมโน บางนา',          'condo',      'condo_sleek',  260000,  2.9, -2.7),
  ],
  yl_samrong: [
    b('origin_samrong',   'KnightsBridge Collage Samrong','ไนท์บริดจ์ สำโรง',  'condo',      'condo_sleek',  275000,  2.9, -2.8),
    b('samrong_yl_711',   '7-Eleven Thepharak Rd',  'เซเว่น เทพารักษ์',        'seven',      'seven_eleven', 48000,   2.9,  2.8),
    b('thepharak_food',   'Thepharak Seafood Kitchen','ครัวเทพารักษ์ ซีฟู้ด',  'restaurant', 'restaurant',   82000,  -2.9, -2.7),
  ],

  // ===== MRT PINK LINE =====
  pk_nonthaburi: [
    b('supalai_pk01',     'Supalai Loft Khae Rai',  'ศุภาลัย ลอฟท์ แคราย',     'condo',      'condo_sleek',  265000,  2.9, -2.8),
    b('khaerai_plaza',    'Lotus Rattanathibet',    'โลตัส รัตนาธิเบศร์',      'mall',       'mall_modern',  340000, -2.9, -2.7),
    b('khaerai_711',      '7-Eleven Khae Rai Jct',  'เซเว่น แยกแคราย',         'seven',      'seven_eleven', 46000,   2.9,  2.7),
  ],
  pk_pakkret: [
    b('pakkret_plaza',    'Major Hollywood Pak Kret','เมเจอร์ ปากเกร็ด',       'mall',       'mall_modern',  345000, -2.9, -2.7),
    b('koh_kret_cafe',    'Pak Kret Riverside Eats','ครัวริมน้ำปากเกร็ด',       'restaurant', 'restaurant',   78000,   2.9,  2.7),
    b('pakkret_condo',    'Supalai Loft Chaeng Watthana','ศุภาลัย ปากเกร็ด',   'condo',      'condo_sleek',  260000,  2.9, -2.7),
  ],
  pk_chaengwatthana: [
    b('impact_arena',     'IMPACT Muang Thong Arena','อิมแพ็ค เมืองทองธานี',   'attraction', 'qsncc',        560000, -3.1, -3.0),
    b('central_cw',       'Central Chaengwattana',  'เซ็นทรัล แจ้งวัฒนะ',      'mall',       'centralworld', 480000,  2.9,  2.9),
    b('novotel_impact',   'Novotel Bangkok IMPACT', 'โนโวเทล อิมแพ็ค',         'hotel',      'hotel_grand',  360000,  2.9, -2.9),
  ],
  pk_laksi: [
    b('it_square_laksi',  'IT Square Laksi Mall',   'ไอที สแควร์ หลักสี่',     'mall',       'mall_modern',  355000, -2.9,  2.8),
    b('miracle_grand',    'Miracle Grand Convention','มิราเคิล แกรนด์',        'hotel',      'hotel_grand',  345000,  2.9,  2.8),
    b('laksi_plaza_condo','Kensington Laksi Condo', 'เคนซิงตัน หลักสี่',       'condo',      'condo_sleek',  265000,  2.9, -2.7),
  ],
  pk_watphrasri: [
    b('modiz_station',    'Modiz Station Phahol',   'โมดิซ สเตชั่น',           'condo',      'condo_sleek',  255000,  2.9, -2.8),
    b('episode_phahol',   'Episode Phahol-Saphanmai','เอพิโซด สะพานใหม่',      'condo',      'condo_twin',   265000,  2.9,  2.7),
    b('phrasri_krua',     'Bangkhen Thai Kitchen',  'ครัวบางเขน วัดพระศรีฯ',   'restaurant', 'restaurant',   72000,  -2.9, -2.7),
  ],
  pk_fashion: [
    b('fashion_island',   'Fashion Island & Promenade','แฟชั่นไอส์แลนด์',      'mall',       'centralworld', 515000, -3.0, -2.9),
    b('origin_ramintra',  'Origin Play Ramintra',   'ออริจิ้น รามอินทรา',      'condo',      'condo_twin',   285000,  2.9,  2.8),
    b('ramintra_seafood', 'Sompong Ramintra Seafood','ครัวรามอินทรา',          'restaurant', 'restaurant',   88000,  -2.9,  2.9),
  ],
  pk_minburi: [
    b('minburi_market',   'Chatuchak 2 Min Buri Mkt','ตลาดนัดจตุจักร 2 มีนบุรี','market',    'chatuchak',    245000, -3.0,  2.9),
    b('supalai_minburi',  'Supalai Park Min Buri',  'ศุภาลัย มีนบุรี',         'condo',      'condo_sleek',  270000,  2.9, -2.9),
    b('minburi_711',      '7-Eleven Min Buri Plaza','เซเว่น มีนบุรี',          'seven',      'seven_eleven', 48000,   2.9,  2.8),
  ],

  // ===== AIRPORT RAIL LINK (ALL 8 STATIONS!) =====
  arl_phayathai: [
    b('sukhothai_res_pt', 'The Address Phayathai',  'ดิ แอดเดรส พญาไท',        'condo',      'condo_sleek',  285000,  2.9, -2.7),
    b('florida_hotel_pt', 'Florida Hotel Phaya Thai','โรงแรมฟลอริดา พญาไท',    'hotel',      'hotel_grand',  260000,  2.9,  2.6),
    b('phayathai_plaza',  'Phaya Thai Plaza Cafe',  'พญาไท พลาซ่า',            'restaurant', 'restaurant',   52000,  -2.7, -2.9),
  ],
  arl_ratchaprarop: [
    b('baiyoke_sky',      'Baiyoke Sky Hotel Tower','โรงแรมใบหยก สกาย',        'attraction', 'hotel_tower',  440000, -2.9,  2.9),
    b('pratunam_mkt',     'Pratunam Fashion Market','ตลาดประตูน้ำ',            'market',     'market_tent',  195000,  2.9,  2.8),
    b('kuang_heng_chick', 'Go-Ang Pratunam Chicken Rice','ข้าวมันไก่ประตูน้ำ', 'restaurant', 'shophouse',    58000,  -2.9, -2.8),
  ],
  arl_makkasan: [
    b('asoke_mak_condo',  'The Line Asoke-Ratchada','เดอะ ไลน์ อโศก-รัชดา',    'condo',      'condo_twin',   310000, -2.9, -2.8),
    b('fx_hotel_mak',     'FX Hotel Metrolink Makkasan','เอฟเอ็กซ์ มักกะสัน',  'hotel',      'hotel_tower',  295000,  2.9, -2.8),
    b('makkasan_711',     '7-Eleven Makkasan Hub',  'เซเว่น มักกะสัน',         'seven',      'seven_eleven', 42000,  -2.8,  2.7),
  ],
  arl_ramkhamhaeng: [
    b('nasa_bangkok_ht',  'NASA Bangkok Hotel',     'โรงแรมนาซ่า กรุงเทพ',     'hotel',      'hotel_tower',  290000, -2.9,  2.8),
    b('fuse_mobius_ram',  'The Base Garden Rama 9', 'เดอะ เบส การ์เด้น พระราม 9','condo',    'condo_sleek',  270000,  2.9, -2.8),
    b('ram_night_bazaar', 'Ramkhamhaeng Night Eats','ตลาดนัดรามคำแหง',         'market',     'market_tent',  155000,  2.9,  2.9),
  ],
  arl_huamak: [
    b('the_iris_hm',      'The Rich Rama 9-Srinakarin','เดอะ ริช พระราม 9',    'condo',      'condo_sleek',  275000, -2.9, -2.8),
    b('al_meroz_hotel',   'Al Meroz Hotel Bangkok', 'โรงแรมอัล มีรอซ',         'hotel',      'hotel_grand',  320000, -2.9,  2.8),
    b('london_street_hm', 'London Street Phatthanakan','ลอนดอน สตรีท พัฒนาการ','restaurant', 'restaurant',   95000,   2.8, -2.9),
  ],
  arl_banthapchang: [
    b('uniloft_btc',      'The Iris Rama 9 Condo',  'ดิ ไอริส บ้านทับช้าง',    'condo',      'condo_sleek',  250000, -2.9, -2.7),
    b('btc_plaza',        'Prawet Community Plaza', 'ประเวศ พลาซ่า',           'mall',       'mall_modern',  310000,  2.9,  2.7),
    b('btc_711',          '7-Eleven Ban Thap Chang','เซเว่น บ้านทับช้าง',      'seven',      'seven_eleven', 46000,  -2.8,  2.8),
  ],
  arl_latkrabang: [
    b('paseo_latkrabang', 'The Paseo Mall Latkrabang','เดอะ พาซิโอ ลาดกระบัง', 'mall',       'mall_modern',  390000, -2.9,  2.8),
    b('courtyard_suvarn', 'Courtyard Suvarnabhumi', 'คอร์ทยาร์ด สุวรรณภูมิ',   'hotel',      'hotel_grand',  380000,  2.9, -2.8),
    b('kave_latkrabang',  'The Origin Latkrabang',  'ดิ ออริจิ้น ลาดกระบัง',   'condo',      'condo_sleek',  265000, -2.9, -2.8),
  ],
  arl_suvarnabhumi: [
    b('suvarnabhumi_term','Suvarnabhumi Duty-Free Hall','คิง เพาเวอร์ สุวรรณภูมิ','attraction','airport',    850000,  3.2, -3.2, { featured: true }),
    b('novotel_suvarn',   'Hyatt Regency Suvarnabhumi','ไฮแอท สุวรรณภูมิ',     'hotel',      'hotel_grand',  460000, -3.0,  2.9),
    b('magic_food_point', 'Magic Food Point Airport','เมจิก ฟู้ด พอยท์',       'restaurant', 'restaurant',   125000,  3.0,  2.9),
    b('suvarn_711',       '7-Eleven Airport Concourse','เซเว่น สุวรรณภูมิ',    'seven',      'seven_eleven', 75000,  -2.9, -2.9),
  ],

  // ===== SRT RED LINES =====
  srt_aphiwat: [
    b('aphiwat_terminal', 'Krung Thep Aphiwat Hall','โถงสถานีกลางอภิวัฒน์',    'attraction', 'aphiwat',      560000, -3.2, -3.1),
    b('bangsue_grand_ht', 'The Quarter Ladprao-BS', 'เดอะ ควอเตอร์ บางซื่อ',   'hotel',      'hotel_tower',  320000,  3.0, -2.9),
    b('aphiwat_711',      '7-Eleven Bang Sue Concourse','เซเว่น สถานีกลางอภิวัฒน์','seven',  'seven_eleven', 58000,   2.9,  2.8),
  ],
  srt_chatuchak: [
    b('energy_complex',   'EnCo Energy Complex Plaza','เอนเนอร์ยี่ คอมเพล็กซ์','mall',       'mall_glass',   385000,  2.9, -2.8),
    b('m_jatujak_condo',  'M Jatujak Condo',        'เอ็ม จตุจักร',            'condo',      'condo_twin',   295000, -2.9,  2.8),
    b('vibhavadi_eats',   'Vibhavadi Street Kitchen','ครัววิภาวดี จตุจักร',    'restaurant', 'shophouse',    68000,   2.8,  2.8),
  ],
  srt_watsemsian: [
    b('bon_marche_mkt',   'Bon Marche Market Park', 'ตลาดบองมาร์เช่',          'market',     'market_tent',  210000, -2.9, -2.7),
    b('prachanivet_cnd',  'U Delight Prachachuen',  'ยู ดีไลท์ ประชาชื่น',     'condo',      'condo_sleek',  260000,  2.9,  2.7),
    b('watsemsian_711',   '7-Eleven Wat Samian Nari','เซเว่น วัดเสมียนนารี',   'seven',      'seven_eleven', 46000,   2.8, -2.7),
  ],
  srt_laksi: [
    b('centra_gov_laksi', 'Centara Life Chaeng Watthana','เซ็นทารา หลักสี่',   'hotel',      'hotel_tower',  325000, -2.9, -2.8),
    b('laksi_711_srt',    '7-Eleven Vibhavadi Lak Si','เซเว่น วิภาวดี หลักสี่','seven',      'seven_eleven', 48000,   2.9, -2.8),
    b('chulabhorn_plaza', 'Chulabhorn Plaza Eats',  'พลาซ่าจุฬาภรณ์ หลักสี่',   'restaurant', 'restaurant',   78000,  -2.9,  2.7),
  ],
  srt_donmueang: [
    b('donmueang_term',   'Don Mueang Airport Plaza','ท่าอากาศยานดอนเมือง',    'attraction', 'airport',      680000,  3.1, -3.0),
    b('amari_donmueang',  'Amari Don Muang Hotel',  'อมารี ดอนเมือง',          'hotel',      'hotel_grand',  410000, -3.0,  2.8),
    b('dm_food_hall',     'Magic Garden Don Mueang','ศูนย์อาหารดอนเมือง',      'restaurant', 'restaurant',   115000,  2.9,  2.9),
  ],
  srt_rangsit: [
    b('future_park_rs',   'Future Park Rangsit & Zpell','ฟิวเจอร์พาร์ค รังสิต','mall',       'centralworld', 540000,  3.1, -2.9),
    b('novotel_future',   'Novotel Future Park',    'โนโวเทล ฟิวเจอร์พาร์ค',   'hotel',      'hotel_grand',  365000, -3.0, -2.8),
    b('plum_rangsit',     'Plum Condo Park Rangsit','พลัม คอนโด รังสิต',       'condo',      'condo_twin',   280000, -2.9,  2.9),
  ],
  srt_bangbamru: [
    b('changchui_plane',  'ChangChui Creative Park','ช่างชุ่ย',                'attraction', 'jodd_fairs',   330000, -3.0, -2.9),
    b('lumpini_pinklao',  'The Parkland Charan-Pinklao','พาร์คแลนด์ ปิ่นเกล้า','condo',      'condo_sleek',  265000,  2.9,  2.8),
    b('sirindhorn_711',   '7-Eleven Sirindhorn Rd', 'เซเว่น ถนนสิรินธร',       'seven',      'seven_eleven', 46000,   2.9, -2.8),
  ],
  srt_talingchan: [
    b('talingchan_float', 'Taling Chan Floating Market','ตลาดน้ำตลิ่งชัน',     'attraction', 'market_tent',  310000, -3.0,  2.8),
    b('the_circle_rp',    'The Circle Ratchapruk',  'เดอะ เซอร์เคิล ราชพฤกษ์', 'mall',       'mall_modern',  420000,  2.9, -2.8),
    b('talingchan_711',   '7-Eleven Taling Chan Jct','เซเว่น ตลิ่งชัน',        'seven',      'seven_eleven', 48000,   2.9,  2.8),
  ],

  // ===== BANGKOK BRT =====
  brt_sathorn: [
    b('empire_tower',     'Empire Tower Sathorn',   'เอ็มไพร์ ทาวเวอร์ สาทร',  'mall',       'mall_glass',   440000,  2.9,  2.6),
    b('anantara_sathorn', 'JC Kevin Sathorn Hotel', 'เจซี เควิน สาทร',         'hotel',      'hotel_tower',  345000, -2.9,  2.8),
    b('sathorn_square',   'Sathorn Square Dining',  'สาทร สแควร์',             'restaurant', 'restaurant',   78000,   2.9, -2.5),
  ],
  brt_technic: [
    b('the_met_sathorn',  'Rhythm Sathorn-Narathiwas','ริทึ่ม สาทร-นราธิวาส',  'condo',      'condo_sleek',  295000,  2.9, -2.8),
    b('chatrium_sathorn', 'Chatrium Residence Sathon','ชาเทรียม สาทร',         'hotel',      'hotel_grand',  330000, -2.9,  2.8),
    b('narathiwas_eats',  'Narathiwas Street Kitchen','ครัวถนนนราธิวาส',       'restaurant', 'shophouse',    56000,   2.9,  2.8),
  ],
  brt_nararam3: [
    b('central_rama3',    'Central Rama 3 Mall',    'เซ็นทรัล พระราม 3',       'mall',       'centralworld', 465000, -3.0, -2.8),
    b('the_up_rama3',     'The UP Rama 3 Plaza',    'ดิ อัพ พระราม 3',         'mall',       'mall_modern',  340000,  2.9,  2.7),
    b('lumpini_nara3',    'Lumpini Place Narathiwas','ลุมพินี นราธิวาส',       'condo',      'condo_sleek',  265000,  2.9, -2.7),
  ],
  brt_rama3: [
    b('terminal21_r3',    'Terminal 21 Rama 3',     'เทอร์มินอล 21 พระราม 3',  'mall',       'terminal21',   485000, -3.0,  2.9),
    b('montien_riverside','Montien Riverside Hotel','มณเฑียร ริเวอร์ไซด์',     'hotel',      'hotel_grand',  355000,  2.9,  2.9),
    b('starview_rama3',   'StarView Rama 3 Condo',  'สตาร์วิว พระราม 3',       'condo',      'condo_twin',   310000,  2.9, -2.8),
  ],
  brt_watdokmai: [
    b('int_intersect_r3', 'INT Intersect Rama 3',   'อินท์ อินเตอร์เซค พระราม 3','mall',     'mall_modern',  340000, -2.9, -2.8),
    b('supalai_prima_r3', 'Supalai Prima Riva Condo','ศุภาลัย พรีมา ริว่า',    'condo',      'condo_sleek',  295000,  2.9,  2.8),
    b('rama3_711',        '7-Eleven Rama III Rd',   'เซเว่น พระราม 3',         'seven',      'seven_eleven', 46000,  -2.9,  2.8),
  ],
  brt_ratchaphruek: [
    b('casa_condo_rp',    'Casa Condo Ratchada-Ratch','คาซ่า คอนโด ราชพฤกษ์',  'condo',      'condo_sleek',  260000,  2.9,  2.8),
    b('rp_food_plaza',    'Ratchaphruek Market Hub','ตลาดราชพฤกษ์',            'market',     'market_tent',  150000, -2.9,  2.8),
    b('rp_711_brt',       '7-Eleven Ratchaphruek BRT','เซเว่น ราชพฤกษ์',       'seven',      'seven_eleven', 44000,   2.9, -2.6),
  ],

  // ===== CHAO PHRAYA EXPRESS BOAT PIERS =====
  boat_asiatique: [
    b('asiatique_rf',     'Asiatique The Riverfront','เอเชียทีค เดอะ ริเวอร์ฟรอนท์','attraction','asiatique', 540000,  3.1,  2.6),
    b('chatrium_river',   'Chatrium Hotel Riverside','ชาเทรียม ริเวอร์ไซด์',   'hotel',      'hotel_tower',  385000,  3.0, -2.9),
    b('sirimahannop',     'Sirimahannop Tall Ship Cafe','เรือสิริมหรรณพ',       'restaurant', 'restaurant',   110000, -2.8,  2.7),
  ],
  boat_sathorn: [
    b('river_city_side',  'Lebua State Tower Dome', 'เลอบัว แอท สเตท ทาวเวอร์','attraction', 'hotel_grand',  490000,  3.1, -2.6),
    b('sathorn_pier_711', '7-Eleven Sathorn Pier',  'เซเว่น ท่าเรือสาทร',      'seven',      'seven_eleven', 44000,   2.9,  2.8),
    b('charoenkrung_cafe','Sarnies Charoen Krung',  'ซาร์นีส์ เจริญกรุง',      'restaurant', 'shophouse',    68000,  -2.9, -2.6),
  ],
  boat_iconsiam: [
    b('banyan_tree_riv',  'The Residences Mandarin','แมนดาริน ริเวอร์ไซด์',    'condo',      'condo_sleek',  440000, -2.9, -2.8),
    b('iconsiam_fountain','River Park Promenade Cafe','ริเวอร์ พาร์ค คาเฟ่',   'restaurant', 'restaurant',   95000,   2.8,  2.7),
    b('four_seasons_rv',  'Four Seasons Chao Phraya','โฟร์ซีซั่นส์ เจ้าพระยา', 'hotel',      'hotel_grand',  520000,  3.0, -2.7),
  ],
  boat_siphraya: [
    b('river_city_bkk',   'River City Bangkok Art', 'ริเวอร์ ซิตี้ แบงค็อก',   'attraction', 'mall_modern',  390000,  2.9, -2.8),
    b('royal_orchid_sh',  'Royal Orchid Sheraton',  'รอยัล ออคิด เชอราตัน',    'hotel',      'hotel_grand',  410000,  2.9,  2.8),
    b('warehouse_30',     'Warehouse 30 Coffee Hub','แวร์เฮาส์ 30',            'restaurant', 'shophouse',    82000,  -2.9,  2.8),
  ],
  boat_ratchawong: [
    b('sampheng_lane',    'Sampheng Market Alley',  'ตลาดสำเพ็ง',              'market',     'chinatown',    245000,  2.9, -2.8),
    b('grand_china_ht',   'Grand China Bangkok',    'แกรนด์ ไชน่า เยาวราช',    'hotel',      'hotel_tower',  310000,  2.9,  2.8),
    b('songwat_coffee',   'Song Wat Heritage Street','ถนนทรงวาด คาเฟ่',        'restaurant', 'shophouse',    85000,  -2.9, -2.7),
  ],
  boat_rajinee: [
    b('yodpiman_walk',    'Yodpiman River Walk',    'ยอดพิมาน ริเวอร์วอล์ค',   'mall',       'mandarin_ori', 380000,  2.8,  2.6),
    b('rajinee_school',   'Rajini Heritage Riverfront','โรงเรียนราชินี ท่าราชินี','school',  'hotel_grand',  290000,  2.7, -2.7),
    b('rajinee_711',      '7-Eleven Pak Khlong Pier','เซเว่น ท่าราชินี',       'seven',      'seven_eleven', 46000,  -2.8,  2.7),
  ],
  boat_thatien: [
    b('wat_arun_prang',   'Wat Arun Temple Spire',  'วัดอรุณราชวราราม',        'attraction', 'temple_gold',  590000, -3.2, -2.6, { featured: true }),
    b('supanniga_river',  'Supanniga Eating Room',  'ห้องทานข้าวสุพรรณิการ์',  'restaurant', 'restaurant',   115000,  2.9,  2.7),
    b('riva_arun_hotel',  'Riva Arun Bangkok Hotel','ริวา อรุณ กรุงเทพ',       'hotel',      'hotel_grand',  360000,  2.9, -2.8),
  ],
  boat_phraarthit: [
    b('khaosan_road',     'Khaosan Road Night Hub', 'ถนนข้าวสาร',              'attraction', 'jodd_fairs',   410000,  3.0,  2.7),
    b('riva_surya_ht',    'Riva Surya Bangkok',     'ริวา เซอร์ยา กรุงเทพ',    'hotel',      'hotel_grand',  365000,  2.9, -2.8),
    b('roti_mataba',      'Karim Roti Mataba',      'โรตีมะตะบะ พระอาทิตย์',   'restaurant', 'shophouse',    72000,  -2.9,  2.7),
  ],
  boat_nonthaburi: [
    b('nonthaburi_clock', 'Nonthaburi Pier Market', 'ตลาดท่าน้ำนนท์',          'market',     'market_tent',  195000,  2.9, -2.8),
    b('non_bakery',       'Nonthaburi Bakery Shop', 'นนท์เบเกอรี่ ท่าน้ำนนท์', 'restaurant', 'shophouse',    78000,   2.9,  2.8),
    b('nont_pier_711',    '7-Eleven Nonthaburi Pier','เซเว่น ท่าน้ำนนท์',      'seven',      'seven_eleven', 48000,  -2.9,  2.8),
  ],

  // ===== ENDGAME BONUS: BANGKOK EV CITY BUSES =====
  bus_sanamluang: [
    b('tha_maharaj',      'Tha Maharaj Community',  'ท่ามหาราช',               'mall',       'mall_modern',  390000, -2.9, -2.7),
    b('rattanakosin_ht',  'Royal Rattanakosin Hotel','โรงแรมรัตนโกสินทร์',     'hotel',      'hotel_grand',  340000,  2.9, -2.7),
    b('sanamluang_711',   '7-Eleven Ratchadamnoen', 'เซเว่น ราชดำเนิน',        'seven',      'seven_eleven', 52000,   2.8,  2.7),
  ],
  bus_victory: [
    b('century_vm_bus',   'Century The Movie Plaza','เซ็นจูรี่ อนุสาวรีย์ฯ',    'mall',       'mall_modern',  380000, -2.9,  2.7),
    b('vm_bus_711',       '7-Eleven Phaya Thai Island','เซเว่น เกาะพญาไท',     'seven',      'seven_eleven', 50000,  -2.9, -2.7),
    b('victory_hub_food', 'Victory Hub Dining Hall','วิคตอรี่ ฮับ',            'restaurant', 'restaurant',   92000,   2.9, -2.7),
  ],
  bus_siam: [
    b('siamscape',        'Siamscape Sky Tower',    'สยามสเคป',                'mall',       'mall_glass',   440000, -2.9,  2.8),
    b('somtum_nua_siam',  'Somtum Nua Siam Square', 'ส้มตำนัว สยามสแควร์',     'restaurant', 'shophouse',    88000,   2.9,  2.8),
    b('siam_bus_711',     '7-Eleven Siam Square Soi 7','เซเว่น สยามสแควร์ ซอย 7','seven',    'seven_eleven', 52000,  -2.9, -2.6),
  ],
  bus_pratunam: [
    b('platinum_mall',    'Platinum Fashion Mall',  'แพลทินัม แฟชั่น มอลล์',   'mall',       'centralworld', 495000, -2.9, -2.8),
    b('amari_watergate',  'Amari Bangkok Hotel',    'อมารี กรุงเทพ',           'hotel',      'hotel_grand',  395000,  2.9, -2.8),
    b('krungthong_plaza', 'Krungthong Plaza Market','กรุงทองพลาซ่า ประตูน้ำ',  'market',     'market_tent',  195000, -2.9,  2.8),
  ],
  bus_asok: [
    b('gmm_grammy',       'GMM Grammy Place Asok',  'ตึกแกรมมี่ อโศก',         'mall',       'mall_glass',   445000,  2.9, -2.7),
    b('asok_condo_q',     'The Esse Asoke Condo',   'ดิ เอส อโศก',             'condo',      'condo_sleek',  345000,  2.9,  2.8),
    b('midtown_asoke',    'Midtown Asoke Food Mall','มิดทาวน์ อโศก',           'restaurant', 'restaurant',   95000,  -2.9,  2.7),
  ],
  bus_khlongtoei: [
    b('port_authority',   'Khlong Toei Port Cafe',  'ท่าเรือคลองเตย',          'restaurant', 'restaurant',   95000,   2.9,  2.8),
    b('bigc_rama4',       'Big C Extra Rama IV',    'บิ๊กซี พระราม 4',         'mall',       'mall_modern',  390000, -2.9,  2.8),
    b('aspace_rama4',     'Lumpini Place Rama IV',  'ลุมพินี เพลส พระราม 4',   'condo',      'condo_sleek',  285000,  2.9, -2.7),
  ],
  bus_ekkamai: [
    b('major_ekkamai',    'Major Cineplex Sukhumvit','เมเจอร์ สุขุมวิท เอกมัย','mall',       'mall_modern',  410000,  2.9, -2.8),
    b('sabai_jai_ek',     'Sabai Jai Kai Yang',     'สบายใจไก่ย่าง เอกมัย',    'restaurant', 'restaurant',   92000,   2.9,  2.8),
    b('ekkamai_711_bus',  '7-Eleven Ekkamai Terminal','เซเว่น ขนส่งเอกมัย',    'seven',      'seven_eleven', 54000,  -2.9,  2.7),
  ],
};

// Station 7-Eleven slot config generator (affordable starter investment at every single station!)
export function getStationSevenConfig(station) {
  const tier = Math.max(1, Math.round((station.cost || 900) / 4500) + 1);
  const baseCost = Math.round(3500 + Math.pow(tier, 1.32) * 2800);
  const baseIncome = Math.round(baseCost * 0.011);
  // Keep Khlong Toei 7-Eleven cleanly clear of the nearby B-47 Rama IV bus shelter!
  const isKt = station.id === 'mrt_khlongtoei';
  return {
    id: `st711_${station.id}`,
    stationId: station.id,
    name: `7-Eleven @ ${station.name}`,
    thai: `เซเว่น สถานี${station.thai}`,
    category: 'seven',
    archType: 'seven_eleven',
    isStationSeven: true,
    baseCost,
    baseIncome,
    dx: isKt ? -1.85 : 1.7,
    dz: isKt ? 1.45 : 1.65,
  };
}

// Level 1..10 upgrade cost & passive income curves
export function getBuildingUpgradeCost(baseCost, currentLevel) {
  if (currentLevel <= 0) return baseCost;
  return Math.round(baseCost * Math.pow(1.65, currentLevel));
}

export function getBuildingIncome(baseIncome, level) {
  if (level <= 0) return 0;
  return Math.round(baseIncome * Math.pow(1.42, level - 1));
}
