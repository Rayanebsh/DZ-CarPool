// __tests__/app/documents/page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import DocumentsPage from '@/app/documents/page';

jest.mock('next/navigation');
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

global.fetch = jest.fn();

describe('DocumentsPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    localStorage.setItem('access_token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  const getFileInput = () =>
    screen
      .getByText(/Fichier \(PDF, JPG, PNG - max 5Mo\)/)
      .parentElement!.querySelector('input[type="file"]') as HTMLInputElement;

  it('renders upload form', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Télécharger un document')).toBeInTheDocument();
      expect(screen.getByText('Type de document')).toBeInTheDocument();
    });
  });

  it('displays document type options', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<DocumentsPage />);

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();

      const options = screen.getAllByRole('option');
      expect(options.length).toBe(3);
      expect(options[0]).toHaveTextContent("Carte Nationale d'Identité");
      expect(options[1]).toHaveTextContent('Permis de Conduire');
      expect(options[2]).toHaveTextContent('Autre Document');
    });
  });

  it('handles file selection', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Télécharger un document')).toBeInTheDocument();
    });

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = getFileInput();

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('✓ test.pdf')).toBeInTheDocument();
    });
  });

  it('displays file size after selection', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Télécharger un document')).toBeInTheDocument();
    });

    const file = new File(['x'.repeat(1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });
    const input = getFileInput();

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/1\.0 Mo/)).toBeInTheDocument();
    });
  });

  it('alerts when no file is selected', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Télécharger le document')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Télécharger le document'));

    expect(alertSpy).toHaveBeenCalledWith('Veuillez sélectionner un fichier');
    alertSpy.mockRestore();
  });

  it('uploads document successfully and shows alert', async () => {
    (fetch as jest.Mock)
      // fetchDocuments
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      // uploadDocument
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, document_type: 'CNI' }),
      });

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Télécharger un document')).toBeInTheDocument();
    });

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = getFileInput();

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByText('Télécharger le document'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('Document téléchargé avec succès'),
      );
    });

    alertSpy.mockRestore();
  });

  it('redirects to home after successful upload', async () => {
    (fetch as jest.Mock)
      // fetchDocuments
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      // uploadDocument
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
      });

    jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Télécharger un document')).toBeInTheDocument();
    });

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = getFileInput();

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByText('Télécharger le document'));

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/');
      },
      { timeout: 3000 },
    );
  });

  it('displays error message on upload failure', async () => {
    (fetch as jest.Mock)
      // fetchDocuments
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      // uploadDocument KO
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: 'Invalid file' }),
      });

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Télécharger un document')).toBeInTheDocument();
    });

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = getFileInput();

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByText('Télécharger le document'));

    await waitFor(() => {
      expect(screen.getByText(/Invalid file/)).toBeInTheDocument();
    });
  });

  it('disables upload button during upload', async () => {
    (fetch as jest.Mock)
      // fetchDocuments
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      // uploadDocument long
      .mockResolvedValueOnce(
        new Promise((resolve) =>
          setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100),
        ),
      );

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Télécharger un document')).toBeInTheDocument();
    });

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = getFileInput();

    fireEvent.change(input, { target: { files: [file] } });

    const uploadBtn = screen.getByText('Télécharger le document');
    fireEvent.click(uploadBtn);

    expect(uploadBtn).toBeDisabled();
    expect(screen.getByText('Téléchargement en cours...')).toBeInTheDocument();
  });

  it('displays uploaded documents list', async () => {
    (fetch as jest.Mock).mockReset();

    const mockDocuments = [
      {
        id: 1,
        document_type: 'CNI',
        uploaded_at: '2025-01-01T10:00:00Z',
        verified: true,
        rejection_reason: null,
      },
      {
        id: 2,
        document_type: 'PERMIS',
        uploaded_at: '2025-01-02T15:00:00Z',
        verified: false,
        rejection_reason: null,
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDocuments,
    });

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('CNI')).toBeInTheDocument();
      expect(screen.getByText('PERMIS')).toBeInTheDocument();
      expect(screen.getByText('✓ Vérifié')).toBeInTheDocument();
      expect(screen.getByText('⏳ En attente')).toBeInTheDocument();
    });
  });

  it('displays rejection reason when present', async () => {
    (fetch as jest.Mock).mockReset();

    const mockDocuments = [
      {
        id: 1,
        document_type: 'CNI',
        uploaded_at: '2025-01-01T10:00:00Z',
        verified: false,
        rejection_reason: 'Document illisible',
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDocuments,
    });

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Raison du rejet :')).toBeInTheDocument();
      expect(screen.getByText('Document illisible')).toBeInTheDocument();
    });
  });

  it('shows empty state when no documents', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Aucun document téléchargé pour le moment'),
      ).toBeInTheDocument();
    });
  });

  it('redirects to login on 401 error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Session expirée. Redirection vers connexion...',
      );
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    alertSpy.mockRestore();
  });

  it('changes document type selection', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<DocumentsPage />);

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'PERMIS' } });
      expect(select).toHaveValue('PERMIS');
    });
  });
});
