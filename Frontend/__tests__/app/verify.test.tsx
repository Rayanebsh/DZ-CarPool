import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import VerifyPage from '@/app/verify/page';
import verificationService from '@/services/verification.service';

// Mocks
jest.mock('next/navigation');
jest.mock('@/services/verification.service');

describe('VerifyPage', () => {
  const mockPush = jest.fn();
  const mockGetVerificationStatus = jest.fn();
  const mockSendEmailVerification = jest.fn();
  const mockSendPhoneVerification = jest.fn();
  const mockVerifyEmail = jest.fn();
  const mockVerifyPhone = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (verificationService.getVerificationStatus as jest.Mock) =
      mockGetVerificationStatus;
    (verificationService.sendEmailVerification as jest.Mock) =
      mockSendEmailVerification;
    (verificationService.sendPhoneVerification as jest.Mock) =
      mockSendPhoneVerification;
    (verificationService.verifyEmail as jest.Mock) = mockVerifyEmail;
    (verificationService.verifyPhone as jest.Mock) = mockVerifyPhone;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial Loading', () => {
    it('should show loading state initially', () => {
      mockGetVerificationStatus.mockImplementation(() => new Promise(() => {}));

      render(<VerifyPage />);

      expect(screen.getByText('Vérification en cours...')).toBeInTheDocument();
    });

    it('should check verification status on mount', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: false,
        phone_verified: false,
        has_phone_number: true,
        first_login: true,
      });
      mockSendEmailVerification.mockResolvedValue({});
      mockSendPhoneVerification.mockResolvedValue({});

      render(<VerifyPage />);

      await waitFor(() => {
        expect(mockGetVerificationStatus).toHaveBeenCalled();
      });
    });
  });

  describe('Already Verified - Redirect', () => {
    it('should redirect to preferences if first login and fully verified', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: true,
        phone_verified: true,
        has_phone_number: true,
        first_login: true,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/preferences');
      });
    });

    it('should redirect to home if not first login and fully verified', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: true,
        phone_verified: true,
        has_phone_number: true,
        first_login: false,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should redirect if email verified and no phone number', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: true,
        phone_verified: false,
        has_phone_number: false,
        first_login: true,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/preferences');
      });
    });

    it('should show success message before redirect', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: true,
        phone_verified: true,
        has_phone_number: true,
        first_login: false,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Compte vérifié !')).toBeInTheDocument();
        expect(screen.getByText('Redirection en cours...')).toBeInTheDocument();
      });
    });
  });

  describe('Email Verification', () => {
    beforeEach(() => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: false,
        phone_verified: false,
        has_phone_number: true,
        first_login: true,
      });
      mockSendEmailVerification.mockResolvedValue({});
      mockSendPhoneVerification.mockResolvedValue({});
    });

    it('should render email verification section', async () => {
      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('📧 Vérification Email')).toBeInTheDocument();
      });
    });

    it('should send email code automatically', async () => {
      render(<VerifyPage />);

      await waitFor(() => {
        expect(mockSendEmailVerification).toHaveBeenCalled();
      });
    });

    it('should show sent message after code is sent', async () => {
      render(<VerifyPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Un code a été envoyé à votre adresse email'),
        ).toBeInTheDocument();
      });
    });

    it('should update email code input', async () => {
      render(<VerifyPage />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Entrez le code à 6 chiffres'),
        ).toBeInTheDocument();
      });

      const emailInput = screen.getAllByPlaceholderText(
        'Entrez le code à 6 chiffres',
      )[0] as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: '123456' } });

      expect(emailInput.value).toBe('123456');
    });

    it('should verify email with correct code', async () => {
      mockVerifyEmail.mockResolvedValue({});

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Vérifier Email')).toBeInTheDocument();
      });

      const emailInput = screen.getAllByPlaceholderText(
        'Entrez le code à 6 chiffres',
      )[0];
      fireEvent.change(emailInput, { target: { value: '123456' } });

      const verifyButton = screen.getByText('Vérifier Email');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(mockVerifyEmail).toHaveBeenCalledWith('123456');
      });
    });

    it('should show success message after email verification', async () => {
      mockVerifyEmail.mockResolvedValue({});

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Vérifier Email')).toBeInTheDocument();
      });

      const emailInput = screen.getAllByPlaceholderText(
        'Entrez le code à 6 chiffres',
      )[0];
      fireEvent.change(emailInput, { target: { value: '123456' } });

      const verifyButton = screen.getByText('Vérifier Email');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(
          screen.getByText('✅ Email vérifié avec succès !'),
        ).toBeInTheDocument();
      });
    });

    it('should show error for invalid email code', async () => {
      mockVerifyEmail.mockRejectedValue({
        response: { data: { error: 'Code invalide' } },
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Vérifier Email')).toBeInTheDocument();
      });

      const emailInput = screen.getAllByPlaceholderText(
        'Entrez le code à 6 chiffres',
      )[0];
      fireEvent.change(emailInput, { target: { value: '999999' } });

      const verifyButton = screen.getByText('Vérifier Email');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText('Code invalide')).toBeInTheDocument();
      });
    });

    it('should resend email code', async () => {
      mockSendEmailVerification.mockResolvedValue({});

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Renvoyer le code')).toBeInTheDocument();
      });

      const resendButtons = screen.getAllByText('Renvoyer le code');
      fireEvent.click(resendButtons[0]);

      await waitFor(() => {
        expect(mockSendEmailVerification).toHaveBeenCalledTimes(2); // Once on mount, once on click
        expect(
          screen.getByText('📧 Nouveau code email envoyé !'),
        ).toBeInTheDocument();
      });
    });

    it('should handle already verified email when resending', async () => {
      mockSendEmailVerification.mockRejectedValueOnce({}).mockRejectedValue({
        message: 'EMAIL_ALREADY_VERIFIED',
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Renvoyer le code')).toBeInTheDocument();
      });

      const resendButtons = screen.getAllByText('Renvoyer le code');
      fireEvent.click(resendButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('✅ Email déjà vérifié !')).toBeInTheDocument();
      });
    });

    it('should limit email code to 6 characters', async () => {
      render(<VerifyPage />);

      await waitFor(() => {
        const emailInput = screen.getAllByPlaceholderText(
          'Entrez le code à 6 chiffres',
        )[0];
        expect(emailInput).toHaveAttribute('maxLength', '6');
      });
    });

    it('should show email verified checkmark', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: true,
        phone_verified: false,
        has_phone_number: true,
        first_login: true,
      });
      mockSendPhoneVerification.mockResolvedValue({});

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Email vérifié ✓')).toBeInTheDocument();
      });
    });
  });

  describe('Phone Verification', () => {
    beforeEach(() => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: false,
        phone_verified: false,
        has_phone_number: true,
        first_login: true,
      });
      mockSendEmailVerification.mockResolvedValue({});
      mockSendPhoneVerification.mockResolvedValue({});
    });

    it('should render phone verification section', async () => {
      render(<VerifyPage />);

      await waitFor(() => {
        expect(
          screen.getByText('📱 Vérification Téléphone'),
        ).toBeInTheDocument();
      });
    });

    it('should send phone code automatically', async () => {
      render(<VerifyPage />);

      await waitFor(() => {
        expect(mockSendPhoneVerification).toHaveBeenCalled();
      });
    });

    it('should show sent message for phone', async () => {
      render(<VerifyPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Un code SMS a été envoyé à votre téléphone'),
        ).toBeInTheDocument();
      });
    });

    it('should verify phone with correct code', async () => {
      mockVerifyPhone.mockResolvedValue({});

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Vérifier Téléphone')).toBeInTheDocument();
      });

      const phoneInput = screen.getAllByPlaceholderText(
        'Entrez le code à 6 chiffres',
      )[1];
      fireEvent.change(phoneInput, { target: { value: '654321' } });

      const verifyButton = screen.getByText('Vérifier Téléphone');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(mockVerifyPhone).toHaveBeenCalledWith('654321');
      });
    });

    it('should show success message after phone verification', async () => {
      mockVerifyPhone.mockResolvedValue({});

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Vérifier Téléphone')).toBeInTheDocument();
      });

      const phoneInput = screen.getAllByPlaceholderText(
        'Entrez le code à 6 chiffres',
      )[1];
      fireEvent.change(phoneInput, { target: { value: '654321' } });

      const verifyButton = screen.getByText('Vérifier Téléphone');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(
          screen.getByText('✅ Téléphone vérifié avec succès !'),
        ).toBeInTheDocument();
      });
    });

    it('should resend phone code', async () => {
      render(<VerifyPage />);

      await waitFor(() => {
        const resendButtons = screen.getAllByText('Renvoyer le code');
        expect(resendButtons.length).toBeGreaterThan(0);
      });

      const resendButtons = screen.getAllByText('Renvoyer le code');
      fireEvent.click(resendButtons[1]);

      await waitFor(() => {
        expect(mockSendPhoneVerification).toHaveBeenCalledTimes(2);
        expect(
          screen.getByText('📱 Nouveau code SMS envoyé !'),
        ).toBeInTheDocument();
      });
    });

    it('should not show phone section if no phone number', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: false,
        phone_verified: false,
        has_phone_number: false,
        first_login: true,
      });
      mockSendEmailVerification.mockResolvedValue({});

      render(<VerifyPage />);

      await waitFor(() => {
        expect(
          screen.queryByText('📱 Vérification Téléphone'),
        ).not.toBeInTheDocument();
      });
    });

    it('should show phone verified checkmark when both email and phone verified', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: true,
        phone_verified: true,
        has_phone_number: true,
        first_login: true,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Compte vérifié !')).toBeInTheDocument();
      });
    });
  });

  describe('No Phone Number Scenarios', () => {
    it('should show warning when email verified but no phone number', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: true,
        phone_verified: false,
        has_phone_number: false,
        first_login: true,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Téléphone requis pour continuer'),
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            'Ajoutez un numéro de téléphone pour finaliser votre inscription',
          ),
        ).toBeInTheDocument();
      });
    });

    it('should have button to add phone number', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: true,
        phone_verified: false,
        has_phone_number: false,
        first_login: true,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        const addPhoneButton = screen.getByText('Ajouter mon numéro');
        expect(addPhoneButton).toBeInTheDocument();

        fireEvent.click(addPhoneButton);
        expect(mockPush).toHaveBeenCalledWith('/profile');
      });
    });

    it('should show info message when neither verified and no phone', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: false,
        phone_verified: false,
        has_phone_number: false,
        first_login: true,
      });
      mockSendEmailVerification.mockResolvedValue({});

      render(<VerifyPage />);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Vous pourrez ajouter votre numéro de téléphone après la vérification de votre email',
          ),
        ).toBeInTheDocument();
      });
    });

    it('should handle NO_PHONE_NUMBER error when sending phone verification', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: false,
        phone_verified: false,
        has_phone_number: true,
        first_login: true,
      });
      mockSendEmailVerification.mockResolvedValue({});
      mockSendPhoneVerification.mockRejectedValue({
        message: 'NO_PHONE_NUMBER',
      });

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<VerifyPage />);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'ℹ️ Pas de téléphone enregistré',
        );
      });

      consoleLogSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle verification status error', async () => {
      mockGetVerificationStatus.mockRejectedValue(new Error('Network error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<VerifyPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Erreur lors de la vérification du statut'),
        ).toBeInTheDocument();
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should show default error for invalid email code', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: false,
        phone_verified: false,
        has_phone_number: true,
        first_login: true,
      });
      mockSendEmailVerification.mockResolvedValue({});
      mockSendPhoneVerification.mockResolvedValue({});
      mockVerifyEmail.mockRejectedValue({});

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Vérifier Email')).toBeInTheDocument();
      });

      const emailInput = screen.getAllByPlaceholderText(
        'Entrez le code à 6 chiffres',
      )[0];
      fireEvent.change(emailInput, { target: { value: '123456' } });

      const verifyButton = screen.getByText('Vérifier Email');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText('Code email invalide')).toBeInTheDocument();
      });
    });

    it('should show default error for invalid phone code', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: false,
        phone_verified: false,
        has_phone_number: true,
        first_login: true,
      });
      mockSendEmailVerification.mockResolvedValue({});
      mockSendPhoneVerification.mockResolvedValue({});
      mockVerifyPhone.mockRejectedValue({});

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Vérifier Téléphone')).toBeInTheDocument();
      });

      const phoneInput = screen.getAllByPlaceholderText(
        'Entrez le code à 6 chiffres',
      )[1];
      fireEvent.change(phoneInput, { target: { value: '654321' } });

      const verifyButton = screen.getByText('Vérifier Téléphone');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText('Code téléphone invalide')).toBeInTheDocument();
      });
    });

    it('should handle resend code error', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: false,
        phone_verified: false,
        has_phone_number: true,
        first_login: true,
      });
      mockSendEmailVerification
        .mockResolvedValueOnce({})
        .mockRejectedValue(new Error('Failed'));

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Renvoyer le code')).toBeInTheDocument();
      });

      const resendButtons = screen.getAllByText('Renvoyer le code');
      fireEvent.click(resendButtons[0]);

      await waitFor(() => {
        expect(
          screen.getByText("Erreur lors de l'envoi du code"),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Success Flow', () => {
    it('should redirect after both verifications complete', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: false,
        phone_verified: false,
        has_phone_number: true,
        first_login: true,
      });
      mockSendEmailVerification.mockResolvedValue({});
      mockSendPhoneVerification.mockResolvedValue({});
      mockVerifyEmail.mockResolvedValue({});
      mockVerifyPhone.mockResolvedValue({});

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Vérifier Email')).toBeInTheDocument();
      });

      // Verify email
      const emailInput = screen.getAllByPlaceholderText(
        'Entrez le code à 6 chiffres',
      )[0];
      fireEvent.change(emailInput, { target: { value: '123456' } });
      fireEvent.click(screen.getByText('Vérifier Email'));

      await waitFor(() => {
        expect(
          screen.getByText('✅ Email vérifié avec succès !'),
        ).toBeInTheDocument();
      });

      // Verify phone
      const phoneInput = screen.getAllByPlaceholderText(
        'Entrez le code à 6 chiffres',
      )[1];
      fireEvent.change(phoneInput, { target: { value: '654321' } });
      fireEvent.click(screen.getByText('Vérifier Téléphone'));

      await waitFor(() => {
        expect(
          screen.getByText('✅ Téléphone vérifié avec succès !'),
        ).toBeInTheDocument();
      });

      // Wait for redirect
      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/preferences');
      });
    });

    it('should show first login message', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: true,
        phone_verified: true,
        has_phone_number: true,
        first_login: true,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Configuration de vos préférences...'),
        ).toBeInTheDocument();
      });
    });

    it('should show returning user message', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: true,
        phone_verified: true,
        has_phone_number: true,
        first_login: false,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Redirection en cours...')).toBeInTheDocument();
      });
    });
  });

  describe('Console Logging', () => {
    it('should log verification status', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      mockGetVerificationStatus.mockResolvedValue({
        email_verified: false,
        phone_verified: false,
        has_phone_number: true,
        first_login: true,
      });
      mockSendEmailVerification.mockResolvedValue({});
      mockSendPhoneVerification.mockResolvedValue({});

      render(<VerifyPage />);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          '📊 Statut de vérification:',
          expect.any(Object),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
          '🔑 Première connexion ?',
          true,
        );
        expect(consoleLogSpy).toHaveBeenCalledWith('📧 Email vérifié ?', false);
        expect(consoleLogSpy).toHaveBeenCalledWith(
          '📱 Téléphone vérifié ?',
          false,
        );
      });

      consoleLogSpy.mockRestore();
    });

    it('should log when codes are sent', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      mockGetVerificationStatus.mockResolvedValue({
        email_verified: false,
        phone_verified: false,
        has_phone_number: true,
        first_login: true,
      });
      mockSendEmailVerification.mockResolvedValue({});
      mockSendPhoneVerification.mockResolvedValue({});

      render(<VerifyPage />);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('✅ Code email envoyé');
        expect(consoleLogSpy).toHaveBeenCalledWith('✅ Code téléphone envoyé');
      });

      consoleLogSpy.mockRestore();
    });

    it('should log verification success', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      mockGetVerificationStatus.mockResolvedValue({
        email_verified: false,
        phone_verified: false,
        has_phone_number: true,
        first_login: true,
      });
      mockSendEmailVerification.mockResolvedValue({});
      mockSendPhoneVerification.mockResolvedValue({});
      mockVerifyEmail.mockResolvedValue({});

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Vérifier Email')).toBeInTheDocument();
      });

      const emailInput = screen.getAllByPlaceholderText(
        'Entrez le code à 6 chiffres',
      )[0];
      fireEvent.change(emailInput, { target: { value: '123456' } });
      fireEvent.click(screen.getByText('Vérifier Email'));

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('✅ Email vérifié');
      });

      consoleLogSpy.mockRestore();
    });
  });

  describe('UI Styling', () => {
    it('should have proper styling for error messages', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: false,
        phone_verified: false,
        has_phone_number: true,
        first_login: true,
      });
      mockSendEmailVerification.mockResolvedValue({});
      mockSendPhoneVerification.mockResolvedValue({});
      mockVerifyEmail.mockRejectedValue({
        response: { data: { error: 'Invalid' } },
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Vérifier Email')).toBeInTheDocument();
      });

      const emailInput = screen.getAllByPlaceholderText(
        'Entrez le code à 6 chiffres',
      )[0];
      fireEvent.change(emailInput, { target: { value: '123456' } });
      fireEvent.click(screen.getByText('Vérifier Email'));

      await waitFor(() => {
        const errorElement = screen.getByText('Invalid');
        expect(errorElement).toHaveClass('text-red-700');
      });
    });

    it('should have proper styling for success messages', async () => {
      mockGetVerificationStatus.mockResolvedValue({
        email_verified: false,
        phone_verified: false,
        has_phone_number: true,
        first_login: true,
      });
      mockSendEmailVerification.mockResolvedValue({});
      mockSendPhoneVerification.mockResolvedValue({});
      mockVerifyEmail.mockResolvedValue({});

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Vérifier Email')).toBeInTheDocument();
      });

      const emailInput = screen.getAllByPlaceholderText(
        'Entrez le code à 6 chiffres',
      )[0];
      fireEvent.change(emailInput, { target: { value: '123456' } });
      fireEvent.click(screen.getByText('Vérifier Email'));

      await waitFor(() => {
        const successElement = screen.getByText(
          '✅ Email vérifié avec succès !',
        );
        expect(successElement).toHaveClass('text-green-700');
      });
    });
  });
});
