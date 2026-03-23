import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import NuevoEmbarque from './pages/NuevoEmbarque';
import Clientes from './pages/Clientes';
import Transportistas from './pages/Transportistas';
import Login from './pages/Login';
import Historial from './pages/Historial';

// --- EL CADENERO DE SEGURIDAD ---
// Este componente envuelve a las páginas que queremos proteger
const RutaProtegida = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Si no hay token, lo pateamos de vuelta al Login
    return <Navigate to="/login" replace />;
  }
  
  // Si hay token, lo dejamos pasar a la página (children)
  return (
    // Envolvemos todo en un div flex que ocupa el 100% del alto (min-h-screen)
    // y le ponemos el fondo oscuro global (bg-gray-900)
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navbar /> 
      {/* El contenedor donde viven tus pantallas */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
};    

function App() {
  return (
    // BrowserRouter envuelve toda la app para habilitar el sistema de rutas
    <BrowserRouter>
      <Routes>
        {/* Ruta pública: Cualquiera puede verla */}
        <Route path="/login" element={<Login />} />

        {/* Rutas Privadas: Protegidas por nuestro "Cadenero" */}
        <Route path="/" element={
          <RutaProtegida><Dashboard /></RutaProtegida>
        } />
        
        <Route path="/nuevo-embarque" element={
          <RutaProtegida><NuevoEmbarque /></RutaProtegida>
        } />
        
        <Route path="/clientes" element={
          <RutaProtegida><Clientes /></RutaProtegida>
        } />
        
        <Route path="/transportistas" element={
          <RutaProtegida><Transportistas /></RutaProtegida>
        } />
        
        <Route path="/historial" element={
          <RutaProtegida><Historial /></RutaProtegida>
        } />
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;