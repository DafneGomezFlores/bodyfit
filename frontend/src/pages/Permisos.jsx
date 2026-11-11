import { useEffect, useState } from 'react';
import { getPermisos, getMembresias, crearPermiso, actualizarPermiso } from '../api/client.js';

export default function Permisos() {
  const [permisos, setPermisos] = useState([]);
  const [membresias, setMembresias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [form, setForm] = useState({ 
    membresiaId: '', 
    diasSolicitados: '', 
    fechaInicio: new Date().toISOString().split('T')[0], // Hoy por defecto
    fechaFin: '',
    fechaAnterior: '', 
    fechaNueva: '', 
    motivo: '' 
  });
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');

  const cargar = () => {
    Promise.all([getPermisos(), getMembresias()])
      .then(([p, m]) => {
        setPermisos(p);
        setMembresias(m);
      })
      .catch(() => setError('Error al cargar permisos'));
  };

  useEffect(() => { cargar(); }, []);

  // Recalcular automáticamente las fechas calculadas en tiempo real
  useEffect(() => {
    const dias = parseInt(form.diasSolicitados, 10);

    if (!isNaN(dias) && dias > 0) {
      // 1. Calcular Fecha Fin Permiso (fechaInicio + días)
      if (form.fechaInicio) {
        const [y, m, d] = form.fechaInicio.split('-').map(Number);
        const dateFin = new Date(y, m - 1, d + dias);
        const fechaFinCalc = dateFin.toISOString().split('T')[0];
        setForm((prev) => ({ ...prev, fechaFin: fechaFinCalc }));
      }

      // 2. Calcular Nueva Fecha de Vencimiento (fechaAnterior + días)
      if (form.fechaAnterior) {
        const [y, m, d] = form.fechaAnterior.split('-').map(Number);
        const dateNueva = new Date(y, m - 1, d + dias);
        const fechaNuevaCalc = dateNueva.toISOString().split('T')[0];
        setForm((prev) => ({ ...prev, fechaNueva: fechaNuevaCalc }));
      }
    } else {
      // Si borran los días, se limpian los cálculos automáticos
      setForm((prev) => ({ ...prev, fechaFin: '', fechaNueva: prev.fechaAnterior }));
    }
  }, [form.fechaInicio, form.diasSolicitados, form.fechaAnterior]);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === 'membresiaId') {
      const membresiaSel = membresias.find((m) => m.id === Number(value));
      const fechaFinMembresia = membresiaSel?.fechaFin || membresiaSel?.fechaVencimiento || '';
      const fechaLimpia = fechaFinMembresia ? fechaFinMembresia.split('T')[0] : '';
      const hoy = new Date().toISOString().split('T')[0];

      setForm((prev) => ({
        ...prev,
        membresiaId: value,
        fechaInicio: hoy,           // Fecha de inicio por defecto (hoy)
        fechaAnterior: fechaLimpia,   // Fecha fin actual de la membresía
        fechaNueva: fechaLimpia,      // Fecha nueva inicial (sin días sumados)
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const seleccionarParaEditar = (p) => {
    setEditandoId(p.id);
    setForm({
      membresiaId: p.membresiaId || p.membresia?.id || '',
      diasSolicitados: p.diasSolicitados || p.diasPermiso || '',
      fechaInicio: p.fechaInicio ? p.fechaInicio.split('T')[0] : new Date().toISOString().split('T')[0],
      fechaFin: p.fechaFin ? p.fechaFin.split('T')[0] : '',
      fechaAnterior: p.fechaAnterior ? p.fechaAnterior.split('T')[0] : '',
      fechaNueva: p.fechaNueva ? p.fechaNueva.split('T')[0] : '',
      motivo: p.motivo || ''
    });
    setError('');
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setForm({ 
      membresiaId: '', 
      diasSolicitados: '', 
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: '',
      fechaAnterior: '', 
      fechaNueva: '', 
      motivo: '' 
    });
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        membresiaId: Number(form.membresiaId),
        diasSolicitados: parseInt(form.diasSolicitados, 10),
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        fechaAnterior: form.fechaAnterior,
        fechaNueva: form.fechaNueva,
        motivo: form.motivo
      };

      if (editandoId) {
        await actualizarPermiso(editandoId, payload);
      } else {
        await crearPermiso(payload);
      }
      cancelarEdicion();
      cargar();
    } catch (err) {
      setError(err.response?.data?.message?.toString() || 'Error al guardar permiso');
    }
  };

  const permisosFiltrados = permisos.filter(p => {
    const nombre = String(p.membresia?.usuario?.nombreCompleto || p.membresia?.nombreCompleto || '').toLowerCase();
    return nombre.includes(busqueda.toLowerCase().trim());
  });

  return (
    <>
      <div className="topbar">
        <div><h2>Permisos</h2><div className="sub mono">tabla: permiso</div></div>
      </div>

      <section className="split">
        <div className="panel">
          <div className="panel-head"><h3>LISTADO</h3><span className="count mono">{permisosFiltrados.length}</span></div>
          
          {/* Buscador */}
          <div style={{ margin: '15px 0' }}>
            <input 
              type="text"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444',
                borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none'
              }}
            />
          </div>

          <table>
            <thead>
              <tr>
                <th>Membresía / Cliente</th>
                <th>Días</th>
                <th>Inicio Permiso</th>
                <th>Fin Permiso</th>
                <th>Venc. Anterior</th>
                <th>Venc. Nuevo</th>
                <th>Motivo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {permisosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.membresia?.usuario?.nombreCompleto || `Membresía #${p.membresiaId}`}</td>
                  <td className="mono">{p.diasSolicitados || p.diasPermiso} días</td>
                  <td className="mono">{p.fechaInicio?.split('T')[0]}</td>
                  <td className="mono">{p.fechaFin?.split('T')[0]}</td>
                  <td className="mono">{p.fechaAnterior?.split('T')[0]}</td>
                  <td className="mono">{p.fechaNueva?.split('T')[0]}</td>
                  <td>{p.motivo}</td>
                  <td>
                    <button 
                      className="btn" 
                      style={{ padding: '4px 8px', fontSize: '12px' }} 
                      onClick={() => seleccionarParaEditar(p)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>{editandoId ? 'EDITAR PERMISO' : 'NUEVO PERMISO'}</h3>
          </div>
          <form className="form-panel" onSubmit={onSubmit}>
            <div className="field">
              <label>Membresía / Cliente</label>
              <select name="membresiaId" value={form.membresiaId} onChange={onChange} required>
                <option value="">Seleccionar cliente...</option>
                {membresias.map((m) => (
                  <option key={m.id} value={m.id}>
                    #{m.id} - {m.usuario?.nombreCompleto || m.nombreCompleto}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Vencimiento Actual Membresía</label>
              <input type="date" name="fechaAnterior" value={form.fechaAnterior} readOnly disabled style={{ opacity: 0.8 }} />
            </div>

            <div className="field">
              <label>Fecha Inicio Permiso</label>
              <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={onChange} required />
            </div>

            <div className="field">
              <label>Días Solicitados</label>
              <input 
                type="number" 
                name="diasSolicitados" 
                value={form.diasSolicitados} 
                onChange={onChange} 
                min="1" 
                placeholder="Ej. 7"
                required 
              />
            </div>

            <div className="field">
              <label>Fecha Fin Permiso (Retorno)</label>
              <input type="date" name="fechaFin" value={form.fechaFin} readOnly disabled style={{ opacity: 0.8 }} />
            </div>

            <div className="field">
              <label>Nuevo Vencimiento Membresía</label>
              <input type="date" name="fechaNueva" value={form.fechaNueva} readOnly disabled style={{ opacity: 0.8, fontWeight: 'bold' }} />
            </div>

            <div className="field">
              <label>Motivo</label>
              <input name="motivo" value={form.motivo} onChange={onChange} required />
            </div>

            {error && <p className="error">{error}</p>}
            <button className="btn" type="submit">
              {editandoId ? 'Actualizar permiso' : 'Registrar permiso'}
            </button>
            {editandoId && (
              <button className="btn" type="button" onClick={cancelarEdicion} style={{ backgroundColor: '#444', marginTop: '8px' }}>
                Cancelar
              </button>
            )}
          </form>
        </div>
      </section>
    </>
  );
}