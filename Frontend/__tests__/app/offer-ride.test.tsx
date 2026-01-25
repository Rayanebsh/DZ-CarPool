// __tests__/app/offer-ride/page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import OfferRidePage from '@/app/offer-ride/page';
import authService from '@/services/auth.service';

jest.mock('next/navigation');
jest.mock('@/services/auth.service');
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key: string) => key,
  }),
}));

// Mock global fetch
global.fetch = jest.fn();

describe('OfferRidePage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    localStorage.setItem('access_token', 'test-token');

    // Mock fuel prices (1er appel)
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        last_updated: '2025-01-02',
        wilayas: {
          '16': {
            name: 'Alger',
            prices: {
              gasoil: 33.84,
              essence_sans_plomb: 43.44,
              gpl: 9.0,
            },
          },
        },
        consommation_moyenne: {
          gasoil: 8.0,
          essence_sans_plomb: 9.0,
          gpl: 10.0,
          electrique: 15.0,
        },
      }),
    });

    // Mock preferences
    (authService.getPreferences as jest.Mock).mockResolvedValue([
      {
        id: 1,
        name_en: 'Music',
        name_fr: 'Musique',
        category: 'interests',
        icon: '🎵',
      },
      {
        id: 2,
        name_en: 'No Smoking',
        name_fr: 'Non-fumeur',
        category: 'habits',
        icon: '🚭',
      },
    ]);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders all form sections', async () => {
    render(<OfferRidePage />);

    await waitFor(() => {
      expect(screen.getByText('Itinerary')).toBeInTheDocument();
      expect(screen.getByText('Date & Seats')).toBeInTheDocument();
      expect(screen.getByText('Vehicle Information')).toBeInTheDocument();
      expect(screen.getByText('Price & Options')).toBeInTheDocument();
    });
  });

  it('handles departure and arrival location changes', async () => {
    render(<OfferRidePage />);

    await waitFor(() => {
      const departureInput = screen.getByPlaceholderText('Algiers');
      const arrivalInput = screen.getByPlaceholderText('Oran');

      fireEvent.change(departureInput, { target: { value: 'Alger' } });
      fireEvent.change(arrivalInput, { target: { value: 'Oran' } });

      expect(departureInput).toHaveValue('Alger');
      expect(arrivalInput).toHaveValue('Oran');
    });
  });

  it('adjusts seat count with plus/minus buttons', async () => {
    render(<OfferRidePage />);

    await waitFor(() => {
      const plusBtn = screen
        .getAllByRole('button')
        .find((btn) =>
          btn.querySelector('svg')?.classList.contains('lucide-plus'),
        );
      const minusBtn = screen
        .getAllByRole('button')
        .find((btn) =>
          btn.querySelector('svg')?.classList.contains('lucide-minus'),
        );

      // Default is 3 seats
      expect(screen.getByText('3')).toBeInTheDocument();

      // Increase
      fireEvent.click(plusBtn!);
      expect(screen.getByText('4')).toBeInTheDocument();

      // Decrease
      fireEvent.click(minusBtn!);
      fireEvent.click(minusBtn!);
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('prevents seats from going below 1', async () => {
    render(<OfferRidePage />);

    await waitFor(() => {
      const minusBtn = screen
        .getAllByRole('button')
        .find((btn) =>
          btn.querySelector('svg')?.classList.contains('lucide-minus'),
        );

      // Click minus 5 times (should stop at 1)
      for (let i = 0; i < 5; i++) {
        fireEvent.click(minusBtn!);
      }

      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('prevents seats from going above 8', async () => {
    render(<OfferRidePage />);

    await waitFor(() => {
      const plusBtn = screen
        .getAllByRole('button')
        .find((btn) =>
          btn.querySelector('svg')?.classList.contains('lucide-plus'),
        );

      // Click plus 10 times (should stop at 8)
      for (let i = 0; i < 10; i++) {
        fireEvent.click(plusBtn!);
      }

      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });

  it('calculates pricing breakdown correctly', async () => {
    render(<OfferRidePage />);

    await waitFor(() => {
      // Default price is 1200
      expect(screen.getByText('1200 DA')).toBeInTheDocument();

      // Platform fee 15% = 180
      expect(screen.getByText('180 DA')).toBeInTheDocument();

      // Total = 1380
      expect(screen.getByText('1380 DA')).toBeInTheDocument();
    });
  });

  it('updates pricing when comfort option is selected', async () => {
    render(<OfferRidePage />);

    await waitFor(() => {
      const comfortCheckbox = screen.getByLabelText(/Comfort Trip/i);
      fireEvent.click(comfortCheckbox);
    });

    // Attendre le re-render
    await waitFor(() => {
      // Comfort adds 30% to base price
      // 1200 * 1.3 = 1560
      // Fee: 1560 * 0.15 = 234
      // Total: 1794
      expect(screen.getByText('1794 DA')).toBeInTheDocument();
    });
  });

  it('loads and displays preferences', async () => {
    render(<OfferRidePage />);

    await waitFor(() => {
      expect(screen.getByText('Music')).toBeInTheDocument();
      expect(screen.getByText('No Smoking')).toBeInTheDocument();
    });
  });

  it('toggles preference selection', async () => {
    render(<OfferRidePage />);

    await waitFor(() => {
      const musicBtn = screen.getByText('Music').closest('button');
      expect(musicBtn).not.toHaveClass('border-[#FF5722]');

      fireEvent.click(musicBtn!);
    });

    await waitFor(() => {
      const musicBtn = screen.getByText('Music').closest('button');
      expect(musicBtn).toHaveClass('border-[#FF5722]');
    });
  });

  it('validates required fields before submission', async () => {
    render(<OfferRidePage />);

    await waitFor(() => {
      const submitBtn = screen.getByText('Publish Trip →');
      fireEvent.click(submitBtn);
    });

    // Form should not submit without required fields
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('submits trip successfully with valid data', async () => {
    // Mock check-document-status (2e appel)
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ can_publish_trip: true }),
    });

    // Mock trajets POST (3e appel)
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, ville_depart: 'Alger' }),
    });

    render(<OfferRidePage />);

    await waitFor(() => {
      // Fill required fields
      fireEvent.change(screen.getByPlaceholderText('Algiers'), {
        target: { value: 'Alger' },
      });
      fireEvent.change(screen.getByPlaceholderText('Oran'), {
        target: { value: 'Oran' },
      });

      const dateInput = screen
        .getByLabelText('DEPARTURE DATE')
        .querySelector('input');
      fireEvent.change(dateInput!, {
        target: { value: '2025-12-25T14:00' },
      });
    });

    const submitBtn = screen.getByText('Publish Trip →');
    fireEvent.click(submitBtn);

    await waitFor(
      () => {
        expect(
          screen.getByText('Trip published successfully!'),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('displays error message on submission failure', async () => {
    // Mock check-document-status OK
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ can_publish_trip: true }),
    });

    // Mock trajets POST KO
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'Invalid data',
    });

    render(<OfferRidePage />);

    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText('Algiers'), {
        target: { value: 'Alger' },
      });
      fireEvent.change(screen.getByPlaceholderText('Oran'), {
        target: { value: 'Oran' },
      });

      const dateInput = screen
        .getByLabelText('DEPARTURE DATE')
        .querySelector('input');
      fireEvent.change(dateInput!, {
        target: { value: '2025-12-25T14:00' },
      });
    });

    fireEvent.click(screen.getByText('Publish Trip →'));

    await waitFor(() => {
      expect(screen.getByText(/Erreur 400/)).toBeInTheDocument();
    });
  });

  it('disables submit button during submission', async () => {
    // Mock check-document-status OK
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ can_publish_trip: true }),
    });

    // Mock trajets POST lent
    (fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({}),
              }),
            100,
          ),
        ),
    );

    render(<OfferRidePage />);

    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText('Algiers'), {
        target: { value: 'Alger' },
      });
      fireEvent.change(screen.getByPlaceholderText('Oran'), {
        target: { value: 'Oran' },
      });

      const dateInput = screen
        .getByLabelText('DEPARTURE DATE')
        .querySelector('input');
      fireEvent.change(dateInput!, {
        target: { value: '2025-12-25T14:00' },
      });
    });

    const submitBtn = screen.getByText('Publish Trip →');
    fireEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    expect(screen.getByText('Publishing...')).toBeInTheDocument();
  });

  it('handles fuel type changes', async () => {
    render(<OfferRidePage />);

    await waitFor(() => {
      const fuelSelect = screen.getByLabelText('FUEL TYPE');
      fireEvent.change(fuelSelect, { target: { value: 'essence_sans_plomb' } });

      expect(fuelSelect).toHaveValue('essence_sans_plomb');
    });
  });

  it('updates fuel consumption', async () => {
    render(<OfferRidePage />);

    await waitFor(() => {
      const consumptionInput = screen.getByLabelText(/CONSUMPTION/);
      fireEvent.change(consumptionInput, { target: { value: '10.5' } });

      expect(consumptionInput).toHaveValue(10.5);
    });
  });
});
