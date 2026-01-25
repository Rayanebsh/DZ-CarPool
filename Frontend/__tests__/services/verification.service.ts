import verificationService from '@/services/verification.service';
import api from '@/services/api.client';
import MockAdapter from 'axios-mock-adapter';

describe('VerificationService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
    jest.clearAllMocks();
  });

  afterEach(() => {
    mock.restore();
  });

  describe('getVerificationStatus()', () => {
    test('returns complete verification status', async () => {
      const mockStatus = {
        email_verified: true,
        phone_verified: false,
        phone_number: '+213555111111',
        has_phone_number: true,
        first_login: true,
      };

      mock.onGet('/users/verification-status/').reply(200, mockStatus);

      const result = await verificationService.getVerificationStatus();

      expect(result).toEqual(mockStatus);
    });

    test('handles missing phone_number gracefully', async () => {
      mock.onGet('/users/verification-status/').reply(200, {
        email_verified: false,
        phone_verified: false,
        first_login: true,
      });

      const result = await verificationService.getVerificationStatus();

      expect(result.has_phone_number).toBe(false);
    });
  });

  describe('sendEmailVerification()', () => {
    test('sends verification email successfully', async () => {
      mock.onPost('/users/send-email-verification/').reply(200);

      await expect(
        verificationService.sendEmailVerification(),
      ).resolves.not.toThrow();
    });

    test('throws when email already verified', async () => {
      mock.onPost('/users/send-email-verification/').reply(400, {
        error: 'EMAIL_ALREADY_VERIFIED',
      });

      await expect(verificationService.sendEmailVerification()).rejects.toThrow(
        'EMAIL_ALREADY_VERIFIED',
      );
    });
  });

  describe('sendPhoneVerification()', () => {
    test('sends SMS verification successfully', async () => {
      mock.onPost('/users/send-phone-verification/').reply(200);

      await expect(
        verificationService.sendPhoneVerification(),
      ).resolves.not.toThrow();
    });

    test('throws when phone already verified', async () => {
      mock.onPost('/users/send-phone-verification/').reply(400, {
        error: 'PHONE_ALREADY_VERIFIED',
      });

      await expect(verificationService.sendPhoneVerification()).rejects.toThrow(
        'PHONE_ALREADY_VERIFIED',
      );
    });

    test('throws when no phone number provided', async () => {
      mock.onPost('/users/send-phone-verification/').reply(400, {
        error: 'NO_PHONE_NUMBER',
      });

      await expect(verificationService.sendPhoneVerification()).rejects.toThrow(
        'NO_PHONE_NUMBER',
      );
    });
  });

  describe('verifyEmail()', () => {
    test('verifies email with correct code', async () => {
      mock.onPost('/users/verify-email/').reply(200);

      await expect(
        verificationService.verifyEmail('123456'),
      ).resolves.not.toThrow();
    });

    test('throws on invalid code', async () => {
      mock.onPost('/users/verify-email/').reply(400, {
        error: 'Invalid code',
      });

      await expect(verificationService.verifyEmail('000000')).rejects.toThrow();
    });
  });

  describe('verifyPhone()', () => {
    test('verifies phone with correct code', async () => {
      mock.onPost('/users/verify-phone/').reply(200);

      await expect(
        verificationService.verifyPhone('123456'),
      ).resolves.not.toThrow();
    });

    test('throws on invalid code', async () => {
      mock.onPost('/users/verify-phone/').reply(400, {
        error: 'Invalid code',
      });

      await expect(verificationService.verifyPhone('000000')).rejects.toThrow();
    });
  });
});
