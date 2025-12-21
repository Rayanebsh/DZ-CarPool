'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Briefcase, Heart, Zap, Users } from 'lucide-react';
import { useEffect } from 'react';

const jobOpenings = [
  {
    id: 1,
    title: 'Full Stack Developer',
    titleFr: 'Développeur Full Stack',
    location: 'Algiers, Algeria',
    locationFr: 'Alger, Algérie',
    type: 'Full-time',
    typeFr: 'Temps plein',
    department: 'Engineering',
    departmentFr: 'Ingénierie',
  },
  {
    id: 2,
    title: 'Product Designer',
    titleFr: 'Designer Produit',
    location: 'Algiers, Algeria',
    locationFr: 'Alger, Algérie',
    type: 'Full-time',
    typeFr: 'Temps plein',
    department: 'Design',
    departmentFr: 'Design',
  },
  {
    id: 3,
    title: 'Customer Support Specialist',
    titleFr: 'Spécialiste Support Client',
    location: 'Remote',
    locationFr: 'À distance',
    type: 'Full-time',
    typeFr: 'Temps plein',
    department: 'Support',
    departmentFr: 'Support',
  },
];

export default function CareersPage() {
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
                {language === 'en' ? 'Join Our Team' : 'Rejoignez notre équipe'}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {language === 'en'
                  ? "Help us build the future of ride-sharing in Algeria. We're looking for talented, passionate people to join our growing team."
                  : "Aidez-nous à construire l'avenir du covoiturage en Algérie. Nous recherchons des personnes talentueuses et passionnées pour rejoindre notre équipe en croissance."}
              </p>
            </div>
          </div>
        </section>

        {/* Why Join Us */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {language === 'en'
                  ? 'Why Join DZ-CarPool?'
                  : 'Pourquoi rejoindre DZ-CarPool ?'}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-[#FF5722]/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-[#FF5722]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'en' ? 'Impact' : 'Impact'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'en'
                    ? 'Make a real difference in how Algerians travel'
                    : 'Faites une vraie différence dans la façon dont les Algériens voyagent'}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-[#FF5722]/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-[#FF5722]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'en' ? 'Growth' : 'Croissance'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'en'
                    ? 'Develop your skills in a fast-paced environment'
                    : 'Développez vos compétences dans un environnement dynamique'}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-[#FF5722]/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-[#FF5722]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'en' ? 'Team' : 'Équipe'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'en'
                    ? 'Work with talented and passionate people'
                    : 'Travaillez avec des personnes talentueuses et passionnées'}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-[#FF5722]/10 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-6 h-6 text-[#FF5722]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'en' ? 'Benefits' : 'Avantages'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'en'
                    ? 'Competitive salary and great work culture'
                    : 'Salaire compétitif et excellente culture de travail'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Job Openings */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {language === 'en' ? 'Open Positions' : 'Postes ouverts'}
              </h2>
              <p className="text-lg text-gray-600">
                {language === 'en'
                  ? 'Explore our current opportunities and find your perfect role'
                  : 'Explorez nos opportunités actuelles et trouvez votre rôle idéal'}
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {jobOpenings.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {language === 'en' ? job.title : job.titleFr}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {language === 'en'
                            ? job.department
                            : job.departmentFr}
                        </span>
                        <span>•</span>
                        <span>
                          {language === 'en' ? job.location : job.locationFr}
                        </span>
                        <span>•</span>
                        <span>{language === 'en' ? job.type : job.typeFr}</span>
                      </div>
                    </div>
                    <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
                      {language === 'en' ? 'Apply' : 'Postuler'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">
                {language === 'en'
                  ? "Don't see a position that fits? We're always looking for talented people."
                  : 'Vous ne voyez pas de poste qui vous convient ? Nous recherchons toujours des personnes talentueuses.'}
              </p>
              <Button
                variant="outline"
                className="border-gray-300 bg-transparent"
              >
                {language === 'en'
                  ? 'Send us your resume'
                  : 'Envoyez-nous votre CV'}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
