import trajetService from '@/services/trajet.service';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('TrajetService', () => {
  let mock: MockAdapter;
  const API_BASE = 'http://localhost:8000/api/v1';

  beforeEach(() => {
    mock = new MockAdapter(axios);
    jest.clearAllMocks();
  });

  afterEach(() => {
    mock.restore();
  });

  // ----------------------
  // Search
  // ----------------------
  describe('Search', () => {
    test('simpleSearch() performs basic search without auth', async () => {
      const mockResponse = {
        results: [
          {
            id: 1,
            ville_depart: 'Alger',
            ville_arrivee: 'Oran',
            price: 500,
          },
        ],
        count: 1,
      };

      mock.onPost(`${API_BASE}/trajets/search/`).reply(200, mockResponse);

      const result = await trajetService.simpleSearch({
        ville_depart: 'Alger',
        ville_arrivee: 'Oran',
      });

      expect(result).toEqual(mockResponse);
    });

    test('simpleSearch() sends optional filters (date, page)', async () => {
      const payload = {
        ville_depart: 'Alger',
        ville_arrivee: 'Oran',
        date: '2025-01-01',
        nbr_places: 2,
      };

      const mockResponse = { results: [], count: 0 };

      const spy = jest.spyOn(axios, 'post');

      mock.onPost(`${API_BASE}/trajets/search/`).reply(200, mockResponse);

      const result = await trajetService.simpleSearch(payload);

      expect(result).toEqual(mockResponse);
      expect(spy).toHaveBeenCalledWith(
        `${API_BASE}/trajets/search/`,
        payload,
        expect.any(Object),
      );
    });

    test('simpleSearch() handles network error', async () => {
      mock.onPost(`${API_BASE}/trajets/search/`).networkError();

      await expect(
        trajetService.simpleSearch({
          ville_depart: 'Alger',
          ville_arrivee: 'Oran',
        }),
      ).rejects.toThrow();
    });

    test('intelligentSearch() performs filtered search', async () => {
      const mockResponse = {
        results: [
          {
            id: 1,
            ville_depart: 'Alger',
            ville_arrivee: 'Oran',
            price: 500,
            is_confort: true,
          },
        ],
        count: 1,
      };

      mock
        .onPost(`${API_BASE}/trajets/intelligent_search/`)
        .reply(200, mockResponse);

      const result = await trajetService.intelligentSearch({
        ville_depart: 'Alger',
        ville_arrivee: 'Oran',
        price_max: 600,
        is_confort: true,
      });

      expect(result).toEqual(mockResponse);
    });

    test('intelligentSearch() handles 400 error', async () => {
      mock
        .onPost(`${API_BASE}/trajets/intelligent_search/`)
        .reply(400, { detail: 'Bad request' });

      await expect(
        trajetService.intelligentSearch({
          ville_depart: 'Alger',
          ville_arrivee: 'Oran',
        }),
      ).rejects.toThrow();
    });
  });

  // ----------------------
  // Trajet Details
  // ----------------------
  describe('Trajet Details', () => {
    test('getTrajetDetails() fetches trajet by ID', async () => {
      const mockTrajet = {
        id: 1,
        ville_depart: 'Alger',
        ville_arrivee: 'Oran',
        conducteur_name: 'John Doe',
      };

      mock.onGet(`${API_BASE}/trajets/1/`).reply(200, mockTrajet);

      const result = await trajetService.getTrajetDetails(1);

      expect(result).toEqual(mockTrajet);
    });

    test('getTrajetDetails() handles 404 error', async () => {
      mock
        .onGet(`${API_BASE}/trajets/999/`)
        .reply(404, { detail: 'Not found' });

      await expect(trajetService.getTrajetDetails(999)).rejects.toThrow();
    });
  });

  // ----------------------
  // Booking
  // ----------------------
  describe('Booking', () => {
    test('bookTrajet() creates reservation', async () => {
      const mockResponse = {
        id: 1,
        trajet: 1,
        nbr_places: 2,
        status: 'PENDING',
      };

      mock.onPost(`${API_BASE}/reservations/`).reply(201, mockResponse);

      const result = await trajetService.bookTrajet({
        trajet: 1,
        nbr_places: 2,
        message: 'Hello',
      });

      expect(result).toEqual(mockResponse);
    });

    test('bookTrajet() sends message when provided', async () => {
      const payload = { trajet: 1, nbr_places: 2, message: 'Hello' };
      const spy = jest.spyOn(axios, 'post');

      mock.onPost(`${API_BASE}/reservations/`).reply(201, {
        id: 1,
        ...payload,
        status: 'PENDING',
      });

      await trajetService.bookTrajet(payload);

      // Correction : ne vérifier que les 2 premiers arguments
      expect(spy).toHaveBeenCalledWith(`${API_BASE}/reservations/`, payload);

      spy.mockRestore();
    });

    test('bookTrajet() handles 401 error', async () => {
      mock.onPost(`${API_BASE}/reservations/`).reply(401);

      await expect(
        trajetService.bookTrajet({
          trajet: 1,
          nbr_places: 2,
        }),
      ).rejects.toThrow('Session expirée. Veuillez vous reconnecter.');
    });

    test('bookTrajet() handles server 500 error', async () => {
      mock.onPost(`${API_BASE}/reservations/`).reply(500);

      await expect(
        trajetService.bookTrajet({
          trajet: 1,
          nbr_places: 2,
        }),
      ).rejects.toThrow();
    });
  });

  // ----------------------
  // Trip Management
  // ----------------------
  describe('Trip Management', () => {
    test('createTrajet() creates new trip', async () => {
      const mockTrajet = {
        id: 1,
        ville_depart: 'Alger',
        ville_arrivee: 'Oran',
      };

      mock.onPost(`${API_BASE}/trajets/`).reply(201, mockTrajet);

      const result = await trajetService.createTrajet({
        ville_depart: 'Alger',
        ville_arrivee: 'Oran',
      });

      expect(result).toEqual(mockTrajet);
    });

    test('createTrajet() handles error response', async () => {
      mock
        .onPost(`${API_BASE}/trajets/`)
        .reply(400, { detail: 'Invalid data' });

      await expect(
        trajetService.createTrajet({
          ville_depart: 'Alger',
          ville_arrivee: 'Oran',
        }),
      ).rejects.toThrow();
    });

    test('getMyTrajets() fetches user trips without status', async () => {
      const mockTrajets = [
        { id: 1, status: 'ACTIVE' },
        { id: 2, status: 'ACTIVE' },
      ];

      mock.onGet(`${API_BASE}/trajets/my_trips/`).reply(200, mockTrajets);

      const result = await trajetService.getMyTrajets();

      expect(result).toEqual(mockTrajets);
    });

    test('getMyTrajets() fetches user trips with status filter', async () => {
      const mockTrajets = [{ id: 1, status: 'UPCOMING' }];

      mock
        .onGet(`${API_BASE}/trajets/my_trips/`, {
          params: { status: 'UPCOMING' },
        })
        .reply(200, mockTrajets);

      const result = await trajetService.getMyTrajets('UPCOMING');

      expect(result).toEqual(mockTrajets);
    });

    test('getMyTrajets() handles network error', async () => {
      mock.onGet(`${API_BASE}/trajets/my_trips/`).networkError();

      await expect(trajetService.getMyTrajets()).rejects.toThrow();
    });

    test('getUpcomingTrajets() returns upcoming trips', async () => {
      const mockTrajets = [{ id: 1, status: 'upcoming' }];

      mock.onGet(`${API_BASE}/trajets/upcoming/`).reply(200, mockTrajets);

      const result = await trajetService.getUpcomingTrajets();

      expect(result).toEqual(mockTrajets);
    });

    test('getUpcomingTrajets() handles error', async () => {
      mock.onGet(`${API_BASE}/trajets/upcoming/`).reply(500);

      await expect(trajetService.getUpcomingTrajets()).rejects.toThrow();
    });

    test('getPastTrajets() returns past trips', async () => {
      const mockTrajets = [{ id: 1, status: 'completed' }];

      mock.onGet(`${API_BASE}/trajets/past/`).reply(200, mockTrajets);

      const result = await trajetService.getPastTrajets();

      expect(result).toEqual(mockTrajets);
    });

    test('getPastTrajets() handles error', async () => {
      mock.onGet(`${API_BASE}/trajets/past/`).reply(500);

      await expect(trajetService.getPastTrajets()).rejects.toThrow();
    });

    test('cancelTrajet() cancels trip', async () => {
      mock
        .onPost(`${API_BASE}/trajets/1/cancel/`)
        .reply(200, { success: true });

      const result = await trajetService.cancelTrajet(1);

      expect(result).toEqual({ success: true });
    });

    test('cancelTrajet() handles 403 error', async () => {
      mock
        .onPost(`${API_BASE}/trajets/1/cancel/`)
        .reply(403, { detail: 'Forbidden' });

      await expect(trajetService.cancelTrajet(1)).rejects.toThrow();
    });
  });

  // ----------------------
  // Fuel prices
  // ----------------------
  describe('Fuel prices', () => {
    test('getFuelPrices() returns data', async () => {
      const mockData = { diesel: 100, essence: 120 };

      mock.onGet(`${API_BASE}/trajets/fuel_prices/`).reply(200, mockData);

      const result = await trajetService.getFuelPrices();

      expect(result).toEqual(mockData);
    });

    test('getFuelPrices() handles error', async () => {
      mock.onGet(`${API_BASE}/trajets/fuel_prices/`).reply(500);

      await expect(trajetService.getFuelPrices()).rejects.toThrow();
    });
  });
});
