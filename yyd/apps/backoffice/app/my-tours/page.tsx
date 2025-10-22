'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Booking = {
  id: string;
  bookingNumber: string;
  date: string;
  startTime: string;
  numberOfPeople: number;
  status: string;
  guideApprovalStatus: string | null;
  guideApprovedAt: string | null;
  guideObservations: string | null;
  product: {
    titlePt: string;
    titleEn: string;
    titleEs: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  pickupLocation: string | null;
  dropoffLocation: string | null;
  specialRequests: string | null;
  createdAt: string;
};

export default function MyToursPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [observations, setObservations] = useState('');
  const [transferGuideId, setTransferGuideId] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, guidesRes] = await Promise.all([
        fetch('/api/guide/my-tours'),
        fetch('/api/guide/list-guides'),
      ]);

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data);
      }

      if (guidesRes.ok) {
        const guidesData = await guidesRes.json();
        setGuides(guidesData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveBooking = async (bookingId: string) => {
    if (!confirm('Confirmar aceitação deste tour?')) return;

    setProcessing(bookingId);
    try {
      const res = await fetch('/api/guide/approve-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          action: 'approve',
          observations,
        }),
      });

      if (res.ok) {
        alert('Tour aprovado com sucesso!');
        setSelectedBooking(null);
        setObservations('');
        loadData();
      } else {
        const error = await res.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      alert('Erro ao aprovar tour');
    } finally {
      setProcessing(null);
    }
  };

  const rejectBooking = async (bookingId: string) => {
    const reason = prompt('Por que está recusando este tour?');
    if (!reason) return;

    setProcessing(bookingId);
    try {
      const res = await fetch('/api/guide/approve-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          action: 'reject',
          observations: reason,
        }),
      });

      if (res.ok) {
        alert('Tour recusado');
        loadData();
      } else {
        const error = await res.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      alert('Erro ao recusar tour');
    } finally {
      setProcessing(null);
    }
  };

  const transferBooking = async (bookingId: string) => {
    if (!transferGuideId) {
      alert('Selecione um guia para transferir');
      return;
    }

    if (!confirm('Confirmar transferência deste tour?')) return;

    setProcessing(bookingId);
    try {
      const res = await fetch('/api/guide/transfer-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          newGuideId: transferGuideId,
          observations,
        }),
      });

      if (res.ok) {
        alert('Tour transferido com sucesso!');
        setSelectedBooking(null);
        setObservations('');
        setTransferGuideId('');
        loadData();
      } else {
        const error = await res.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      alert('Erro ao transferir tour');
    } finally {
      setProcessing(null);
    }
  };

  const pendingBookings = bookings.filter(b => b.guideApprovalStatus === 'pending');
  const approvedBookings = bookings.filter(b => b.guideApprovalStatus === 'approved');
  const rejectedBookings = bookings.filter(b => b.guideApprovalStatus === 'rejected');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🚗 Meus Tours
        </h1>
        <p className="text-gray-600">
          Gerencie os tours atribuídos a você
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : (
        <div className="space-y-8">
          {/* Pending Approvals */}
          {pendingBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-yellow-800 mb-4">
                ⏳ Aguardando Sua Aprovação ({pendingBookings.length})
              </h2>
              <div className="space-y-4">
                {pendingBookings.map(booking => {
                  const deadline = new Date(booking.createdAt);
                  deadline.setHours(deadline.getHours() + 1);
                  const isUrgent = new Date() > deadline;

                  return (
                    <div
                      key={booking.id}
                      className={`bg-white rounded-lg border-2 p-6 ${
                        isUrgent ? 'border-red-500' : 'border-yellow-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {booking.product.titlePt}
                          </h3>
                          <p className="text-sm text-gray-600">
                            #{booking.bookingNumber} - {new Date(booking.date).toLocaleDateString()} às {booking.startTime}
                          </p>
                          {isUrgent && (
                            <p className="text-sm text-red-600 font-semibold mt-2">
                              ⚠️ ATENÇÃO: Prazo de aprovação expirado! Sistema pode aprovar automaticamente.
                            </p>
                          )}
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                          Pendente
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500">Cliente:</span>
                          <p className="font-medium">{booking.customer.name}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Pessoas:</span>
                          <p className="font-medium">{booking.numberOfPeople}</p>
                        </div>
                        {booking.pickupLocation && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Pickup:</span>
                            <p className="font-medium">{booking.pickupLocation}</p>
                          </div>
                        )}
                        {booking.specialRequests && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Pedidos Especiais:</span>
                            <p className="font-medium text-gray-700">{booking.specialRequests}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => approveBooking(booking.id)}
                          disabled={processing === booking.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          ✅ Aprovar
                        </button>
                        <button
                          onClick={() => rejectBooking(booking.id)}
                          disabled={processing === booking.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          ❌ Recusar
                        </button>
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          🔄 Transferir
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Approved Tours */}
          {approvedBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-green-800 mb-4">
                ✅ Tours Aprovados ({approvedBookings.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedBookings.map(booking => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-lg border border-green-200 p-4"
                  >
                    <h3 className="font-bold text-gray-900 mb-2">
                      {booking.product.titlePt}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(booking.date).toLocaleDateString()} às {booking.startTime}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Cliente:</span> {booking.customer.name}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Pessoas:</span> {booking.numberOfPeople}
                    </p>
                    {booking.guideObservations && (
                      <p className="text-sm mt-2 p-2 bg-gray-50 rounded">
                        💭 {booking.guideObservations}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transfer Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Transferir Tour</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transferir para:
              </label>
              <select
                value={transferGuideId}
                onChange={(e) => setTransferGuideId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Selecione um guia</option>
                {guides.map(guide => (
                  <option key={guide.id} value={guide.id}>
                    {guide.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações:
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
                placeholder="Por que está transferindo este tour?"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => transferBooking(selectedBooking.id)}
                disabled={!transferGuideId || processing === selectedBooking.id}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Confirmar Transferência
              </button>
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setObservations('');
                  setTransferGuideId('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
