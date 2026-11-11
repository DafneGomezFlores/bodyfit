import { useEffect, useState } from 'react';
import { getTarifas, crearTarifa, actualizarTarifa, eliminarTarifa } from '../api/client.js';

export default function Tarifas() {
  const [tarifas, setTarifas] = useState([]);
  const [form, setForm] = useState({ nombreTarifa: '', precio: '', diasDuracion: '', tipo: 'estandar' });
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');

  const cargar = () => getTarifas().then(setTarifas).catch(() => setError('No se pudo cargar la lista de tarifas'));

  useEffect(() => { cargar(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Cargar tarifa en el formulario para editar
  const seleccionarParaEditar = (t) => {
    setEditandoId(t.id);
    setForm({
      nombreTarifa: t.nombreTarifa || '',
      precio: t.precio || '',
      diasDuracion: t.diasDuracion || '',
      tipo: t.tipo || 'estandar'
    });
    setError('');
  };

  // Limpiar el estado de edición
  const cancelarEdicion = () => {
    setEditandoId(null);
    setForm({ nombreTarifa: '', precio: '', diasDuracion: '', tipo: 'estandar' });
    setError('');
  };

  // Guardar (Crear o Actualizar)
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        precio: parseFloat(form.precio),
        diasDuracion: parseInt(form.diasDuracion, 10),
      };

      if (editandoId) {
        await actualizarTarifa(editandoId, payload);
      } else {
        await crearTarifa(payload);
      }

      cancelarEdicion();
      cargar();
    } catch (err) {
      setError(err.response?.data?.message?.toString() || 'No se pudo guardar la tarifa');
    }
  };

  // Eliminar tarifa
  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarifa?')) {
      try {
        await eliminarTarifa(id);
        cargar();
      } catch (err) {
        setError('No se pudo eliminar la tarifa');
      }
    }
  };

  return (
    <>
      <div className="topbar">
        <div><h2>Tarifas</h2><div className="sub mono">tabla: tarifa_dinamica</div></div>
      </div>

      <section className="split">
        {/* LISTADO DE TARIFAS */}
        <div className="panel">
          <div className="panel-head"><h3>LISTADO</h3><span className="count mono">{tarifas.length}</span></div>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Duración</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tarifas.map((t) => (
                <tr key={t.id}>
                  <td>{t.nombreTarifa}</td>
                  <td><span className="tag">{t.tipo}</span></td>
                  <td className="mono">{t.diasDuracion} días</td>
                  <td className="price mono">Bs {t.precio}</td>
                  <td style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      className="btn" 
                      style={{ padding: '4px 8px', fontSize: '12px' }} 
                      onClick={() => seleccionarParaEditar(t)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn" 
                      style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#e53e3e' }} 
                      onClick={() => handleEliminar(t.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FORMULARIO DINÁMICO */}
        <div className="panel">
          <div className="panel-head">
            <h3>{editandoId ? 'EDITAR TARIFA' : 'NUEVA TARIFA'}</h3>
          </div>
          <form className="form-panel" onSubmit={onSubmit}>
            <div className="field">
              <label>Nombre de la tarifa</label>
              <input name="nombreTarifa" value={form.nombreTarifa} onChange={onChange} required />
            </div>
            <div className="field">
              <label>Precio (Bs)</label>
              <input name="precio" type="number" step="0.01" value={form.precio} onChange={onChange} required />
            </div>
            <div className="field">
              <label>Duración (días)</label>
              <input name="diasDuracion" type="number" value={form.diasDuracion} onChange={onChange} required />
            </div>
            <div className="field">
              <label>Tipo</label>
              <select name="tipo" value={form.tipo} onChange={onChange}>
                <option value="estandar">Estándar</option>
                <option value="promocion">Promoción</option>
                <option value="descuento">Descuento</option>
              </select>
            </div>
            {error && <p className="error">{error}</p>}
            
            <button className="btn" type="submit">
              {editandoId ? 'Actualizar tarifa' : 'Guardar tarifa'}
            </button>

            {editandoId && (
              <button 
                className="btn" 
                type="button" 
                onClick={cancelarEdicion}
                style={{ backgroundColor: '#444', marginTop: '8px' }}
              >
                Cancelar
              </button>
            )}
          </form>
        </div>
      </section>
    </>
  );
}