import Image from 'next/image';
import * as styles from './styles/components.css';

interface Tour {
  id: number;
  title_en: string;
  description_en: string;
  city: string;
  base_price_eur: number;
  duration_minutes: number;
}

async function getTours(): Promise<Tour[]> {
  try {
    const backendUrl = 'http://localhost:8000';
    
    const res = await fetch(`${backendUrl}/api/v1/tours/`, {
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
              {tours.map((tour) => (
                <div key={tour.id} className={styles.tourCard}>
                  <div className={styles.tourCardContent}>
                    <h3 className={styles.tourTitle}>{tour.title_en}</h3>
                    <p className={styles.tourCity}>{tour.city}</p>
                    <p className={styles.tourDescription}>
                      {tour.description_en?.substring(0, 150)}...
                    </p>
                    <div className={styles.tourDetails}>
                      <span className={styles.tourPrice}>€{tour.base_price_eur}</span>
                      <span className={styles.tourDuration}>{tour.duration_minutes} min</span>
                    </div>
                    <button className={styles.bookButton}>Book Now</button>
                  </div>
                </div>
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
