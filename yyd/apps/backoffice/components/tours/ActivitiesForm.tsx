'use client';

import { useState } from 'react';
import { ProductActivity } from '@prisma/client';

interface ActivitiesFormProps {
  productId: string;
  existingActivities?: ProductActivity[];
  onSave: (activities: ActivityInput[]) => Promise<void>;
}

export interface ActivityInput {
  nameEn: string;
  namePt: string;
  nameEs: string;
  descriptionEn: string;
  descriptionPt: string;
  descriptionEs: string;
  imageUrl: string | null;
  sortOrder: number;
  active: boolean;
}

export default function ActivitiesForm({
  productId,
  existingActivities = [],
  onSave,
}: ActivitiesFormProps) {
  const [activities, setActivities] = useState<ActivityInput[]>(
    existingActivities.length > 0
      ? existingActivities.map((a, idx) => ({
          nameEn: a.nameEn,
          namePt: a.namePt,
          nameEs: a.nameEs,
          descriptionEn: a.descriptionEn,
          descriptionPt: a.descriptionPt,
          descriptionEs: a.descriptionEs,
          imageUrl: a.imageUrl,
          sortOrder: a.sortOrder || idx,
          active: a.active,
        }))
      : []
  );

  const [isSaving, setIsSaving] = useState(false);

  const addActivity = () => {
    setActivities([
      ...activities,
      {
        nameEn: '',
        namePt: '',
        nameEs: '',
        descriptionEn: '',
        descriptionPt: '',
        descriptionEs: '',
        imageUrl: null,
        sortOrder: activities.length,
        active: true,
      },
    ]);
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const updateActivity = (
    index: number,
    field: keyof ActivityInput,
    value: any
  ) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [field]: value };
    setActivities(updated);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...activities];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updated.forEach((a, i) => (a.sortOrder = i));
    setActivities(updated);
  };

  const moveDown = (index: number) => {
    if (index === activities.length - 1) return;
    const updated = [...activities];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updated.forEach((a, i) => (a.sortOrder = i));
    setActivities(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(activities);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Atividades / Destaques
        </h3>
        <button
          onClick={addActivity}
          className="px-4 py-2 bg-[#23C0E3] text-white rounded-lg hover:bg-[#1da5c4] transition"
        >
          + Adicionar Atividade
        </button>
      </div>

      <div className="space-y-6">
        {activities.map((activity, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">Atividade #{index + 1}</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="px-2 py-1 text-sm border rounded disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === activities.length - 1}
                  className="px-2 py-1 text-sm border rounded disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeActivity(index)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Remover
                </button>
              </div>
            </div>

            {/* Títulos */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome (EN) *
                </label>
                <input
                  type="text"
                  value={activity.nameEn}
                  onChange={(e) =>
                    updateActivity(index, 'nameEn', e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Pena Palace Visit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome (PT) *
                </label>
                <input
                  type="text"
                  value={activity.namePt}
                  onChange={(e) =>
                    updateActivity(index, 'namePt', e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="ex: Visita Palácio da Pena"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome (ES) *
                </label>
                <input
                  type="text"
                  value={activity.nameEs}
                  onChange={(e) =>
                    updateActivity(index, 'nameEs', e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="ej: Visita Palacio de Pena"
                />
              </div>
            </div>

            {/* Descrições */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (EN)
                </label>
                <textarea
                  value={activity.descriptionEn}
                  onChange={(e) =>
                    updateActivity(index, 'descriptionEn', e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (PT)
                </label>
                <textarea
                  value={activity.descriptionPt}
                  onChange={(e) =>
                    updateActivity(index, 'descriptionPt', e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Descrição opcional..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (ES)
                </label>
                <textarea
                  value={activity.descriptionEs}
                  onChange={(e) =>
                    updateActivity(index, 'descriptionEs', e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Descripción opcional..."
                />
              </div>
            </div>

            {/* Image URL e Active */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL da Imagem (opcional)
                </label>
                <input
                  type="text"
                  value={activity.imageUrl || ''}
                  onChange={(e) =>
                    updateActivity(index, 'imageUrl', e.target.value || null)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="/uploads/tours/..."
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={activity.active}
                    onChange={(e) =>
                      updateActivity(index, 'active', e.target.checked)
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Ativo</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Nenhuma atividade configurada. Clique em "+ Adicionar Atividade" para
          começar.
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-[#23C0E3] text-white rounded-lg hover:bg-[#1da5c4] transition disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : 'Salvar Atividades'}
        </button>
      </div>
    </div>
  );
}
