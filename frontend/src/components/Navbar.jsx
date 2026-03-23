import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    // bg-gray-900 (Fondo oscuro), border-b (Borde inferior sutil para separarlo del contenido)
    <nav className="bg-gray-900 px-8 py-4 flex justify-between items-center border-b border-gray-800 shadow-md">
      
      <h2 className="text-2xl text-white font-bold tracking-wider m-0">
        PORTAL <span className="text-blue-500">ASSA</span>
      </h2>
      
      <div className="flex gap-6 items-center">
        {/* Usamos hover:text-blue-300 para que iluminen al pasar el mouse */}
        <Link to="/" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          Dashboard
        </Link>
        <Link to="/clientes" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          Catálogo Clientes
        </Link>
        <Link to="/historial" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          Historial EDI
        </Link>
        <Link to="/transportistas" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          Transportistas
        </Link>
        
        {/* Resaltamos la acción principal (Nuevo Embarque) dándole un fondo sutil */}
        <Link to="/nuevo-embarque" className="text-white bg-blue-900/30 hover:bg-blue-800/50 px-3 py-1.5 rounded border border-blue-800 font-semibold transition-colors">
          + Nuevo Embarque
        </Link>
        
        <button 
          onClick={handleCerrarSesion} 
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors ml-4 shadow-lg shadow-red-900/20"
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;