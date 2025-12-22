'use client';
import { create } from 'zustand';

interface Trip {
  id: number;
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  seatsBooked?: number;
  pricePerSeat: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  driver?: any;
  passengers?: any[];
}

interface TripsState {
  // État
  driverTrips: Trip[];
  passengerTrips: Trip[];
  searchResults: Trip[];
  selectedTrip: Trip | null;
  loading: boolean;
  error: string | null;

  // Actions
  setDriverTrips: (trips: Trip[]) => void;
  setPassengerTrips: (trips: Trip[]) => void;
  setSearchResults: (trips: Trip[]) => void;
  setSelectedTrip: (trip: Trip | null) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (id: number, updates: Partial<Trip>) => void;
  cancelTrip: (id: number) => void;
  searchTrips: (filters: any) => Promise<void>;
}

export const useTripsStore = create<TripsState>((set) => ({
  // État initial
  driverTrips: [],
  passengerTrips: [],
  searchResults: [],
  selectedTrip: null,
  loading: false,
  error: null,

  // Setters
  setDriverTrips: (trips) => set({ driverTrips: trips }),
  setPassengerTrips: (trips) => set({ passengerTrips: trips }),
  setSearchResults: (trips) => set({ searchResults: trips }),
  setSelectedTrip: (trip) => set({ selectedTrip: trip }),

  // Ajouter un trajet
  addTrip: (trip) =>
    set((state) => ({
      driverTrips: [...state.driverTrips, trip],
    })),

  // Mettre à jour un trajet
  updateTrip: (id, updates) =>
    set((state) => ({
      driverTrips: state.driverTrips.map((t) =>
        t.id === id ? { ...t, ...updates } : t,
      ),
      passengerTrips: state.passengerTrips.map((t) =>
        t.id === id ? { ...t, ...updates } : t,
      ),
    })),

  // Annuler un trajet
  cancelTrip: (id) =>
    set((state) => ({
      driverTrips: state.driverTrips.map((t) =>
        t.id === id ? { ...t, status: 'cancelled' as const } : t,
      ),
    })),

  // Rechercher des trajets
  searchTrips: async () => {
    try {
      set({ loading: true, error: null });
      // Appel API ici
      // const results = await tripsService.search(filters);
      // set({ searchResults: results, loading: false });

      // Mock pour l'exemple
      set({ searchResults: [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
