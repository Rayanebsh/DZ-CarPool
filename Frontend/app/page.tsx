'use client';

import { useState } from 'react';
import Head from 'next/head';
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
    <>
      <Head>
        <title>DZ-CarPool - Covoiturage en Algérie</title>
        <meta
          name="description"
          content="Partagez vos trajets en covoiturage à travers l'Algérie. Économisez, voyagez éco et connectez-vous avec des conducteurs fiables."
        />
      </Head>
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
    </>
  );
}
