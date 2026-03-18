import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import NuevoEmbarque from './pages/NuevoEmbarque';
import Clientes from './pages/Clientes';
import Transportistas from './pages/Transportistas';

function App() {
  return (
    // BrowserRouter envuelve toda la app para habilitar el sistema de rutas
    <BrowserRouter>
      {/* El Navbar queda fuera de <Routes> para que siempre esté visible arriba */}
      <Navbar />
      
      <div style={{ padding: '20px' }}>
        <Routes>
          {/* Definimos qué componente se carga en cada URL */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/nuevo-embarque" element={<NuevoEmbarque />} />
          <Route path="/transportistas" element={<Transportistas />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;