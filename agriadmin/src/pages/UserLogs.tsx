import React, { useState, useEffect } from 'react';
import { userLogs, UserLog, fetchUserLogsFromDB } from '../data/mockData';

const typeChip = (type: string) => {
  const map: Record<string, string> = {
    create: 'chip-success', update: 'chip-info', delete: 'chip-danger',
    login: 'chip-purple', logout: 'chip-default', view: 'chip-warning',
  };
  return map[type] ?? 'chip-default';
};

const typeEmoji = (type: string) => {
  const map: Record<string, string> = { create: '➕', update: '✏️', delete: '🗑️', login: '🔑', logout: '🚪', view: '👁️' };
  return map[type] ?? '•';
};

const UserLogs: React.FC = () => {
  const [logs, setLogs] = useState<UserLog[]>(userLogs);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterModule, setFilterModule] = useState('All');

  useEffect(() => {
    fetchUserLogsFromDB().then(dbLogs => {
      if (dbLogs && dbLogs.length > 0) {
        setLogs(dbLogs);
      }
    });
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
          <div className="page-subtitle">{filtered.length} of {logs.length} log entries</div>
        </div>
        <span className="chip chip-success" style={{ padding: '6px 14px', fontSize: 12 }}>🟢 Live Audit Trail</span>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input placeholder="Search user, action…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Module filter */}
        <select
          className="form-select"
          style={{ width: 'auto', padding: '8px 12px', fontSize: 12 }}
          value={filterModule}
          onChange={e => setFilterModule(e.target.value)}
        >
          {modules.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* Type chips */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        {types.map(t => (
          <button
            key={t}
            className={`filter-chip${filterType === t ? ' active' : ''}`}
            onClick={() => setFilterType(t)}
          >
            {t === 'All' ? '📋 All' : `${typeEmoji(t)} ${t.charAt(0).toUpperCase() + t.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Summary Row */}
      <div className="stat-row" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total', val: logs.length, color: 'var(--text-primary)' },
          { label: 'Creates', val: logs.filter(l=>l.type==='create').length, color: 'var(--color-success)' },
          { label: 'Updates', val: logs.filter(l=>l.type==='update').length, color: 'var(--color-info)' },
          { label: 'Deletes', val: logs.filter(l=>l.type==='delete').length, color: 'var(--color-danger)' },
          { label: 'Logins', val: logs.filter(l=>l.type==='login').length, color: '#a855f7' },
        ].map(s => (
          <div key={s.label} className="stat-box">
            <div className="stat-box-val" style={{ color: s.color }}>{s.val}</div>
            <div className="stat-box-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Type</th>
              <th>IP Address</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id}>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{log.id}</td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{log.user}</div>
                  <span className={`chip ${log.role === 'Admin' ? 'chip-success' : 'chip-info'}`} style={{ fontSize: 10 }}>{log.role}</span>
                </td>
                <td style={{ fontSize: 13, maxWidth: 280 }}>
                  <span style={{ marginRight: 6 }}>{typeEmoji(log.type)}</span>{log.action}
                </td>
                <td><span className="chip chip-default">{log.module}</span></td>
                <td><span className={`chip ${typeChip(log.type)}`}>{log.type}</span></td>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{log.ip}</td>
                <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatTime(log.timestamp)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No logs match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserLogs;
