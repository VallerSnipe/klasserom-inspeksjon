import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listInspections } from '../api/inspectionService';
import { getAllClassrooms } from '../api/classroomService';
import { getAllInspectors } from '../api/inspectorService';
import * as XLSX from 'xlsx';

function ReportPage() {
  const [inspections, setInspections] = useState([]);
  const [filteredInspections, setFilteredInspections] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const displayStatus = (s) => (s === 'IKKE_OK' ? 'IKKE OK' : s);
  const doExport = () => {
    // Prepare rows
    const rows = filteredInspections.map((i) => ({
      Dato: new Date(i.inspectionDate).toLocaleDateString('nb-NO'),
      Klasserom: i.classroom?.name ?? '',
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
    XLSX.utils.book_append_sheet(wb, ws, 'Rapporter');
    const today = new Date().toISOString().slice(0,10);
    XLSX.writeFile(wb, `inspeksjonsrapport_${today}.xlsx`);
  };
  
  // Filter states
  const [filters, setFilters] = useState({
    classroom: '',
    inspector: '',
    status: '',
    search: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [inspectionsData, classroomsData, inspectorsData] = await Promise.all([
          listInspections(),
          getAllClassrooms(),
          getAllInspectors()
        ]);
        setInspections(inspectionsData);
        setFilteredInspections(inspectionsData);
        setClassrooms(classroomsData);
        setInspectors(inspectorsData);
      } catch (e) {
        setError('Feil ved henting av data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...inspections];

    // Apply filters
    if (filters.classroom) {
      filtered = filtered.filter(i => i.classroom?.id === parseInt(filters.classroom));
    }
    if (filters.inspector) {
      filtered = filtered.filter(i => i.inspector?.id === parseInt(filters.inspector));
    }
    if (filters.status) {
      filtered = filtered.filter(i => 
        i.projectorStatus === filters.status || 
        i.dustFilterStatus === filters.status ||
        i.speakerStatus === filters.status ||
        i.hdmiStatus === filters.status ||
        i.chargerStatus === filters.status
      );
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(i =>
        i.classroom?.name?.toLowerCase().includes(searchLower) ||
        i.inspector?.name?.toLowerCase().includes(searchLower) ||
        i.generalComment?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (filters.sortBy) {
        case 'date':
          aVal = new Date(a.inspectionDate);
          bVal = new Date(b.inspectionDate);
          break;
        case 'classroom':
          aVal = a.classroom?.name || '';
          bVal = b.classroom?.name || '';
          break;
        case 'inspector':
          aVal = a.inspector?.name || '';
          bVal = b.inspector?.name || '';
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredInspections(filtered);
  }, [inspections, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      classroom: '',
      inspector: '',
      status: '',
      search: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  if (loading) return <div>Laster inspeksjoner...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Rapporter</h1>
        <button onClick={doExport} style={{ padding: '6px 10px', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'transparent', borderRadius: 6, cursor: 'pointer' }}>
          Eksporter til Excel
        </button>
      </div>
      
      {/* Filters */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 12, 
        marginBottom: 20,
        padding: 16,
        border: '1px solid #ddd',
        borderRadius: 4,
        backgroundColor: '#f9f9f9'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Søk</label>
          <input
            type="text"
            placeholder="Søk i rom, inspektør, kommentar..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ width: '100%', padding: 6 }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Klasserom</label>
          <select
            value={filters.classroom}
            onChange={(e) => handleFilterChange('classroom', e.target.value)}
            style={{ width: '100%', padding: 6 }}
          >
            <option value="">Alle klasserom</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Inspektør</label>
          <select
            value={filters.inspector}
            onChange={(e) => handleFilterChange('inspector', e.target.value)}
            style={{ width: '100%', padding: 6 }}
          >
            <option value="">Alle inspektører</option>
            {inspectors.map(i => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{ width: '100%', padding: 6 }}
          >
            <option value="">Alle statuser</option>
            <option value="OK">OK</option>
            <option value="IKKE_OK">Ikke OK</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Sorter etter</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            style={{ width: '100%', padding: 6 }}
          >
            <option value="date">Dato</option>
            <option value="classroom">Klasserom</option>
            <option value="inspector">Inspektør</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Rekkefølge</label>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            style={{ width: '100%', padding: 6 }}
          >
            <option value="desc">Nyeste først</option>
            <option value="asc">Eldste først</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'end' }}>
          <button 
            onClick={clearFilters}
            style={{ 
              padding: '6px 12px', 
              backgroundColor: '#f0f0f0', 
              border: '1px solid #ccc',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Nullstill filtre
          </button>
        </div>
      </div>
      
      <div style={{ marginBottom: 12 }}>
        <strong>Viser {filteredInspections.length} av {inspections.length} inspeksjoner</strong>
      </div>
      
      {filteredInspections.length === 0 ? (
        <p>Ingen inspeksjoner funnet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Dato</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Klasserom</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Inspektør</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Projektor</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Støvfilter</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Høyttaler</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>HDMI</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Lader</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Kommentar</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {filteredInspections.map((i) => (
                <tr key={i.id}>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{new Date(i.inspectionDate).toLocaleDateString()}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{i.classroom?.name ?? '-'}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{i.inspector?.name ?? '-'}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, color: i.projectorStatus === 'IKKE_OK' ? 'red' : 'green' }}>{displayStatus(i.projectorStatus)}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, color: i.dustFilterStatus === 'IKKE_OK' ? 'red' : 'green' }}>{displayStatus(i.dustFilterStatus)}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, color: i.speakerStatus === 'IKKE_OK' ? 'red' : 'green' }}>{displayStatus(i.speakerStatus)}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, color: i.hdmiStatus === 'IKKE_OK' ? 'red' : 'green' }}>{displayStatus(i.hdmiStatus)}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, color: i.chargerStatus === 'IKKE_OK' ? 'red' : 'green' }}>{displayStatus(i.chargerStatus)}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{i.generalComment || '-'}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>
                    <Link 
                      to={`/inspections/${i.id}`}
                      style={{ 
                        color: '#007bff', 
                        textDecoration: 'none',
                        padding: '4px 8px',
                        border: '1px solid #007bff',
                        borderRadius: 4,
                        fontSize: '12px'
                      }}
                    >
                      Vis detaljer
                    </Link>
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

export default ReportPage;
