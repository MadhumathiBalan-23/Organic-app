import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Key, LogOut, Eye, Circle, FileText } from 'lucide-react';
import { UserLog, fetchUserLogsFromDB } from '../data/mockData';

const typeChip = (type: string) => {
  const map: Record<string, string> = {
    create: 'chip-success', update: 'chip-info', delete: 'chip-danger',
    login: 'chip-purple', logout: 'chip-default', view: 'chip-warning',
  };
  return map[type] ?? 'chip-default';
};

const renderTypeIcon = (type: string, size = 13) => {
  switch (type) {
    case 'create': return <Plus size={size} color="var(--color-success)" />;
    case 'update': return <Edit2 size={size} color="var(--color-info)" />;
    case 'delete': return <Trash2 size={size} color="var(--color-danger)" />;
    case 'login': return <Key size={size} color="#a855f7" />;
    case 'logout': return <LogOut size={size} color="var(--text-muted)" />;
    case 'view': return <Eye size={size} color="var(--color-warning)" />;
    default: return <Circle size={size} />;
  }
};

const UserLogs: React.FC = () => {
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterModule, setFilterModule] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchUserLogsFromDB().then(dbLogs => {
      setLogs(dbLogs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const modules = ['All', ...Array.from(new Set(logs.map(l => l.module)))];
  const types = ['All', 'create', 'update', 'delete', 'login', 'logout', 'view'];

  const filtered = logs.filter(l => {
    const matchSearch = l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || l.type === filterType;
    const matchModule = filterModule === 'All' || l.module === filterModule;
    return matchSearch && matchType && matchModule;
  });

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">User Logs</div>
          <div className="page-subtitle">{filtered.length} of {logs.length} log entries loaded from live API</div>
        </div>
        <span className="chip chip-success" style={{ padding: '6px 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <FileText size={14} /> Audit Trail Active
        </span>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-bar">
          <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}><Search size={16} /></span>
          <input placeholder="Search user or action…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 'auto', padding: '6px 12px' }}>
          {types.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t.toUpperCase()}</option>)}
        </select>
        <select className="form-select" value={filterModule} onChange={e => setFilterModule(e.target.value)} style={{ width: 'auto', padding: '6px 12px' }}>
          {modules.map(m => <option key={m} value={m}>{m === 'All' ? 'All Modules' : m}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="table-wrap">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading user audit logs directly from live API...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={36} style={{ margin: '0 auto 12px auto', display: 'block', opacity: 0.5 }} />
            No user logs found.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Module</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td>
                    <span className={`chip ${typeChip(l.type)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {renderTypeIcon(l.type)}
                      {l.type.toUpperCase()}
                    </span>
                  </td>
                  <td><strong>{l.user}</strong></td>
                  <td>
                    <span className={`chip ${l.role === 'Admin' ? 'chip-purple' : l.role === 'Manager' ? 'chip-info' : 'chip-default'}`}>
                      {l.role}
                    </span>
                  </td>
                  <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.action}
                  </td>
                  <td><span className="chip chip-default">{l.module}</span></td>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{l.ip}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {formatTime(l.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserLogs;
