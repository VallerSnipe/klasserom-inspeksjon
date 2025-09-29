import React, { useEffect, useState } from 'react';
import { getAllClassrooms } from '../api/classroomService';
import { listInspections } from '../api/inspectionService';
import { Link } from 'react-router-dom';

function DashboardPage() {
  const [classrooms, setClassrooms] = useState([]);
  const [latestByClassroom, setLatestByClassroom] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [rooms, inspections] = await Promise.all([
          getAllClassrooms(),
          listInspections(),
        ]);
        setClassrooms(rooms);
        // Build latest inspection per classroom
        const map = {};
        inspections.forEach((i) => {
          const cid = i.classroom?.id;
          if (!cid) return;
          const prev = map[cid];
          if (!prev || new Date(i.inspectionDate) > new Date(prev.inspectionDate)) {
            map[cid] = i;
          }
        });
        setLatestByClassroom(map);
      } catch (e) {
        setError('Feil ved henting av klasserom.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const overallStatus = (insp) => {
    if (!insp) return null;
    const anyBad = [
      insp.projectorStatus,
      insp.dustFilterStatus,
      insp.speakerStatus,
      insp.hdmiStatus,
      insp.chargerStatus,
    ].some((s) => s === 'IKKE_OK');
    return anyBad ? 'IKKE_OK' : 'OK';
  };

  const displayStatus = (s) => (s === 'IKKE_OK' ? 'IKKE OK' : s);

  if (loading) return <div>Laster inn klasserom...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Klasseromoversikt</h1>
        <div style={{ color: '#6c757d' }}>{classrooms.length} rom</div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {classrooms.map((c) => {
          const insp = latestByClassroom[c.id];
          const status = overallStatus(insp);
          const statusColor = status === 'IKKE_OK' ? '#dc3545' : '#28a745';
          const dateText = insp ? new Date(insp.inspectionDate).toLocaleDateString('nb-NO') : 'Ingen inspeksjon';
          const card = (
            <div
              className="card"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                rowGap: 8,
                alignItems: 'center',
                padding: 16,
                transition: 'transform 0.12s ease, box-shadow 0.12s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ fontWeight: 600 }}>{c.name}</div>

              <div style={{ fontSize: 13, color: '#6b7280', gridColumn: '2', justifySelf: 'end', textAlign: 'right' }}>Sist inspisert: {dateText}</div>
              {insp ? (
                <Link to={`/inspections/${insp.id}/edit`} style={{ fontSize: 12, color: '#007bff', textDecoration: 'none' }}>Rediger</Link>
              ) : (
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Ingen inspeksjon</span>
              )}
              <span style={{
                justifySelf: 'end',
                fontSize: 12,
                color: statusColor,
                border: `1px solid ${statusColor}`,
                borderRadius: 999,
                padding: '2px 8px',
              }}>{status ? displayStatus(status) : '-'}</span>
            </div>
          );
          return (
            <div key={c.id}>
              {insp ? (
                <Link to={`/inspections/${insp.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {card}
                </Link>
              ) : (
                card
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardPage;
