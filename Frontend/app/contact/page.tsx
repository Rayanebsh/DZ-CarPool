'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[v0] Contact form submitted:', formData);
    // TODO: Send form data to backend
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-[#FF5722]/5 to-transparent">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {language === 'en' ? 'Get in Touch' : 'Contactez-nous'}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {language === 'en'
                  ? "Have questions or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible."
                  : 'Vous avez des questions ou des commentaires ? Nous serions ravis de vous entendre. Envoyez-nous un message et nous vous répondrons dès que possible.'}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#FF5722]/10 flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-[#FF5722]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {language === 'en' ? 'Email' : 'Email'}
                  </h3>
                  <p className="text-gray-600">contact@dz-carpool.dz</p>
                </div>

                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#FF5722]/10 flex items-center justify-center mb-4">
                    <Phone className="w-6 h-6 text-[#FF5722]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {language === 'en' ? 'Phone' : 'Téléphone'}
                  </h3>
                  <p className="text-gray-600">+213 XX XX XX XX XX</p>
                </div>

                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#FF5722]/10 flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-[#FF5722]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {language === 'en' ? 'Address' : 'Adresse'}
                  </h3>
                  <p className="text-gray-600">Algiers, Algeria</p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-700"
                      >
                        {language === 'en' ? 'Name' : 'Nom'}
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="mt-1.5 h-11 bg-white border-gray-300"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
                      >
                        {language === 'en' ? 'Email' : 'Email'}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        className="mt-1.5 h-11 bg-white border-gray-300"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="subject"
                        className="text-sm font-medium text-gray-700"
                      >
                        {language === 'en' ? 'Subject' : 'Sujet'}
                      </Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        required
                        className="mt-1.5 h-11 bg-white border-gray-300"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="message"
                        className="text-sm font-medium text-gray-700"
                      >
                        {language === 'en' ? 'Message' : 'Message'}
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        required
                        rows={6}
                        className="mt-1.5 bg-white border-gray-300 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium"
                    >
                      {language === 'en'
                        ? 'Send Message'
                        : 'Envoyer le message'}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
