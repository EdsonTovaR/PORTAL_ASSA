import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { ConfigContext } from '../context/ConfigContext';



const Navbar = () => {
  const navigate = useNavigate();
  // Extraemos la configuración global
  const { config } = useContext(ConfigContext);
  // Construimos la URL completa de la imagen apuntando al Backend
  const logoUrl = config.logo_url ? `http://localhost:8000${config.logo_url}` : null;

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    // bg-gray-900 (Fondo oscuro), border-b (Borde inferior sutil para separarlo del contenido)
    <nav className="bg-gray-900 px-8 py-4 flex justify-between items-center border-b border-gray-800 shadow-md">
      
      {/* LOGO DINÁMICO */}
     <div className="flex items-center gap-3">
       {logoUrl ? (
         <img src={logoUrl} alt="Logo Empresa" className="h-10 w-auto object-contain rounded" />
       ) : (
         <div className="h-10 w-10 bg-blue-600 rounded flex items-center justify-center font-bold text-white">
           {config.nombre_empresa.charAt(0)}
         </div>
       )}
       <h1 className="text-xl font-bold text-white tracking-widest uppercase">
         {config.nombre_empresa}
       </h1>
     </div>
      
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
        <Link to="/configuracion" className="text-gray-400 hover:text-white font-semibold transition-colors flex items-center gap-1">
   ⚙️ Configuración
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