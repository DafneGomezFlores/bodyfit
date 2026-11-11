import { useEffect, useState, useRef } from 'react';

export default function Membresias() {
  const [membresias, setMembresias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [busquedaMembresia, setBusquedaMembresia] = useState('');
  const [membresiaEditando, setMembresiaEditando] = useState(null);

  const [busquedaClienteInput, setBusquedaClienteInput] = useState('');
  const [usuarioIdSeleccionado, setUsuarioIdSeleccionado] = useState('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const [promocionId, setPromocionId] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState('');
  const [montoPagado, setMontoPagado] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');

  const wrapperRef = useRef(null);

  useEffect(() => {
    cargarMembresias();
    cargarClientes();
    cargarTarifas();

    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMostrarSugerencias(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cargarMembresias = async () => {
    try {
      const res = await fetch('http://localhost:3000/membresias');
      const data = await res.json();
      setMembresias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar membresías', err);
    }
  };

  const cargarClientes = async () => {
    try {
      const res = await fetch('http://localhost:3000/usuarios');
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      console.error('Error al cargar clientes', err);
    }
  };

  const cargarTarifas = async () => {
    try {
      const res = await fetch('http://localhost:3000/tarifas');
      const data = await res.json();
      setTarifas(Array.isArray(data) ? data : (data?.data || data?.tarifas || []));
    } catch (err) {
      console.error('Error al cargar tarifas', err);
    }
  };

  const clientesSugeridos = clientes.filter(c => {
    if (!busquedaClienteInput.trim()) return false;
    const nombre = String(c.nombreCompleto || c.nombre || '').toLowerCase();
    const ci = String(c.ci || c.carnet || '').toLowerCase();
    const query = busquedaClienteInput.toLowerCase().trim();
    return nombre.includes(query) || ci.includes(query);
  });

  const handleSeleccionarCliente = (c) => {
    setUsuarioIdSeleccionado(c.id);
    const nombreCompleto = c.nombreCompleto || c.nombre || '';
    const ciCliente = c.ci || c.carnet || '';
    setBusquedaClienteInput(`${nombreCompleto} (CI: ${ciCliente})`);
    setMostrarSugerencias(false);
  };

  const handleTarifaChange = (e) => {
    const tId = e.target.value;
    setPromocionId(tId);
    const tarifaEncontrada = tarifas.find(t => String(t.id || t.tarifaId) === String(tId));
    if (tarifaEncontrada) {
      const precio = tarifaEncontrada.precio ?? tarifaEncontrada.monto ?? 0;
      setMontoPagado(precio);
      
      const dias = tarifaEncontrada.dias || tarifaEncontrada.duracionDias || tarifaEncontrada.duracion || 30;
      if (fechaInicio) {
        const [y, m, d] = fechaInicio.split('-').map(Number);
        const fechaF = new Date(y, m - 1, d);
        fechaF.setDate(fechaF.getDate() + Number(dias));
        setFechaFin(fechaF.toISOString().split('T')[0]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuarioIdSeleccionado) {
      alert('Por favor selecciona un cliente de la lista desplegable.');
      return;
    }

    try {
      // SIEMPRE USAMOS POST (CREATE) PARA QUE EL BACKEND APLIQUE LA REGLA DE LOS 5 DÍAS,
      // ACTUALICE LA VIGENTE SI ES CORRECCIÓN O CREE UNA NUEVA SI ES RENOVACIÓN MENSUAL REAL.
      const url = 'http://localhost:3000/membresias';
      const method = 'POST';

      const payload = {
        usuarioId: Number(usuarioIdSeleccionado),
        montoPagado: Number(montoPagado),
        fechaInicio,
        fechaFin,
        metodoPago,
        promocionId: promocionId ? Number(promocionId) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        limpiarFormulario();
        cargarMembresias();
      } else {
        alert('Error al guardar la membresía');
      }
    } catch (err) {
      console.error('Error al procesar membresía', err);
    }
  };

  const handleEditarClick = (m) => {
    setMembresiaEditando(m);
    const uId = m.usuario?.id || m.usuarioId || '';
    setUsuarioIdSeleccionado(uId);
    
    const nombre = m.usuario?.nombreCompleto || m.usuario?.nombre || '';
    const ci = m.usuario?.ci || m.usuario?.carnet || '';
    setBusquedaClienteInput(nombre ? `${nombre} (CI: ${ci})` : '');
    
    const tId = m.promocion?.id || m.promocionId || '';
    setPromocionId(tId);

    setMontoPagado(m.montoPagado || '');
    setFechaInicio(m.fechaInicio ? m.fechaInicio.split('T')[0] : '');
    setFechaFin(m.fechaFin ? m.fechaFin.split('T')[0] : '');
    setMetodoPago(m.metodoPago || 'EFECTIVO');
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta membresía?')) return;
    try {
      const res = await fetch(`http://localhost:3000/membresias/${id}`, { method: 'DELETE' });
      if (res.ok) {
        cargarMembresias();
        if (membresiaEditando?.id === id) limpiarFormulario();
      }
    } catch (err) {
      console.error('Error al eliminar membresía', err);
    }
  };

  const limpiarFormulario = () => {
    setMembresiaEditando(null);
    setBusquedaClienteInput('');
    setUsuarioIdSeleccionado('');
    setMostrarSugerencias(false);
    setPromocionId('');
    setMontoPagado('');
    setFechaInicio(new Date().toISOString().split('T')[0]);
    setFechaFin('');
    setMetodoPago('EFECTIVO');
  };

  const membresiasFiltradas = membresias.filter(m => {
    const texto = `${m.usuario?.nombreCompleto || m.usuario?.nombre || ''} ${m.usuario?.ci || ''} ${m.usuario?.carnet || ''}`.toLowerCase();
    return texto.includes(busquedaMembresia.toLowerCase());
  });

  return (
    <div style={{ padding: '20px', color: '#fff', display: 'flex', gap: '20px' }}>
      
      <div style={{ flex: 2, background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
        <h2>Membresías</h2>
        <p style={{ color: '#888', fontSize: '13px' }} className="mono">Inscripción y renovación para clientes registrados</p>

        <div style={{ margin: '15px 0' }}>
          <input 
            type="text"
            placeholder="Buscar por cliente o N° de carnet..."
            value={busquedaMembresia}
            onChange={(e) => setBusquedaMembresia(e.target.value)}
            style={{
              width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444',
              borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none'
            }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #444', color: '#aaa' }}>
              <th style={{ padding: '10px' }}>Cliente (CI)</th>
              <th style={{ padding: '10px' }}>Tarifa / Nombre</th>
              <th style={{ padding: '10px' }}>Vencimiento</th>
              <th style={{ padding: '10px' }}>Monto</th>
              <th style={{ padding: '10px' }}>Pago</th>
              <th style={{ padding: '10px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {membresiasFiltradas.length > 0 ? (
              membresiasFiltradas.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <td style={{ padding: '10px' }}>
                    <div>{m.usuario?.nombreCompleto || m.usuario?.nombre || `Cliente #${m.usuarioId}`}</div>
                    <div style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>CI: {m.usuario?.ci || m.usuario?.carnet || 'S/N'}</div>
                  </td>
                  <td style={{ padding: '10px', color: '#60a5fa', fontWeight: '500' }}>
                    {m.nombreTarifa}
                  </td>
                  <td style={{ padding: '10px', fontFamily: 'monospace', color: '#facc15' }}>{m.fechaFin ? m.fechaFin.split('T')[0] : ''}</td>
                  <td style={{ padding: '10px', color: '#4ade80', fontWeight: 'bold' }} className="mono">Bs {m.montoPagado}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ background: '#2a2a2a', color: '#16a34a', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                      {m.metodoPago || 'EFECTIVO'}
                    </span>
                  </td>
                  <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => handleEditarClick(m)}
                      style={{ background: '#d97706', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleEliminar(m.id)}
                      style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  No se encontró ninguna membresía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ flex: 1, background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', height: 'fit-content' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: membresiaEditando ? '#60a5fa' : '#ea580c' }}>
          {membresiaEditando ? 'EDITAR MEMBRESÍA' : 'NUEVA INSCRIPCIÓN / RENOVACIÓN'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ position: 'relative' }} ref={wrapperRef}>
            <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '5px' }}>Buscar Cliente (Nombre o Carnet)</label>
            <input 
              type="text" 
              value={busquedaClienteInput} 
              onChange={(e) => {
                setBusquedaClienteInput(e.target.value);
                setMostrarSugerencias(true);
                if (!e.target.value.trim()) setUsuarioIdSeleccionado('');
              }}
              onFocus={() => setMostrarSugerencias(true)}
              placeholder="Escribe nombre o carnet..."
              style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '6px', color: '#fff', outline: 'none' }}
              required
            />

            {mostrarSugerencias && clientesSugeridos.length > 0 && (
              <ul style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                background: '#252525', border: '1px solid #555', borderRadius: '6px',
                listStyle: 'none', margin: '4px 0 0 0', padding: 0, maxHeight: '160px', overflowY: 'auto'
              }}>
                {clientesSugeridos.map(c => (
                  <li 
                    key={c.id}
                    onClick={() => handleSeleccionarCliente(c)}
                    style={{
                      padding: '10px', borderBottom: '1px solid #333', cursor: 'pointer', fontSize: '13px', color: '#fff',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <strong>{c.nombreCompleto || c.nombre}</strong> (CI: {c.ci || c.carnet})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '5px' }}>Tarifa / Promoción (Nombre)</label>
            <select 
              value={promocionId} 
              onChange={handleTarifaChange}
              style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '6px', color: '#fff', outline: 'none' }}
              required
            >
              <option value="">Seleccionar tarifa...</option>
              {tarifas.map(t => {
                const idTarifa = t.id || t.tarifaId;
                const nombreTarifa = t.nombre || t.descripcion || t.titulo || t.tipo || 'Tarifa sin nombre';
                const precioTarifa = t.precio ?? t.monto ?? 0;
                return (
                  <option key={idTarifa} value={idTarifa}>
                    {nombreTarifa} (Bs {precioTarifa})
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '5px' }}>Fecha Inicio</label>
              <input 
                type="date" 
                value={fechaInicio} 
                onChange={(e) => setFechaInicio(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '6px', color: '#fff', outline: 'none' }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '5px' }}>Vencimiento</label>
              <input 
                type="date" 
                value={fechaFin} 
                onChange={(e) => setFechaFin(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '6px', color: '#fff', outline: 'none' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '5px' }}>Monto Pagado (Bs)</label>
            <input 
              type="number" 
              value={montoPagado} 
              onChange={(e) => setMontoPagado(e.target.value)}
              placeholder="0.00"
              style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '6px', color: '#fff', outline: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '5px' }}>Método de Pago</label>
            <select 
              value={metodoPago} 
              onChange={(e) => setMetodoPago(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '6px', color: '#fff', outline: 'none' }}
            >
              <option value="EFECTIVO">Efectivo (Bs)</option>
              <option value="QR">QR</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              type="submit"
              style={{ flex: 1, padding: '10px', background: membresiaEditando ? '#ea580c' : '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {membresiaEditando ? 'Actualizar Cambios' : 'Registrar Membresía'}
            </button>
            {membresiaEditando && (
              <button 
                type="button"
                onClick={limpiarFormulario}
                style={{ padding: '10px 15px', background: '#333', color: '#aaa', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

    </div>
  );
}