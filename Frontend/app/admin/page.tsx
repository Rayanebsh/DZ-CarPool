'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Car,
  AlertCircle,
  TrendingUp,
  Search,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  BarChart3,
} from 'lucide-react';

export default function AdminPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock admin data
  const stats = {
    totalUsers: 15420,
    activeDrivers: 3850,
    totalTrips: 42300,
    pendingReports: 12,
  };

  const recentUsers = [
    {
      id: 1,
      name: 'Ahmed Benali',
      email: 'ahmed@email.com',
      role: 'Driver',
      status: 'active',
      joinDate: '2024-01-15',
    },
    {
      id: 2,
      name: 'Fatima Zohra',
      email: 'fatima@email.com',
      role: 'Passenger',
      status: 'active',
      joinDate: '2024-01-14',
    },
    {
      id: 3,
      name: 'Karim Mansour',
      email: 'karim@email.com',
      role: 'Driver',
      status: 'pending',
      joinDate: '2024-01-13',
    },
  ];

  const reportedContent = [
    {
      id: 1,
      type: 'User',
      reportedBy: 'User #1234',
      reason: 'Inappropriate behavior',
      status: 'pending',
    },
    {
      id: 2,
      type: 'Trip',
      reportedBy: 'User #5678',
      reason: 'Cancellation',
      status: 'reviewing',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'en' ? 'Admin Dashboard' : 'Tableau de bord Admin'}
            </h1>
            <p className="text-gray-600">
              {language === 'en'
                ? 'Manage users, trips, and platform settings'
                : 'Gérer les utilisateurs, les trajets et les paramètres de la plateforme'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.totalUsers.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'en' ? 'Total Users' : 'Utilisateurs totaux'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#FF5722]/10 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-[#FF5722]" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.activeDrivers.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'en' ? 'Active Drivers' : 'Conducteurs actifs'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.totalTrips.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'en' ? 'Total Trips' : 'Trajets totaux'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.pendingReports}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'en'
                  ? 'Pending Reports'
                  : 'Signalements en attente'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
              <TabsTrigger
                value="users"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5722] data-[state=active]:bg-transparent"
              >
                {language === 'en' ? 'Users' : 'Utilisateurs'}
              </TabsTrigger>
              <TabsTrigger
                value="trips"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5722] data-[state=active]:bg-transparent"
              >
                {language === 'en' ? 'Trips' : 'Trajets'}
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5722] data-[state=active]:bg-transparent"
              >
                {language === 'en' ? 'Reports' : 'Signalements'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={
                        language === 'en'
                          ? 'Search users...'
                          : 'Rechercher des utilisateurs...'
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === 'en' ? 'User' : 'Utilisateur'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === 'en' ? 'Role' : 'Rôle'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === 'en' ? 'Status' : 'Statut'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === 'en'
                            ? 'Join Date'
                            : "Date d'inscription"}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === 'en' ? 'Actions' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary">{user.role}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={
                                user.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {user.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.joinDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Ban className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trips">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <p className="text-gray-600 text-center">
                  {language === 'en'
                    ? 'Trip management coming soon...'
                    : 'Gestion des trajets à venir...'}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === 'en' ? 'Type' : 'Type'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === 'en' ? 'Reported By' : 'Signalé par'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === 'en' ? 'Reason' : 'Raison'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === 'en' ? 'Status' : 'Statut'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === 'en' ? 'Actions' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportedContent.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary">{report.type}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.reportedBy}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.reason}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={
                                report.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }
                            >
                              {report.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
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
      </main>

      <Footer />
    </div>
  );
}
