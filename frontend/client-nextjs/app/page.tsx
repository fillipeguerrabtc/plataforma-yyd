import Image from 'next/image';
import * as styles from './styles/components.css';
import { TourCard } from './components/TourCard';
import { WhatsAppButton } from './components/WhatsAppButton';
import { HeroSection } from './components/HeroSection';
import { NoCrowdsSection } from './components/NoCrowdsSection';
import { AwardsSection } from './components/AwardsSection';
import { FeaturesSection } from './components/FeaturesSection';
import { StatsCounter } from './components/StatsCounter';
import { ContactSection } from './components/ContactSection';
import { ComparisonTable } from './components/ComparisonTable';
import { TestimonialsSection } from './components/TestimonialsSection';
import { WhyChooseSection } from './components/WhyChooseSection';
import { LeadCaptureForm } from './components/LeadCaptureForm';

interface Tour {
  id: string;
  title_en: string;
  description_en: string;
  city: string;
  base_price_eur: string | number;
  duration_minutes: number;
}

async function getTours(): Promise<Tour[]> {
  try {
    const backendUrl = process.env.BACKEND_URL || 
                       (typeof window === 'undefined' ? 'http://localhost:8000' : '');
    
    const url = backendUrl 
      ? `${backendUrl}/api/v1/tours/`
      : '/api/backend/v1/tours/';
    
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('Failed to fetch tours:', res.status, res.statusText);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching tours:', error);
    return [];
  }
}

export default async function Home() {
  const tours = await getTours();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerContent}`}>
          <Image 
            src="/yyd-logo-real.png" 
            alt="Yes You Deserve Logo" 
            width={80}
            height={80}
            className={styles.headerLogo}
            priority
          />
          <div>
            <h1 className={styles.headerTitle}>Yes, You Deserve!</h1>
            <p className={styles.headerSubtitle}>Private Tuk Tuk Tours in Sintra & Cascais</p>
          </div>
        </div>
      </header>

      <HeroSection />
      <NoCrowdsSection />
      <AwardsSection />
      <FeaturesSection />
      <StatsCounter />

      <section id="tours" className={styles.toursSection}>
        <div className={styles.container}>
          <div className={styles.toursSectionHeader}>
            <h2 className={styles.toursSectionTitle}>
              Choose Your Perfect Tuk Tuk Tour
            </h2>
            <p className={styles.toursSectionSubtitle}>
              Whether you want to explore majestic palaces or ride along dramatic coastal roads, 
              our tuk tuk tours offer the perfect match — from half-day highlights to full-day adventures. 
              Choose what inspires you most.
            </p>
          </div>

          {tours.length === 0 ? (
            <div className={styles.loading}>
              <p className={styles.loadingText}>Loading amazing tours...</p>
            </div>
          ) : (
            <div className={styles.toursGrid}>
              {tours.map((tour, index) => (
                <TourCard key={tour.id} tour={tour} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ComparisonTable />
      <TestimonialsSection />
      <WhyChooseSection />
      <LeadCaptureForm />
      <ContactSection />

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <Image 
                src="/yyd-logo-real.png" 
                alt="Yes You Deserve Logo" 
                width={60}
                height={60}
                className={styles.footerLogo}
              />
              <p className={styles.footerTagline}>
                Private Tuk Tuk Tours in Sintra & Cascais
              </p>
            </div>
            <div className={styles.footerLinks}>
              <a href="#tours" className={styles.footerLink}>Tours</a>
              <a href="#contact" className={styles.footerLink}>Contact</a>
              <a href="/privacy" className={styles.footerLink}>Privacy Policy</a>
            </div>
            <div className={styles.footerSocial}>
              <a 
                href="https://www.facebook.com/Yesyoudeserve/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                📘 Facebook
              </a>
              <a 
                href="https://www.instagram.com/yesyoudeservetours/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                📷 Instagram
              </a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.footerCopyright}>
              © 2025 Yes You Deserve - All rights reserved
            </p>
            <p className={styles.footerCities}>Sintra · Lisboa · Cascais · Douro</p>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
