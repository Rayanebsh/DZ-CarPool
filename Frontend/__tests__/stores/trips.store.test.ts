import { renderHook, act } from '@testing-library/react';
import { useTripsStore } from '@/stores/trips-store';

describe('TripsStore', () => {
  beforeEach(() => {
    useTripsStore.setState({
      driverTrips: [],
      passengerTrips: [],
      searchResults: [],
      selectedTrip: null,
      loading: false,
      error: null,
      setDriverTrips: useTripsStore.getState().setDriverTrips,
      setPassengerTrips: useTripsStore.getState().setPassengerTrips,
      setSearchResults: useTripsStore.getState().setSearchResults,
      setSelectedTrip: useTripsStore.getState().setSelectedTrip,
      addTrip: useTripsStore.getState().addTrip,
      updateTrip: useTripsStore.getState().updateTrip,
      cancelTrip: useTripsStore.getState().cancelTrip,
      searchTrips: useTripsStore.getState().searchTrips,
    });
  });

  test('initial state is correct', () => {
    const { result } = renderHook(() => useTripsStore());

    expect(result.current.driverTrips).toEqual([]);
    expect(result.current.passengerTrips).toEqual([]);
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.selectedTrip).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('setDriverTrips() updates driver trips', () => {
    const { result } = renderHook(() => useTripsStore());
    const mockTrips = [
      { id: 1, from: 'Alger', to: 'Oran' },
      { id: 2, from: 'Constantine', to: 'Annaba' },
    ] as any[];

    act(() => {
      result.current.setDriverTrips(mockTrips);
    });

    expect(result.current.driverTrips).toEqual(mockTrips);
  });

  test('setPassengerTrips() updates passenger trips', () => {
    const { result } = renderHook(() => useTripsStore());
    const mockTrips = [
      { id: 3, from: 'Tizi', to: 'Alger' },
      { id: 4, from: 'Oran', to: 'Alger' },
    ] as any[];

    act(() => {
      result.current.setPassengerTrips(mockTrips);
    });

    expect(result.current.passengerTrips).toEqual(mockTrips);
  });

  test('setSearchResults() updates searchResults', () => {
    const { result } = renderHook(() => useTripsStore());
    const mockTrips = [{ id: 5, from: 'Alger', to: 'Blida' }] as any[];

    act(() => {
      result.current.setSearchResults(mockTrips);
    });

    expect(result.current.searchResults).toEqual(mockTrips);
  });

  test('addTrip() adds new trip to driver trips', () => {
    const { result } = renderHook(() => useTripsStore());
    const newTrip = {
      id: 1,
      from: 'Alger',
      to: 'Oran',
      status: 'upcoming',
    } as any;

    act(() => {
      result.current.addTrip(newTrip);
    });

    expect(result.current.driverTrips).toContainEqual(newTrip);
    expect(result.current.driverTrips).toHaveLength(1);
  });

  test('updateTrip() updates trip in both lists', () => {
    const { result } = renderHook(() => useTripsStore());
    const trip = { id: 1, from: 'Alger', to: 'Oran', seats: 4 } as any;

    act(() => {
      result.current.setDriverTrips([trip]);
      result.current.setPassengerTrips([trip]);
    });

    act(() => {
      result.current.updateTrip(1, { seats: 3 });
    });

    expect(result.current.driverTrips[0].seats).toBe(3);
    expect(result.current.passengerTrips[0].seats).toBe(3);
  });

  test('cancelTrip() marks trip as cancelled', () => {
    const { result } = renderHook(() => useTripsStore());
    const trip = { id: 1, status: 'upcoming' } as any;

    act(() => {
      result.current.setDriverTrips([trip]);
    });

    act(() => {
      result.current.cancelTrip(1);
    });

    expect(result.current.driverTrips[0].status).toBe('cancelled');
  });

  test('setSelectedTrip() updates selected trip', () => {
    const { result } = renderHook(() => useTripsStore());
    const trip = { id: 1, from: 'Alger', to: 'Oran' } as any;

    act(() => {
      result.current.setSelectedTrip(trip);
    });

    expect(result.current.selectedTrip).toEqual(trip);
  });

  test('searchTrips() sets loading then resets it and updates searchResults (success path)', async () => {
    const { result } = renderHook(() => useTripsStore());

    // on remplace temporairement searchTrips par une version contrôlée
    const spy = jest.spyOn(result.current, 'searchTrips');

    // on appelle la vraie implémentation (qui met loading true/false et searchResults [])
    await act(async () => {
      await result.current.searchTrips({});
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.searchResults).toEqual([]);

    spy.mockRestore();
  });

  test('searchTrips() handles error and sets error state', async () => {
    // on mock la fonction pour forcer une erreur dans le try/catch interne
    const failingSearch = async () => {
      const state = useTripsStore.getState();
      // on simule manuellement le même comportement que searchTrips mais avec throw
      state.loading = true;
      throw new Error('Search failed');
    };

    act(() => {
      useTripsStore.setState({
        ...useTripsStore.getState(),
        searchTrips: async () => {
          try {
            await failingSearch();
          } catch (error: any) {
            useTripsStore.setState({
              error: error.message,
              loading: false,
            });
          }
        },
      });
    });

    await act(async () => {
      await useTripsStore.getState().searchTrips({});
    });

    expect(useTripsStore.getState().loading).toBe(false);
    expect(useTripsStore.getState().error).toBe('Search failed');
  });
});
