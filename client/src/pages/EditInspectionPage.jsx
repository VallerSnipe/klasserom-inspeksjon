import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getInspection, updateInspection } from '../api/inspectionService';
import { getAllClassrooms } from '../api/classroomService';
import { getAllInspectors } from '../api/inspectorService';

const statusOptions = [
  { value: 'OK', label: 'OK' },
  { value: 'IKKE_OK', label: 'Ikke OK' },
];

function EditInspectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [inspectors, setInspectors] = useState([]);

  const [form, setForm] = useState({
    inspectionDate: '',
    classroomId: '',
    inspectorId: '',
    projectorStatus: 'OK',
    projectorComment: '',
    dustFilterStatus: 'OK',
    lampHours: '',
    lampLifeRemaining: '',
    speakerStatus: 'OK',
    speakerComment: '',
    hdmiStatus: 'OK',
    hdmiComment: '',
    chargerStatus: 'OK',
    chargerComment: '',
    generalComment: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [ins, cls, insp] = await Promise.all([
          getInspection(id),
          getAllClassrooms(),
          getAllInspectors(),
        ]);
        setClassrooms(cls);
        setInspectors(insp);
        setForm({
          inspectionDate: new Date(ins.inspectionDate).toISOString().slice(0,10),
          classroomId: ins.classroomId ?? ins.classroom?.id ?? '',
          inspectorId: ins.inspectorId ?? ins.inspector?.id ?? '',
          projectorStatus: ins.projectorStatus ?? 'OK',
          projectorComment: ins.projectorComment ?? '',
          dustFilterStatus: ins.dustFilterStatus ?? 'OK',
          lampHours: ins.lampHours ?? '',
          lampLifeRemaining: ins.lampLifeRemaining ?? '',
          speakerStatus: ins.speakerStatus ?? 'OK',
          speakerComment: ins.speakerComment ?? '',
          hdmiStatus: ins.hdmiStatus ?? 'OK',
          hdmiComment: ins.hdmiComment ?? '',
          chargerStatus: ins.chargerStatus ?? 'OK',
          chargerComment: ins.chargerComment ?? '',
          generalComment: ins.generalComment ?? '',
        });
      } catch (e) {
        console.error(e);
        setError('Kunne ikke laste inspeksjon for redigering.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...form,
        classroomId: Number(form.classroomId),
        inspectorId: Number(form.inspectorId),
      };
      await updateInspection(id, payload);
      setSuccess('Endringer lagret.');
      // Gå tilbake til detaljvisningen
      navigate(`/inspections/${id}`);
    } catch (err) {
      console.error(err);
      setError('Noe gikk galt ved lagring.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Laster...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link to={`/inspections/${id}`} style={{ color: '#007bff', textDecoration: 'none' }}>← Tilbake til detaljer</Link>
      </div>
      <h1>Rediger inspeksjon</h1>
      {success && <div className="success">{success}</div>}
      <div className="card" style={{ maxWidth: 1000 }}>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          <label style={{ display: 'grid', gap: 8 }}>
            Dato
            <input type="date" name="inspectionDate" value={form.inspectionDate} onChange={onChange} required />
          </label>
          <label style={{ display: 'grid', gap: 8 }}>
            Klasserom
            <select name="classroomId" value={form.classroomId} onChange={onChange} required>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 8 }}>
            Inspektør
            <select name="inspectorId" value={form.inspectorId} onChange={onChange} required>
              {inspectors.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </label>

          {/* Statusfelt */}
          <fieldset style={{ border: '1px solid var(--border)', padding: 16, gridColumn: '1 / -1' }}>
            <legend>Projektor</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
              <label style={{ display: 'grid', gap: 8 }}>
                Status
                <select name="projectorStatus" value={form.projectorStatus} onChange={onChange}>
                  {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
            <legend>Støvfilter</legend>
            <label style={{ display: 'grid', gap: 8 }}>
              Status
              <select name="dustFilterStatus" value={form.dustFilterStatus} onChange={onChange}>
                {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          </fieldset>

          <fieldset style={{ border: '1px solid var(--border)', padding: 16 }}>
            <legend>Høyttalere</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
              <label style={{ display: 'grid', gap: 8 }}>
                Status
                <select name="speakerStatus" value={form.speakerStatus} onChange={onChange}>
                  {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
              <label style={{ display: 'grid', gap: 8 }}>
                Status
                <select name="hdmiStatus" value={form.hdmiStatus} onChange={onChange}>
                  {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
              <label style={{ display: 'grid', gap: 8 }}>
                Kommentar
                <input type="text" name="hdmiComment" value={form.hdmiComment} onChange={onChange} />
              </label>
            </div>
          </fieldset>

          <fieldset style={{ border: '1px solid var(--border)', padding: 16 }}>
            <legend>Lader</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
              <label style={{ display: 'grid', gap: 8 }}>
                Status
                <select name="chargerStatus" value={form.chargerStatus} onChange={onChange}>
                  {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={() => navigate('/')} disabled={saving} style={{ backgroundColor: '#6b7280' }}>Avbryt</button>
            <button type="submit" disabled={saving}>{saving ? 'Lagrer...' : 'Lagre endringer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditInspectionPage;
