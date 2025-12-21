'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { WhyDZCarPool } from '@/components/why-dz-carpool';
import { HowItWorks } from '@/components/how-it-works';
import { CTASection } from '@/components/cta-section';
import { FAQSection } from '@/components/faq-section';
import { Footer } from '@/components/footer';
import { NotificationsSidebar } from '@/components/notifications-sidebar';

export default function Home() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onNotificationsClick={() => setNotificationsOpen(true)} />
      <main>
        <div id="hero">
          <HeroSection />
        </div>
        <div id="why-us">
          <WhyDZCarPool />
        </div>
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <div id="cta">
          <CTASection />
        </div>
        <div id="faq">
          <FAQSection />
        </div>
      </main>
      <Footer />

      {/* Notifications Sidebar */}
      <NotificationsSidebar
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
}
