// __tests__/app/preferences/page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import PreferencesPage from '@/app/preferences/page';
import authService from '@/services/auth.service';

jest.mock('next/navigation');
jest.mock('@/services/auth.service');
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key: string) => key,
    setLanguage: jest.fn(),
  }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('PreferencesPage', () => {
  const mockPush = jest.fn();
  const mockPreferences = [
    {
      id: 1,
      name_en: 'Music',
      name_fr: 'Musique',
      category: 'interests',
      icon: '🎵',
      description: 'Love music',
    },
    {
      id: 2,
      name_en: 'Reading',
      name_fr: 'Lecture',
      category: 'interests',
      icon: '📚',
      description: 'Enjoy reading',
    },
    {
      id: 3,
      name_en: 'No Smoking',
      name_fr: 'Non-fumeur',
      category: 'habits',
      icon: '🚭',
      description: 'Smoke-free',
    },
    {
      id: 4,
      name_en: 'Talkative',
      name_fr: 'Bavard',
      category: 'habits',
      icon: '💬',
      description: 'Love chatting',
    },
    {
      id: 5,
      name_en: 'Smooth Driving',
      name_fr: 'Conduite souple',
      category: 'driving',
      icon: '🚗',
      description: 'Drive smoothly',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('displays loading state initially', () => {
    (authService.getAllPreferences as jest.Mock).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<PreferencesPage />);

    expect(screen.getByText('Loading preferences...')).toBeInTheDocument();
  });

  it('renders all preferences grouped by category', async () => {
    (authService.getAllPreferences as jest.Mock).mockResolvedValue(
      mockPreferences,
    );

    render(<PreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText('Interests')).toBeInTheDocument();
      expect(screen.getByText('Habits')).toBeInTheDocument();
      expect(screen.getByText('Driving Preferences')).toBeInTheDocument();
    });

    expect(screen.getByText('Music')).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByText('No Smoking')).toBeInTheDocument();
    expect(screen.getByText('Talkative')).toBeInTheDocument();
    expect(screen.getByText('Smooth Driving')).toBeInTheDocument();
  });

  it('toggles preference selection', async () => {
    (authService.getAllPreferences as jest.Mock).mockResolvedValue(
      mockPreferences,
    );

    render(<PreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText('Music')).toBeInTheDocument();
    });

    const musicBtn = screen.getByText('Music').closest('button');

    // Initially not selected
    expect(musicBtn).not.toHaveClass('border-[#FF5722]');

    // Select
    fireEvent.click(musicBtn!);
    expect(musicBtn).toHaveClass('border-[#FF5722]');

    // Deselect
    fireEvent.click(musicBtn!);
    expect(musicBtn).not.toHaveClass('border-[#FF5722]');
  });

  it('allows multiple preference selection', async () => {
    (authService.getAllPreferences as jest.Mock).mockResolvedValue(
      mockPreferences,
    );

    render(<PreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText('Music')).toBeInTheDocument();
    });

    const musicBtn = screen.getByText('Music').closest('button');
    const readingBtn = screen.getByText('Reading').closest('button');
    const noSmokingBtn = screen.getByText('No Smoking').closest('button');

    fireEvent.click(musicBtn!);
    fireEvent.click(readingBtn!);
    fireEvent.click(noSmokingBtn!);

    expect(musicBtn).toHaveClass('border-[#FF5722]');
    expect(readingBtn).toHaveClass('border-[#FF5722]');
    expect(noSmokingBtn).toHaveClass('border-[#FF5722]');
  });

  it('displays error when no preferences are selected on submit', async () => {
    (authService.getAllPreferences as jest.Mock).mockResolvedValue(
      mockPreferences,
    );

    render(<PreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(
        screen.getByText('Please select at least one preference'),
      ).toBeInTheDocument();
    });
  });

  it('submits preferences successfully', async () => {
    (authService.getAllPreferences as jest.Mock).mockResolvedValue(
      mockPreferences,
    );
    (authService.updatePreferences as jest.Mock).mockResolvedValue({});

    render(<PreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText('Music')).toBeInTheDocument();
    });

    // Select preferences
    fireEvent.click(screen.getByText('Music').closest('button')!);
    fireEvent.click(screen.getByText('No Smoking').closest('button')!);

    // Submit
    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(authService.updatePreferences).toHaveBeenCalledWith([1, 3]);
      expect(mockPush).toHaveBeenCalledWith('/#hero');
    });
  });

  it('handles API error gracefully', async () => {
    (authService.getAllPreferences as jest.Mock).mockRejectedValue(
      new Error('Network error'),
    );

    render(<PreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText('No preferences available')).toBeInTheDocument();
    });
  });

  it('handles unexpected data format', async () => {
    (authService.getAllPreferences as jest.Mock).mockResolvedValue({
      preferences: mockPreferences,
    });

    render(<PreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText('Music')).toBeInTheDocument();
    });
  });

  it('displays error on save failure', async () => {
    (authService.getAllPreferences as jest.Mock).mockResolvedValue(
      mockPreferences,
    );
    (authService.updatePreferences as jest.Mock).mockRejectedValue(
      new Error('Save failed'),
    );

    render(<PreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText('Music')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Music').closest('button')!);
    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Error saving preferences')).toBeInTheDocument();
    });
  });

  it('disables submit button while saving', async () => {
    (authService.getAllPreferences as jest.Mock).mockResolvedValue(
      mockPreferences,
    );
    (authService.updatePreferences as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<PreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText('Music')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Music').closest('button')!);

    const submitBtn = screen.getByText('Continue');
    fireEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('displays icons for each preference', async () => {
    (authService.getAllPreferences as jest.Mock).mockResolvedValue(
      mockPreferences,
    );

    render(<PreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText('🎵')).toBeInTheDocument();
      expect(screen.getByText('📚')).toBeInTheDocument();
      expect(screen.getByText('🚭')).toBeInTheDocument();
      expect(screen.getByText('💬')).toBeInTheDocument();
      expect(screen.getByText('🚗')).toBeInTheDocument();
    });
  });

  it('renders language switcher', async () => {
    (authService.getAllPreferences as jest.Mock).mockResolvedValue(
      mockPreferences,
    );

    render(<PreferencesPage />);

    const languageBtn = screen.getByText('EN');
    expect(languageBtn).toBeInTheDocument();
  });

  it('shows correct title and description', async () => {
    (authService.getAllPreferences as jest.Mock).mockResolvedValue(
      mockPreferences,
    );

    render(<PreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
      expect(screen.getByText(/Select your preferences/)).toBeInTheDocument();
    });
  });
});
