// e2e/fixtures/test-data.ts

/**
 * Données de test réutilisables pour DZ-CarPool
 */

export const testUsers = {
  newUser: {
    firstName: 'Ahmed',
    lastName: 'Benali',
    email: `test.user.${Date.now()}@example.com`,
    phone: '0555123456',
    password: 'TestPassword123!',
  },
  
  existingUser: {
    email: 'existing.user@example.com',
    password: 'ExistingPassword123!',
  },
  
  // ✅ AJOUT : Compte vérifié pour les tests de création de trajet
  verifiedUser: {
    email: 'r_bessah@estin.dz',
    password: 'Besray@1986/*',
  },
  
  verifiedUserAlt: {
    firstName: 'Fatima',
    lastName: 'Kaci',
    email: `verified.${Date.now()}@example.com`,
    phone: '0666789012',
    password: 'VerifiedPass123!',
  }
};

export const testTrip = {
  departure: 'Alger',
  arrival: 'Oran',
  
  date: () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  },
  
  dateInTwoDays: () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split('T')[0];
  },
  
  time: '14:00',
  seats: 3,
  price: 1500,
  fuelType: 'gasoil',
  fuelConsumption: 7.5,
};

export const testRoutes = {
  algerOran: {
    departure: 'Alger',
    arrival: 'Oran',
    expectedDistance: { min: 350, max: 500 }, // km
  },
  
  algerConstantine: {
    departure: 'Alger',
    arrival: 'Constantine',
    expectedDistance: { min: 380, max: 450 },
  },
  
  oranTlemcen: {
    departure: 'Oran',
    arrival: 'Tlemcen',
    expectedDistance: { min: 140, max: 180 },
  }
};

export const testPreferences = {
  interests: ['Musique', 'Sport', 'Lecture'],
  habits: ['Non-fumeur', 'Ponctuel'],
  driving: ['Conduite souple', 'Respect du code'],
};

/**
 * Générateurs de données aléatoires
 */
export const generators = {
  randomEmail: () => `test.${Date.now()}.${Math.random().toString(36).substring(7)}@example.com`,
  
  randomPhone: () => {
    const prefixes = ['055', '056', '066', '077'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(1000000 + Math.random() * 9000000);
    return `${prefix}${number}`;
  },
  
  randomName: () => {
    const firstNames = ['Ahmed', 'Fatima', 'Karim', 'Amina', 'Yacine', 'Sarah'];
    const lastNames = ['Benali', 'Kaci', 'Boudiaf', 'Hamdani', 'Mansouri', 'Zerrouki'];
    return {
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)]
    };
  }
};