// services/trajet.service.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface SimpleSearchParams {
  ville_depart: string;
  ville_arrivee: string;
  date?: string;
  nbr_places?: number;
}

export interface IntelligentSearchParams extends SimpleSearchParams {
  price_max?: number;
  departure_time?: 'morning' | 'afternoon' | 'evening';
  preference_ids?: number[];
  is_confort?: boolean;
}

export interface Trajet {
  id: number;
  conducteur: number;
  conducteur_name: string;
  conducteur_rating: number;
  conducteur_picture: string | null;
  ville_depart: string;
  ville_arrivee: string;
  date: string;
  heure_depart: string;
  nbr_places: number;
  places_disponibles: number;
  price: number;
  distance: number;
  is_confort: boolean;
  luggage_allowed: boolean;
  status: string;
}

export interface SearchResponse {
  results: Trajet[];
  count: number;
  search_params: {
    depart: string;
    arrivee: string;
    date?: string;
    places: number;
  };
}

class TrajetService {
  /**
   * 🔍 RECHERCHE SIMPLE - Pour la recherche initiale (PUBLIQUE)
   * Pas de filtres avancés, pas d'authentification requise
   */
  async simpleSearch(params: SimpleSearchParams): Promise<SearchResponse> {
    try {
      console.log('🔍 Recherche simple (publique):', params);

      const response = await axios.post(`${API_URL}/api/v1/trajets/search/`, params, {
        headers: {
          'Content-Type': 'application/json',
        },
        // ⚠️ Pas de token pour cette recherche
        transformRequest: [
          (data, headers) => {
            delete headers.Authorization;
            return JSON.stringify(data);
          },
        ],
      });

      console.log(`✅ ${response.data.count} trajet(s) trouvé(s)`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur recherche simple:', error);
      throw error;
    }
  }

  /**
   * 🎯 RECHERCHE INTELLIGENTE - Avec filtres avancés (PUBLIQUE)
   * Inclut les préférences, prix max, heure, confort, etc.
   */
  async intelligentSearch(
    params: IntelligentSearchParams,
  ): Promise<SearchResponse> {
    try {
      console.log('🎯 Recherche intelligente avec filtres:', params);

      const response = await axios.post(
        `${API_URL}/api/v1/trajets/intelligent_search/`,
        params,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          // ⚠️ Pas de token pour cette recherche
          transformRequest: [
            (data, headers) => {
              delete headers.Authorization;
              return JSON.stringify(data);
            },
          ],
        },
      );

      console.log(`✅ ${response.data.count} trajet(s) trouvé(s) avec filtres`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur recherche intelligente:', error);
      throw error;
    }
  }

  /**
   * 📄 DÉTAILS D'UN TRAJET - Public
   */
  async getTrajetDetails(trajetId: number): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/api/v1/trajets/${trajetId}/`, {
        transformRequest: [
          (data, headers) => {
            delete headers.Authorization;
            return data;
          },
        ],
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur chargement trajet:', error);
      throw error;
    }
  }

  /**
   * 📝 RÉSERVER UN TRAJET - Authentification REQUISE
   * Le token sera automatiquement ajouté par les intercepteurs Axios
   */
  async bookTrajet(bookingData: {
    trajet: number;
    nbr_places: number;
    message?: string;
  }): Promise<any> {
    try {
      console.log('📝 Création de réservation:', bookingData);

      // ✅ Le token sera ajouté automatiquement par l'intercepteur
      const response = await axios.post(
        `${API_URL}/api/v1/reservations/`,
        bookingData,
      );

      console.log('✅ Réservation créée:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        '❌ Erreur de réservation:',
        error.response?.data || error.message,
      );

      if (error.response?.status === 401) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      throw error;
    }
  }

  /**
   * 🚗 CRÉER UN TRAJET - Authentification REQUISE
   */
  async createTrajet(trajetData: any): Promise<Trajet> {
    try {
      const response = await axios.post(`${API_URL}/api/v1/trajets/`, trajetData);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur création trajet:', error);
      throw error;
    }
  }

  /**
   * 📋 MES TRAJETS - Authentification REQUISE
   */
  async getMyTrajets(status?: string): Promise<Trajet[]> {
    try {
      const params = status ? { status } : {};
      const response = await axios.get(`${API_URL}/api/v1/trajets/my_trips/`, {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur chargement trajets:', error);
      throw error;
    }
  }

  /**
   * ⏰ TRAJETS À VENIR - Authentification REQUISE
   */
  async getUpcomingTrajets(): Promise<Trajet[]> {
    try {
      const response = await axios.get(`${API_URL}/api/v1/trajets/upcoming/`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      throw error;
    }
  }

  /**
   * 📅 TRAJETS PASSÉS - Authentification REQUISE
   */
  async getPastTrajets(): Promise<Trajet[]> {
    try {
      const response = await axios.get(`${API_URL}/api/v1/trajets/past/`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      throw error;
    }
  }

  /**
   * ❌ ANNULER UN TRAJET - Authentification REQUISE
   */
  async cancelTrajet(trajetId: number): Promise<any> {
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/trajets/${trajetId}/cancel/`,
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur annulation:', error);
      throw error;
    }
  }

  /**
   * ⛽ PRIX DU CARBURANT - Public
   */
  async getFuelPrices(): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/api/v1/trajets/fuel_prices/`, {
        transformRequest: [
          (data, headers) => {
            delete headers.Authorization;
            return data;
          },
        ],
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur prix carburant:', error);
      throw error;
    }
  }
}

const trajetService = new TrajetService();
export default trajetService;
