import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Clientes from './pages/Clientes.jsx';
import Membresias from './pages/Membresias.jsx';
import Tarifas from './pages/Tarifas.jsx';
import PasesDiarios from './pages/PasesDiarios.jsx';
import Permisos from './pages/Permisos.jsx';
import Asistencias from './pages/Asistencias.jsx'; // 👈 1. Importando desde pages/Asistencias.jsx

export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/membresias" element={<Membresias />} />
          <Route path="/tarifas" element={<Tarifas />} />
          <Route path="/pases-diarios" element={<PasesDiarios />} />
          <Route path="/permisos" element={<Permisos />} />
          <Route path="/asistencias" element={<Asistencias />} /> {/* 👈 2. Usando el componente aquí */}
        </Routes>
      </main>
    </div>
  );
}
