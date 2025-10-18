import Image from 'next/image';
import * as styles from './styles/components.css';
import { TourCard } from './components/TourCard';

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
            src="/yyd-logo.png" 
            alt="YYD Logo" 
            width={80}
            height={80}
            className={styles.headerLogo}
            priority
          />
          <div>
            <h1 className={styles.headerTitle}>YYD - Yes You Deserve</h1>
            <p className={styles.headerSubtitle}>Boutique Tourism Experiences in Portugal 🇵🇹</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <section className={styles.heroSection}>
            <h2 className={styles.heroTitle}>Discover Our Tours</h2>
            <p className={styles.heroSubtitle}>
              Experience the magic of Sintra, Cascais, Lisboa, and Douro with our private electric tuk-tuk tours.
            </p>
          </section>

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
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <p className={styles.footerText}>© 2025 Yes You Deserve - Boutique Tourism Portugal</p>
          <p className={styles.footerCities}>Sintra · Lisboa · Cascais · Douro</p>
        </div>
      </footer>
    </div>
  );
}
