'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuroraChatWidget from '@/components/AuroraChatWidget';

interface Booking {
  id: string;
  bookingNumber: string;
  date: string;
  startTime: string;
  numberOfPeople: number;
  status: string;
  priceEur: number;
  addonsTotal: number;
  product: {
    nameEn: string;
    namePt: string;
    tourType: string;
    durationHours: number;
    imageUrl?: string;
  };
  guide?: {
    name: string;
    phone: string;
  };
  addons: Array<{
    quantity: number;
    priceEur: number;
    addon: {
      nameEn: string;
      namePt: string;
      category: string;
    };
  }>;
  payments: Array<{
    status: string;
    amountEur: number;
    method: string;
    paidAt?: string;
  }>;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [past, setPast] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem('customerToken');
    const customerData = localStorage.getItem('customer');

    if (!token || !customerData) {
      router.push('/login');
      return;
    }

    setCustomer(JSON.parse(customerData));
    fetchBookings(token);
  }, [router]);

  const fetchBookings = async (token: string) => {
    try {
      const response = await fetch('/api/customer/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('customerToken');
          localStorage.removeItem('customer');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setUpcoming(data.upcoming || []);
      setPast(data.past || []);
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customer');
    router.push('/');
  };

  const downloadVoucher = (bookingNumber: string) => {
    const token = localStorage.getItem('customerToken');
    window.open(`/api/bookings/voucher/${bookingNumber}?token=${token}`, '_blank');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isPaid = (payments: Booking['payments']) => {
    return payments.some(p => p.status === 'succeeded');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando suas reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black">YYD</h1>
                <p className="text-sm text-gray-600 mt-1">Yes You Deserve</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Bem-vindo,</p>
                  <p className="font-semibold text-black">{customer?.name}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-1">Próximos Tours</p>
              <p className="text-3xl font-bold text-black">{upcoming.length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-1">Tours Realizados</p>
              <p className="text-3xl font-bold text-black">{past.length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-1">Total Investido</p>
              <p className="text-3xl font-bold text-black">
                €{(upcoming.reduce((sum, b) => sum + b.priceEur + b.addonsTotal, 0) +
                    past.reduce((sum, b) => sum + b.priceEur + b.addonsTotal, 0)).toFixed(0)}
              </p>
            </div>
          </div>

          {/* Upcoming Bookings */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6">Próximos Tours</h2>
            {upcoming.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-gray-600 mb-4">Você ainda não tem tours agendados</p>
                <a
                  href="/tours"
                  className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
                >
                  Explorar Tours
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-black mb-1">
                          {booking.product.namePt}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Reserva #{booking.bookingNumber}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Data</p>
                        <p className="font-semibold text-black">{formatDate(booking.date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Horário</p>
                        <p className="font-semibold text-black">{booking.startTime}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Pessoas</p>
                        <p className="font-semibold text-black">{booking.numberOfPeople}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="font-semibold text-black">
                          €{(booking.priceEur + booking.addonsTotal).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {booking.addons.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-600 mb-2">Add-ons:</p>
                        <div className="flex flex-wrap gap-2">
                          {booking.addons.map((addon, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs"
                            >
                              {addon.addon.namePt} x{addon.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {isPaid(booking.payments) && booking.status === 'confirmed' && (
                        <button
                          onClick={() => downloadVoucher(booking.bookingNumber)}
                          className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                        >
                          📥 Baixar Voucher
                        </button>
                      )}
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Past Bookings */}
          {past.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-black mb-6">Histórico de Tours</h2>
              <div className="space-y-4">
                {past.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-black mb-1">
                          {booking.product.namePt}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(booking.date)} • {booking.numberOfPeople} pessoas • €{(booking.priceEur + booking.addonsTotal).toFixed(2)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Aurora Chat Widget - Always visible */}
      <AuroraChatWidget />
    </>
  );
}
