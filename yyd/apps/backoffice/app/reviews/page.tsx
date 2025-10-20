'use client';

import { useEffect, useState } from 'react';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: Date;
  booking: {
    product: {
      titlePt: string;
    };
  } | null;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  async function fetchReviews() {
    try {
      const url = `/api/reviews?status=${filter}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error('Reviews fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateReviewStatus(reviewId: string, newStatus: string) {
    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update review');
      
      // Refresh reviews
      fetchReviews();
    } catch (err) {
      console.error('Update review error:', err);
      alert('Erro ao atualizar avaliação');
    }
  }

  function renderStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-[#FFD700]' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⭐ Avaliações</h1>
          <p className="text-gray-600 mt-1">Moderar e gerenciar feedback dos clientes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex gap-3">
          {['pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-[#37C8C4] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'pending' && 'Pendentes'}
              {status === 'approved' && 'Aprovadas'}
              {status === 'rejected' && 'Rejeitadas'}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37C8C4] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando avaliações...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhuma avaliação {filter}
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{review.customerName}</h3>
                    <div className="flex">{renderStars(review.rating)}</div>
                  </div>
                  {review.booking?.product && (
                    <p className="text-sm text-gray-600">
                      Tour: {review.booking.product.titlePt}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    review.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : review.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {review.status}
                </span>
              </div>

              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.comment}</p>

              {review.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => updateReviewStatus(review.id, 'approved')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    ✓ Aprovar
                  </button>
                  <button
                    onClick={() => updateReviewStatus(review.id, 'rejected')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    ✕ Rejeitar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
