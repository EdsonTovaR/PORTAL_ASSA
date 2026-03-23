import { useState, useEffect } from 'react';
import { getTransportistas, crearTransportista, actualizarTransportista } from '../services/api';

const Transportistas = () => {
  const [transportistas, setTransportistas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // --- ESTADOS UNIFICADOS PARA LA MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transpEditando, setTranspEditando] = useState({ 
    id: null, 
    linea_transportista: '', 
    nombre_chofer: '', 
    placas: '' 
  });

  // --- CARGA INICIAL DE DATOS ---
  const cargarTransportistas = async () => {
    try {
      const data = await getTransportistas();
      setTransportistas(data);
    } catch (error) {
      console.error("Error al cargar transportistas:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTransportistas();
  }, []);

  // --- FUNCIONES CONTROLADORAS DE LA MODAL ---
  // Abre la ventana con datos (Para EDITAR)
  const abrirModalParaEditar = (transp) => {
    setTranspEditando(transp);
    setIsModalOpen(true);
  };

  // Abre la ventana en blanco (Para CREAR)
  const abrirModalParaCrear = () => {
    setTranspEditando({ id: null, linea_transportista: '', nombre_chofer: '', placas: '' });
    setIsModalOpen(true);
  };

  // Cierra y limpia la memoria
  const cerrarModal = () => {
    setIsModalOpen(false);
    setTranspEditando({ id: null, linea_transportista: '', nombre_chofer: '', placas: '' });
  };

  const [busqueda, setBusqueda] = useState('');

  // --- EL SÚPER CONTROLADOR DE GUARDADO (POST / PUT) ---
  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (transpEditando.id) {
        // --- MODO ACTUALIZAR (PUT) ---
        await actualizarTransportista(transpEditando.id, {
          linea_transportista: transpEditando.linea_transportista,
          nombre_chofer: transpEditando.nombre_chofer,
          placas: transpEditando.placas
        });
        
        // Actualización Optimista en la tabla
        setTransportistas(transportistas.map(t => t.id === transpEditando.id ? transpEditando : t));
        alert("¡Transportista actualizado con éxito!");
      
      } else {
        // --- MODO CREAR (POST) ---
        const nuevoTransp = await crearTransportista({
          linea_transportista: transpEditando.linea_transportista,
          nombre_chofer: transpEditando.nombre_chofer,
          placas: transpEditando.placas
        });
        
        // Agregamos el nuevo registro a la tabla en pantalla
        setTransportistas([...transportistas, nuevoTransp]);
        alert("¡Transportista registrado exitosamente!");
      }
      
      cerrarModal(); // Desaparecemos el cuadrito
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar los cambios.");
    }
  };

  const transportistasFiltrados = transportistas.filter(transp => 
    transp.linea_transportista.toLowerCase().includes(busqueda.toLowerCase()) ||
    transp.nombre_chofer.toLowerCase().includes(busqueda.toLowerCase()) ||
    transp.placas.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto mt-8 mb-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-white">Líneas Transportistas</h2>
        
        <div className="flex w-full md:w-auto gap-4">
          <input 
            type="text" 
            placeholder="🔍 Buscar línea, chofer o placas..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full md:w-72 p-2.5 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
          />
          
          <button onClick={abrirModalParaCrear} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap shadow-lg shadow-blue-900/50">
            + Nuevo Transportista
          </button>
        </div>
      </div>
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/80 text-gray-400 text-sm uppercase tracking-wider border-b border-gray-700">
                <th className="p-4 font-semibold w-16">ID</th>
                <th className="p-4 font-semibold">Línea Transportista</th>
                <th className="p-4 font-semibold">Nombre del Chofer</th>
                <th className="p-4 font-semibold">Placas</th>
                <th className="p-4 font-semibold text-center w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
        {/* Usamos transportistasFiltrados */}
        {transportistasFiltrados.map((transp) => (
                <tr key={transp.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 text-gray-500 font-mono">#{transp.id}</td>
                  <td className="p-4 text-white font-medium">{transp.linea_transportista}</td>
                  <td className="p-4 text-gray-300">{transp.nombre_chofer}</td>
                  <td className="p-4 text-orange-400 font-mono border border-orange-900/50 bg-orange-900/10 rounded px-2 py-1 inline-block mt-3 ml-4">
                    {transp.placas}
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => abrirModalParaEditar(transp)} className="text-gray-400 hover:text-blue-400 transition-colors p-1" title="Editar">
                    ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {transportistas.length === 0 && !cargando && (
          <div className="p-8 text-center text-gray-500 font-medium">
            No hay transportistas registrados en la base de datos.
          </div>
        )}
      </div>

      {/* --- VENTANA MODAL FLOTANTE (TRANSPORTISTAS) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center backdrop-blur-sm">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
            {/* Título dinámico */}
            <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
              {transpEditando.id ? 'Editar Transportista' : 'Nuevo Transportista'}
            </h3>

            {/* Formulario conectado al Súper Controlador */}
            <form onSubmit={handleGuardar} className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 block mb-2 text-sm font-medium">Línea Transportista</label>
                <input type="text" value={transpEditando.linea_transportista} onChange={(e) => setTranspEditando({...transpEditando, linea_transportista: e.target.value})} required className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-gray-400 block mb-2 text-sm font-medium">Nombre del Chofer</label>
                <input type="text" value={transpEditando.nombre_chofer} onChange={(e) => setTranspEditando({...transpEditando, nombre_chofer: e.target.value})} required className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-gray-400 block mb-2 text-sm font-medium">Placas</label>
                <input type="text" value={transpEditando.placas} onChange={(e) => setTranspEditando({...transpEditando, placas: e.target.value})} required className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-orange-400" />
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={cerrarModal} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded font-medium transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-colors shadow-lg shadow-blue-900/50">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transportistas;