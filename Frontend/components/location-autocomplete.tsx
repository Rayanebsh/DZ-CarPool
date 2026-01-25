'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';

interface Location {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
  };
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, location?: Location) => void;
  placeholder: string;
  icon?: React.ReactNode;
  className?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder,
  icon,
  className = '',
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSelected, setIsSelected] = useState(false); // ✅ NOUVEAU : Track si une sélection a été faite
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        setError(null);
        setIsSelected(false); // ✅ Reset si on efface
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Using Nominatim API for Algeria (Yassir-like experience)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(value)}&` +
            `countrycodes=dz&` +
            `format=json&` +
            `limit=8&` +
            `addressdetails=1&` +
            `accept-language=fr`,
          {
            headers: {
              'User-Agent': 'DZ-CarPool/1.0',
            },
          },
        );

        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }

        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0 && !isSelected); // ✅ Ne pas ouvrir si déjà sélectionné
      } catch (error) {
        console.error('[v0] Error fetching location suggestions:', error);
        setError('Impossible de charger les suggestions');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(debounce);
  }, [value, isSelected]); // ✅ Ajout de isSelected dans les dépendances

  const handleSelect = (location: Location) => {
    // Format display name to show city/town first
    const cityName =
      location.address?.city ||
      location.address?.town ||
      location.address?.village;
    const displayName = cityName
      ? `${cityName}, ${location.address?.state || 'Algeria'}`
      : location.display_name;

    onChange(displayName, location);
    setShowSuggestions(false);
    setSuggestions([]); // ✅ Vider les suggestions
    setIsSelected(true); // ✅ Marquer comme sélectionné
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?` +
                `lat=${latitude}&` +
                `lon=${longitude}&` +
                `format=json&` +
                `addressdetails=1&` +
                `accept-language=fr`,
              {
                headers: {
                  'User-Agent': 'DZ-CarPool/1.0',
                },
              },
            );
            const data = await response.json();
            const cityName =
              data.address?.city || data.address?.town || data.address?.village;
            const displayName = cityName
              ? `${cityName}, ${data.address?.state || 'Algeria'}`
              : data.display_name;
            onChange(displayName, data);
            setIsSelected(true); // ✅ Marquer comme sélectionné
          } catch (error) {
            console.error('[v0] Error getting current location:', error);
            setError("Impossible d'obtenir votre position");
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('[v0] Geolocation error:', error);
          setError('Accès à la localisation refusé');
          setIsLoading(false);
        },
      );
    }
  };

  // ✅ NOUVEAU : Gérer le changement manuel de texte
  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    if (newValue.length < 2) {
      setIsSelected(false); // Reset si on efface
    }
  };

  return (
    <div ref={wrapperRef} className={`relative flex-1 ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 bg-background rounded-lg border border-border focus-within:ring-2 focus-within:ring-[#FF5722]/20 focus-within:border-[#FF5722] transition-all">
        {icon || <MapPin className="w-5 h-5 text-[#FF5722] flex-shrink-0" />}
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            // ✅ CORRIGÉ : Ne réouvre QUE si pas encore sélectionné ET qu'il y a des suggestions
            if (!isSelected && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin text-[#FF5722]" />
        )}
        {!isLoading && !value && (
          <button
            type="button"
            onClick={handleCurrentLocation}
            className="p-1 hover:bg-accent rounded-md transition-colors"
            title="Utiliser ma position"
          >
            <Navigation className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-xl shadow-xl max-h-80 overflow-y-auto">
          {suggestions.map((location) => {
            const cityName =
              location.address?.city ||
              location.address?.town ||
              location.address?.village;
            const mainText = cityName || location.display_name.split(',')[0];
            const secondaryText = location.address?.state || 'Algeria';

            return (
              <button
                key={location.place_id}
                type="button"
                onClick={() => handleSelect(location)}
                className="w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors flex items-start gap-3 border-b border-border last:border-b-0 group"
              >
                <div className="w-8 h-8 rounded-full bg-[#FF5722]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FF5722]/20 transition-colors">
                  <MapPin className="w-4 h-4 text-[#FF5722]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">
                    {mainText}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {secondaryText}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <div className="absolute z-50 w-full mt-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {showSuggestions &&
        !isLoading &&
        suggestions.length === 0 &&
        value.length >= 2 &&
        !error && (
          <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg p-4 shadow-lg">
            <p className="text-sm text-muted-foreground text-center">
              Aucune localisation trouvée
            </p>
          </div>
        )}
    </div>
  );
}
