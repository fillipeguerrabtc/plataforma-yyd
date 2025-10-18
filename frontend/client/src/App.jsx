import { useState, useEffect } from 'react'

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
    <div className="min-h-screen bg-white font-lato">
      <header className="bg-yyd-turquoise text-white py-6 shadow-lg">
        <div className="container mx-auto px-4 flex items-center gap-6">
          <img src="/yyd-logo.png" alt="YYD Logo" className="w-20 h-20 rounded-full bg-white p-1" />
          <div>
            <h1 className="text-4xl font-montserrat font-bold">YYD - Yes You Deserve</h1>
            <p className="text-xl mt-2">Boutique Tourism Experiences in Portugal 🇵🇹</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="mb-12">
          <h2 className="text-3xl font-montserrat font-bold text-yyd-black mb-4">
            Discover Our Tours
          </h2>
          <p className="text-gray-700 text-lg mb-8">
            Experience the magic of Sintra, Cascais, Lisboa, and Douro with our private electric tuk-tuk tours.
          </p>
        </section>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-600">Loading tours...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.length > 0 ? (
              tours.map(tour => (
                <div key={tour.id} className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-yyd-gold hover:shadow-2xl transition-shadow">
                  <div className="p-6">
                    <h3 className="text-2xl font-montserrat font-bold text-yyd-black mb-2">
                      {tour.title_en || 'Tour'}
                    </h3>
                    <p className="text-gray-600 mb-4">{tour.city}</p>
                    <p className="text-gray-700 mb-4">{tour.description_en?.substring(0, 150)}...</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-yyd-turquoise">
                        €{tour.base_price_eur}
                      </span>
                      <span className="text-gray-600">{tour.duration_minutes} min</span>
                    </div>
                    <button className="mt-4 w-full bg-yyd-gold hover:bg-yyd-turquoise text-white font-bold py-3 px-6 rounded-lg transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-xl text-gray-600">No tours available yet.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-yyd-black text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg">© 2025 Yes You Deserve - Boutique Tourism Portugal</p>
          <p className="text-sm mt-2 text-gray-400">Sintra · Lisboa · Cascais · Douro</p>
        </div>
      </footer>
    </div>
  )
}

export default App
