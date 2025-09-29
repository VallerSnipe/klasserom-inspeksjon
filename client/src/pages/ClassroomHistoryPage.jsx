import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAllClassrooms, getClassroomInspections } from '../api/classroomService';
import * as XLSX from 'xlsx';

function ClassroomHistoryPage() {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    from: '',
    to: '',
    onlyIssues: false,
    page: 1,
    pageSize: 20,
  });

  const displayStatus = (s) => (s === 'IKKE_OK' ? 'IKKE OK' : s);

  useEffect(() => {
    const load = async () => {
      try {
        const [classrooms, res] = await Promise.all([
          getAllClassrooms(),
          getClassroomInspections(id, { page: filters.page, pageSize: filters.pageSize }),
        ]);
        const found = classrooms.find((c) => String(c.id) === String(id));
        setClassroom(found || null);
        setInspections(res?.items || []);
        setTotal(res?.total || 0);
      } catch (e) {
        setError('Feil ved henting av historikk.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, filters.page, filters.pageSize]);

  const filtered = useMemo(() => {
    let arr = [...inspections];
    if (filters.from) {
      const fromD = new Date(filters.from);
      arr = arr.filter((i) => new Date(i.inspectionDate) >= fromD);
    }
    if (filters.to) {
      const toD = new Date(filters.to);
      arr = arr.filter((i) => new Date(i.inspectionDate) <= toD);
    }
    if (filters.onlyIssues) {
      arr = arr.filter((i) => [
        i.projectorStatus,
        i.dustFilterStatus,
        i.speakerStatus,
        i.hdmiStatus,
        i.chargerStatus,
      ].some((s) => s === 'IKKE_OK'));
    }
    return arr;
  }, [inspections, filters]);

  const exportExcel = () => {
    const rows = filtered.map((i) => ({
      Dato: new Date(i.inspectionDate).toLocaleDateString('nb-NO'),
      Inspektør: i.inspector?.name ?? '',
      Projektor: displayStatus(i.projectorStatus),
      Støvfilter: displayStatus(i.dustFilterStatus),
      Høyttalere: displayStatus(i.speakerStatus),
      HDMI: displayStatus(i.hdmiStatus),
      Lader: displayStatus(i.chargerStatus),
      'Generell kommentar': i.generalComment ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, classroom ? classroom.name : 'Historikk');
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `historikk_${classroom ? classroom.name + '_' : ''}${today}.xlsx`);
  };

  if (loading) return <div>Laster historikk...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ marginBottom: 6 }}>
            <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>← Tilbake til Dashboard</Link>
          </div>
          <h1 style={{ margin: 0 }}>Historikk: {classroom ? classroom.name : `Rom #${id}`}</h1>
        </div>
        <button onClick={exportExcel} style={{ padding: '6px 10px', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'transparent', borderRadius: 6, cursor: 'pointer' }}>
          Eksporter til Excel
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, margin: '12px 0', padding: 12, border: '1px solid #e5e7eb', borderRadius: 6 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          Fra dato
          <input type="date" value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          Til dato
          <input type="date" value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={filters.onlyIssues} onChange={(e) => setFilters((p) => ({ ...p, onlyIssues: e.target.checked }))} />
          Vis kun IKKE OK
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          Antall per side
          <select value={filters.pageSize} onChange={(e) => setFilters((p) => ({ ...p, pageSize: Number(e.target.value), page: 1 }))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p>Ingen inspeksjoner i valgt tidsrom.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Dato</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Inspektør</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Projektor</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Støvfilter</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Høyttalere</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>HDMI</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Lader</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Kommentar</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Vis</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id}>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{new Date(i.inspectionDate).toLocaleDateString('nb-NO')}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{i.inspector?.name ?? '-'}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, color: i.projectorStatus === 'IKKE_OK' ? 'red' : 'green' }}>{displayStatus(i.projectorStatus)}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, color: i.dustFilterStatus === 'IKKE_OK' ? 'red' : 'green' }}>{displayStatus(i.dustFilterStatus)}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, color: i.speakerStatus === 'IKKE_OK' ? 'red' : 'green' }}>{displayStatus(i.speakerStatus)}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, color: i.hdmiStatus === 'IKKE_OK' ? 'red' : 'green' }}>{displayStatus(i.hdmiStatus)}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, color: i.chargerStatus === 'IKKE_OK' ? 'red' : 'green' }}>{displayStatus(i.chargerStatus)}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{i.generalComment || '-'}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>
                    <Link to={`/inspections/${i.id}`} style={{ color: '#007bff', textDecoration: 'none' }}>Vis detaljer</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <div style={{ color: '#6b7280', fontSize: 13 }}>
              Viser {inspections.length} av {total} inspeksjoner • Side {filters.page} av {Math.max(1, Math.ceil(total / filters.pageSize))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setFilters((p) => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={filters.page <= 1}>
                Forrige
              </button>
              <button onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))} disabled={filters.page >= Math.ceil(total / filters.pageSize)}>
                Neste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassroomHistoryPage;
