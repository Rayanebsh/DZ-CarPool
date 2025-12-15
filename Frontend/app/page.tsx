import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { WhyDZCarPool } from "@/components/why-dz-carpool"
import { HowItWorks } from "@/components/how-it-works"
import { CTASection } from "@/components/cta-section"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
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
    </div>
  )
}
