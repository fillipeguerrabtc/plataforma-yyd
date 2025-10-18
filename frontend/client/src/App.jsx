import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const backendUrl = window.location.hostname.includes('replit.dev') 
      ? window.location.protocol + '//' + window.location.hostname.replace(/^5000-/, '8000-')
      : 'http://localhost:8000'
    
    fetch(`${backendUrl}/api/v1/tours/`)
      .then(res => res.json())
      .then(data => {
        setTours(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching tours:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="app">
      <header className="header">
        <div className="container header-content">
          <img src="/yyd-logo.png" alt="YYD Logo" className="header-logo" />
          <div className="header-text">
            <h1>YYD - Yes You Deserve</h1>
            <p>Boutique Tourism Experiences in Portugal 🇵🇹</p>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <section className="hero-section">
            <h2>Discover Our Tours</h2>
            <p>
              Experience the magic of Sintra, Cascais, Lisboa, and Douro with our private electric tuk-tuk tours.
            </p>
          </section>

          {loading ? (
            <div className="loading">
              <p>Loading tours...</p>
            </div>
          ) : (
            <div className="tours-grid">
              {tours.length > 0 ? (
                tours.map(tour => (
                  <div key={tour.id} className="tour-card">
                    <div className="tour-card-content">
                      <h3>{tour.title_en || 'Tour'}</h3>
                      <p className="tour-city">{tour.city}</p>
                      <p className="tour-description">
                        {tour.description_en?.substring(0, 150)}...
                      </p>
                      <div className="tour-details">
                        <span className="tour-price">€{tour.base_price_eur}</span>
                        <span className="tour-duration">{tour.duration_minutes} min</span>
                      </div>
                      <button className="book-button">Book Now</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-tours">
                  <p>No tours available yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <p>© 2025 Yes You Deserve - Boutique Tourism Portugal</p>
          <p className="footer-cities">Sintra · Lisboa · Cascais · Douro</p>
        </div>
      </footer>
    </div>
  )
}

export default App
