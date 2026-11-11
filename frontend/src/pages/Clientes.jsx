import { useEffect, useState } from 'react';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [clienteEditando, setClienteEditando] = useState(null);
  
  // Campos para el formulario (Sirve tanto para Registrar como para Editar)
  const [nombre, setNombre] = useState('');
  const [ci, setCi] = useState('');
  const [telefono, setTelefono] = useState('');

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const res = await fetch('http://localhost:3000/usuarios');
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      console.error('Error al cargar clientes', err);
    }
  };

  // Guardar (Crear nuevo o Actualizar si se está editando)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = clienteEditando 
        ? `http://localhost:3000/usuarios/${clienteEditando.id}` 
        : 'http://localhost:3000/usuarios';
      
      const method = clienteEditando ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreCompleto: nombre, ci, telefono })
      });

      if (res.ok) {
        setNombre('');
        setCi('');
        setTelefono('');
        setClienteEditando(null);
        cargarClientes();
      } else {
        alert('Error al guardar el cliente');
      }
    } catch (err) {
      console.error('Error al procesar cliente', err);
    }
  };

  const handleEditarClick = (c) => {
    setClienteEditando(c);
    setNombre(c.nombreCompleto || c.nombre || '');
    setCi(c.ci || c.carnet || '');
    setTelefono(c.telefono || '');
  };

  const handleCancelarEdicion = () => {
    setClienteEditando(null);
    setNombre('');
    setCi('');
    setTelefono('');
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    try {
      const res = await fetch(`http://localhost:3000/usuarios/${id}`, { method: 'DELETE' });
      if (res.ok) {
        cargarClientes();
        if (clienteEditando?.id === id) handleCancelarEdicion();
      }
    } catch (err) {
      console.error('Error al eliminar cliente', err);
    }
  };

  const clientesFiltrados = clientes.filter(c => {
    const texto = `${c.nombreCompleto || c.nombre || ''} ${c.ci || c.carnet || ''}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div style={{ padding: '20px', color: '#fff', display: 'flex', gap: '20px' }}>
      
      {/* SECCIÓN IZQUIERDA: LISTADO Y BUSCADOR */}
      <div style={{ flex: 2, background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
        <h2>Clientes</h2>
        <p style={{ color: '#888', fontSize: '13px' }} className="mono">tabla: usuario</p>

        <div style={{ margin: '15px 0' }}>
          <input 
            type="text"
            placeholder="Buscar por nombre o carnet (CI)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444',
              borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none'
            }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #444', color: '#aaa' }}>
              <th style={{ padding: '10px' }}>Nombre</th>
              <th style={{ padding: '10px' }}>CI</th>
              <th style={{ padding: '10px' }}>Teléfono</th>
              <th style={{ padding: '10px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length > 0 ? (
              clientesFiltrados.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <td style={{ padding: '10px' }}>{c.nombreCompleto || c.nombre}</td>
                  <td style={{ padding: '10px', fontFamily: 'monospace' }}>{c.ci || c.carnet}</td>
                  <td style={{ padding: '10px', fontFamily: 'monospace' }}>{c.telefono || 'S/N'}</td>
                  <td style={{ padding: '10px', display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleEditarClick(c)}
                      style={{ background: '#d97706', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleEliminar(c.id)}
                      style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  No se encontró ningún cliente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO DINÁMICO (REGISTRAR NUEVO / EDITAR) */}
      <div style={{ flex: 1, background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', height: 'fit-content' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: clienteEditando ? '#60a5fa' : '#ea580c' }}>
          {clienteEditando ? 'EDITAR CLIENTE' : 'REGISTRAR NUEVO CLIENTE'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '5px' }}>Nombre completo</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Juan Pérez"
              style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '6px', color: '#fff', outline: 'none' }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '5px' }}>Carnet de identidad</label>
            <input 
              type="text" 
              value={ci} 
              onChange={(e) => setCi(e.target.value)}
              placeholder="Ej. 1234567"
              style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '6px', color: '#fff', outline: 'none' }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '5px' }}>Teléfono</label>
            <input 
              type="text" 
              value={telefono} 
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej. 70012345"
              style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '6px', color: '#fff', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              type="submit"
              style={{ flex: 1, padding: '10px', background: clienteEditando ? '#ea580c' : '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {clienteEditando ? 'Actualizar cliente' : 'Registrar cliente'}
            </button>
            {clienteEditando && (
              <button 
                type="button"
                onClick={handleCancelarEdicion}
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