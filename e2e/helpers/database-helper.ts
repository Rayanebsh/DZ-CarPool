// e2e/helpers/database-helper.ts

import axios, { AxiosInstance } from 'axios';

/**
 * Helper pour interagir avec la base de données et nettoyer après les tests
 */
export class DatabaseHelper {
  private apiUrl: string;
  private apiClient: AxiosInstance;

  constructor(baseUrl: string = 'http://localhost:8000/api/v1') {
    this.apiUrl = baseUrl;
    this.apiClient = axios.create({
      baseURL: this.apiUrl,
      timeout: 10000,
    });
  }

  /**
   * Supprimer un utilisateur de test par email
   */
  async deleteTestUser(email: string, adminToken: string) {
    try {
      await this.apiClient.delete('/users/delete-by-email/', {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { email }
      });
      console.log(`✅ User deleted: ${email}`);
    } catch (error) {
      console.warn('Could not delete test user:', error);
    }
  }

  /**
   * Supprimer tous les utilisateurs de test (ceux avec email test.*)
   */
  async cleanAllTestUsers(adminToken: string) {
    try {
      const response = await this.apiClient.get('/users/', {
        headers: { Authorization: `Bearer ${adminToken}` },
        params: { email__contains: 'test.' }
      });
      
      for (const user of response.data.results || response.data) {
        if (user.email.includes('test.')) {
          await this.deleteTestUser(user.email, adminToken);
        }
      }
    } catch (error) {
      console.warn('Could not clean test users:', error);
    }
  }

  /**
   * Nettoyer tous les trajets d'un utilisateur
   */
  async cleanUserTrips(userId: number, token: string) {
    try {
      const response = await this.apiClient.get('/trajets/my_trips/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const trips = response.data.results || response.data;
      
      for (const trip of trips) {
        await this.deleteTrip(trip.id, token);
      }
      
      console.log(`✅ Cleaned ${trips.length} trips for user ${userId}`);
    } catch (error) {
      console.warn('Could not clean user trips:', error);
    }
  }

  /**
   * Supprimer un trajet spécifique
   */
  async deleteTrip(tripId: number, token: string) {
    try {
      await this.apiClient.delete(`/trajets/${tripId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Trip deleted: ${tripId}`);
    } catch (error) {
      console.warn(`Could not delete trip ${tripId}:`, error);
    }
  }

  /**
   * Supprimer tous les trajets de test (créés aujourd'hui)
   */
  async cleanTodaysTrips(adminToken: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await this.apiClient.get('/trajets/', {
        headers: { Authorization: `Bearer ${adminToken}` },
        params: { created_at__gte: today }
      });
      
      const trips = response.data.results || response.data;
      
      for (const trip of trips) {
        await this.deleteTrip(trip.id, adminToken);
      }
      
      console.log(`✅ Cleaned ${trips.length} trips from today`);
    } catch (error) {
      console.warn('Could not clean today\'s trips:', error);
    }
  }

  /**
   * Créer un utilisateur admin pour les tests
   */
  async createAdminUser() {
    try {
      const adminData = {
        email: `admin.test.${Date.now()}@example.com`,
        password: 'AdminPassword123!',
        first_name: 'Admin',
        last_name: 'Test',
        is_staff: true,
        is_superuser: true
      };
      
      const response = await this.apiClient.post('/auth/register/', adminData);
      
      // Login pour obtenir le token
      const loginResponse = await this.apiClient.post('/auth/login/', {
        email: adminData.email,
        password: adminData.password
      });
      
      return {
        user: response.data,
        token: loginResponse.data.access_token
      };
    } catch (error) {
      console.warn('Could not create admin user:', error);
      return null;
    }
  }

  /**
   * Vérifier si un utilisateur existe
   */
  async userExists(email: string, token?: string): Promise<boolean> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await this.apiClient.get('/users/', {
        headers,
        params: { email }
      });
      
      const users = response.data.results || response.data;
      return users.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Obtenir les informations d'un utilisateur
   */
  async getUserByEmail(email: string, token: string) {
    try {
      const response = await this.apiClient.get('/users/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { email }
      });
      
      const users = response.data.results || response.data;
      return users[0] || null;
    } catch (error) {
      console.warn('Could not get user:', error);
      return null;
    }
  }

  /**
   * Vérifier la santé de l'API
   */
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await this.apiClient.get('/health/');
      return response.status === 200;
    } catch {
      try {
        // Fallback: essayer juste de ping l'API
        const response = await this.apiClient.get('/');
        return response.status < 500;
      } catch {
        return false;
      }
    }
  }

  /**
   * Attendre que l'API soit disponible
   */
  async waitForApi(maxRetries: number = 10, delayMs: number = 2000): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      const healthy = await this.checkApiHealth();
      
      if (healthy) {
        console.log('✅ API is ready');
        return true;
      }
      
      console.log(`⏳ Waiting for API... (attempt ${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    console.error('❌ API is not available');
    return false;
  }

  /**
   * Nettoyer complètement après un test
   */
  async fullCleanup(userEmail: string, token: string) {
    // Nettoyer les trajets
    const user = await this.getUserByEmail(userEmail, token);
    if (user) {
      await this.cleanUserTrips(user.id, token);
    }
    
    // On ne supprime pas forcément l'utilisateur pour permettre de débugger
    console.log(`✅ Cleanup completed for ${userEmail}`);
  }

  /**
   * Réinitialiser la base de données (DANGEREUX - uniquement pour tests)
   */
  async resetDatabase(adminToken: string) {
    console.warn('⚠️  WARNING: Resetting database...');
    
    try {
      await this.apiClient.post('/admin/reset-database/', {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('✅ Database reset completed');
    } catch (error) {
      console.error('❌ Could not reset database:', error);
    }
  }

  /**
   * Créer des données de seed pour les tests
   */
  async seedTestData(adminToken: string) {
    try {
      await this.apiClient.post('/admin/seed/', {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('✅ Test data seeded');
    } catch (error) {
      console.warn('Could not seed test data:', error);
    }
  }
}