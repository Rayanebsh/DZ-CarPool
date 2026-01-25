import verificationService from '@/services/verification.service';
import authService from '@/services/auth.service';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('Authentication Flow Integration', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    mock.restore();
  });

  test('Complete login flow with verification redirect', async () => {
    const loginResponse = {
      user: {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      },
      tokens: {
        access: 'access_token',
        refresh: 'refresh_token',
      },
    };

    mock
      .onPost('http://localhost:8000/api/v1/users/login/')
      .reply(200, loginResponse);

    const authResult = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(authResult).toEqual(loginResponse);

    // Vérification du statut - mock l'instance api pour ce service
    const apiMock = new MockAdapter(require('@/services/api.client').default);
    apiMock.onGet('/users/verification-status/').reply(200, {
      email_verified: false,
      phone_verified: false,
      has_phone_number: true,
      first_login: true,
    });

    const status = await verificationService.getVerificationStatus();

    expect(status.email_verified).toBe(false);
    expect(status.first_login).toBe(true);

    apiMock.onPost('/users/send-email-verification/').reply(200);
    await verificationService.sendEmailVerification();

    apiMock.onPost('/users/verify-email/').reply(200);
    await verificationService.verifyEmail('123456');

    apiMock.restore();
  });
});
