import { Outlet, NavLink } from 'react-router-dom';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_1REM = '1rem';

export default function Layout() {
  return (
    <div>
      <nav style={{ padding: STR_1REM, background: '#eee' }}>
        <NavLink to='/' style={{ marginRight: STR_1REM }}>
          Accueil
        </NavLink>
        <NavLink to='/generator' style={{ marginRight: STR_1REM }}>
          Générateur
        </NavLink>
        <NavLink to='/calculator' style={{ marginRight: STR_1REM }}>
          Calculateur ROI
        </NavLink>
        <NavLink to='/dashboard'>Dashboard</NavLink>
      </nav>
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
