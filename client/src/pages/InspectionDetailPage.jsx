import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listInspections } from '../api/inspectionService';

function InspectionDetailPage() {
  const { id } = useParams();
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const inspections = await listInspections();
        const found = inspections.find(i => i.id === parseInt(id));
        if (found) {
          setInspection(found);
        } else {
          setError('Inspeksjon ikke funnet.');
        }
      } catch (e) {
        setError('Feil ved henting av inspeksjon.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div>Laster inspeksjon...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!inspection) return <div>Inspeksjon ikke funnet.</div>;

  const statusColor = (status) => status === 'IKKE_OK' ? 'red' : 'green';
  const displayStatus = (status) => (status === 'IKKE_OK' ? 'IKKE OK' : status);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>
          ← Tilbake til oversikt
        </Link>
        {inspection?.classroom?.id && (
          <Link to={`/classrooms/${inspection.classroom.id}/history`} style={{ color: '#007bff', textDecoration: 'none' }}>
            Historikk for {inspection.classroom.name}
          </Link>
        )}
      </div>
      
      <h1>Inspeksjonsdetaljer</h1>
      
      {/* Basic Info */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 16, 
        marginBottom: 24,
        padding: 16,
        border: '1px solid #ddd',
        borderRadius: 4,
        backgroundColor: '#f9f9f9'
      }}>
        <div>
          <strong>Dato:</strong><br />
          {new Date(inspection.inspectionDate).toLocaleDateString('nb-NO')}
        </div>
        <div>
          <strong>Klasserom:</strong><br />
          {inspection.classroom?.name || '-'}
        </div>
        <div>
          <strong>Inspektør:</strong><br />
          {inspection.inspector?.name || '-'}
        </div>
        <div>
          <strong>Opprettet:</strong><br />
          {new Date(inspection.createdAt).toLocaleString('nb-NO')}
        </div>
      </div>

      {/* Equipment Status */}
      <h2>Utstyrsstatus</h2>
      <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
        
        {/* Projektor */}
        <div style={{ 
          padding: 16, 
          border: '1px solid #ddd', 
          borderRadius: 4,
          backgroundColor: inspection.projectorStatus === 'IKKE_OK' ? '#fff5f5' : '#f0fff4'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: statusColor(inspection.projectorStatus) }}>
            Projektor - {displayStatus(inspection.projectorStatus)}
          </h3>
          {inspection.projectorComment && (
            <p><strong>Kommentar:</strong> {inspection.projectorComment}</p>
          )}
          {inspection.lampHours && (
            <p><strong>Lampe timer:</strong> {inspection.lampHours}</p>
          )}
          {inspection.lampLifeRemaining && (
            <p><strong>Gjenstående levetid:</strong> {inspection.lampLifeRemaining}</p>
          )}
        </div>

        {/* Støvfilter */}
        <div style={{ 
          padding: 16, 
          border: '1px solid #ddd', 
          borderRadius: 4,
          backgroundColor: inspection.dustFilterStatus === 'IKKE_OK' ? '#fff5f5' : '#f0fff4'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: statusColor(inspection.dustFilterStatus) }}>
            Støvfilter - {displayStatus(inspection.dustFilterStatus)}
          </h3>
        </div>

        {/* Høyttalere */}
        <div style={{ 
          padding: 16, 
          border: '1px solid #ddd', 
          borderRadius: 4,
          backgroundColor: inspection.speakerStatus === 'IKKE_OK' ? '#fff5f5' : '#f0fff4'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: statusColor(inspection.speakerStatus) }}>
            Høyttalere - {displayStatus(inspection.speakerStatus)}
          </h3>
          {inspection.speakerComment && (
            <p><strong>Kommentar:</strong> {inspection.speakerComment}</p>
          )}
        </div>

        {/* HDMI */}
        <div style={{ 
          padding: 16, 
          border: '1px solid #ddd', 
          borderRadius: 4,
          backgroundColor: inspection.hdmiStatus === 'IKKE_OK' ? '#fff5f5' : '#f0fff4'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: statusColor(inspection.hdmiStatus) }}>
            HDMI - {displayStatus(inspection.hdmiStatus)}
          </h3>
          {inspection.hdmiComment && (
            <p><strong>Kommentar:</strong> {inspection.hdmiComment}</p>
          )}
        </div>

        {/* Lader */}
        <div style={{ 
          padding: 16, 
          border: '1px solid #ddd', 
          borderRadius: 4,
          backgroundColor: inspection.chargerStatus === 'IKKE_OK' ? '#fff5f5' : '#f0fff4'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: statusColor(inspection.chargerStatus) }}>
            Lader - {displayStatus(inspection.chargerStatus)}
          </h3>
          {inspection.chargerComment && (
            <p><strong>Kommentar:</strong> {inspection.chargerComment}</p>
          )}
        </div>
      </div>

      {/* General Comment */}
      {inspection.generalComment && (
        <div style={{ 
          padding: 16, 
          border: '1px solid #ddd', 
          borderRadius: 4,
          backgroundColor: '#f9f9f9',
          marginBottom: 24
        }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Generell kommentar</h3>
          <p style={{ margin: 0 }}>{inspection.generalComment}</p>
        </div>
      )}
    </div>
  );
}

export default InspectionDetailPage;
