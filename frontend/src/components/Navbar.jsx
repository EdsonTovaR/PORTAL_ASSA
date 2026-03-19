import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate(); // Herramienta para mover al usuario

  const handleCerrarSesion = () => {
    // 1. Destruimos el gafete (Token) eliminándolo de la caja fuerte
    localStorage.removeItem('token');
    
    // 2. Lo mandamos de regreso a la pantalla de Login
    navigate('/login');
  };

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
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Dashboard</Link>
        <Link to="/clientes" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Catálogo Clientes</Link>
        <Link to="/transportistas" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Transportistas</Link>
        <Link to="/nuevo-embarque" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>+ Nuevo Embarque</Link>
        
        {/* --- BOTÓN DE CERRAR SESIÓN --- */}
        <button 
          onClick={handleCerrarSesion} 
          style={{ 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            padding: '8px 15px', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            marginLeft: '15px' 
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;