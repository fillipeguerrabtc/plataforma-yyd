'use client';

import { useState, useEffect } from 'react';

type LedgerEntry = {
  id: string;
  accountId: string;
  transactionId: string;
  transactionType: string;
  description?: string;
  debit: number;
  credit: number;
  currency: string;
  metadata?: any;
  createdAt: string;
  account: {
    code: string;
    name: string;
    type: string;
  };
};

type Account = {
  id: string;
  code: string;
  name: string;
};

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountFilter, setAccountFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [limit, setLimit] = useState<number>(100);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    loadEntries();
  }, [accountFilter, limit]);

  const loadAccounts = async () => {
    try {
      const res = await fetch('/api/financial/accounts');
      const data = await res.json();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const loadEntries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (accountFilter) params.append('accountId', accountFilter);
      params.append('limit', limit.toString());

      const res = await fetch(`/api/financial/ledger?${params.toString()}`);
      const data = await res.json();
      setEntries(data);
    } catch (error) {
      console.error('Failed to load ledger entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = typeFilter
    ? entries.filter((e) => e.transactionType === typeFilter)
    : entries;

  const totalDebit = filteredEntries.reduce((sum, e) => sum + Number(e.debit), 0);
  const totalCredit = filteredEntries.reduce((sum, e) => sum + Number(e.credit), 0);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>General Ledger</h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          View all ledger entries (double-entry bookkeeping)
        </p>
      </div>

      <div
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0 }}>
          ℹ️ Ledger entries are created automatically by transactions (bookings, payroll, etc). Manual editing is disabled to maintain accounting integrity.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1.5rem',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Entries</p>
          <p style={{ fontSize: '2rem', fontWeight: '700' }}>{filteredEntries.length}</p>
        </div>
        <div
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1.5rem',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Debit</p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>
            EUR {totalDebit.toFixed(2)}
          </p>
        </div>
        <div
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1.5rem',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Credit</p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626' }}>
            EUR {totalCredit.toFixed(2)}
          </p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              flex: '1 1 200px',
            }}
          >
            <option value="">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.code} - {acc.name}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              flex: '1 1 150px',
            }}
          >
            <option value="">All Types</option>
            <option value="booking">Booking</option>
            <option value="payroll">Payroll</option>
            <option value="payment">Payment</option>
            <option value="adjustment">Adjustment</option>
          </select>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              flex: '1 1 100px',
            }}
          >
            <option value={50}>50 entries</option>
            <option value={100}>100 entries</option>
            <option value={250}>250 entries</option>
            <option value={500}>500 entries</option>
          </select>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Loading...</p>
        ) : filteredEntries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No ledger entries found</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Account</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600' }}>Debit</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600' }}>Credit</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem', color: '#6b7280', fontSize: '0.75rem' }}>
                      {new Date(entry.createdAt).toLocaleDateString()}
                      <br />
                      {new Date(entry.createdAt).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#6b7280' }}>
                        {entry.account.code}
                      </div>
                      <div style={{ fontSize: '0.875rem' }}>{entry.account.name}</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#f3f4f6',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          textTransform: 'capitalize',
                        }}
                      >
                        {entry.transactionType}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#6b7280', maxWidth: '200px' }}>
                      {entry.description || '-'}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        textAlign: 'right',
                        fontFamily: 'monospace',
                        color: Number(entry.debit) > 0 ? '#059669' : '#d1d5db',
                        fontWeight: Number(entry.debit) > 0 ? '600' : '400',
                      }}
                    >
                      {Number(entry.debit) > 0 ? `${entry.currency} ${Number(entry.debit).toFixed(2)}` : '-'}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        textAlign: 'right',
                        fontFamily: 'monospace',
                        color: Number(entry.credit) > 0 ? '#dc2626' : '#d1d5db',
                        fontWeight: Number(entry.credit) > 0 ? '600' : '400',
                      }}
                    >
                      {Number(entry.credit) > 0 ? `${entry.currency} ${Number(entry.credit).toFixed(2)}` : '-'}
                    </td>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#6b7280' }}>
                      {entry.transactionId.substring(0, 8)}...
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #e5e7eb', fontWeight: '700' }}>
                  <td colSpan={4} style={{ padding: '0.75rem', textAlign: 'right' }}>
                    Totals:
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace', color: '#059669' }}>
                    EUR {totalDebit.toFixed(2)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace', color: '#dc2626' }}>
                    EUR {totalCredit.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
