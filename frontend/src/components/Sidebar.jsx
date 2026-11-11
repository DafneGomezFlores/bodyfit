import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/clientes', label: 'Clientes' },
  { to: '/membresias', label: 'Membresías' },
  { to: '/tarifas', label: 'Tarifas' },
  { to: '/pases-diarios', label: 'Pases diarios' },
  { to: '/permisos', label: 'Permisos' },
  { to: '/asistencias', label: 'Asistencias' }, // 👈 ¡Enlace agregado!
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="mark mono">SISTEMA</div>
        <h1>Gimnasio<span>BodyFit</span></h1>
      </div>
      <nav>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="dot"></span>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-foot mono">SQLite · NestJS · React</div>
    </aside>
  );
}
