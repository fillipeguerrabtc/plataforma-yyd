function App() {
  return (
    <div className="min-h-screen bg-gray-100 font-lato">
      <header className="bg-yyd-turquoise text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <img src="/yyd-logo.png" alt="YYD Logo" className="w-16 h-16 rounded-full bg-white p-1" />
          <div>
            <h1 className="text-3xl font-montserrat font-bold">YYD BackOffice</h1>
            <p className="text-sm mt-1">Gestão Completa da Plataforma</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-montserrat font-bold text-xl mb-2">Tours</h3>
            <p className="text-gray-600">Gestão de Passeios</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-montserrat font-bold text-xl mb-2">Guias</h3>
            <p className="text-gray-600">Gestão de Guias</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-montserrat font-bold text-xl mb-2">Frota</h3>
            <p className="text-gray-600">Gestão de Veículos</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-montserrat font-bold text-xl mb-2">Usuários</h3>
            <p className="text-gray-600">Gestão de Funcionários</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-montserrat font-bold text-xl mb-2">Financeiro</h3>
            <p className="text-gray-600">Gestão Financeira</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-montserrat font-bold text-xl mb-2">Integrações</h3>
            <p className="text-gray-600">WhatsApp, Meta, Stripe</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-montserrat font-bold text-xl mb-2">Agenda</h3>
            <p className="text-gray-600">Calendário de Tours</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-montserrat font-bold text-xl mb-2">Reservas</h3>
            <p className="text-gray-600">Gestão de Bookings</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-montserrat font-bold mb-4">Dashboard</h2>
          <p className="text-gray-700">
            Bem-vindo ao BackOffice da YYD Platform - Yes You Deserve!
          </p>
          <p className="text-gray-600 mt-4">
            Sistema completo de gestão com CRUD de Tours, Guias, Frota, Usuários, Financeiro e Integrações.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
