import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import GoogleLoginButton from '@/components/google-login-button';
import { useAuth } from '@/hooks/use-auth';
import authService from '@/services/auth.service';

jest.mock('next/navigation');
jest.mock('@react-oauth/google');
jest.mock('@/hooks/use-auth');
jest.mock('@/services/auth.service');

describe('GoogleLoginButton', () => {
  const mockPush = jest.fn();
  const mockUpdateUser = jest.fn();
  const mockCheckAuth = jest.fn();
  const mockDetermineRedirectUrl = jest.fn();
  const mockOnError = jest.fn();

  let successCallback: ((token: { access_token: string }) => void) | undefined;
  let errorCallback: ((error: any) => void) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useAuth as jest.Mock).mockReturnValue({
      updateUser: mockUpdateUser,
      checkAuth: mockCheckAuth,
      determineRedirectUrl: mockDetermineRedirectUrl,
    });

    (useGoogleLogin as jest.Mock).mockImplementation((config) => {
      successCallback = config.onSuccess;
      errorCallback = config.onError;

      return jest.fn(); // handler appelé au clic
    });
  });

  it('renders button with text', () => {
    render(<GoogleLoginButton text="Sign in with Google" />);
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('renders google svg icon', () => {
    const { container } = render(<GoogleLoginButton text="Sign in" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('starts loading on click', async () => {
    mockDetermineRedirectUrl.mockImplementation(() => new Promise(() => {}));

    render(<GoogleLoginButton text="Sign in" />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      successCallback?.({ access_token: 'token' });
    });

    expect(screen.getByText('Connexion en cours...')).toBeInTheDocument();
  });

  it('calls backend with google token', async () => {
    (authService.googleAuth as jest.Mock).mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    render(<GoogleLoginButton text="Sign in" />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      successCallback?.({ access_token: 'google-token' });
    });

    expect(authService.googleAuth).toHaveBeenCalledWith('google-token');
  });

  it('updates user and redirects', async () => {
    const user = { id: '1', email: 'test@test.com' };
    (authService.googleAuth as jest.Mock).mockResolvedValue({ user });
    mockDetermineRedirectUrl.mockResolvedValue('/dashboard');

    render(<GoogleLoginButton text="Sign in" />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      successCallback?.({ access_token: 'token' });
    });

    expect(mockUpdateUser).toHaveBeenCalledWith(user);
    expect(mockCheckAuth).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('handles google sdk error', async () => {
    render(<GoogleLoginButton text="Sign in" onError={mockOnError} />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      errorCallback?.({ error: 'popup_closed' });
    });

    expect(mockOnError).toHaveBeenCalledWith(
      'Impossible de se connecter avec Google',
    );
  });

  it('handles backend error', async () => {
    (authService.googleAuth as jest.Mock).mockRejectedValue({
      response: { status: 401 },
    });

    render(<GoogleLoginButton text="Sign in" onError={mockOnError} />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      successCallback?.({ access_token: 'token' });
    });

    expect(mockOnError).toHaveBeenCalledWith('Authentification Google refusée');
  });

  it('button type is button', () => {
    render(<GoogleLoginButton text="Sign in" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});
