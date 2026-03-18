import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{ 
      backgroundColor: '#1a1a1a', 
      padding: '15px 30px', 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '2px solid #333'
    }}>
      <h2 style={{ color: 'white', margin: 0 }}>Portal ASSA</h2>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Usamos Link en lugar de <a> para que React no recargue la página */}
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Dashboard</Link>
        <Link to="/nuevo-embarque" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>+ Nuevo Embarque</Link>
        <Link to="/clientes" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Catálogo Clientes</Link>
        <Link to="/transportistas" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Transportistas</Link>
      </div>
    </nav>
  );
};

export default Navbar;