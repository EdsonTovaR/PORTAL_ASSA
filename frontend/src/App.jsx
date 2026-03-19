import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import NuevoEmbarque from './pages/NuevoEmbarque';
import Clientes from './pages/Clientes';
import Transportistas from './pages/Transportistas';
import Login from './pages/Login';

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
    <>
      <Navbar /> {/* El Navbar solo se muestra si ya inició sesión */}
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;