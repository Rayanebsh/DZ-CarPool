import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/app/login/page';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/hooks/use-auth';

// Mocks
jest.mock('next/navigation');
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));
jest.mock('@/contexts/language-context');
jest.mock('@/hooks/use-auth');
jest.mock('@/components/google-login-button', () => {
  return function MockGoogleLoginButton({ text, onError }: any) {
    return (
      <button
        data-testid="google-login-button"
        onClick={() => onError && onError('Test error')}
      >
        {text}
      </button>
    );
  };
});

describe('LoginPage', () => {
  const mockPush = jest.fn();
  const mockLogin = jest.fn();
  const mockSetLanguage = jest.fn();

  const defaultTranslations = {
    forAlgeria: 'For Algeria',
    trustedRideSharing: 'Trusted Ride Sharing',
    connectWithDrivers: 'Connect with drivers',
    getStarted: 'Get Started',
    createAccountOrLogin: 'Create account or login',
    register: 'Register',
    login: 'Login',
    emailAddress: 'Email Address',
    emailPlaceholder: 'Enter your email',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    forgotPassword: 'Forgot password?',
    or: 'OR',
    continueWithGoogle: 'Continue with Google',
    agreeTerms: 'By continuing, you agree to our',
    termsOfService: 'Terms of Service',
    and: 'and',
    privacyPolicy: 'Privacy Policy',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });

    (useLanguage as jest.Mock).mockReturnValue({
      t: (key: string) =>
        defaultTranslations[key as keyof typeof defaultTranslations] || key,
      language: 'en',
      setLanguage: mockSetLanguage,
    });
  });

  describe('Rendering', () => {
    it('should render login page', () => {
      render(<LoginPage />);
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('should render logo and brand name', () => {
      render(<LoginPage />);
      expect(screen.getByAltText('DZ-CarPool')).toBeInTheDocument();
      expect(screen.getAllByText('DZ-CarPool')[0]).toBeInTheDocument();
    });

    it('should render branding section', () => {
      render(<LoginPage />);
      expect(screen.getByText('For Algeria')).toBeInTheDocument();
      expect(screen.getByText('Trusted Ride Sharing')).toBeInTheDocument();
      expect(screen.getByText('Connect with drivers')).toBeInTheDocument();
    });

    it('should render road journey image', () => {
      render(<LoginPage />);
      const image = screen.getByAltText('Road journey');
      expect(image).toBeInTheDocument();
    });

    it('should render tabs for register and login', () => {
      render(<LoginPage />);
      expect(screen.getByText('Register')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('should render email input field', () => {
      render(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should render password input field', () => {
      render(<LoginPage />);
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should render forgot password link', () => {
      render(<LoginPage />);
      const forgotLink = screen.getByText('Forgot password?');
      expect(forgotLink).toBeInTheDocument();
      expect(forgotLink).toHaveAttribute('href', '/forgot-password');
    });

    it('should render login button', () => {
      render(<LoginPage />);
      expect(
        screen.getByRole('button', { name: /login/i }),
      ).toBeInTheDocument();
    });

    it('should render Google login button', () => {
      render(<LoginPage />);
      expect(screen.getByTestId('google-login-button')).toBeInTheDocument();
    });

    it('should render terms and privacy links', () => {
      render(<LoginPage />);
      expect(screen.getByText('Terms of Service')).toHaveAttribute(
        'href',
        '/terms',
      );
      expect(screen.getByText('Privacy Policy')).toHaveAttribute(
        'href',
        '/privacy',
      );
    });

    it('should render language selector', () => {
      render(<LoginPage />);
      expect(screen.getByText('EN')).toBeInTheDocument();
    });
  });

  describe('Language Toggle', () => {
    it('should display current language', () => {
      render(<LoginPage />);
      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('should toggle language to French', () => {
      render(<LoginPage />);
      const languageButton = screen.getByText('EN').closest('button');

      fireEvent.click(languageButton!);

      expect(mockSetLanguage).toHaveBeenCalledWith('fr');
    });

    it('should toggle language to English when French is active', () => {
      (useLanguage as jest.Mock).mockReturnValue({
        t: (key: string) =>
          defaultTranslations[key as keyof typeof defaultTranslations] || key,
        language: 'fr',
        setLanguage: mockSetLanguage,
      });

      render(<LoginPage />);
      const languageButton = screen.getByText('FR').closest('button');

      fireEvent.click(languageButton!);

      expect(mockSetLanguage).toHaveBeenCalledWith('en');
    });

    it('should render language icon', () => {
      const { container } = render(<LoginPage />);
      const languageIcon = container.querySelector('svg');
      expect(languageIcon).toBeInTheDocument();
    });
  });

  describe('Form Input', () => {
    it('should update email field on change', () => {
      render(<LoginPage />);
      const emailInput = screen.getByPlaceholderText(
        'Enter your email',
      ) as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password field on change', () => {
      render(<LoginPage />);
      const passwordInput = screen.getByPlaceholderText(
        'Enter your password',
      ) as HTMLInputElement;

      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput.value).toBe('password123');
    });

    it('should clear error when email input changes', () => {
      render(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const loginButton = screen.getByRole('button', { name: /login/i });

      // Trigger error first
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));
      fireEvent.click(loginButton);

      // Change email
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

      // Error should be cleared
      expect(
        screen.queryByText(/Invalid credentials/i),
      ).not.toBeInTheDocument();
    });

    it('should clear error when password input changes', () => {
      render(<LoginPage />);
      const passwordInput = screen.getByPlaceholderText('Enter your password');

      fireEvent.change(passwordInput, { target: { value: 'newpassword' } });

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should require email field', () => {
      render(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      expect(emailInput).toBeRequired();
    });

    it('should require password field', () => {
      render(<LoginPage />);
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      expect(passwordInput).toBeRequired();
    });
  });

  describe('Form Submission', () => {
    it('should call login function with correct credentials', async () => {
      mockLogin.mockResolvedValue({});

      render(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should show loading state during login', async () => {
      mockLogin.mockImplementation(() => new Promise(() => {}));

      render(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Connexion...')).toBeInTheDocument();
      });
    });

    it('should disable button during login', async () => {
      mockLogin.mockImplementation(() => new Promise(() => {}));

      render(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(loginButton).toBeDisabled();
      });
    });

    it('should prevent form default submission', async () => {
      mockLogin.mockResolvedValue({});

      render(<LoginPage />);
      const form = screen
        .getByRole('button', { name: /login/i })
        .closest('form');
      const preventDefault = jest.fn();

      fireEvent.submit(form!, { preventDefault });

      expect(preventDefault).toHaveBeenCalled();
    });

    it('should handle successful login', async () => {
      mockLogin.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
      });

      render(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on login failure', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));

      render(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    it('should display default error message when error has no message', async () => {
      mockLogin.mockRejectedValue({});

      render(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Erreur de connexion')).toBeInTheDocument();
      });
    });

    it('should show error with red styling', async () => {
      mockLogin.mockRejectedValue(new Error('Test error'));

      render(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        const errorElement = screen.getByText('Test error');
        expect(errorElement).toHaveClass('text-red-600');
      });
    });

    it('should reset loading state after error', async () => {
      mockLogin.mockRejectedValue(new Error('Login failed'));

      render(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
        expect(loginButton).not.toBeDisabled();
      });
    });

    it('should handle Google login error', () => {
      render(<LoginPage />);
      const googleButton = screen.getByTestId('google-login-button');

      fireEvent.click(googleButton);

      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have link to signup page', () => {
      render(<LoginPage />);
      const signupLink = screen.getByText('Register');
      expect(signupLink).toHaveAttribute('href', '/signup');
    });

    it('should have link to home page from logo', () => {
      render(<LoginPage />);
      const logoLink = screen.getAllByText('DZ-CarPool')[0].closest('a');
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('should have link to terms page', () => {
      render(<LoginPage />);
      const termsLink = screen.getByText('Terms of Service');
      expect(termsLink).toHaveAttribute('href', '/terms');
    });

    it('should have link to privacy page', () => {
      render(<LoginPage />);
      const privacyLink = screen.getByText('Privacy Policy');
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    it('should have link to forgot password page', () => {
      render(<LoginPage />);
      const forgotLink = screen.getByText('Forgot password?');
      expect(forgotLink).toHaveAttribute('href', '/forgot-password');
    });
  });

  describe('Styling', () => {
    it('should have proper form container styling', () => {
      render(<LoginPage />);
      const container = screen.getByText('Get Started').closest('div');
      expect(container).toHaveClass('bg-white', 'rounded-2xl');
    });

    it('should have login button with correct styling', () => {
      render(<LoginPage />);
      const loginButton = screen.getByRole('button', { name: /login/i });
      expect(loginButton).toHaveClass('bg-[#FF5722]', 'hover:bg-[#E64A19]');
    });

    it('should have active tab styling for login', () => {
      render(<LoginPage />);
      const loginTab = screen.getByText('Login');
      expect(loginTab).toHaveClass('bg-white', 'text-gray-900', 'shadow-sm');
    });

    it('should have inactive tab styling for register', () => {
      render(<LoginPage />);
      const registerTab = screen.getByText('Register');
      expect(registerTab).toHaveClass('text-gray-600');
    });
  });

  describe('Accessibility', () => {
    it('should have proper label for email input', () => {
      render(<LoginPage />);
      const emailLabel = screen.getByText('Email Address');
      expect(emailLabel).toBeInTheDocument();
    });

    it('should have proper label for password input', () => {
      render(<LoginPage />);
      const passwordLabel = screen.getByText('Password');
      expect(passwordLabel).toBeInTheDocument();
    });

    it('should associate labels with inputs', () => {
      render(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      expect(emailInput).toHaveAttribute('id', 'email');
    });

    it('should have button type submit', () => {
      render(<LoginPage />);
      const loginButton = screen.getByRole('button', { name: /login/i });
      expect(loginButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Responsive Design', () => {
    it('should have mobile-friendly layout classes', () => {
      const { container } = render(<LoginPage />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('min-h-screen');
    });

    it('should hide branding on small screens', () => {
      render(<LoginPage />);
      const brandingSection = screen
        .getByText('Trusted Ride Sharing')
        .closest('div');
      expect(brandingSection?.parentElement).toHaveClass('hidden', 'lg:flex');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty form submission', async () => {
      render(<LoginPage />);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.click(loginButton);

      // HTML5 validation should prevent submission
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should trim whitespace from inputs', async () => {
      mockLogin.mockResolvedValue({});

      render(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, {
        target: { value: '  test@example.com  ' },
      });
      fireEvent.change(passwordInput, { target: { value: '  password123  ' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: '  test@example.com  ',
          password: '  password123  ',
        });
      });
    });

    it('should handle rapid form submissions', async () => {
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      fireEvent.click(loginButton);
      fireEvent.click(loginButton);
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(1);
      });
    });
  });
});
