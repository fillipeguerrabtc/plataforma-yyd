'use client';

import { useEffect, useState } from 'react';

type Department = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  active: boolean;
  createdAt: string;
  _count?: {
    staff: number;
    guides: number;
  };
};

const colorOptions = [
  { value: '#1FB7C4', label: 'Turquesa', hex: '#1FB7C4' },
  { value: '#7E3231', label: 'Bordô', hex: '#7E3231' },
  { value: '#E9C46A', label: 'Dourado', hex: '#E9C46A' },
  { value: '#2563eb', label: 'Azul', hex: '#2563eb' },
  { value: '#dc2626', label: 'Vermelho', hex: '#dc2626' },
  { value: '#16a34a', label: 'Verde', hex: '#16a34a' },
  { value: '#9333ea', label: 'Roxo', hex: '#9333ea' },
  { value: '#ea580c', label: 'Laranja', hex: '#ea580c' },
];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#1FB7C4',
    active: true,
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingId(dept.id);
    setShowForm(true);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      color: dept.color || '#1FB7C4',
      active: dept.active,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      const url = editingId ? `/api/departments/${editingId}` : '/api/departments';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowForm(false);
        resetForm();
        fetchDepartments();
      } else {
        const error = await res.json();
        alert(`Erro: ${error.error || 'Falha ao salvar departamento'}`);
      }
    } catch (error) {
      console.error('Failed to save department:', error);
      alert('Falha ao salvar departamento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este departamento?')) return;

    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchDepartments();
      }
    } catch (error) {
      console.error('Failed to delete department:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#1FB7C4',
      active: true,
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Carregando departamentos...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Departamentos</h1>
          <p className="text-gray-600 mt-2">
            Organize funcionários e guias por departamento
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#1FB7C4] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1a9aa5] transition-colors"
        >
          + Novo Departamento
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Editar Departamento' : 'Novo Departamento'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1FB7C4] focus:border-transparent"
                  placeholder="ex: Atendimento, Operações, Financeiro"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1FB7C4] focus:border-transparent"
                  rows={3}
                  placeholder="Breve descrição do departamento..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: option.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.color === option.value
                          ? 'border-gray-800 scale-105'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: option.hex }}
                      title={option.label}
                    >
                      {formData.color === option.value && (
                        <span className="text-white text-lg">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-[#1FB7C4] border-gray-300 rounded focus:ring-[#1FB7C4]"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Departamento ativo
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#1FB7C4] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1a9aa5] transition-colors"
                >
                  {editingId ? 'Salvar Alterações' : 'Criar Departamento'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {departments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-5xl mb-4">🏛️</div>
          <p className="text-gray-600">Nenhum departamento cadastrado.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-[#1FB7C4] font-medium hover:underline"
          >
            Criar primeiro departamento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl"
                    style={{ backgroundColor: dept.color || '#1FB7C4' }}
                  >
                    🏛️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{dept.name}</h3>
                    <p className="text-xs text-gray-500">
                      {dept._count?.staff || 0} funcionários, {dept._count?.guides || 0} guias
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    dept.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {dept.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {dept.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{dept.description}</p>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(dept)}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDelete(dept.id)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  disabled={!dept.active}
                >
                  🗑️ Desativar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
