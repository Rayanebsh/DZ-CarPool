'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu, X, Bell, User, ChevronDown, Globe, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onNotificationsClick?: () => void;
}

function Header({ onNotificationsClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [unreadNotifications] = useState(3);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // 🔍 DEBUG COMPLET
  useEffect(() => {
    console.log('=== HEADER DEBUG ===');
    console.log('User object:', user);
    console.log('User keys:', user ? Object.keys(user) : 'No user');
    console.log('Profile picture value:', user?.profile_picture);
    console.log('Type of profile_picture:', typeof user?.profile_picture);
    console.log('Is staff:', user?.is_staff);
    console.log('===================');
  }, [user]);

  const navigation = [
    { name: language === 'en' ? 'Find a ride' : 'Trajets', href: '/#hero' },
    { name: language === 'en' ? 'Publish a ride' : 'Publier', href: '/#cta' },
    {
      name: language === 'en' ? 'How it works' : 'Fonctionnement',
      href: '/#how-it-works',
    },
    { name: language === 'en' ? 'Why us' : 'Avantages', href: '/#why-us' },
    { name: language === 'en' ? 'FAQ' : 'FAQ', href: '/#faq' },
  ];

  const toggleLanguage = (lang: 'en' | 'fr') => {
    setLanguage(lang);
    setLangMenuOpen(false);
  };

  // Fonction pour construire l'URL de la photo
  const getProfileImageUrl = () => {
    if (!user || !user.profile_picture) {
      console.log('❌ No profile picture');
      return null;
    }

    const profilePic = user.profile_picture;
    console.log('📸 Raw profile_picture:', profilePic);

    // Si l'URL est complète
    if (profilePic.startsWith('http')) {
      console.log('✅ Full URL:', profilePic);
      return profilePic;
    }

    // Si l'URL est relative
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const fullUrl = `${API_URL}${profilePic.startsWith('/') ? '' : '/'}${profilePic}`;
    console.log('✅ Constructed URL:', fullUrl);
    return fullUrl;
  };

  const profileImageUrl = getProfileImageUrl();

  // TEST: Avatar simple avec beaucoup de debug
  const TestAvatar = () => {
    const [imageError, setImageError] = useState(false);

    const initial =
      user?.first_name?.charAt(0)?.toUpperCase() ||
      user?.email?.charAt(0)?.toUpperCase() ||
      'U';

    console.log('🎨 Rendering avatar with URL:', profileImageUrl);
    console.log('🎨 Image error state:', imageError);

    if (!profileImageUrl || imageError) {
      console.log('🟠 Showing initial:', initial);
      return (
        <div className="w-8 h-8 rounded-full bg-[#FF5722] flex items-center justify-center text-white font-semibold text-sm">
          {initial}
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
        <img
          src={profileImageUrl}
          alt="Profile"
          className="w-full h-full object-cover"
          onError={() => {
            console.error('❌ Image failed to load:', profileImageUrl);
            setImageError(true);
          }}
          onLoad={() => {
            console.log('✅ Image loaded successfully:', profileImageUrl);
          }}
        />
      </div>
    );
  };
  console.log('Is staff:', user?.is_staff);
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-15 h-15 rounded-lg bg-[#FF5722]">
              <Image
                src="/images/logo.png"
                alt="DZ-CarPool"
                width={75}
                height={75}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold text-foreground">
              DZ-CarPool
            </span>
          </Link>

          <div className="flex md:hidden gap-2">
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onNotificationsClick}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#FF5722] text-white text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
            )}
            <button
              type="button"
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {language.toUpperCase()}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-background border border-border rounded-md shadow-lg overflow-hidden z-50">
                  <button
                    onClick={() => toggleLanguage('en')}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors ${language === 'en' ? 'bg-accent font-medium' : ''}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => toggleLanguage('fr')}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors ${language === 'fr' ? 'bg-accent font-medium' : ''}`}
                  >
                    Français
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNotificationsClick}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#FF5722] text-white text-xs">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 hover:bg-accent"
                    >
                      <TestAvatar />
                      <span className="text-sm font-medium">
                        {user.first_name || user.email}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'My Profile' : 'Mon profil'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/trips" className="cursor-pointer">
                        {language === 'en' ? 'My Trips' : 'Mes trajets'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/messages" className="cursor-pointer">
                        {language === 'en' ? 'Messages' : 'Messages'}
                      </Link>
                    </DropdownMenuItem>

                    {/* Admin Dashboard - Only for staff/admin users */}
                    {user.is_staff && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin"
                            className="cursor-pointer text-orange-600 font-semibold"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            {language === 'en'
                              ? 'Admin Dashboard'
                              : 'Tableau de bord Admin'}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-red-600"
                    >
                      {language === 'en' ? 'Logout' : 'Déconnexion'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {language === 'en' ? 'Log in' : 'Se connecter'}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="sm"
                    className="bg-[#FF5722] hover:bg-[#FF5722]/90 text-white"
                  >
                    {language === 'en' ? 'Sign up' : "S'inscrire"}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="border-t border-border pt-4 mt-4 flex gap-2">
              <button
                onClick={() => toggleLanguage('en')}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${language === 'en' ? 'bg-accent font-medium' : 'hover:bg-accent'}`}
              >
                English
              </button>
              <button
                onClick={() => toggleLanguage('fr')}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${language === 'fr' ? 'bg-accent font-medium' : 'hover:bg-accent'}`}
              >
                Français
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-border">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <TestAvatar />
                    <span className="text-sm font-medium">
                      {user.first_name || user.email}
                    </span>
                  </div>
                  <Link
                    href="/profile"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left px-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {language === 'en' ? 'My Profile' : 'Mon profil'}
                  </Link>
                  <Link
                    href="/trips"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left px-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {language === 'en' ? 'My Trips' : 'Mes trajets'}
                  </Link>
                  <Link
                    href="/messages"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left px-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {language === 'en' ? 'Messages' : 'Messages'}
                  </Link>

                  {/* Admin Dashboard - Mobile */}
                  {user.is_staff && (
                    <Link
                      href="/admin"
                      className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors text-left px-3 py-2 flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      {language === 'en'
                        ? 'Admin Dashboard'
                        : 'Tableau de bord Admin'}
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors text-left px-3 py-2"
                  >
                    {language === 'en' ? 'Logout' : 'Déconnexion'}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start w-full"
                    >
                      {language === 'en' ? 'Log in' : 'Se connecter'}
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      size="sm"
                      className="bg-[#FF5722] hover:bg-[#FF5722]/90 text-white w-full"
                    >
                      {language === 'en' ? 'Sign up' : "S'inscrire"}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// ✅ Export nommé pour correspondre à l'import
export { Header };
