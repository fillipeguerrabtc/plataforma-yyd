'use client';

import { useEffect, useState } from 'react';

interface Permission {
  id: string;
  resource: string;
  action: string;
  labelPt: string;
  labelEn: string;
  labelEs: string;
  category: string;
  sortOrder: number;
}

interface PermissionState {
  canRead: boolean;
  canWrite: boolean;
  source: 'user' | 'department' | 'both';
}

interface PermissionsManagerProps {
  userId?: string;
  departmentId?: string;
  mode: 'user' | 'department';
  onSave?: () => void;
}

export default function PermissionsManager({ userId, departmentId, mode, onSave }: PermissionsManagerProps) {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [effectivePermissions, setEffectivePermissions] = useState<Map<string, PermissionState>>(new Map());
  const [departmentPermissions, setDepartmentPermissions] = useState<Map<string, PermissionState>>(new Map());
  const [userOverrides, setUserOverrides] = useState<Map<string, PermissionState>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [actualUserId, setActualUserId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Todas as Categorias' },
    { id: 'super_admin', label: 'Super Admin' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'products', label: 'Produtos' },
    { id: 'bookings', label: 'Reservas' },
    { id: 'crm', label: 'CRM' },
    { id: 'people', label: 'Pessoas' },
    { id: 'admin', label: 'Administração' },
    { id: 'finance', label: 'Financeiro' },
    { id: 'aurora', label: 'Aurora IA' },
    { id: 'communication', label: 'Comunicação' },
    { id: 'reports', label: 'Relatórios' },
  ];

  useEffect(() => {
    fetchPermissions();
  }, [userId, departmentId, mode]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);

      const permissionsRes = await fetch('/api/permissions');
      const permissionsData = await permissionsRes.json();
      setAllPermissions(permissionsData.permissions || []);

      if (mode === 'user' && userId) {
        const staffRes = await fetch(`/api/staff/${userId}`);
        const staffData = await staffRes.json();

        // Buscar o User correspondente pelo email do Staff
        const userRes = await fetch(`/api/user-by-email?email=${encodeURIComponent(staffData.email)}`);
        const userData = await userRes.json();
        
        if (!userData.user) {
          console.error('❌ User not found for staff:', staffData.email);
          return;
        }

        const realUserId = userData.user.id;
        setActualUserId(realUserId);

        const userPermsRes = await fetch(`/api/user-permissions?userId=${realUserId}`);
        const userPermsData = await userPermsRes.json();

        const deptPermsMap = new Map<string, PermissionState>();
        if (staffData.departmentId) {
          const deptPermsRes = await fetch(`/api/department-permissions?departmentId=${staffData.departmentId}`);
          const deptPermsData = await deptPermsRes.json();
          
          (deptPermsData.permissions || []).forEach((p: any) => {
            deptPermsMap.set(p.permissionId, {
              canRead: p.canRead,
              canWrite: p.canWrite,
              source: 'department',
            });
          });
        }
        setDepartmentPermissions(deptPermsMap);

        const userPermsMap = new Map<string, PermissionState>();
        (userPermsData.permissions || []).forEach((p: any) => {
          userPermsMap.set(p.permissionId, {
            canRead: p.canRead,
            canWrite: p.canWrite,
            source: 'user',
          });
        });
        setUserOverrides(userPermsMap);

        const effectiveMap = new Map<string, PermissionState>();
        
        deptPermsMap.forEach((value, key) => {
          effectiveMap.set(key, value);
        });

        userPermsMap.forEach((value, key) => {
          const deptPerm = deptPermsMap.get(key);
          if (deptPerm) {
            effectiveMap.set(key, {
              canRead: value.canRead || deptPerm.canRead,
              canWrite: value.canWrite || deptPerm.canWrite,
              source: 'both',
            });
          } else {
            effectiveMap.set(key, value);
          }
        });

        setEffectivePermissions(effectiveMap);

      } else if (mode === 'department' && departmentId) {
        const deptPermsRes = await fetch(`/api/department-permissions?departmentId=${departmentId}`);
        const deptPermsData = await deptPermsRes.json();
        
        const permsMap = new Map<string, PermissionState>();
        (deptPermsData.permissions || []).forEach((p: any) => {
          permsMap.set(p.permissionId, {
            canRead: p.canRead,
            canWrite: p.canWrite,
            source: 'department',
          });
        });
        setEffectivePermissions(permsMap);
        setUserOverrides(permsMap);
        setDepartmentPermissions(permsMap);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionId: string, type: 'read' | 'write') => {
    const deptPerm = departmentPermissions.get(permissionId);
    const currentOverride = userOverrides.get(permissionId);
    
    let newState: PermissionState;
    
    if (currentOverride) {
      newState = { ...currentOverride };
    } else {
      newState = {
        canRead: deptPerm?.canRead || false,
        canWrite: deptPerm?.canWrite || false,
        source: 'user',
      };
    }

    if (type === 'read') {
      newState.canRead = !newState.canRead;
      if (!newState.canRead) {
        newState.canWrite = false;
      }
    } else if (type === 'write') {
      newState.canWrite = !newState.canWrite;
      if (newState.canWrite) {
        newState.canRead = true;
      }
    }

    const newOverrides = new Map(userOverrides);
    if (newState.canRead || newState.canWrite) {
      newOverrides.set(permissionId, newState);
    } else {
      newOverrides.delete(permissionId);
    }
    setUserOverrides(newOverrides);

    const newEffective = new Map(effectivePermissions);
    if (deptPerm) {
      const combined = {
        canRead: newState.canRead || deptPerm.canRead,
        canWrite: newState.canWrite || deptPerm.canWrite,
        source: (newState.canRead || newState.canWrite) ? 'both' : 'department',
      } as PermissionState;
      newEffective.set(permissionId, combined);
    } else {
      if (newState.canRead || newState.canWrite) {
        newEffective.set(permissionId, { ...newState, source: 'user' });
      } else {
        newEffective.delete(permissionId);
      }
    }
    setEffectivePermissions(newEffective);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const permissions = Array.from(userOverrides.entries()).map(([id, perm]) => ({
        permissionId: id,
        canRead: perm.canRead,
        canWrite: perm.canWrite,
      }));

      if (mode === 'user' && actualUserId) {
        await fetch('/api/user-permissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: actualUserId, permissions }),
        });
      } else if (mode === 'department' && departmentId) {
        await fetch('/api/department-permissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ departmentId, permissions }),
        });
      }

      alert('Permissões salvas com sucesso!');
      if (onSave) onSave();
    } catch (error) {
      console.error('Failed to save permissions:', error);
      alert('Erro ao salvar permissões');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = (category: string) => {
    const newOverrides = new Map(userOverrides);
    const categoryPerms = allPermissions.filter(p => category === 'all' || p.category === category);
    
    categoryPerms.forEach(perm => {
      const newState: PermissionState = {
        canRead: true,
        canWrite: true,
        source: 'user',
      };
      newOverrides.set(perm.id, newState);
    });
    
    setUserOverrides(newOverrides);
    
    const newEffective = new Map(effectivePermissions);
    categoryPerms.forEach(perm => {
      const deptPerm = departmentPermissions.get(perm.id);
      newEffective.set(perm.id, {
        canRead: true,
        canWrite: true,
        source: deptPerm ? 'both' : 'user',
      });
    });
    setEffectivePermissions(newEffective);
  };

  const handleDeselectAll = (category: string) => {
    const categoryPerms = allPermissions.filter(p => category === 'all' || p.category === category);
    
    const newOverrides = new Map(userOverrides);
    categoryPerms.forEach(perm => {
      newOverrides.delete(perm.id);
    });
    setUserOverrides(newOverrides);

    const newEffective = new Map(effectivePermissions);
    categoryPerms.forEach(perm => {
      const deptPerm = departmentPermissions.get(perm.id);
      if (deptPerm) {
        newEffective.set(perm.id, deptPerm);
      } else {
        newEffective.delete(perm.id);
      }
    });
    setEffectivePermissions(newEffective);
  };

  const filteredPermissions = allPermissions
    .filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch = searchTerm === '' || 
        p.labelPt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.action.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const groupedPermissions = filteredPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Carregando permissões...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#f9fafb', 
      padding: '1.5rem', 
      borderRadius: '0.5rem', 
      border: '1px solid #e5e7eb',
      marginTop: '1rem',
    }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
        🔐 Permissões Granulares ({allPermissions.length} disponíveis)
      </h3>
      
      {mode === 'user' && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '0.75rem', 
          background: '#e0f2fe', 
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
        }}>
          <strong>Legenda:</strong>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span>🟢 <strong>Verde</strong> = Permissão do usuário (override)</span>
            <span>🟣 <strong>Roxo</strong> = Usuário + Departamento (combinado)</span>
            <span>🔵 <strong>Azul</strong> = Apenas departamento (herdada)</span>
            <span>⚪ <strong>Branco</strong> = Sem permissão</span>
          </div>
          <div style={{ marginTop: '0.5rem', color: '#0369a1', fontWeight: '500' }}>
            💡 Permissões herdadas do departamento (azul) são read-only. Para remover, edite o departamento.
          </div>
          <div style={{ marginTop: '0.25rem', color: '#7c3aed', fontSize: '0.875rem' }}>
            ℹ️ Você pode adicionar overrides do usuário (verde/roxo) para AMPLIAR acesso, mas não para REDUZIR permissões do departamento.
          </div>
        </div>
      )}

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <input
            type="text"
            placeholder="🔍 Buscar permissão..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.375rem' 
            }}
          />
        </div>
        
        <div style={{ flex: '1', minWidth: '200px' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.375rem' 
            }}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ 
        marginBottom: '1rem', 
        display: 'flex', 
        gap: '0.5rem', 
        padding: '0.75rem', 
        background: '#e0f2fe', 
        borderRadius: '0.375rem',
        border: '1px solid #0ea5e9',
      }}>
        <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>Ações rápidas:</span>
        <button
          type="button"
          onClick={() => handleSelectAll(selectedCategory)}
          style={{
            padding: '0.25rem 0.75rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Selecionar Tudo
        </button>
        <button
          type="button"
          onClick={() => handleDeselectAll(selectedCategory)}
          style={{
            padding: '0.25rem 0.75rem',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Desmarcar Tudo (apenas overrides)
        </button>
      </div>

      <div style={{ 
        maxHeight: '500px', 
        overflowY: 'auto', 
        border: '1px solid #e5e7eb', 
        borderRadius: '0.375rem', 
        background: 'white',
      }}>
        {Object.entries(groupedPermissions).map(([category, perms]) => (
          <div key={category} style={{ borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ 
              background: '#f3f4f6', 
              padding: '0.75rem 1rem', 
              fontWeight: '600', 
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              color: '#374151',
            }}>
              {categories.find(c => c.id === category)?.label || category}
            </div>
            
            {perms.map(perm => {
              const effective = effectivePermissions.get(perm.id);
              const override = userOverrides.get(perm.id);
              const deptPerm = departmentPermissions.get(perm.id);
              
              const hasUserOverride = override !== undefined;
              const hasBoth = effective?.source === 'both';
              const hasDepartmentOnly = !hasUserOverride && deptPerm !== undefined;
              
              let bgColor = 'white';
              let badgeColor = '';
              let badgeText = '';
              
              if (hasBoth) {
                bgColor = '#f3e8ff';
                badgeColor = '#9333ea';
                badgeText = 'Usuário + Departamento';
              } else if (hasUserOverride) {
                bgColor = '#f0fdf4';
                badgeColor = '#10b981';
                badgeText = 'Usuário';
              } else if (hasDepartmentOnly) {
                bgColor = '#eff6ff';
                badgeColor = '#3b82f6';
                badgeText = 'Departamento';
              }
              
              return (
                <div 
                  key={perm.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.75rem 1rem', 
                    borderBottom: '1px solid #f3f4f6',
                    background: bgColor,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {perm.labelPt}
                      {badgeText && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          background: badgeColor, 
                          color: 'white', 
                          padding: '0.125rem 0.5rem', 
                          borderRadius: '0.25rem' 
                        }}>
                          {badgeText}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {perm.resource}.{perm.action}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem', 
                      cursor: hasDepartmentOnly && mode === 'user' ? 'not-allowed' : 'pointer',
                      opacity: hasDepartmentOnly && mode === 'user' ? 0.6 : 1,
                    }}>
                      <input
                        type="checkbox"
                        checked={effective?.canRead || false}
                        onChange={() => togglePermission(perm.id, 'read')}
                        disabled={hasDepartmentOnly && mode === 'user'}
                        style={{ 
                          width: '16px', 
                          height: '16px', 
                          cursor: hasDepartmentOnly && mode === 'user' ? 'not-allowed' : 'pointer' 
                        }}
                      />
                      <span style={{ fontSize: '0.875rem' }}>Leitura</span>
                    </label>
                    
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem', 
                      cursor: hasDepartmentOnly && mode === 'user' ? 'not-allowed' : 'pointer',
                      opacity: hasDepartmentOnly && mode === 'user' ? 0.6 : 1,
                    }}>
                      <input
                        type="checkbox"
                        checked={effective?.canWrite || false}
                        onChange={() => togglePermission(perm.id, 'write')}
                        disabled={hasDepartmentOnly && mode === 'user'}
                        style={{ 
                          width: '16px', 
                          height: '16px', 
                          cursor: hasDepartmentOnly && mode === 'user' ? 'not-allowed' : 'pointer' 
                        }}
                      />
                      <span style={{ fontSize: '0.875rem' }}>Escritura</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '1rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1rem',
        background: '#fef3c7',
        borderRadius: '0.375rem',
        border: '1px solid #f59e0b',
      }}>
        <div>
          <strong>{userOverrides.size}</strong> permissões configuradas diretamente
          {mode === 'user' && (
            <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: '#6b7280' }}>
              <strong>{departmentPermissions.size}</strong> permissões herdadas do departamento
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '0.75rem 2rem',
            background: saving ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Salvando...' : '💾 Salvar Permissões'}
        </button>
      </div>
    </div>
  );
}
