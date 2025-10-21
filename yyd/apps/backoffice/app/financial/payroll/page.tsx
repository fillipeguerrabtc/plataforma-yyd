'use client';

import { useEffect, useState } from 'react';

type Payroll = {
  id: string;
  employeeId?: string;
  guideId?: string;
  vendorName?: string;
  payrollType: string;
  period: string;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  currency: string;
  status: string;
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
  guide?: { name: string; email: string };
};

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    employeeId: '',
    guideId: '',
    vendorName: '',
    payrollType: 'employee',
    period: '',
    periodStart: '',
    periodEnd: '',
    grossAmount: 0,
    deductions: 0,
    currency: 'EUR',
    paymentMethod: '',
    notes: '',
  });

  useEffect(() => {
    fetchPayrolls();
    fetchStaff();
    fetchGuides();
    fetchVendors();
  }, [statusFilter, typeFilter]);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  const fetchGuides = async () => {
    try {
      const res = await fetch('/api/guides');
      if (res.ok) {
        const data = await res.json();
        setGuides(data);
      }
    } catch (error) {
      console.error('Failed to fetch guides:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/vendors');
      if (res.ok) {
        const data = await res.json();
        setVendors(data);
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    }
  };

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('payrollType', typeFilter);
      
      const res = await fetch(`/api/financial/payroll?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPayrolls(data);
      }
    } catch (error) {
      console.error('Failed to fetch payrolls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (payroll: Payroll) => {
    setEditingId(payroll.id);
    setShowAddForm(true);
    setFormData({
      employeeId: payroll.employeeId || '',
      guideId: payroll.guideId || '',
      vendorName: payroll.vendorName || '',
      payrollType: payroll.payrollType,
      period: payroll.period,
      periodStart: payroll.periodStart.split('T')[0],
      periodEnd: payroll.periodEnd.split('T')[0],
      grossAmount: payroll.grossAmount,
      deductions: payroll.deductions,
      currency: payroll.currency || 'EUR',
      paymentMethod: payroll.paymentMethod || '',
      notes: payroll.notes || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      grossAmount: Number(formData.grossAmount),
      deductions: Number(formData.deductions),
    };

    try {
      const url = editingId ? `/api/financial/payroll/${editingId}` : '/api/financial/payroll';
      const method = editingId ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddForm(false);
        resetForm();
        fetchPayrolls();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed to save payroll'}`);
      }
    } catch (error) {
      console.error('Failed to save payroll:', error);
      alert('Failed to save payroll');
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      const res = await fetch(`/api/financial/payroll/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          paidAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        fetchPayrolls();
      }
    } catch (error) {
      console.error('Failed to update payroll:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payroll entry?')) return;

    try {
      const res = await fetch(`/api/financial/payroll/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchPayrolls();
      }
    } catch (error) {
      console.error('Failed to delete payroll:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      guideId: '',
      vendorName: '',
      payrollType: 'employee',
      period: '',
      periodStart: '',
      periodEnd: '',
      grossAmount: 0,
      deductions: 0,
      currency: 'EUR',
      paymentMethod: '',
      notes: '',
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>💵 Folha de Pagamento</h1>
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
          {showAddForm ? 'Cancel' : '+ Add Payroll'}
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div>
          <label style={{ marginRight: '0.5rem', fontWeight: '500' }}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label style={{ marginRight: '0.5rem', fontWeight: '500' }}>Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
          >
            <option value="all">All</option>
            <option value="employee">Employee</option>
            <option value="guide">Guide</option>
            <option value="vendor">Vendor</option>
          </select>
        </div>
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
            {editingId ? 'Edit Payroll' : 'Add New Payroll'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Type *</label>
              <select
                value={formData.payrollType}
                onChange={(e) => setFormData({ ...formData, payrollType: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              >
                <option value="employee">Employee</option>
                <option value="guide">Guide</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>

            {formData.payrollType === 'employee' && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Funcionário *</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  required
                >
                  <option value="">Selecione um funcionário</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.position}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.payrollType === 'guide' && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Guia *</label>
                <select
                  value={formData.guideId}
                  onChange={(e) => setFormData({ ...formData, guideId: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  required
                >
                  <option value="">Selecione um guia</option>
                  {guides.map((guide) => (
                    <option key={guide.id} value={guide.id}>
                      {guide.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.payrollType === 'vendor' && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Fornecedor *</label>
                <select
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  required
                >
                  <option value="">Selecione um fornecedor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.name}>
                      {vendor.name} {vendor.companyName ? `- ${vendor.companyName}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Period *</label>
              <input
                type="text"
                placeholder="e.g. 2025-01"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Period Start *</label>
              <input
                type="date"
                value={formData.periodStart}
                onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Period End *</label>
              <input
                type="date"
                value={formData.periodEnd}
                onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Gross Amount (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.grossAmount}
                onChange={(e) => setFormData({ ...formData, grossAmount: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Deductions (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Currency *</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Payment Method</label>
              <input
                type="text"
                placeholder="e.g. Bank Transfer"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', minHeight: '80px' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
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
              {editingId ? 'Update Payroll' : 'Create Payroll'}
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
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : payrolls.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>No payroll entries found</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '0.5rem' }}>
            <thead style={{ background: '#f3f4f6' }}>
              <tr>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Type</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Name/ID</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Period</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Gross</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Deductions</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Net</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((payroll) => (
                <tr key={payroll.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: payroll.payrollType === 'employee' ? '#dbeafe' : payroll.payrollType === 'guide' ? '#d1fae5' : '#fef3c7',
                      color: payroll.payrollType === 'employee' ? '#1e40af' : payroll.payrollType === 'guide' ? '#065f46' : '#92400e',
                    }}>
                      {payroll.payrollType}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {payroll.guide?.name || payroll.vendorName || payroll.employeeId || payroll.guideId || '-'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>{payroll.period}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>€{payroll.grossAmount.toFixed(2)}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>€{payroll.deductions.toFixed(2)}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>€{payroll.netAmount.toFixed(2)}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: payroll.status === 'paid' ? '#d1fae5' : payroll.status === 'approved' ? '#dbeafe' : '#fef3c7',
                      color: payroll.status === 'paid' ? '#065f46' : payroll.status === 'approved' ? '#1e40af' : '#92400e',
                    }}>
                      {payroll.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleEdit(payroll)}
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
                        Edit
                      </button>
                      {payroll.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkAsPaid(payroll.id)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(payroll.id)}
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
                        Delete
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
