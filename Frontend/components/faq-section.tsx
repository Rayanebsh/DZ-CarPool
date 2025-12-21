'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useLanguage } from '@/contexts/language-context';

export function FAQSection() {
  const { t } = useLanguage();

  const faqs = [
    {
      question: t('paymentQuestion'),
      answer:
        'Payments are handled securely through our platform. Passengers pay when booking, and drivers receive their share after the trip is completed. We use encrypted payment processing to ensure your financial information is safe.',
    },
    {
      question: t('verificationQuestion'),
      answer:
        'All users must verify their identity by providing a valid ID and phone number. Drivers must also verify their vehicle registration and insurance. This helps maintain a trusted and safe community.',
    },
    {
      question: t('cancellationQuestion'),
      answer:
        'Passengers can cancel up to 24 hours before departure for a full refund. Cancellations within 24 hours are subject to a cancellation fee. Drivers who cancel may face account restrictions to maintain reliability.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('faqTitle')}
            </h2>
            <p className="text-lg text-muted-foreground">{t('faqSubtitle')}</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-muted/50 rounded-lg border border-border px-6"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
