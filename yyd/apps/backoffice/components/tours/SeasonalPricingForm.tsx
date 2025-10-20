'use client';

import { useState } from 'react';
import { ProductSeasonPrice } from '@prisma/client';

interface SeasonalPricingFormProps {
  productId: string;
  existingPrices?: ProductSeasonPrice[];
  onSave: (prices: SeasonalPriceInput[]) => Promise<void>;
}

export interface SeasonalPriceInput {
  season: string;
  startMonth: number;
  endMonth: number;
  tier: string;
  minPeople: number;
  maxPeople: number | null;
  priceEur: number;
  pricePerPerson: boolean;
}

const SEASONS = [
  { value: 'low', label: 'Baixa Temporada' },
  { value: 'high', label: 'Alta Temporada' },
  { value: 'peak', label: 'Super Alta' },
  { value: 'special', label: 'Especial' },
];

const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

const TIERS = [
  { value: 'private', label: 'Privado (1-6 pessoas)' },
  { value: 'small_group', label: 'Grupo Pequeno (7-15)' },
  { value: 'large_group', label: 'Grupo Grande (16+)' },
];

export default function SeasonalPricingForm({
  productId,
  existingPrices = [],
  onSave,
}: SeasonalPricingFormProps) {
  const [prices, setPrices] = useState<SeasonalPriceInput[]>(
    existingPrices.length > 0
      ? existingPrices.map((p) => ({
          season: p.season,
          startMonth: p.startMonth,
          endMonth: p.endMonth,
          tier: p.tier,
          minPeople: p.minPeople,
          maxPeople: p.maxPeople,
          priceEur: parseFloat(p.priceEur.toString()),
          pricePerPerson: p.pricePerPerson,
        }))
      : []
  );

  const [isSaving, setIsSaving] = useState(false);

  const addPrice = () => {
    setPrices([
      ...prices,
      {
        season: 'high',
        startMonth: 1,
        endMonth: 12,
        tier: 'private',
        minPeople: 1,
        maxPeople: 6,
        priceEur: 0,
        pricePerPerson: false,
      },
    ]);
  };

  const removePrice = (index: number) => {
    setPrices(prices.filter((_, i) => i !== index));
  };

  const updatePrice = (index: number, field: keyof SeasonalPriceInput, value: any) => {
    const updated = [...prices];
    updated[index] = { ...updated[index], [field]: value };
    setPrices(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(prices);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Preços Sazonais</h3>
        <button
          onClick={addPrice}
          className="px-4 py-2 bg-[#23C0E3] text-white rounded-lg hover:bg-[#1da5c4] transition"
        >
          + Adicionar Preço
        </button>
      </div>

      <div className="space-y-4">
        {prices.map((price, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temporada
                </label>
                <select
                  value={price.season}
                  onChange={(e) => updatePrice(index, 'season', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {SEASONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mês Início
                </label>
                <select
                  value={price.startMonth}
                  onChange={(e) =>
                    updatePrice(index, 'startMonth', parseInt(e.target.value))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mês Fim
                </label>
                <select
                  value={price.endMonth}
                  onChange={(e) =>
                    updatePrice(index, 'endMonth', parseInt(e.target.value))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={price.tier}
                  onChange={(e) => updatePrice(index, 'tier', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {TIERS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mín. Pessoas
                </label>
                <input
                  type="number"
                  min="1"
                  value={price.minPeople}
                  onChange={(e) =>
                    updatePrice(index, 'minPeople', parseInt(e.target.value))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máx. Pessoas
                </label>
                <input
                  type="number"
                  min="1"
                  value={price.maxPeople || ''}
                  onChange={(e) =>
                    updatePrice(
                      index,
                      'maxPeople',
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ilimitado"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price.priceEur}
                  onChange={(e) =>
                    updatePrice(index, 'priceEur', parseFloat(e.target.value))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={price.pricePerPerson}
                    onChange={(e) =>
                      updatePrice(index, 'pricePerPerson', e.target.checked)
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Por pessoa</span>
                </label>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => removePrice(index)}
                  className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {prices.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Nenhum preço sazonal configurado. Clique em "+ Adicionar Preço" para começar.
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-[#23C0E3] text-white rounded-lg hover:bg-[#1da5c4] transition disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : 'Salvar Preços'}
        </button>
      </div>
    </div>
  );
}
