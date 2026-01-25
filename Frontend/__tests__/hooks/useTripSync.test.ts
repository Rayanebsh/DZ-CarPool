import { renderHook, act, waitFor } from '@testing-library/react';
import { useTripSync } from '@/hooks/useTripSync';

describe('useTripSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('effectue un polling toutes les 5 secondes', async () => {
    const onUpdate = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ places_disponibles: 3 }),
    });

    renderHook(() =>
      useTripSync({
        tripId: 123,
        onUpdate,
        enabled: true,
      }),
    );

    // Avancer de 5 secondes
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledWith(3);
    });

    // Avancer encore de 5 secondes
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('ne fait pas de polling si enabled est false', async () => {
    const onUpdate = jest.fn();

    renderHook(() =>
      useTripSync({
        tripId: 123,
        onUpdate,
        enabled: false,
      }),
    );

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('ne fait pas de polling sans tripId', async () => {
    const onUpdate = jest.fn();

    renderHook(() =>
      useTripSync({
        tripId: '',
        onUpdate,
        enabled: true,
      }),
    );

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("gère les erreurs d'API sans crasher", async () => {
    const onUpdate = jest.fn();
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    renderHook(() =>
      useTripSync({
        tripId: 123,
        onUpdate,
        enabled: true,
      }),
    );

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it('arrête le polling au démontage', async () => {
    const onUpdate = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ places_disponibles: 3 }),
    });

    const { unmount } = renderHook(() =>
      useTripSync({
        tripId: 123,
        onUpdate,
        enabled: true,
      }),
    );

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    unmount();

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    // Ne devrait pas avoir fait d'appels supplémentaires
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("utilise la bonne URL pour l'API", async () => {
    const onUpdate = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ places_disponibles: 3 }),
    });

    renderHook(() =>
      useTripSync({
        tripId: 456,
        onUpdate,
        enabled: true,
      }),
    );

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/trajets/456/places/',
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });
});
