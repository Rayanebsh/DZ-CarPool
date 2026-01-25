// stores/documents.store.ts
'use client';
import { create } from 'zustand';

interface Document {
  id: number;
  document_type: string;
  file_path: string;
  uploaded_at: string;
  verified: boolean;
  rejection_reason?: string;
}

interface DocumentsState {
  // État
  documents: Document[];
  selectedFile: File | null;
  documentType: string;
  loading: boolean;
  uploadError: string | null;
  uploadSuccess: boolean;

  // Actions
  setDocuments: (docs: Document[]) => void;
  setSelectedFile: (file: File | null) => void;
  setDocumentType: (type: string) => void;
  setLoading: (loading: boolean) => void;
  setUploadError: (error: string | null) => void;
  setUploadSuccess: (success: boolean) => void;

  // API calls
  fetchDocuments: () => Promise<void>;
  uploadDocument: () => Promise<void>;

  // Reset
  reset: () => void;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  // État initial
  documents: [],
  selectedFile: null,
  documentType: 'CNI',
  loading: false,
  uploadError: null,
  uploadSuccess: false,

  // ========== SETTERS ==========
  setDocuments: (docs) => set({ documents: docs }),
  setSelectedFile: (file) => set({ selectedFile: file, uploadError: null }),
  setDocumentType: (type) => set({ documentType: type }),
  setLoading: (loading) => set({ loading }),
  setUploadError: (error) => set({ uploadError: error }),
  setUploadSuccess: (success) => set({ uploadSuccess: success }),

  // ========== FETCH DOCUMENTS ==========
  fetchDocuments: async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Non authentifié');

      const response = await fetch(`${API_URL}/api/v1/users/documents/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erreur chargement documents');

      const data = await response.json();
      set({ documents: data });
    } catch (error: any) {
      console.error('Erreur fetch documents:', error);
      throw error;
    }
  },

  // ========== UPLOAD DOCUMENT ==========
  uploadDocument: async () => {
    const { selectedFile, documentType } = get();

    if (!selectedFile) {
      throw new Error('Veuillez sélectionner un fichier');
    }

    try {
      set({ loading: true, uploadError: null, uploadSuccess: false });

      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Non authentifié');

      const formData = new FormData();
      formData.append('file_path', selectedFile);
      formData.append('document_type', documentType);

      const response = await fetch(`${API_URL}/api/v1/users/upload-document/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Erreur ${response.status}`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage =
            errorData.detail ||
            errorData.message ||
            errorData.error ||
            errorText;
        } catch {
          errorMessage += `: ${errorText.slice(0, 100)}`;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      set({
        uploadSuccess: true,
        loading: false,
        selectedFile: null,
      });

      // Refresh documents list
      await get().fetchDocuments();

      return result;
    } catch (error: any) {
      const errorMsg = error.message || 'Erreur upload document';
      set({ uploadError: errorMsg, loading: false });
      throw error;
    }
  },

  // ========== RESET ==========
  reset: () =>
    set({
      documents: [],
      selectedFile: null,
      documentType: 'CNI',
      loading: false,
      uploadError: null,
      uploadSuccess: false,
    }),
}));
