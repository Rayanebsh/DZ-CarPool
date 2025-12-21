'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useLanguage } from '@/contexts/language-context';
import { Users, Shield, Target, Heart } from 'lucide-react';
import { useEffect } from 'react';

export default function AboutPage() {
  const { language } = useLanguage();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-[#FF5722]/5 to-transparent">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {language === 'en'
                  ? 'About DZ-CarPool'
                  : 'À propos de DZ-CarPool'}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {language === 'en'
                  ? "We're building Algeria's most trusted ride-sharing community, connecting travelers across wilayas and making inter-city journeys more affordable, sustainable, and enjoyable."
                  : "Nous construisons la communauté de covoiturage la plus fiable d'Algérie, reliant les voyageurs à travers les wilayas et rendant les voyages inter-villes plus abordables, durables et agréables."}
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#FF5722]/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-[#FF5722]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === 'en' ? 'Our Mission' : 'Notre Mission'}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {language === 'en'
                    ? 'To revolutionize inter-city travel in Algeria by creating a safe, reliable, and affordable ride-sharing platform that connects drivers and passengers, reduces carbon emissions, and builds lasting communities.'
                    : 'Révolutionner les voyages inter-villes en Algérie en créant une plateforme de covoiturage sûre, fiable et abordable qui connecte conducteurs et passagers, réduit les émissions de carbone et construit des communautés durables.'}
                </p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#FF5722]/10 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-[#FF5722]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === 'en' ? 'Our Vision' : 'Notre Vision'}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {language === 'en'
                    ? 'To become the leading ride-sharing platform in Algeria, empowering millions of Algerians to travel smarter, connect with their communities, and contribute to a more sustainable future.'
                    : "Devenir la plateforme de covoiturage leader en Algérie, permettant à des millions d'Algériens de voyager plus intelligemment, de se connecter avec leurs communautés et de contribuer à un avenir plus durable."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {language === 'en' ? 'Our Values' : 'Nos Valeurs'}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-[#FF5722]/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-[#FF5722]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {language === 'en' ? 'Safety First' : "Sécurité d'abord"}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {language === 'en'
                    ? 'We prioritize the safety of our community with verified profiles, reviews, and secure payment systems.'
                    : 'Nous priorisons la sécurité de notre communauté avec des profils vérifiés, des avis et des systèmes de paiement sécurisés.'}
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-[#FF5722]/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-[#FF5722]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {language === 'en' ? 'Community' : 'Communauté'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {language === 'en'
                    ? 'We believe in building strong connections and fostering trust among travelers across Algeria.'
                    : "Nous croyons en la construction de liens solides et en favorisant la confiance entre les voyageurs à travers l'Algérie."}
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-[#FF5722]/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-[#FF5722]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {language === 'en' ? 'Sustainability' : 'Durabilité'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {language === 'en'
                    ? 'By sharing rides, we reduce carbon emissions and contribute to a cleaner environment for future generations.'
                    : 'En partageant des trajets, nous réduisons les émissions de carbone et contribuons à un environnement plus propre pour les générations futures.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
                {language === 'en' ? 'Our Story' : 'Notre Histoire'}
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600">
                <p className="mb-4 leading-relaxed">
                  {language === 'en'
                    ? 'DZ-CarPool was born from a simple observation: too many cars traveling between Algerian cities with empty seats, while passengers struggled to find affordable and reliable transportation. We saw an opportunity to connect these travelers and create a win-win solution.'
                    : "DZ-CarPool est né d'une observation simple : trop de voitures voyageant entre les villes algériennes avec des sièges vides, alors que les passagers peinaient à trouver un transport abordable et fiable. Nous avons vu une opportunité de connecter ces voyageurs et de créer une solution gagnant-gagnant."}
                </p>
                <p className="mb-4 leading-relaxed">
                  {language === 'en'
                    ? "Since our launch, we've helped thousands of Algerians travel smarter, save money, and build meaningful connections. Our platform has grown from a small startup to a trusted community of drivers and passengers across all 58 wilayas."
                    : "Depuis notre lancement, nous avons aidé des milliers d'Algériens à voyager plus intelligemment, à économiser de l'argent et à créer des liens significatifs. Notre plateforme est passée d'une petite startup à une communauté de confiance de conducteurs et passagers à travers les 58 wilayas."}
                </p>
                <p className="leading-relaxed">
                  {language === 'en'
                    ? "Today, we continue to innovate and improve our platform, always keeping our users' safety, convenience, and satisfaction at the heart of everything we do."
                    : "Aujourd'hui, nous continuons d'innover et d'améliorer notre plateforme, en gardant toujours la sécurité, la commodité et la satisfaction de nos utilisateurs au cœur de tout ce que nous faisons."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
