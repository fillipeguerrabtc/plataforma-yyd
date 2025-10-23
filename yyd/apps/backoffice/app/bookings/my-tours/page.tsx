'use client';

import { useEffect, useState } from 'react';

type Booking = {
  id: string;
  bookingNumber: string;
  date: string;
  startTime: string;
  numberOfPeople: number;
  priceEur: number;
  status: string;
  guideApprovalStatus?: string;
  guideObservations?: string;
  product: {
    titlePt: string;
    titleEn: string;
  };
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
};

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export default function MyToursPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [observations, setObservations] = useState('');

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchBookings();
    }
  }, [currentUser, filter]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchBookings = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?guideId=${currentUser.id}`);
      if (res.ok) {
        let data = await res.json();
        
        if (filter !== 'all') {
          data = data.filter((b: Booking) => {
            if (filter === 'pending') return !b.guideApprovalStatus || b.guideApprovalStatus === 'pending';
            return b.guideApprovalStatus === filter;
          });
        }

        setBookings(data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (bookingId: string, status: 'approved' | 'rejected') => {
    if (!currentUser) return;

    if (status === 'rejected' && !observations.trim()) {
      alert('Por favor, adicione observações ao rejeitar um tour.');
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${bookingId}/guide-approval`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          observations: observations || null,
        }),
      });

      if (res.ok) {
        alert(status === 'approved' ? 'Tour aprovado!' : 'Tour rejeitado.');
        setSelectedBooking(null);
        setObservations('');
        fetchBookings();
      } else {
        const error = await res.json();
        alert(`Erro: ${error.error || 'Falha ao processar aprovação'}`);
      }
    } catch (error) {
      console.error('Failed to update approval:', error);
      alert('Falha ao processar aprovação');
    }
  };

  const handleUpdateObservations = async (bookingId: string) => {
    if (!currentUser) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}/observations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          observations: observations || null,
        }),
      });

      if (res.ok) {
        alert('Observações atualizadas!');
        setSelectedBooking(null);
        setObservations('');
        fetchBookings();
      } else {
        const error = await res.json();
        alert(`Erro: ${error.error || 'Falha ao atualizar observações'}`);
      }
    } catch (error) {
      console.error('Failed to update observations:', error);
      alert('Falha ao atualizar observações');
    }
  };

  const openApprovalModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setObservations(booking.guideObservations || '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Carregando seus tours...</div>
      </div>
    );
  }

  if (currentUser?.role !== 'guide') {
    return (
      <div className="p-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
          Esta página é apenas para guias.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Meus Tours</h1>
        <p className="text-gray-600 mt-2">Aprove tours e adicione observações</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-[#1FB7C4] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ⏳ Pendentes
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'approved'
              ? 'bg-[#1FB7C4] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ✅ Aprovados
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'rejected'
              ? 'bg-[#1FB7C4] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ❌ Rejeitados
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[#1FB7C4] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📋 Todos
        </button>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {selectedBooking.product.titlePt}
            </h2>
            <div className="space-y-3 mb-6">
              <p><strong>Cliente:</strong> {selectedBooking.customer.name}</p>
              <p><strong>Data:</strong> {new Date(selectedBooking.date).toLocaleDateString('pt-BR')} às {selectedBooking.startTime}</p>
              <p><strong>Pessoas:</strong> {selectedBooking.numberOfPeople}</p>
              <p><strong>Valor:</strong> R${parseFloat(selectedBooking.priceEur.toString()).toFixed(2)}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1FB7C4]"
                rows={4}
                placeholder="Adicione observações sobre este tour..."
              />
            </div>

            <div className="flex gap-3">
              {(!selectedBooking.guideApprovalStatus || selectedBooking.guideApprovalStatus === 'pending') && (
                <>
                  <button
                    onClick={() => handleApproval(selectedBooking.id, 'approved')}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600"
                  >
                    ✅ Aprovar
                  </button>
                  <button
                    onClick={() => handleApproval(selectedBooking.id, 'rejected')}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600"
                  >
                    ❌ Rejeitar
                  </button>
                </>
              )}
              {selectedBooking.guideApprovalStatus && selectedBooking.guideApprovalStatus !== 'pending' && (
                <button
                  onClick={() => handleUpdateObservations(selectedBooking.id)}
                  className="flex-1 bg-[#1FB7C4] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1a9aa5]"
                >
                  💾 Salvar Observações
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setObservations('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-5xl mb-4">🗺️</div>
          <p className="text-gray-600">Nenhum tour encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => {
            const isPending = !booking.guideApprovalStatus || booking.guideApprovalStatus === 'pending';
            const isApproved = booking.guideApprovalStatus === 'approved';
            const isRejected = booking.guideApprovalStatus === 'rejected';

            return (
              <div
                key={booking.id}
                className={`bg-white rounded-lg border-2 p-6 hover:shadow-lg transition-shadow ${
                  isPending
                    ? 'border-yellow-400'
                    : isApproved
                    ? 'border-green-400'
                    : 'border-red-400'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {booking.product.titlePt}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      isPending
                        ? 'bg-yellow-100 text-yellow-800'
                        : isApproved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isPending ? '⏳ Pendente' : isApproved ? '✅ Aprovado' : '❌ Rejeitado'}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>
                    <strong>Data:</strong>{' '}
                    {new Date(booking.date).toLocaleDateString('pt-BR')} às {booking.startTime}
                  </p>
                  <p>
                    <strong>Cliente:</strong> {booking.customer.name}
                  </p>
                  <p>
                    <strong>Pessoas:</strong> {booking.numberOfPeople}
                  </p>
                  <p>
                    <strong>Valor:</strong> R${parseFloat(booking.priceEur.toString()).toFixed(2)}
                  </p>
                </div>

                {booking.guideObservations && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-1">Observações:</p>
                    <p className="text-sm text-gray-600">{booking.guideObservations}</p>
                  </div>
                )}

                <button
                  onClick={() => openApprovalModal(booking)}
                  className="w-full bg-[#1FB7C4] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1a9aa5] transition-colors"
                >
                  {isPending ? '📝 Aprovar/Rejeitar' : '✏️ Editar Observações'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
