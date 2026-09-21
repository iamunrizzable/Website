'use client';

import './page.css';

import { useEffect, useState, useCallback } from 'react';
import { parseUserAgent } from '@/lib/deviceSignals';
import { renderStaticMap } from '@/lib/staticMap';

const s = {
  page: { minHeight: '100vh', background: 'transparent', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '32px 20px', position: 'relative', zIndex: 10 },
  card: { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 20, border: '2px solid rgba(168,85,247,0.25)', animation: 'borderGlow 3s ease-in-out infinite' },
  h2: { fontSize: 16, fontWeight: 600, color: '#d946ef', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  input: { background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, width: '100%', boxSizing: 'border-box' },
  btn: { background: '#a855f7', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  btnDanger: { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
  btnGhost: { background: 'transparent', border: '1px solid #475569', color: '#94a3b8', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155', fontFamily: 'monospace', fontSize: 14 },
  msg: { fontSize: 12, color: '#f59e0b', marginBottom: 8, minHeight: 18 },
  warnBanner: { background: '#3f1d1d', border: '1px solid #ef4444', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#fca5a5', lineHeight: 1.5 },
  detailPanel: { marginTop: 10, padding: 16, background: '#0f172a', borderRadius: 8, border: '1px solid #334155', fontFamily: 'system-ui,sans-serif' },
  detailLabel: { color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 3 },
  detailValue: { color: '#e2e8f0', fontSize: 13, fontWeight: 600 },
  detailSub: { color: '#94a3b8', fontSize: 12 },
  caveat: { color: '#f59e0b', fontSize: 11, lineHeight: 1.6, marginTop: 6, fontStyle: 'italic' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 },
  badgeOn: { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' },
  badgeOff: { background: 'rgba(100,116,139,0.15)', color: '#64748b', border: '1px solid rgba(100,116,139,0.3)' },
  scoreBarTrack: { width: '100%', maxWidth: 240, height: 8, background: '#1e293b', borderRadius: 999, overflow: 'hidden', marginTop: 6 },
  jsonBlock: { background: '#000', color: '#0f0', fontFamily: 'monospace', fontSize: 11, padding: 10, borderRadius: 6, marginTop: 8, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 300, overflowY: 'auto' },
};

const suspectColor = (label) => (label === 'High' ? '#ef4444' : label === 'Medium' ? '#f59e0b' : '#22c55e');

export default function SecurityPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [redisConfigured, setRedisConfigured] = useState(true);
  const [devices, setDevices] = useState([]);
  const [newMarker, setNewMarker] = useState('');
  const [deviceMsg, setDeviceMsg] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showJson, setShowJson] = useState({});

  const fetchDevices = useCallback(async (key) => {
    try {
      const res = await fetch('/api/admin/blocked-devices', { headers: { 'x-admin-key': key } });
      if (res.status === 401) { localStorage.removeItem('admin_key'); return; }
      const data = await res.json();
      setDevices(data.devices ?? []);
      setRedisConfigured(!!data.redisConfigured);
      localStorage.setItem('admin_key', key);
    } catch (e) {
      setDeviceMsg('Failed to load blocked devices: ' + e.message);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('admin_key');
    if (saved) {
      setAdminKey(saved);
      fetchDevices(saved);
    } else {
      fetch('/api/admin/me')
        .then(r => r.json())
        .then(({ key }) => { if (key) { setAdminKey(key); fetchDevices(key); } })
        .catch(() => {});
    }
  }, [fetchDevices]);

  const addMarker = async () => {
    setDeviceMsg('');
    const persistentMarker = newMarker.trim();
    if (!persistentMarker) return;
    try {
      const res = await fetch('/api/admin/blocked-devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ persistentMarker }),
      });
      const data = await res.json();
      if (!res.ok) { setDeviceMsg(data.error ?? 'Failed to block ID'); return; }
      setNewMarker('');
      fetchDevices(adminKey);
    } catch (e) {
      setDeviceMsg('Failed to block ID: ' + e.message);
    }
  };

  const removeDevice = async (banId) => {
    try {
      await fetch(`/api/admin/blocked-devices?banId=${encodeURIComponent(banId)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });
      fetchDevices(adminKey);
    } catch (e) {
      setDeviceMsg('Failed to remove device: ' + e.message);
    }
  };

  const summarizeDevice = (d) => {
    const ua = d.userAgent ? d.userAgent.slice(0, 60) : 'Unknown browser';
    const when = d.bannedAt ? new Date(d.bannedAt).toLocaleDateString() : '—';
    return `${ua} · ${d.country ?? '—'} · ${d.ip ?? 'no IP captured'} · banned ${when}`;
  };

  const toggleExpanded = (id) => setExpandedId((prev) => (prev === id ? null : id));
  const toggleJson = (id) => setShowJson((prev) => ({ ...prev, [id]: !prev[id] }));

  // Mirrors the old Fingerprint.com "Identification" event page as closely
  // as makes sense for what we actually have: enrichment (Location/ASN/
  // Smart Signals/Suspect Score/Velocity) is computed once per device on
  // its first-ever visit history record — manual admin entries with no
  // prior visit history won't have one, and that's expected, not a bug.
  const renderDetail = (entry) => {
    const { enrichment, history } = entry;
    const client = parseUserAgent(entry.userAgent);
    const loc = enrichment?.location;
    const asn = enrichment?.asn;
    const signals = enrichment?.smartSignals;
    const score = enrichment?.suspectScore;
    const velocity = enrichment?.velocity;

    return (
      <div style={s.detailPanel}>
        <div style={s.detailLabel}>Identification</div>
        <div style={s.detailValue}>
          Device marker: <span style={{ fontFamily: 'monospace', fontWeight: 400 }}>{entry.persistentMarker ?? '—'}</span>
        </div>
        <div style={s.detailSub}>
          First seen {history?.firstSeenAt ? new Date(history.firstSeenAt).toLocaleDateString() : 'unknown'}
          {' · '}Last seen {history?.lastSeenAt ? new Date(history.lastSeenAt).toLocaleString() : 'unknown'}
          {' · '}{history?.visitCount ?? '—'} visits
        </div>

        <div style={s.detailLabel}>Client</div>
        <div style={s.detailValue}>{client.browser} · {client.os} · {client.device}</div>

        {!enrichment && (
          <p style={{ color: '#64748b', fontSize: 12, marginTop: 14 }}>
            No Location/Smart Signals data was captured for this entry — manual admin entries and
            immediate exact-match repeat blocks don&apos;t run enrichment by design (see lib/tokens.js).
          </p>
        )}

        {enrichment && (
          <>
            <div style={s.detailLabel}>Location</div>
            {loc ? (
              <>
                <div style={s.detailValue}>{loc.city ?? '—'}, {loc.region ?? '—'}, {loc.country ?? '—'}</div>
                <div style={s.detailSub}>{loc.postalCode ?? '—'} · {loc.timezone ?? '—'}</div>
                {loc.lat && loc.lon && (
                  <>
                    {renderStaticMap(loc.lat, loc.lon)}
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lon}#map=12/${loc.lat}/${loc.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#a855f7', fontSize: 12, display: 'inline-block', marginTop: 6 }}
                    >
                      Open larger interactive map →
                    </a>
                  </>
                )}
              </>
            ) : <div style={s.detailSub}>Unknown</div>}

            <div style={s.detailLabel}>ASN</div>
            <div style={s.detailValue}>
              {asn ? `AS${asn.asn} — ${asn.name ?? 'Unknown name'} (${asn.country ?? '—'})` : 'Unknown ISP'}
            </div>

            <div style={s.detailLabel}>Smart Signals</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              <span style={{ ...s.badge, ...(signals?.tor ? s.badgeOn : s.badgeOff) }}>Tor {signals?.tor ? '✓' : '—'}</span>
              <span style={{ ...s.badge, ...(signals?.vpnOrDatacenter ? s.badgeOn : s.badgeOff) }}>VPN/Datacenter {signals?.vpnOrDatacenter ? '✓' : '—'}</span>
              <span style={{ ...s.badge, ...(signals?.vm?.detected ? s.badgeOn : s.badgeOff) }}>VM {signals?.vm?.detected ? '✓' : '—'}</span>
              <span style={{ ...s.badge, ...(signals?.bot?.suspected ? s.badgeOn : s.badgeOff) }}>Bot {signals?.bot?.suspected ? '✓' : '—'}</span>
              <span style={{ ...s.badge, ...(signals?.incognito?.suspected ? s.badgeOn : s.badgeOff) }}>Incognito {signals?.incognito?.suspected ? '✓' : '—'}</span>
            </div>
            <p style={s.caveat}>
              Bot and Incognito are weak, easily-evaded signals — navigator.webdriver is defeated by a
              single browser flag, and the classic incognito-detection technique was broken by Chrome&apos;s
              2026 storage-quota changes. Treat both as corroborating context only, never as proof.
            </p>

            <div style={s.detailLabel}>Suspect Score</div>
            {score ? (
              <>
                <div style={s.detailValue}>
                  {score.value} — <span style={{ color: suspectColor(score.label) }}>{score.label}</span>
                </div>
                <div style={s.scoreBarTrack}>
                  <div style={{ width: `${score.value}%`, height: '100%', background: suspectColor(score.label) }} />
                </div>
              </>
            ) : <div style={s.detailSub}>—</div>}

            <div style={s.detailLabel}>Velocity (24h snapshot at capture time)</div>
            {velocity ? (
              <div style={s.detailValue}>{velocity.eventCount24h} events · {velocity.ipCount24h} IPs · {velocity.countryCount24h} countries</div>
            ) : <div style={s.detailSub}>—</div>}
          </>
        )}

        <button style={{ ...s.btnGhost, marginTop: 14 }} onClick={() => toggleJson(entry.id)}>
          {showJson[entry.id] ? 'Hide JSON' : 'Show JSON'}
        </button>
        {showJson[entry.id] && <pre style={s.jsonBlock}>{JSON.stringify(entry, null, 2)}</pre>}
      </div>
    );
  };

  return (
    <>
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™</a>
        <a href="/agencies" onClick={() => setMenuOpen(false)}>Creator Networks</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/news" onClick={() => setMenuOpen(false)}>Newsletters</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <div style={s.page}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#d4a5ff', marginBottom: 28, animation: 'glowPulse 3s ease-in-out infinite' }}>Security</h1>

          {!redisConfigured && (
            <div style={s.warnBanner}>
              <strong>Blocking is not actually active yet.</strong> No Redis connection is
              configured on this deployment — without one, IDs will save here but visitors
              won&apos;t actually be blocked, and nothing survives a redeploy. Reconnect the
              Redis database to this project in Vercel (Storage → your Redis database →
              Connect to Project), redeploy, and this banner should clear. If it still shows
              a REDIS_URL env var after that, tell the person maintaining this site — the
              database is on Redis Cloud and needs a plain REDIS_URL, not the
              REST-API-style vars an Upstash integration would use.
            </div>
          )}

          <div style={s.card}>
            <div style={s.h2}>Block an ID</div>
            {deviceMsg && <div style={s.msg}>{deviceMsg}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={s.input}
                placeholder="paste a device marker (e.g. from ?fpdebug=1)"
                value={newMarker}
                onChange={(e) => setNewMarker(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addMarker(); }}
              />
              <button style={s.btn} onClick={addMarker}>Block</button>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.h2}>Blocked Devices ({devices.length})</div>
            {devices.length === 0 && <div style={{ color: '#06b6d4', fontSize: 13 }}>No devices blocked.</div>}
            {devices.map((d) => (
              <div key={d.id} style={{ ...s.row, flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13 }}>{summarizeDevice(d)}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={s.btnGhost} onClick={() => toggleExpanded(d.id)}>
                      {expandedId === d.id ? 'Hide details' : 'Details'}
                    </button>
                    <button style={s.btnDanger} onClick={() => removeDevice(d.id)}>Remove</button>
                  </div>
                </div>
                <span style={{ color: '#64748b', fontSize: 11 }}>
                  {d.persistentMarker ? `id: ${d.persistentMarker.slice(0, 16)}…` : 'no marker captured'}
                  {d.note ? ` · ${d.note}` : ''}
                  {d.matchCount ? ` · seen ${d.matchCount}×` : ''}
                </span>
                {expandedId === d.id && renderDetail(d)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
