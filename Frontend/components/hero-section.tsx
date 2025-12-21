'use client';

import { Button } from '@/components/ui/button';
import { LocationAutocomplete } from '@/components/location-autocomplete';
import { Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function HeroSection() {
  const { t } = useLanguage();
  const router = useRouter();
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
  });

  const handleSearch = () => {
    if (searchData.from && searchData.to) {
      const params = new URLSearchParams({
        from: searchData.from,
        to: searchData.to,
        ...(searchData.date && { date: searchData.date }),
      });
      router.push(`/search-results?${params.toString()}`);
    }
  };

  return (
    <section id="hero" className="relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/img.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="py-24 md:py-36 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 text-balance">
            {t('heroTitle')}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>

          <div className="max-w-4xl mx-auto bg-white rounded-xl p-2 shadow-2xl">
            <div className="flex flex-col md:flex-row items-stretch gap-2">
              <LocationAutocomplete
                value={searchData.from}
                onChange={(value) =>
                  setSearchData({ ...searchData, from: value })
                }
                placeholder={t('from')}
              />
              <LocationAutocomplete
                value={searchData.to}
                onChange={(value) =>
                  setSearchData({ ...searchData, to: value })
                }
                placeholder={t('to')}
              />
              <div className="flex items-center gap-2 px-4 py-3 bg-background rounded-lg border border-border min-w-[160px]">
                <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <input
                  type="date"
                  value={searchData.date}
                  onChange={(e) =>
                    setSearchData({ ...searchData, date: e.target.value })
                  }
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
              <Button
                onClick={handleSearch}
                size="lg"
                className="bg-[#FF5722] hover:bg-[#FF5722]/90 text-white px-8 min-w-[140px]"
              >
                {t('searchButton')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
