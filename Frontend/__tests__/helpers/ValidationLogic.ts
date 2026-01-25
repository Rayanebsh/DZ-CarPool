describe('Validation Utils', () => {
  describe('Email Validation', () => {
    test('validates correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com',
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    test('rejects invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      invalidEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('Password Validation', () => {
    test('validates strong passwords', () => {
      const strongPasswords = ['Password123!', 'MyP@ssw0rd', 'Str0ng!Pass'];

      // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      strongPasswords.forEach((password) => {
        expect(passwordRegex.test(password)).toBe(true);
      });
    });

    test('rejects weak passwords', () => {
      const weakPasswords = ['weak', 'password', '12345678', 'PASSWORD123'];

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      weakPasswords.forEach((password) => {
        expect(passwordRegex.test(password)).toBe(false);
      });
    });
  });

  describe('Phone Number Validation', () => {
    test('validates Algerian phone numbers', () => {
      const validPhones = ['+213555111111', '+213777222222', '+213666333333'];

      const phoneRegex = /^\+213[567]\d{8}$/;

      validPhones.forEach((phone) => {
        expect(phoneRegex.test(phone)).toBe(true);
      });
    });

    test('rejects invalid phone numbers', () => {
      const invalidPhones = ['0555111111', '+213', '+213555', '+1234567890'];

      const phoneRegex = /^\+213[567]\d{8}$/;

      invalidPhones.forEach((phone) => {
        expect(phoneRegex.test(phone)).toBe(false);
      });
    });
  });
});
