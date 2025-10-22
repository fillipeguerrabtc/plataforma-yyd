'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PermissionsManager from '@/components/PermissionsManager';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';

type Staff = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  departmentId?: string;
  hireDate: string;
  salary?: number;
  salaryCurrency: string;
  contractType: string;
  status: string;
  photoUrl?: string;
  bio?: string;
  role: string;
  userTypes?: string[];
  canAccessModules: string[];
  accessLevel: string;
  notes?: string;
};

type Department = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  active: boolean;
};

export default function StaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '@yyd.tours',
    phone: '',
    position: '',
    departmentId: '',
    hireDate: '',
    salary: 0,
    salaryCurrency: 'EUR',
    contractType: 'full-time',
    status: 'active',
    photoUrl: '',
    bio: '',
    role: 'support',
    userTypes: ['staff'] as string[],
    canAccessModules: [] as string[],
    accessLevel: 'read',
    notes: '',
    password: '',
    confirmPassword: '',
    stripeConnectedAccountId: '',
  });

  useEffect(() => {
    fetchStaff();
    fetchDepartments();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.filter((d: Department) => d.active));
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleEdit = (member: Staff) => {
    setEditingId(member.id);
    setShowAddForm(true);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      position: member.position,
      departmentId: member.departmentId || '',
      hireDate: member.hireDate.split('T')[0],
      salary: member.salary || 0,
      salaryCurrency: member.salaryCurrency,
      contractType: member.contractType,
      status: member.status,
      photoUrl: member.photoUrl || '',
      bio: member.bio || '',
      role: member.role,
      userTypes: member.userTypes || ['staff'],
      canAccessModules: member.canAccessModules,
      accessLevel: member.accessLevel,
      notes: member.notes || '',
      password: '',
      confirmPassword: '',
      stripeConnectedAccountId: (member as any).stripeConnectedAccountId || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password match only if password is being changed
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    // Password required only for new staff members
    if (!editingId && !formData.password) {
      alert('Senha é obrigatória para novo funcionário');
      return;
    }
    
    const payload: any = {
      ...formData,
      salary: formData.salary ? Number(formData.salary) : null,
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    delete payload.confirmPassword;

    try {
      const url = editingId ? `/api/staff/${editingId}` : '/api/staff';
      const method = editingId ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddForm(false);
        resetForm();
        fetchStaff();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed to save staff member'}`);
      }
    } catch (error) {
      console.error('Failed to save staff:', error);
      alert('Failed to save staff member');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) return;

    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchStaff();
      }
    } catch (error) {
      console.error('Failed to delete staff:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '@yyd.tours',
      phone: '',
      position: '',
      departmentId: '',
      hireDate: '',
      salary: 0,
      salaryCurrency: 'EUR',
      contractType: 'full-time',
      status: 'active',
      photoUrl: '',
      bio: '',
      role: 'support',
      canAccessModules: [],
      accessLevel: 'read',
      notes: '',
      password: '',
      confirmPassword: '',
      userTypes: ['staff'],
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const toggleModule = (module: string) => {
    setFormData({
      ...formData,
      canAccessModules: formData.canAccessModules.includes(module)
        ? formData.canAccessModules.filter((m) => m !== module)
        : [...formData.canAccessModules, module],
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>👤 Gestão de Funcionários</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          {showAddForm ? 'Cancelar' : '+ Adicionar Funcionário'}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            {editingId ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Nome *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Telefone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                Senha {!editingId && '*'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                placeholder={editingId ? 'Deixe em branco para manter a senha atual' : ''}
                required={!editingId}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                Confirmar Senha {!editingId && '*'}
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                placeholder={editingId ? 'Deixe em branco para manter a senha atual' : ''}
                required={!editingId}
              />
              {editingId && (
                <small style={{ display: 'block', marginTop: '0.25rem', color: '#6b7280', fontSize: '0.875rem' }}>
                  💡 Deixe ambos os campos de senha em branco para não alterar a senha atual
                </small>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Cargo *</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Departamento *</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              >
                <option value="">Selecione</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Data de Contratação *</label>
              <input
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Salário (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Tipo de Contrato *</label>
              <select
                value={formData.contractType}
                onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              >
                <option value="full-time">Tempo Integral</option>
                <option value="part-time">Meio Período</option>
                <option value="contractor">Contratante</option>
                <option value="intern">Estagiário</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              >
                <option value="active">Ativo</option>
                <option value="on-leave">De Férias</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Função no Sistema *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              >
                <option value="support">Suporte</option>
                <option value="guide">Guia</option>
                <option value="finance">Financeiro</option>
                <option value="director">Diretor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Nível de Acesso *</label>
              <select
                value={formData.accessLevel}
                onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              >
                <option value="read">Somente Leitura</option>
                <option value="write">Leitura e Escrita</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Tipos de Usuário * (modificável apenas por administradores)
            </label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {['staff', 'guide', 'vendor', 'client'].map((type) => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.userTypes?.includes(type) || false}
                    onChange={(e) => {
                      const currentTypes = formData.userTypes || [];
                      if (e.target.checked) {
                        setFormData({ ...formData, userTypes: [...currentTypes, type] });
                      } else {
                        setFormData({ ...formData, userTypes: currentTypes.filter(t => t !== type) });
                      }
                    }}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{type === 'staff' ? 'Funcionário' : type === 'guide' ? 'Guia' : type === 'vendor' ? 'Fornecedor' : 'Cliente'}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <ProfilePhotoUpload
              currentPhoto={formData.photoUrl}
              onPhotoChange={(photoUrl) => setFormData({ ...formData, photoUrl })}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Biografia</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', minHeight: '80px' }}
              placeholder="Breve descrição sobre o funcionário..."
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', minHeight: '80px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="submit"
              style={{
                padding: '0.5rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              {editingId ? 'Atualizar' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={() => { setShowAddForm(false); resetForm(); }}
              style={{
                padding: '0.5rem 1.5rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {editingId && showAddForm && (
        <PermissionsManager 
          userId={editingId}
          mode="user"
          onSave={() => {
            fetchStaff();
          }}
        />
      )}

      {loading ? (
        <p>Carregando...</p>
      ) : staff.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>Nenhum funcionário encontrado</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '0.5rem' }}>
            <thead style={{ background: '#f3f4f6' }}>
              <tr>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Nome</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Cargo</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Departamento</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Função</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Acesso</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem', fontWeight: '500' }}>{member.name}</td>
                  <td style={{ padding: '0.75rem' }}>{member.email}</td>
                  <td style={{ padding: '0.75rem' }}>{member.position}</td>
                  <td style={{ padding: '0.75rem' }}>{member.department}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: '#dbeafe',
                      color: '#1e40af',
                    }}>
                      {member.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{member.accessLevel === 'read' ? 'Leitura' : 'Leitura/Escrita'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: member.status === 'active' ? '#d1fae5' : '#fef3c7',
                      color: member.status === 'active' ? '#065f46' : '#92400e',
                    }}>
                      {member.status === 'active' ? 'Ativo' : member.status === 'on-leave' ? 'Férias' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(member)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
