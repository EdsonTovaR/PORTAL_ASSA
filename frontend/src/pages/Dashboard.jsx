import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEstadisticas } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totales: { clientes: 0, transportistas: 0, embarques: 0 },
    actividad_reciente: []
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await getEstadisticas();
        setStats(data);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  if (cargando) {
    return <div className="text-white text-center mt-20 text-xl font-bold animate-pulse">Cargando Centro de Control...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 mb-12">
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white tracking-wide">Centro de Control</h1>
        <p className="text-gray-400 mt-2 text-lg">Resumen de operaciones logísticas en tiempo real.</p>
      </div>

      {/* --- TARJETAS DE INDICADORES (KPIs) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Tarjeta 1: Embarques */}
        <div className="bg-gradient-to-br from-blue-900 to-gray-800 p-6 rounded-2xl shadow-xl border border-blue-800/50 transform hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-300 font-semibold mb-1 uppercase tracking-wider text-sm">Total de Embarques</p>
              <h3 className="text-5xl font-bold text-white">{stats.totales.embarques}</h3>
            </div>
            <div className="text-4xl">📦</div>
          </div>
          <div className="mt-4">
            <Link to="/nuevo-embarque" className="text-sm text-blue-400 hover:text-white font-medium flex items-center gap-1 transition-colors">
              Generar nuevo VDA <span>→</span>
            </Link>
          </div>
        </div>

        {/* Tarjeta 2: Clientes */}
        <div className="bg-gradient-to-br from-emerald-900 to-gray-800 p-6 rounded-2xl shadow-xl border border-emerald-800/50 transform hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-300 font-semibold mb-1 uppercase tracking-wider text-sm">Clientes Activos</p>
              <h3 className="text-5xl font-bold text-white">{stats.totales.clientes}</h3>
            </div>
            <div className="text-4xl">🏭</div>
          </div>
          <div className="mt-4">
            <Link to="/clientes" className="text-sm text-emerald-400 hover:text-white font-medium flex items-center gap-1 transition-colors">
              Gestionar catálogo <span>→</span>
            </Link>
          </div>
        </div>

        {/* Tarjeta 3: Transportistas */}
        <div className="bg-gradient-to-br from-orange-900 to-gray-800 p-6 rounded-2xl shadow-xl border border-orange-800/50 transform hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-300 font-semibold mb-1 uppercase tracking-wider text-sm">Transportistas</p>
              <h3 className="text-5xl font-bold text-white">{stats.totales.transportistas}</h3>
            </div>
            <div className="text-4xl">🚛</div>
          </div>
          <div className="mt-4">
            <Link to="/transportistas" className="text-sm text-orange-400 hover:text-white font-medium flex items-center gap-1 transition-colors">
              Ver unidades <span>→</span>
            </Link>
          </div>
        </div>

      </div>

      {/* --- SECCIÓN DE ACTIVIDAD RECIENTE --- */}
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700 bg-gray-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            ⏱️ Últimos 5 Embarques Generados
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800 text-gray-400 text-sm uppercase tracking-wider border-b border-gray-700">
                <th className="p-4 font-semibold">Folio Interno</th>
                <th className="p-4 font-semibold">Fecha de Salida</th>
                <th className="p-4 font-semibold">ID Destino</th>
                <th className="p-4 font-semibold text-center">Estado del Sistema</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {stats.actividad_reciente.map((embarque) => (
                <tr key={embarque.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 text-blue-400 font-mono font-bold">{embarque.folio_embarque}</td>
                  <td className="p-4 text-gray-300">
                    {new Date(embarque.fecha_salida).toLocaleString('es-MX')}
                  </td>
                  <td className="p-4 text-gray-400 font-mono">Cliente #{embarque.cliente_id}</td>
                  <td className="p-4 text-center">
                    <span className="bg-green-900/50 text-green-400 border border-green-800/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      VDA Listo
                    </span>
                  </td>
                </tr>
              ))}
              {stats.actividad_reciente.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">
                    Aún no hay actividad registrada en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;