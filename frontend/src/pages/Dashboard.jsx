import { useEffect, useState } from 'react';
import { getMembresias, getTarifas } from '../api/client.js';

export default function Dashboard() {
  const [membresias, setMembresias] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [pasesDiarios, setPasesDiarios] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('por_vencer');

  // Estados para el modal de tarifas
  const [tarifaSeleccionada, setTarifaSeleccionada] = useState(null);
  const [clientesTarifa, setClientesTarifa] = useState([]);
  const [modalTarifaAbierto, setModalTarifaAbierto] = useState(false);
  const [busquedaCarnet, setBusquedaCarnet] = useState('');

  // Estados para el Arqueo / Caja por Fechas (Discreto)
  const hoyStr = new Date().toISOString().split('T')[0];
  const [fechaInicioCaja, setFechaInicioCaja] = useState(hoyStr);
  const [fechaFinCaja, setFechaFinCaja] = useState(hoyStr);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const mRes = await getMembresias().catch(() => []);
        const mList = Array.isArray(mRes) ? mRes : (mRes?.data || mRes?.membresias || []);
        setMembresias(mList);

        const tRes = getTarifas ? await getTarifas().catch(() => []) : [];
        const tList = Array.isArray(tRes) ? tRes : (tRes?.data || tRes?.tarifas || tRes?.results || []);
        setTarifas(tList);

        const pRes = await fetch('http://localhost:3000/pases-diarios').then(r => r.json()).catch(() => []);
        const pList = Array.isArray(pRes) ? pRes : (pRes?.data || pRes?.pases || []);
        setPasesDiarios(pList);
      } catch (err) {
        console.error('Error al cargar el dashboard', err);
      }
    }
    cargarDatos();
  }, []);

  const handleTarifaClick = async (t) => {
    setTarifaSeleccionada(t);
    setBusquedaCarnet('');
    const tarifaId = t.id || t.tarifaId || t._id;
    try {
      const res = await fetch(`http://localhost:3000/membresias/por-tarifa/${tarifaId}`);
      const data = await res.json();
      setClientesTarifa(Array.isArray(data) ? data : []);
      setModalTarifaAbierto(true);
    } catch (err) {
      console.error('Error al obtener clientes de la tarifa', err);
    }
  };

  const alDiaList = membresias.filter(m => m.estado === 'activa');
  const porVencerList = membresias.filter(m => m.estado === 'por_vencer');
  const vencidasList = membresias.filter(m => m.estado === 'vencida' || m.estado === 'vencidos');

  const listaMostrada = 
    filtroEstado === 'activa' ? alDiaList :
    filtroEstado === 'por_vencer' ? porVencerList : vencidasList;

  const clientesFiltradosModal = clientesTarifa.filter(m => {
    const ciCliente = String(m.usuario?.ci || m.usuario?.carnet || '');
    return ciCliente.toLowerCase().includes(busquedaCarnet.toLowerCase());
  });

  const precioTarifaActual = tarifaSeleccionada?.precio ?? tarifaSeleccionada?.monto ?? 0;

  // --- CÁLCULO PARA EL ARQUEO DE CAJA CON DESGLOSE EFECTIVO / QR ---
  const membresiasEnRango = membresias.filter(m => {
    const fechaRaw = m.createdAt || m.fechaCreacion || m.fechaInicio;
    if (!fechaRaw) return false;
    const f = String(fechaRaw).split('T')[0];
    return f >= fechaInicioCaja && f <= fechaFinCaja;
  });

  const pasesEnRango = pasesDiarios.filter(p => {
    const fechaRaw = p.createdAt || p.fecha || p.fechaRegistro;
    if (!fechaRaw) return false;
    const f = String(fechaRaw).split('T')[0];
    return f >= fechaInicioCaja && f <= fechaFinCaja;
  });

  const efectivoMembresias = membresiasEnRango.filter(m => (m.metodoPago || m.pago || 'EFECTIVO').toUpperCase() === 'EFECTIVO').reduce((acc, m) => acc + Number(m.montoPagado || m.precio || 0), 0);
  const qrMembresias = membresiasEnRango.filter(m => (m.metodoPago || m.pago || '').toUpperCase() === 'QR').reduce((acc, m) => acc + Number(m.montoPagado || m.precio || 0), 0);

  const efectivoPases = pasesEnRango.filter(p => (p.metodoPago || 'EFECTIVO').toUpperCase() === 'EFECTIVO').reduce((acc, p) => acc + Number(p.monto || p.montoPagado || 0), 0);
  const qrPases = pasesEnRango.filter(p => (p.metodoPago || '').toUpperCase() === 'QR').reduce((acc, p) => acc + Number(p.monto || p.montoPagado || 0), 0);

  const totalEfectivo = efectivoMembresias + efectivoPases;
  const totalQR = qrMembresias + qrPases;
  const totalCajaGeneral = totalEfectivo + totalQR;

  return (
    <div style={{ padding: '20px', color: '#fff', position: 'relative' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>Ventana de Inicio</h2>
        <div className="sub mono" style={{ color: '#888' }}>
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* 3 TARJETAS SUPERIORES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
        <div 
          onClick={() => setFiltroEstado('activa')}
          style={{ 
            background: '#1e1e1e', padding: '20px', borderRadius: '8px', 
            border: filtroEstado === 'activa' ? '2px solid #16a34a' : '1px solid #333', 
            cursor: 'pointer' 
          }}
        >
          <h4 style={{ color: '#888', margin: '0 0 10px 0', fontSize: '14px' }}>AL DÍA</h4>
          <p className="mono" style={{ fontSize: '28px', color: '#16a34a', fontWeight: 'bold', margin: 0 }}>
            {alDiaList.length}
          </p>
        </div>

        <div 
          onClick={() => setFiltroEstado('por_vencer')}
          style={{ 
            background: '#1e1e1e', padding: '20px', borderRadius: '8px', 
            border: filtroEstado === 'por_vencer' ? '2px solid #eab308' : '1px solid #333', 
            cursor: 'pointer' 
          }}
        >
          <h4 style={{ color: '#888', margin: '0 0 10px 0', fontSize: '14px' }}>POR VENCER</h4>
          <p className="mono" style={{ fontSize: '28px', color: '#eab308', fontWeight: 'bold', margin: 0 }}>
            {porVencerList.length}
          </p>
        </div>

        <div 
          onClick={() => setFiltroEstado('vencida')}
          style={{ 
            background: '#1e1e1e', padding: '20px', borderRadius: '8px', 
            border: filtroEstado === 'vencida' ? '2px solid #dc2626' : '1px solid #333', 
            cursor: 'pointer' 
          }}
        >
          <h4 style={{ color: '#888', margin: '0 0 10px 0', fontSize: '14px' }}>VENCIDOS</h4>
          <p className="mono" style={{ fontSize: '28px', color: '#dc2626', fontWeight: 'bold', margin: 0 }}>
            {vencidasList.length}
          </p>
        </div>
      </div>

      {/* SECCIÓN INTERACTIVA: CLIENTES SEGÚN ESTADO */}
      <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ textTransform: 'uppercase', margin: 0, fontSize: '16px', letterSpacing: '1px' }}>
            {filtroEstado === 'activa' ? 'Clientes Al Día' : filtroEstado === 'por_vencer' ? 'Clientes Por Vencer' : 'Clientes Vencidos'}
          </h3>
          <span className="count mono" style={{ background: '#2a2a2a', padding: '2px 8px', borderRadius: '4px' }}>
            {listaMostrada.length}
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #444', color: '#aaa', fontSize: '13px' }}>
              <th style={{ padding: '10px' }}>Cliente</th>
              <th style={{ padding: '10px' }}>Carnet / CI</th>
              <th style={{ padding: '10px' }}>Fecha Vencimiento</th>
              <th style={{ padding: '10px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {listaMostrada.length > 0 ? (
              listaMostrada.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <td style={{ padding: '12px 10px' }}>{m.usuario?.nombreCompleto || `Cliente #${m.usuarioId}`}</td>
                  <td style={{ padding: '12px 10px' }} className="mono">{m.usuario?.ci || m.usuario?.carnet || 'S/N'}</td>
                  <td style={{ padding: '12px 10px' }} className="mono">{m.fechaFin ? m.fechaFin.split('T')[0] : ''}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ 
                      backgroundColor: m.estado === 'activa' ? '#16a34a' : m.estado === 'por_vencer' ? '#eab308' : '#dc2626', 
                      color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' 
                    }}>
                      {m.estado.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '25px', color: '#666' }}>
                  No hay clientes en esta categoría.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SECCIÓN DE TARIFAS DISPONIBLES */}
      {tarifas.length > 0 && (
        <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', letterSpacing: '1px' }}>
              TARIFAS DISPONIBLES
            </h3>
            <span style={{ background: '#3d241d', color: '#f97316', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }} className="mono">
              {tarifas.length}
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', color: '#777', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 10px', width: '35%' }}>Nombre</th>
                <th style={{ padding: '12px 10px', width: '25%' }}>Tipo</th>
                <th style={{ padding: '12px 10px', width: '20%' }}>Duración</th>
                <th style={{ padding: '12px 10px', width: '20%' }}>Precio</th>
              </tr>
            </thead>
            <tbody>
              {tarifas.map((t, idx) => {
                const nombreTarifa = t.nombre || t.descripcion || t.titulo || t.name || t.nombreTarifa || 'Tarifa';
                const tipoTarifa = t.tipo || 'promocion';
                const precioTarifa = t.precio ?? t.monto ?? 0;
                let diasTarifa = t.dias ?? t.duracionDias ?? t.duracion ?? 30;

                return (
                  <tr 
                    key={t.id || t.tarifaId || idx} 
                    onClick={() => handleTarifaClick(t)}
                    style={{ borderBottom: '1px solid #2a2a2a', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '16px 10px', fontWeight: '500', color: '#60a5fa' }}>{nombreTarifa}</td>
                    <td style={{ padding: '16px 10px' }}>
                      <span style={{ background: '#2b2b2b', color: '#aaa', padding: '4px 14px', borderRadius: '14px', fontSize: '12px' }} className="mono">
                        {tipoTarifa}
                      </span>
                    </td>
                    <td style={{ padding: '16px 10px', fontWeight: 'bold', color: '#fff' }} className="mono">{diasTarifa} días</td>
                    <td style={{ padding: '16px 10px', color: '#4ade80', fontWeight: 'bold' }} className="mono">Bs {precioTarifa}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SECCIÓN DE ARQUEO DE CAJA DISCRETA (UBICADA AL FINAL) */}
      <div style={{ background: '#161616', padding: '15px 20px', borderRadius: '8px', border: '1px solid #2a2a2a', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#aaa', letterSpacing: '0.5px' }}>CAJA:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#777' }}>Del</span>
            <input 
              type="date" 
              value={fechaInicioCaja} 
              onChange={(e) => setFechaInicioCaja(e.target.value)}
              style={{ padding: '5px 8px', background: '#222', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '13px', outline: 'none' }}
            />
            <span style={{ fontSize: '12px', color: '#777' }}>Al</span>
            <input 
              type="date" 
              value={fechaFinCaja} 
              onChange={(e) => setFechaFinCaja(e.target.value)}
              style={{ padding: '5px 8px', background: '#222', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '13px', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '13px' }}>
          <div>
            <span style={{ color: '#888' }}>Efectivo: </span>
            <span className="mono" style={{ color: '#4ade80', fontWeight: 'bold' }}>Bs {totalEfectivo}</span>
          </div>
          <div>
            <span style={{ color: '#888' }}>QR: </span>
            <span className="mono" style={{ color: '#60a5fa', fontWeight: 'bold' }}>Bs {totalQR}</span>
          </div>
          <div style={{ borderLeft: '1px solid #333', paddingLeft: '15px' }}>
            <span style={{ color: '#aaa' }}>Total: </span>
            <span className="mono" style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>Bs {totalCajaGeneral}</span>
          </div>
        </div>
      </div>

      {/* VENTANA MODAL PARA MOSTRAR CLIENTES DE LA TARIFA SELECCIONADA */}
      {modalTarifaAbierto && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#1e1e1e', padding: '25px', borderRadius: '8px', width: '700px', border: '1px solid #444', maxHeight: '85vh', overflowY: 'auto', color: '#fff' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#60a5fa' }}>
                  {tarifaSeleccionada?.nombre || tarifaSeleccionada?.descripcion || tarifaSeleccionada?.titulo || tarifaSeleccionada?.name || 'Detalle de Tarifa'}
                </h3>
                <p style={{ color: '#4ade80', margin: 0, fontSize: '14px', fontWeight: 'bold' }} className="mono">
                  Precio Oficial: Bs {precioTarifaActual}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Buscar por N° de Carnet (CI) para corroborar pago..." 
                value={busquedaCarnet}
                onChange={(e) => setBusquedaCarnet(e.target.value)}
                style={{
                  flex: 1, padding: '10px', backgroundColor: '#2a2a2a', border: '1px solid #444',
                  borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none'
                }}
              />
              {busquedaCarnet && (
                <button 
                  onClick={() => setBusquedaCarnet('')}
                  style={{ padding: '0 15px', backgroundColor: '#333', color: '#aaa', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Limpiar
                </button>
              )}
            </div>

            {clientesFiltradosModal.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #444', color: '#aaa' }}>
                    <th style={{ padding: '10px' }}>Cliente</th>
                    <th style={{ padding: '10px' }}>Carnet / CI</th>
                    <th style={{ padding: '10px' }}>Monto Pagado</th>
                    <th style={{ padding: '10px' }}>Fecha Vencimiento</th>
                    <th style={{ padding: '10px' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesFiltradosModal.map((m) => {
                    const montoPagado = m.montoPagado ?? 0;
                    const coincidePago = Number(montoPagado) === Number(precioTarifaActual);

                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                        <td style={{ padding: '10px', color: '#fff' }}>{m.usuario?.nombreCompleto || `Cliente #${m.usuarioId}`}</td>
                        <td style={{ padding: '10px', fontFamily: 'monospace' }}>{m.usuario?.ci || m.usuario?.carnet || 'S/N'}</td>
                        <td style={{ padding: '10px', fontFamily: 'monospace' }}>
                          <span style={{ color: coincidePago ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
                            Bs {montoPagado}
                          </span>
                          {!coincidePago && (
                            <span style={{ display: 'block', fontSize: '10px', color: '#f87171' }}>⚠️ Dif. tarifa</span>
                          )}
                        </td>
                        <td style={{ padding: '10px', fontFamily: 'monospace', color: '#facc15' }}>{m.fechaFin ? m.fechaFin.split('T')[0] : ''}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ 
                            backgroundColor: m.estado === 'activa' ? '#16a34a' : m.estado === 'por_vencer' ? '#eab308' : '#dc2626',
                            color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'
                          }}>
                            {m.estado?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#888', textAlign: 'center', padding: '30px' }}>
                {busquedaCarnet ? 'No se encontró ningún cliente con ese número de carnet.' : 'Ningún cliente ha pagado con esta tarifa todavía.'}
              </p>
            )}

            <button 
              onClick={() => setModalTarifaAbierto(false)}
              style={{
                marginTop: '20px', width: '100%', padding: '10px', backgroundColor: '#dc2626',
                color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              Cerrar Ventana
            </button>
          </div>
        </div>
      )}
    </div>
  );
}