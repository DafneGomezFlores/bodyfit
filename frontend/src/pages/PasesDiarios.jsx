import { useEffect, useState } from 'react';

export default function PasesDiarios() {
  const [pases, setPases] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('10');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');

  useEffect(() => {
    cargarPases();
  }, []);

  const cargarPases = async () => {
    try {
      const res = await fetch('http://localhost:3000/pases-diarios');
      const data = await res.json();
      setPases(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      console.error('Error al cargar pases diarios', err);
    }
  };

  const registrarPase = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('Escribe el nombre');
      return;
    }

    try {
      // ENVIAMOS "nombreVisita" TAL COMO LO EXIGE TU BACKEND
      const res = await fetch('http://localhost:3000/pases-diarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreVisita: nombre.trim(),
          monto: Number(monto),
          metodoPago: metodoPago
        })
      });

      if (res.ok) {
        setNombre('');
        setMonto('10');
        setMetodoPago('EFECTIVO');
        cargarPases();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error al registrar: ${Array.isArray(errorData.message) ? errorData.message.join(', ') : (errorData.message || 'Error desconocido')}`);
      }
    } catch (err) {
      console.error('Error de red:', err);
      alert('No se pudo conectar con el servidor');
    }
  };

  const pasesFiltrados = pases.filter(p => {
    const nombrePase = String(p.nombreVisita || p.nombre || '').toLowerCase();
    return nombrePase.includes(busqueda.toLowerCase().trim());
  });

  return (
    <div style={{ padding: '20px', color: '#fff', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      
      {/* FORMULARIO (IZQUIERDA) */}
      <div style={{ flex: 1, background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', minWidth: '300px' }}>
        <h3>Registrar Pase Diario</h3>
        <p style={{ color: '#888', fontSize: '12px', marginBottom: '15px' }} className="mono">Ingreso por sesión de un día</p>
        
        <form onSubmit={registrarPase} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#ccc', display: 'block', marginBottom: '5px' }}>Nombre</label>
            <input 
              type="text"
              placeholder="Ej. Sergio"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#ccc', display: 'block', marginBottom: '5px' }}>Monto (Bs)</label>
            <input 
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#ccc', display: 'block', marginBottom: '5px' }}>Método de Pago</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
            >
              <option value="EFECTIVO">EFECTIVO</option>
              <option value="QR">QR</option>
            </select>
          </div>

          <button 
            type="submit"
            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}
          >
            Registrar Pase
          </button>
        </form>
      </div>

      {/* TABLA Y BUSCADOR (DERECHA) */}
      <div style={{ flex: 2, background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
        <h2>Pases Diarios</h2>
        <p style={{ color: '#888', fontSize: '13px' }} className="mono">Control de ingresos y pases diarios</p>

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

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #444', color: '#aaa' }}>
              <th style={{ padding: '10px' }}>Nombre</th>
              <th style={{ padding: '10px' }}>Fecha / Hora</th>
              <th style={{ padding: '10px' }}>Monto</th>
              <th style={{ padding: '10px' }}>Pago</th>
              <th style={{ padding: '10px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pasesFiltrados.length > 0 ? (
              pasesFiltrados.map((p) => {
                const fechaRaw = p.fechaRegistro || p.createdAt || p.fecha;
                const fechaFormateada = fechaRaw ? String(fechaRaw).replace('T', ' ').substring(0, 16) : 'N/A';

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                    <td style={{ padding: '10px', fontWeight: '500' }}>
                      {p.nombreVisita || p.nombre || 'Sin Nombre'}
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', color: '#facc15' }}>
                      {fechaFormateada}
                    </td>
                    <td style={{ padding: '10px', color: '#4ade80', fontWeight: 'bold' }} className="mono">
                      Bs {p.monto || 0}
                    </td>
                    <td style={{ padding: '10px', fontSize: '12px', color: '#aaa' }}>
                      {p.metodoPago || 'EFECTIVO'}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button 
                        onClick={async () => {
                          if (window.confirm('¿Eliminar este pase diario?')) {
                            await fetch(`http://localhost:3000/pases-diarios/${p.id}`, { method: 'DELETE' });
                            cargarPases();
                          }
                        }}
                        style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  No se encontró ningún pase diario.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}