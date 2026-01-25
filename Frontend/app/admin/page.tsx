'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/header';
import {
  Users,
  Car,
  Shield,
  TrendingUp,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  FileText,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined: string;
}

interface Trajet {
  id: number;
  ville_depart: string;
  ville_arrivee: string;
  date: string;
  heure_depart: string;
  nbr_places: number;
  places_disponibles: number;
  status: string;
  conducteur: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface UserDocument {
  id: number;
  user?: number;
  document_type: string;
  file_path: string;
  uploaded_at: string;
  verified: boolean;
  verified_by?: number;
  verified_at?: string;
  rejection_reason?: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  pendingDocuments: number;
  totalTrips: number;
  activeTrips: number;
}

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    pendingDocuments: 0,
    totalTrips: 0,
    activeTrips: 0,
  });
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const api = {
    get: async (url: string) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/v1${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('API Error');
      return response.json();
    },
    post: async (url: string, data: any) => {
      const token = localStorage.getItem('access_token');
      console.log('POST Request:', url, data);
      const response = await fetch(`${API_URL}/api/v1${url}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API Error');
      }
      return response.json();
    },
    delete: async (url: string) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/v1${url}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API Error');
      }
      return response.ok;
    },
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsData = await api.get('/users/admin/stats/');
      setStats(statsData);

      const usersResponse = await api.get('/users/');
      setUsers(usersResponse.results || usersResponse);

      const trajetsResponse = await api.get('/trajets/');
      setTrajets(trajetsResponse.results || trajetsResponse);

      const docsResponse = await api.get('/users/admin/pending-documents/');
      console.log('📦 Raw API response:', docsResponse);

      const docs = docsResponse.documents || [];
      console.log('📋 Documents array:', docs);

      setDocuments(docs);

      console.log('✅ Documents loaded:', docs.length);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      alert('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDocument = async (documentId: number) => {
    console.log('🔍 handleVerifyDocument called with:', { documentId });

    if (!documentId) {
      console.error('❌ Missing document ID');
      alert('Erreur: ID du document manquant');
      return;
    }

    try {
      const payload = { document_id: Number(documentId) };
      console.log('📤 Sending payload:', payload);

      const result = await api.post('/users/admin/verify-document/', payload);
      console.log('✅ Success:', result);
      alert('Document approuvé avec succès');
      await loadDashboardData();
    } catch (error: any) {
      console.error('❌ Error:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const handleRejectDocument = async (documentId: number) => {
    console.log('🔍 handleRejectDocument called with:', { documentId });

    if (!documentId) {
      console.error('❌ Missing document ID');
      alert('Erreur: ID du document manquant');
      return;
    }

    const reason = prompt('Raison du rejet:');
    if (!reason) return;

    try {
      const payload = { document_id: Number(documentId), reason };
      console.log('📤 Sending payload:', payload);

      const result = await api.post('/users/admin/reject-document/', payload);
      console.log('✅ Success:', result);
      alert('Document rejeté');
      await loadDashboardData();
    } catch (error: any) {
      console.error('❌ Error:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (
      !confirm(
        '⚠️ Supprimer définitivement cet utilisateur ? Cette action est irréversible.',
      )
    )
      return;
    try {
      console.log('🗑️ Deleting user:', userId);
      await api.delete(`/users/${userId}/`);
      alert('Utilisateur supprimé');
      await loadDashboardData();
    } catch (error: any) {
      console.error('❌ Error:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (!confirm('Supprimer ce trajet ?')) return;
    try {
      console.log('🗑️ Deleting trip:', tripId);
      await api.delete(`/trajets/${tripId}/`);
      alert('Trajet supprimé');
      await loadDashboardData();
    } catch (error: any) {
      console.error('❌ Error:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const handleViewDocument = (filePath: string) => {
    console.log('📄 handleViewDocument called');
    console.log('file_path:', filePath);

    if (
      !filePath ||
      filePath === '' ||
      filePath === 'null' ||
      filePath === 'undefined'
    ) {
      console.error('❌ Invalid file_path:', filePath);
      alert('Fichier du document non disponible');
      return;
    }

    let fullUrl = filePath;
    if (!filePath.startsWith('http')) {
      const ApiUrl = process.env.NEXT_PUBLIC_API_URL;
      fullUrl = `${ApiUrl}/api/v1${filePath}`;
    }

    console.log('✅ Opening URL:', fullUrl);
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tableau de bord Admin
            </h1>
            <p className="text-gray-600">
              Gérer les utilisateurs, trajets et vérifications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.totalUsers}
              </h3>
              <p className="text-sm text-gray-600">Utilisateurs totaux</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-orange-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.activeTrips}
              </h3>
              <p className="text-sm text-gray-600">Trajets actifs</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.verifiedUsers}
              </h3>
              <p className="text-sm text-gray-600">Utilisateurs vérifiés</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.pendingDocuments}
              </h3>
              <p className="text-sm text-gray-600">Documents en attente</p>
            </div>
          </div>

          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
              <TabsTrigger
                value="documents"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500"
              >
                Vérification Identités
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500"
              >
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger
                value="trips"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500"
              >
                Trajets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Documents en attente ({documents.length})
                  </h2>
                </div>

                {documents.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun document en attente</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Document
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Fichier
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y">
                        {documents.map((doc) => {
                          console.log('🔍 Rendering document:', doc);

                          const userId = doc.user || null;

                          return (
                            <tr key={doc.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">
                                  Document #{doc.id}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Utilisateur ID: {userId || 'Non disponible'}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant="secondary">
                                  {doc.document_type === 'ID_CARD'
                                    ? 'CNI'
                                    : doc.document_type}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(doc.uploaded_at).toLocaleDateString(
                                  'fr-FR',
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    console.log(
                                      '🖱️ View button clicked for doc:',
                                      doc.id,
                                    );
                                    console.log('File path:', doc.file_path);
                                    handleViewDocument(doc.file_path);
                                  }}
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Voir le document
                                </Button>
                                <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                                  {doc.file_path || 'Fichier manquant'}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => {
                                      console.log(
                                        '✅ Approve clicked for doc:',
                                        doc.id,
                                      );
                                      handleVerifyDocument(doc.id);
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approuver
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-600 text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                      console.log(
                                        '❌ Reject clicked for doc:',
                                        doc.id,
                                      );
                                      handleRejectDocument(doc.id);
                                    }}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Rejeter
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary">{user.role}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              className={
                                user.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {user.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(user.date_joined).toLocaleDateString(
                              'fr-FR',
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-600 text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Supprimer
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trips">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Trajet
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Conducteur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Places
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y">
                      {trajets.map((trajet) => (
                        <tr key={trajet.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {trajet.ville_depart} → {trajet.ville_arrivee}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {trajet.conducteur.first_name}{' '}
                              {trajet.conducteur.last_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(trajet.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {trajet.places_disponibles}/{trajet.nbr_places}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              className={
                                trajet.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800'
                                  : trajet.status === 'COMPLETED'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                              }
                            >
                              {trajet.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-600 text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteTrip(trajet.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Supprimer
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
