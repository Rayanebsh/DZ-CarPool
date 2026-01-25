// __tests__/app/signup/page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import SignupPage from '@/app/signup/page';
import { useAuth } from '@/hooks/use-auth';
import authService from '@/services/auth.service';

jest.mock('next/navigation');
jest.mock('@/hooks/use-auth');
jest.mock('@/services/auth.service');
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
    setLanguage: jest.fn(),
  }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('SignupPage', () => {
  const mockRegister = jest.fn();
  const mockPush = jest.fn();
  const mockUploadDocument = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useAuth as jest.Mock).mockReturnValue({ register: mockRegister });
    (authService.uploadDocument as jest.Mock) = mockUploadDocument;
  });

  it('renders signup form with all fields', () => {
    render(<SignupPage />);

    expect(screen.getByText('getStarted')).toBeInTheDocument();
    expect(screen.getByLabelText('firstName')).toBeInTheDocument();
    expect(screen.getByLabelText('lastName')).toBeInTheDocument();
    expect(screen.getByLabelText('emailAddress')).toBeInTheDocument();
    expect(screen.getByLabelText('phoneNumber')).toBeInTheDocument();
    expect(screen.getByLabelText('password')).toBeInTheDocument();
    expect(screen.getByLabelText('confirmPassword')).toBeInTheDocument();
  });

  it('renders user type selection buttons', () => {
    render(<SignupPage />);

    expect(screen.getByText('imDriver')).toBeInTheDocument();
    expect(screen.getByText('imPassenger')).toBeInTheDocument();
  });

  it('switches between driver and passenger', () => {
    render(<SignupPage />);

    const driverBtn = screen.getByText('imDriver').closest('button');
    const passengerBtn = screen.getByText('imPassenger').closest('button');

    // Driver selected by default
    expect(driverBtn).toHaveClass('border-gray-900');

    // Switch to passenger
    fireEvent.click(passengerBtn!);
    expect(passengerBtn).toHaveClass('border-gray-900');
  });

  it('validates password match', async () => {
    render(<SignupPage />);

    fireEvent.change(screen.getByLabelText('firstName'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText('lastName'), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText('emailAddress'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText('phoneNumber'), {
      target: { value: '+213555000000' },
    });
    fireEvent.change(screen.getByLabelText('password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('confirmPassword'), {
      target: { value: 'password456' },
    });

    fireEvent.click(screen.getByText('createAccount'));

    await waitFor(() => {
      expect(
        screen.getByText(/mots de passe ne correspondent pas/i),
      ).toBeInTheDocument();
    });
  });

  it('submits form successfully with valid data', async () => {
    mockRegister.mockResolvedValueOnce({});

    render(<SignupPage />);

    fireEvent.change(screen.getByLabelText('firstName'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText('lastName'), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText('emailAddress'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText('phoneNumber'), {
      target: { value: '+213555000000' },
    });
    fireEvent.change(screen.getByLabelText('password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('confirmPassword'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText('createAccount'));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
        password_confirm: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '+213555000000',
      });
    });
  });

  it('handles file upload for ID photo', async () => {
    mockRegister.mockResolvedValueOnce({});
    mockUploadDocument.mockResolvedValueOnce({});

    render(<SignupPage />);

    const file = new File(['id-photo'], 'id.jpg', { type: 'image/jpeg' });
    const input = screen
      .getByLabelText('uploadIdPhoto')
      .closest('div')
      ?.querySelector('input[type="file"]');

    fireEvent.change(input!, { target: { files: [file] } });

    expect(screen.getByText('id.jpg')).toBeInTheDocument();

    // Fill form and submit
    fireEvent.change(screen.getByLabelText('firstName'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText('lastName'), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText('emailAddress'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText('phoneNumber'), {
      target: { value: '+213555000000' },
    });
    fireEvent.change(screen.getByLabelText('password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('confirmPassword'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText('createAccount'));

    await waitFor(() => {
      expect(mockUploadDocument).toHaveBeenCalledWith(file, 'CNI');
    });
  });

  it('displays error message on registration failure', async () => {
    mockRegister.mockRejectedValueOnce(new Error('Email already exists'));

    render(<SignupPage />);

    fireEvent.change(screen.getByLabelText('firstName'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText('lastName'), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText('emailAddress'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText('phoneNumber'), {
      target: { value: '+213555000000' },
    });
    fireEvent.change(screen.getByLabelText('password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('confirmPassword'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText('createAccount'));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('disables submit button while loading', async () => {
    mockRegister.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<SignupPage />);

    fireEvent.change(screen.getByLabelText('firstName'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText('lastName'), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText('emailAddress'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText('phoneNumber'), {
      target: { value: '+213555000000' },
    });
    fireEvent.change(screen.getByLabelText('password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('confirmPassword'), {
      target: { value: 'password123' },
    });

    const submitBtn = screen.getByText('createAccount');
    fireEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
  });

  it('handles drag and drop for file upload', () => {
    render(<SignupPage />);

    const dropZone = screen.getByText('dragDropUpload').closest('div');
    const file = new File(['id-photo'], 'id.jpg', { type: 'image/jpeg' });

    fireEvent.dragOver(dropZone!);
    fireEvent.drop(dropZone!, {
      dataTransfer: { files: [file] },
    });

    expect(screen.getByText('id.jpg')).toBeInTheDocument();
  });

  it('renders Google login button', () => {
    render(<SignupPage />);

    expect(screen.getByText('continueWithGoogle')).toBeInTheDocument();
  });

  it('displays terms and privacy policy links', () => {
    render(<SignupPage />);

    expect(screen.getByText('termsOfService')).toBeInTheDocument();
    expect(screen.getByText('privacyPolicy')).toBeInTheDocument();
  });
});
