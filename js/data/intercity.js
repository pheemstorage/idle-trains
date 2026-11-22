// Endgame Thailand Intercity Rail World View Data
// Unlocks when all Bangkok rail lines are completed!

export const THAILAND_HUB = {
  id: 'bangkok',
  name: 'Bangkok (Krung Thep Aphiwat)',
  thai: 'กรุงเทพมหานคร',
  x: 0,
  z: 4,
};

export const INTERCITY_CITIES = [
  {
    id: 'ayutthaya',
    name: 'Ayutthaya',
    thai: 'พระนครศรีอยุธยา',
    region: 'Central Heritage',
    x: -1,
    z: -12,
    color: '#D97706',
    cost: 45000,
    baseIncome: 3800,
    trainModel: 'SRT Heritage Express',
    landmark: 'Wat Chaiwatthanaram Stupas',
    landmarkStyle: 'stupa',
    description: 'Ancient Siamese capital connected via Northern SRT line.',
  },
  {
    id: 'pattaya',
    name: 'Pattaya / U-Tapao',
    thai: 'พัทยา – อู่ตะเภา',
    region: 'Eastern Seaboard',
    x: 16,
    z: 18,
    color: '#0EA5E9',
    cost: 75000,
    baseIncome: 6200,
    trainModel: 'EEC High-Speed Airport Rail',
    landmark: 'Pattaya Beachfront Bay & Pier',
    landmarkStyle: 'beach',
    description: 'Three-Airport High-Speed Rail racing from Suvarnabhumi to Pattaya beach.',
  },
  {
    id: 'huahin',
    name: 'Hua Hin',
    thai: 'หัวหิน',
    region: 'Royal Coast',
    x: -9,
    z: 24,
    color: '#DC2626',
    cost: 110000,
    baseIncome: 9200,
    trainModel: 'Royal Coastal Express',
    landmark: 'Hua Hin Royal Wooden Station',
    landmarkStyle: 'royal_station',
    description: 'Thailand’s most famous red-and-cream wooden royal railway pavilion.',
  },
  {
    id: 'chiangmai',
    name: 'Chiang Mai',
    thai: 'เชียงใหม่',
    region: 'Northern Mountains',
    x: -14,
    z: -48,
    color: '#16A34A',
    cost: 185000,
    baseIncome: 15500,
    trainModel: 'Shinkansen Northern Bullet',
    landmark: 'Doi Suthep Golden Chedi',
    landmarkStyle: 'mountain_temple',
    description: 'Scenic mountain viaduct rail linking Bangkok to Lanna’s misty peaks.',
  },
  {
    id: 'hatyai',
    name: 'Hat Yai',
    thai: 'หาดใหญ่',
    region: 'Southern Gateway',
    x: -2,
    z: 62,
    color: '#9333EA',
    cost: 280000,
    baseIncome: 24500,
    trainModel: 'Southern Express Sleeper',
    landmark: 'Hat Yai Clocktower & Southern Hub',
    landmarkStyle: 'clocktower',
    description: 'Southern Thailand’s bustling railway trade gateway toward Malaysia.',
  },
];

export function getIntercityUpgradeCost(city, level) {
  if (level <= 0) return city.cost;
  return Math.round(city.cost * Math.pow(1.75, level));
}

export function getIntercityIncome(city, level) {
  if (level <= 0) return 0;
  return Math.round(city.baseIncome * Math.pow(1.48, level - 1));
}
