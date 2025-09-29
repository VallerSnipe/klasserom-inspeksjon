import React, { useEffect, useState } from 'react';
import { getAllClassrooms } from '../api/classroomService';
import { getAllInspectors } from '../api/inspectorService';
import { createInspection } from '../api/inspectionService';

const statusOptions = [
  { value: 'OK', label: 'OK' },
  { value: 'IKKE_OK', label: 'Ikke OK' },
];

// Inline icons (Heroicons-style)
function IconProjector(props){
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect x="2" y="8" width="20" height="8" rx="2"/>
      <circle cx="8" cy="12" r="2"/>
      <circle cx="16" cy="12" r="1"/>
    </svg>
  )
}
function IconFilter(props){
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z"/>
    </svg>
  )
}
function IconSpeaker(props){
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2"/>
      <circle cx="12" cy="14" r="4"/>
      <circle cx="12" cy="7" r="1"/>
    </svg>
  )
}
function IconHdmi(props){
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect x="3" y="8" width="18" height="6" rx="2"/>
      <path d="M6 8v-2h12v2"/>
    </svg>
  )
}
function IconCharger(props){
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M11 21v-7H8l5-11v7h3l-5 11z"/>
    </svg>
  )
}

function NewInspectionPage() {
  const [classrooms, setClassrooms] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [validation, setValidation] = useState({});

  const [form, setForm] = useState({
    inspectionDate: new Date().toISOString().slice(0, 10),
    classroomId: '',
    inspectorId: '',
    projectorStatus: 'OK',
    dustFilterStatus: 'OK',
    speakerStatus: 'OK',
    hdmiStatus: 'OK',
    chargerStatus: 'OK',
    projectorComment: '',
    lampHours: '',
    lampLifeRemaining: '',
    speakerComment: '',
    hdmiComment: '',
    chargerComment: '',
    generalComment: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [cls, ins] = await Promise.all([
          getAllClassrooms(),
          getAllInspectors(),
        ]);
        setClassrooms(cls);
        setInspectors(ins);
      } catch (e) {
        setError('Kunne ikke laste klasserom/inspektører.');
      }
    };
    load();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...form,
        classroomId: Number(form.classroomId),
        inspectorId: Number(form.inspectorId),
      };
      await createInspection(payload);
      setSuccess('Inspeksjon lagret!');
    } catch (err) {
      console.error(err);
      setError('Noe gikk galt ved lagring av inspeksjon.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Ny inspeksjon</h1>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <div className="card" style={{ maxWidth: 1000 }}>
      <form
        onSubmit={onSubmit}
        style={{
          display: 'grid',
          gap: 24,
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        }}
      >
        <label style={{ display: 'grid', gap: 8 }}>
          Dato
          <input
            type="date"
            name="inspectionDate"
            value={form.inspectionDate}
            onChange={onChange}
            required
          />
        </label>

        <label style={{ display: 'grid', gap: 8 }}>
          Klasserom
          <select name="classroomId" value={form.classroomId} onChange={onChange} required>
            <option value="" disabled>Velg klasserom</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: 8 }}>
          Inspektør
          <select name="inspectorId" value={form.inspectorId} onChange={onChange} required>
            <option value="" disabled>Velg inspektør</option>
            {inspectors.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
        </label>

          <fieldset style={{ border: '1px solid var(--border)', padding: 16, gridColumn: '1 / -1' }}>
            <legend style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconProjector /> Projektor</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 24, rowGap: 20 }}>
              <label style={{ display: 'grid', gap: 8 }}>
                Status
                <select name="projectorStatus" value={form.projectorStatus} onChange={onChange}>
                  {statusOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'grid', gap: 8 }}>
                Kommentar
                <input type="text" name="projectorComment" value={form.projectorComment} onChange={onChange} />
              </label>
              <label style={{ display: 'grid', gap: 8 }}>
                Lampe timer
                <input type="text" name="lampHours" value={form.lampHours} onChange={onChange} />
              </label>
              <label style={{ display: 'grid', gap: 8 }}>
                Gjenstående levetid
                <input type="text" name="lampLifeRemaining" value={form.lampLifeRemaining} onChange={onChange} />
              </label>
            </div>
          </fieldset>

          <fieldset style={{ border: '1px solid var(--border)', padding: 16 }}>
            <legend style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconSpeaker /> Høyttalere</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 20 }}>
              <label style={{ display: 'grid', gap: 8 }}>
                Status
                <select name="speakerStatus" value={form.speakerStatus} onChange={onChange}>
                  {statusOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'grid', gap: 8 }}>
                Kommentar
                <input type="text" name="speakerComment" value={form.speakerComment} onChange={onChange} />
              </label>
            </div>
          </fieldset>

          <fieldset style={{ border: '1px solid var(--border)', padding: 16 }}>
            <legend>HDMI</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 20 }}>
              <label style={{ display: 'grid', gap: 8 }}>
                Status
                <select name="hdmiStatus" value={form.hdmiStatus} onChange={onChange}>
                  {statusOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'grid', gap: 8 }}>
                Kommentar
                <input type="text" name="hdmiComment" value={form.hdmiComment} onChange={onChange} />
              </label>
            </div>
          </fieldset>

          <fieldset style={{ border: '1px solid var(--border)', padding: 16 }}>
            <legend style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconCharger /> Lader</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 20 }}>
              <label style={{ display: 'grid', gap: 8 }}>
                Status
                <select name="chargerStatus" value={form.chargerStatus} onChange={onChange}>
                  {statusOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'grid', gap: 8 }}>
                Kommentar
                <input type="text" name="chargerComment" value={form.chargerComment} onChange={onChange} />
              </label>
            </div>
          </fieldset>

          <label style={{ gridColumn: '1 / -1', display: 'grid', gap: 8 }}>
            Generell kommentar
            <textarea name="generalComment" value={form.generalComment} onChange={onChange} rows={3} />
          </label>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Lagrer...' : 'Lagre inspeksjon'}
            </button>
          </div>
      </form>
      </div>
      {/* Toast */}
      {showToast && (
        <div style={{
          position: 'fixed', right: 16, bottom: 16, padding: '12px 14px',
          backgroundColor: success ? 'color-mix(in srgb, #d4edda 85%, var(--card-bg))' : 'color-mix(in srgb, #f8d7da 85%, var(--card-bg))',
          border: '1px solid',
          borderColor: success ? 'color-mix(in srgb, #c3e6cb 85%, var(--border))' : 'color-mix(in srgb, #f5c6cb 85%, var(--border))',
          borderRadius: 6, boxShadow: '0 6px 14px var(--shadow)'
        }}>
          {success || error}
        </div>
      )}
    </div>
  );
}

export default NewInspectionPage;
