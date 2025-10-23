'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  bookingNumber: string;
  date: string;
  startTime: string;
  numberOfPeople: number;
  pickupLocation: string;
  priceEur: number;
  status: string;
  product: {
    title: string;
    imageUrls: string[];
  };
  payments: Array<{
    status: string;
  }>;
}

export default function CustomerPortal() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const token = localStorage.getItem('customer-token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function downloadVoucher(bookingId: string) {
    try {
      const token = localStorage.getItem('customer-token');
      const response = await fetch(`/api/bookings/${bookingId}/voucher`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to download voucher');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `YYD-Voucher-${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Error downloading voucher: ' + err.message);
    }
  }

  function logout() {
    localStorage.removeItem('customer-token');
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37C8C4] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#37C8C4] to-[#23C0E3] text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Pacifico, cursive' }}>
              Yes, you deserve.
            </h1>
            <button
              onClick={logout}
              className="px-4 py-2 bg-white text-[#37C8C4] rounded-lg hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">My Bookings</h2>
          <p className="text-gray-600">Manage your YYD tour bookings</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">Start exploring our amazing tours!</p>
            <button
              onClick={() => router.push('/tours')}
              className="px-6 py-3 bg-[#37C8C4] text-white rounded-lg hover:bg-[#2eb3af] transition"
            >
              Browse Tours
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => {
              const isPaid = booking.payments.some((p) => p.status === 'succeeded');
              const statusColors = {
                confirmed: 'bg-green-100 text-green-800',
                pending: 'bg-yellow-100 text-yellow-800',
                cancelled: 'bg-red-100 text-red-800',
                completed: 'bg-blue-100 text-blue-800',
              };

              return (
                <div key={booking.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                  {booking.product.imageUrls?.[0] && (
                    <img
                      src={booking.product.imageUrls[0]}
                      alt={booking.product.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        {booking.product.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${statusColors[booking.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <span className="font-semibold mr-2">📅</span>
                        {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold mr-2">👥</span>
                        {booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'person' : 'people'}
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold mr-2">📍</span>
                        {booking.pickupLocation}
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold mr-2">💰</span>
                        R${booking.priceEur}
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold mr-2">🎫</span>
                        {booking.bookingNumber}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isPaid && (
                        <button
                          onClick={() => downloadVoucher(booking.id)}
                          className="flex-1 px-4 py-2 bg-[#E9C46A] text-gray-900 rounded hover:bg-[#ddb860] transition font-semibold"
                        >
                          Download Voucher
                        </button>
                      )}
                      {!isPaid && booking.status === 'pending' && (
                        <button className="flex-1 px-4 py-2 bg-[#37C8C4] text-white rounded hover:bg-[#2eb3af] transition font-semibold">
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
