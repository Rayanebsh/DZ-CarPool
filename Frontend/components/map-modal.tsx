'use client';

import { useEffect } from 'react';
import { X, ExternalLink, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  departureCoords: { lat: string; lon: string } | null;
  arrivalCoords: { lat: string; lon: string } | null;
  departure: string;
  arrival: string;
  distance?: number | null;
  duration?: string | null;
}

export function MapModal({
  isOpen,
  onClose,
  departureCoords,
  arrivalCoords,
  departure,
  arrival,
  distance,
  duration,
}: MapModalProps) {
  const { language } = useLanguage();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !departureCoords || !arrivalCoords) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full h-full md:w-[90vw] md:h-[90vh] md:rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'en' ? 'Route Overview' : "Aperçu de l'itinéraire"}
            </h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>{departure}</span>
              </div>
              <span>→</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>{arrival}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${
              Math.min(Number(departureCoords.lon), Number(arrivalCoords.lon)) -
              0.5
            },${
              Math.min(Number(departureCoords.lat), Number(arrivalCoords.lat)) -
              0.5
            },${
              Math.max(Number(departureCoords.lon), Number(arrivalCoords.lon)) +
              0.5
            },${
              Math.max(Number(departureCoords.lat), Number(arrivalCoords.lat)) +
              0.5
            }&layer=mapnik&marker=${departureCoords.lat},${departureCoords.lon}&marker=${
              arrivalCoords.lat
            },${arrivalCoords.lon}`}
            style={{ border: 0 }}
            title="Interactive Route Map"
          />

          {/* Floating info card */}
          <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">
              {language === 'en' ? 'Trip Details' : 'Détails du trajet'}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {language === 'en' ? 'Distance' : 'Distance'}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {distance} km
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {language === 'en' ? 'Est. Duration' : 'Durée estimée'}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {duration}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <a
                href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${departureCoords.lat}%2C${departureCoords.lon}%3B${arrivalCoords.lat}%2C${arrivalCoords.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#FF5722] hover:bg-[#E64A19] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Navigation className="w-4 h-4" />
                {language === 'en' ? 'Open in Maps' : 'Ouvrir dans Maps'}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-sm text-gray-600">
          <p>
            {language === 'en'
              ? 'Map data © OpenStreetMap contributors'
              : 'Données cartographiques © contributeurs OpenStreetMap'}
          </p>
        </div>
      </div>
    </div>
  );
}
