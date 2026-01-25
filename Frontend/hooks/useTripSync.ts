import { useEffect } from 'react';

interface TripSyncOptions {
  tripId: number | string;
  onUpdate: (newPlacesDisponibles: number) => void;
  enabled?: boolean;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const useTripSync = ({
  tripId,
  onUpdate,
  enabled = true,
}: TripSyncOptions) => {
  useEffect(() => {
    if (!enabled || !tripId) return;

    // Polling toutes les 5 secondes
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/trajets/${tripId}/places/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          onUpdate(data.places_disponibles);
        }
      } catch (error) {
        console.error('❌ Erreur sync places:', error);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [tripId, enabled, onUpdate]);
};
