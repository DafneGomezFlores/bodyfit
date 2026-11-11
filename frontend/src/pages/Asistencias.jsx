import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Asistencias() {
  const [ci, setCi] = useState('');
  const [asistencias, setAsistencias] = useState([]);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Cargar asistencias al montar el componente
  const cargarAsistencias = async () => {
    try {
      const res = await axios.get('http://localhost:3000/asistencias');
      setAsistencias(res.data);
    } catch (err) {
      console.error('Error al cargar asistencias:', err);
    }
  };

  useEffect(() => {
    cargarAsistencias();
  }, []);

  // Registrar asistencia por CI
  const handleRegistrar = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!ci.trim()) {
      setError('Por favor ingrese o escanee un número de carnet.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/asistencias/registrar', {
        ci: ci.trim(),
      });
      
      setExito(`¡Acceso permitido para ${res.data.usuario?.nombreCompleto || 'Cliente'}!`);
      setCi('');
      cargarAsistencias(); // Recargar la tabla
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error al registrar la asistencia.';
      setError(mensaje);
    }
  };

  return (
    <div style={{ padding: '30px', color: '#fff', backgroundColor: '#121212', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Control de Asistencias - GymBodyFit
      </h2>

      {/* FORMULARIO DE REGISTRO */}
      <form onSubmit={handleRegistrar} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Escanee o digite el CI / Carnet..."
          value={ci}
          onChange={(e) => setCi(e.target.value)}
          autoFocus
          style={{
            flex: 1,
            padding: '12px 15px',
            backgroundColor: '#1e1e1e',
            border: '1px solid #444',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '16px',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 25px',
            backgroundColor: '#0066ff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '15px',
          }}
        >
          Registrar
        </button>
      </form>

      {/* MENSAJES DE ERROR O EXITO */}
      {error && (
        <div style={{ backgroundColor: '#7f1d1d', border: '1px solid #dc2626', color: '#fca5a5', padding: '12px 15px', borderRadius: '6px', marginBottom: '20px', fontWeight: '500' }}>
          {error}
        </div>
      )}

      {exito && (
        <div style={{ backgroundColor: '#14532d', border: '1px solid #16a34a', color: '#86efac', padding: '12px 15px', borderRadius: '6px', marginBottom: '20px', fontWeight: '500' }}>
          {exito}
        </div>
      )}

      {/* TABLA DE ASISTENCIAS RECIENTES */}
      <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#ccc' }}>Asistencias Recientes</h3>
      
      <div style={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #27272a', color: '#a1a1aa', fontSize: '13px', backgroundColor: '#1f1f23' }}>
              <th style={{ padding: '12px 15px' }}>Hora</th>
              <th style={{ padding: '12px 15px' }}>Cliente</th>
              <th style={{ padding: '12px 15px' }}>CI / Carnet</th>
              <th style={{ padding: '12px 15px' }}>Tipo de Acceso / Estado</th>
            </tr>
          </thead>
          <tbody>
            {asistencias.length > 0 ? (
              asistencias.map((a) => {
                const estadoMembresia = a.membresia?.estado ? a.membresia.estado.toLowerCase() : 'activa';
                const esPermiso = a.tipoAcceso === 'permiso';

                let colorBadge = '#16a34a'; // Verde
                let textoBadge = 'MEMBRESÍA ACTIVA';

                if (esPermiso) {
                  colorBadge = '#3b82f6'; // Azul
                  textoBadge = 'PERMISO VIGENTE';
                } else if (estadoMembresia === 'por_vencer' || estadoMembresia === 'por vencer') {
                  colorBadge = '#eab308'; // Amarillo
                  textoBadge = 'POR VENCER';
                } else if (estadoMembresia === 'vencida' || estadoMembresia === 'vencidos') {
                  colorBadge = '#dc2626'; // Rojo
                  textoBadge = 'VENCIDA';
                }

                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #27272a' }}>
                    <td style={{ padding: '12px 15px', fontFamily: 'monospace' }}>
                      {new Date(a.fechaHora).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '12px 15px', fontWeight: '500', color: '#fff' }}>
                      {a.usuario?.nombreCompleto || 'Desconocido'}
                    </td>
                    <td style={{ padding: '12px 15px', fontFamily: 'monospace' }}>
                      {a.usuario?.ci || 'S/N'}
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      <span style={{ 
                        backgroundColor: colorBadge, 
                        color: '#fff', 
                        padding: '4px 10px', 
                        borderRadius: '4px', 
                        fontSize: '11px', 
                        fontWeight: 'bold',
                        display: 'inline-block'
                      }}>
                        {textoBadge}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#71717a' }}>
                  No hay registros de asistencia aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}