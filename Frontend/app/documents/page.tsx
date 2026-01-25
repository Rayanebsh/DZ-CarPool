'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Document {
  id: number;
  document_type: string;
  uploaded_at: string;
  verified: boolean;
  rejection_reason: string | null;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;
export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('CNI');
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  // ✅ Utilitaire pour obtenir le bon token
  const getAuthToken = (): string | null => {
    return (
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('refresh_token')
    );
  };

  // ✅ Refresh token automatique
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await fetch(`${API_URL}/api/v1/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.access) localStorage.setItem('access_token', data.access);
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh);

      console.log('✅ Token rafraîchi');
      return true;
    } catch {
      return false;
    }
  };

  // ✅ Requête avec retry automatique
  const authenticatedFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      let token = getAuthToken();
      if (!token) {
        setUploadError('Token manquant');
        throw new Error('Token manquant');
      }

      let response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        console.log('🔄 Token expiré, tentative de refresh...');
        const refreshed = await refreshToken();

        if (refreshed) {
          token = getAuthToken()!;
          response = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          // Si refresh échoue, rediriger
          setIsAuthenticated(false);
          alert('Session expirée. Redirection vers connexion...');
          router.push('/login');
          throw new Error('Session expirée');
        }
      }

      return response;
    },
    [router],
  );

  // ✅ fetchDocuments avec gestion d'erreur améliorée
  const fetchDocuments = useCallback(async () => {
    try {
      const response = await authenticatedFetch(`${API_URL}/api/v1/users/documents/`);

      if (!response.ok) {
        console.error(
          '❌ fetchDocuments erreur:',
          response.status,
          await response.text(),
        );
        if (response.status === 401) {
          setIsAuthenticated(false);
          alert('Session expirée. Redirection vers connexion...');
          router.push('/login');
        }
        return;
      }

      const data = await response.json();
      console.log('✅ Documents récupérés:', data);
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ fetchDocuments erreur:', error);
    }
  }, [authenticatedFetch, router]);

  // ✅ handleFileChange
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  // ✅ handleUpload avec redirection vers home CORRIGÉE
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    setLoading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file_path', selectedFile);
      formData.append('document_type', documentType);

      console.log('📤 Upload:', {
        filename: selectedFile.name,
        type: documentType,
        size: (selectedFile.size / 1024 / 1024).toFixed(1) + ' Mo',
      });

      const response = await authenticatedFetch(
        `${API_URL}/api/v1/users/upload_document/`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload erreur:', response.status, errorText);

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

        // ✅ Afficher l'erreur dans l'UI au lieu de throw
        setUploadError(errorMessage);
        return; // Ne pas throw, juste return
      }

      const successData = await response.json();
      console.log('✅ Upload OK:', successData);

      alert(
        "✅ Document téléchargé avec succès ! Redirection vers l'accueil...",
      );

      // ✅ Rafraîchir la liste des documents
      await fetchDocuments();

      // ✅ Redirection vers la page d'accueil après upload réussi
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error: any) {
      console.error('❌ Upload erreur:', error);
      const errorMsg = error.message || 'Erreur inconnue';
      setUploadError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Charger documents au montage
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600">Redirection...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-white p-12 flex-col justify-between">
        <div className="space-y-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-25 h-25 rounded-lg bg-[#FF5722]">
              <Image
                src="/images/logo.png"
                alt="DZ-CarPool"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-gray-900">DZ-CarPool</span>
          </Link>

          <div className="inline-block px-6 py-2.5 bg-[#FF9B89] text-gray-900 rounded-full text-sm font-medium">
            Vérification sécurisée
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Vos documents en toute sécurité
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Téléchargez vos documents d'identité pour une expérience de
              covoiturage sûre et vérifiée
            </p>
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden">
            <Image
              src="/images/img.png"
              alt="Secure documents"
              width={600}
              height={400}
              className="object-cover w-full"
            />
          </div>
        </div>
      </div>

      {/* Right Side - Upload Form & Documents List */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-2xl space-y-6">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Télécharger un document
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Ajoutez vos pièces d'identité pour vérification
              </p>
            </div>

            {uploadError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {uploadError}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-900">
                  Type de document
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent bg-white text-gray-900 text-sm"
                  disabled={loading}
                >
                  <option value="CNI">Carte Nationale d'Identité</option>
                  <option value="PERMIS">Permis de Conduire</option>
                  <option value="AUTRE">Autre Document</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-900">
                  Fichier (PDF, JPG, PNG - max 5Mo)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent bg-white text-gray-900 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                />
                {selectedFile && (
                  <p className="mt-2 text-xs text-green-600 font-medium">
                    ✓ {selectedFile.name} (
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} Mo)
                  </p>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={loading || !selectedFile}
                className="w-full h-12 bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Téléchargement en cours...
                  </span>
                ) : (
                  'Télécharger le document'
                )}
              </button>
            </div>
          </div>

          {/* Documents List Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Mes documents téléchargés
            </h2>

            {documents.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500 text-sm">
                  Aucun document téléchargé pour le moment
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {doc.document_type}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Téléchargé le{' '}
                          {new Date(doc.uploaded_at).toLocaleDateString(
                            'fr-FR',
                          )}
                        </p>
                      </div>
                      <div className="ml-4">
                        {doc.verified ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                            ✓ Vérifié
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium">
                            ⏳ En attente
                          </span>
                        )}
                      </div>
                    </div>
                    {doc.rejection_reason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                        <p className="text-red-700 font-medium text-xs mb-1">
                          Raison du rejet :
                        </p>
                        <p className="text-red-600 text-xs">
                          {doc.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
