'use client';

import { useEffect, useState } from 'react';

type InternalMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientType: string;
  recipientIds: string[];
  departmentTarget?: string;
  subject?: string;
  content: string;
  readBy: string[];
  createdAt: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Department = {
  id: string;
  name: string;
  color?: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    recipientType: 'individual' as 'individual' | 'department',
    recipientIds: [] as string[],
    departmentTarget: '',
    subject: '',
    content: '',
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchDepartments();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

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

  const fetchMessages = async () => {
    if (!currentUser) return;

    try {
      const res = await fetch('/api/internal-messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
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

  const fetchUsers = async () => {
    try {
      const [staffRes, guidesRes] = await Promise.all([
        fetch('/api/staff'),
        fetch('/api/guides'),
      ]);

      const staff = staffRes.ok ? await staffRes.json() : [];
      const guides = guidesRes.ok ? await guidesRes.json() : [];

      const allUsers = [
        ...staff.map((s: any) => ({ id: s.id, name: s.name, email: s.email, role: 'staff' })),
        ...guides.map((g: any) => ({ id: g.id, name: g.name, email: g.email, role: 'guide' })),
      ];

      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;
    if (!formData.content.trim()) {
      alert('Mensagem não pode estar vazia');
      return;
    }

    if (formData.recipientType === 'individual' && formData.recipientIds.length === 0) {
      alert('Selecione pelo menos um destinatário');
      return;
    }

    if (formData.recipientType === 'department' && !formData.departmentTarget) {
      alert('Selecione um departamento');
      return;
    }

    try {
      const res = await fetch('/api/internal-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientType: formData.recipientType,
          recipientIds: formData.recipientIds,
          departmentTarget: formData.departmentTarget || null,
          subject: formData.subject || null,
          content: formData.content,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        resetForm();
        fetchMessages();
      } else {
        const error = await res.json();
        alert(`Erro: ${error.error || 'Falha ao enviar mensagem'}`);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Falha ao enviar mensagem');
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!currentUser) return;

    try {
      await fetch(`/api/internal-messages/${messageId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      fetchMessages();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      recipientType: currentUser?.role === 'guide' ? 'department' : 'individual',
      recipientIds: [],
      departmentTarget: '',
      subject: '',
      content: '',
    });
  };

  const handleRecipientToggle = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      recipientIds: prev.recipientIds.includes(userId)
        ? prev.recipientIds.filter((id) => id !== userId)
        : [...prev.recipientIds, userId],
    }));
  };

  const isMessageRead = (msg: InternalMessage) => {
    return currentUser && msg.readBy.includes(currentUser.id);
  };

  const getDepartmentName = (deptId?: string) => {
    if (!deptId) return 'Departamento';
    const dept = departments.find((d) => d.id === deptId);
    return dept?.name || 'Departamento';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Carregando mensagens...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Chat Interno</h1>
          <p className="text-gray-600 mt-2">Comunicação entre equipe</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#1FB7C4] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1a9aa5] transition-colors"
        >
          ✉️ Nova Mensagem
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Nova Mensagem</h2>
            <form onSubmit={handleSendMessage} className="space-y-4">
              {currentUser?.role !== 'guide' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enviar para
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={formData.recipientType === 'individual'}
                        onChange={() =>
                          setFormData({ ...formData, recipientType: 'individual', departmentTarget: '' })
                        }
                        className="w-4 h-4 text-[#1FB7C4]"
                      />
                      <span className="text-sm">Usuários individuais</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={formData.recipientType === 'department'}
                        onChange={() =>
                          setFormData({ ...formData, recipientType: 'department', recipientIds: [] })
                        }
                        className="w-4 h-4 text-[#1FB7C4]"
                      />
                      <span className="text-sm">Departamento (todos)</span>
                    </label>
                  </div>
                </div>
              )}

              {formData.recipientType === 'department' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento *
                  </label>
                  <select
                    value={formData.departmentTarget}
                    onChange={(e) => setFormData({ ...formData, departmentTarget: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1FB7C4]"
                    required
                  >
                    <option value="">Selecione um departamento</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destinatários *
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {users.length === 0 ? (
                      <p className="text-gray-500 text-sm">Nenhum usuário encontrado</p>
                    ) : (
                      users.map((user) => (
                        <label key={user.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 px-2 rounded">
                          <input
                            type="checkbox"
                            checked={formData.recipientIds.includes(user.id)}
                            onChange={() => handleRecipientToggle(user.id)}
                            className="w-4 h-4 text-[#1FB7C4]"
                          />
                          <span className="text-sm">
                            {user.name} ({user.email})
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1FB7C4]"
                  placeholder="Assunto da mensagem..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1FB7C4]"
                  rows={6}
                  placeholder="Digite sua mensagem..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#1FB7C4] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1a9aa5]"
                >
                  📤 Enviar Mensagem
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-5xl mb-4">💬</div>
          <p className="text-gray-600">Nenhuma mensagem ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => {
            const isRead = isMessageRead(msg);
            const isSender = currentUser?.id === msg.senderId;

            return (
              <div
                key={msg.id}
                className={`bg-white rounded-lg border p-6 hover:shadow-md transition-shadow ${
                  !isRead && !isSender ? 'border-[#1FB7C4] border-2' : 'border-gray-200'
                }`}
                onClick={() => !isRead && !isSender && markAsRead(msg.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1FB7C4] rounded-full flex items-center justify-center text-white font-bold">
                      {msg.senderName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{msg.senderName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(msg.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isRead && !isSender && (
                      <span className="bg-[#1FB7C4] text-white text-xs px-2 py-1 rounded-full font-medium">
                        Nova
                      </span>
                    )}
                    {msg.recipientType === 'department' ? (
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                        📢 {getDepartmentName(msg.departmentTarget)}
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                        👤 Individual
                      </span>
                    )}
                  </div>
                </div>

                {msg.subject && (
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{msg.subject}</h3>
                )}

                <p className="text-gray-700 whitespace-pre-wrap">{msg.content}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
