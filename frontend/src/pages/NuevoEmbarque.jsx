import { useState, useEffect } from 'react';
// 1. IMPORTAMOS LAS FUNCIONES DE LOS CATÁLOGOS
import { crearEmbarque, descargarVDA, getClientes, getTransportistas, enviarOftp2 } from '../services/api'; 


const NuevoEmbarque = () => {
  const [embarque, setEmbarque] = useState({
    folio_embarque: '',
    cliente_id: '',
    transportista_id: '',
    fecha_salida: '',
    detalles: [
      { numero_parte: '', cantidad: '', peso_kg: '' }
    ]
  });

  const [embarqueGuardadoId, setEmbarqueGuardadoId] = useState(null);
  
  // 2. NUEVOS ESTADOS PARA LOS MENÚS DESPLEGABLES
  const [listaClientes, setListaClientes] = useState([]);
  const [listaTransportistas, setListaTransportistas] = useState([]);

  // 3. CARGAMOS LOS CATÁLOGOS AL ABRIR LA PANTALLA
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const clientesData = await getClientes();
        const transportistasData = await getTransportistas();
        setListaClientes(clientesData);
        setListaTransportistas(transportistasData);
      } catch (error) {
        console.error("Error al cargar los catálogos:", error);
      }
    };
    cargarCatalogos();
  }, []);

  const handleCabeceraChange = (e) => {
    const { name, value } = e.target;
    setEmbarque((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDetalleChange = (index, e) => {
    const { name, value } = e.target;
    const nuevosDetalles = [...embarque.detalles];
    nuevosDetalles[index][name] = value;
    setEmbarque((prev) => ({ ...prev, detalles: nuevosDetalles }));
  };

  const agregarPieza = () => {
    setEmbarque((prev) => ({
      ...prev,
      detalles: [...prev.detalles, { numero_parte: '', cantidad: '', peso_kg: '' }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      const respuesta = await crearEmbarque(embarque);
      alert(`¡Embarque guardado con éxito!`);
      setEmbarqueGuardadoId(respuesta.id);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar el embarque. Verifica los datos.");
    }
  };

  const handleDescargarVDA = async () => {
    try {
      const textoVDA = await descargarVDA(embarqueGuardadoId);
      const blob = new Blob([textoVDA], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.setAttribute('download', `VDA4913_${embarque.folio_embarque}.txt`);
      document.body.appendChild(enlace);
      enlace.click();
      enlace.parentNode.removeChild(enlace);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error al intentar generar el archivo VDA.");
    }
  };

  const handleEnviarOftp2 = async () => {
    try {
      const respuesta = await enviarOftp2(embarqueGuardadoId);
      alert(`¡Éxito! \n${respuesta.mensaje}`);
    } catch (error) {
      console.error("Error al enviar por OFTP2:", error);
      alert("Error: No se pudo depositar el archivo en la Drop Zone. Revisa tu sesión o los permisos del servidor.");
    }
  };

  return (
    // Contenedor principal: Centrado y con margen superior
    <div className="max-w-4xl mx-auto mt-8 mb-12">
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Nuevo Embarque</h2>
        {embarqueGuardadoId && (
          <span className="bg-green-900/50 text-green-400 px-4 py-1 rounded-full border border-green-800 text-sm font-bold tracking-wide animate-pulse">
            SISTEMA LISTO PARA TRANSMISIÓN
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* --- TARJETA 1: DATOS GENERALES --- */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h3 className="text-xl text-blue-400 font-semibold mb-4 border-b border-gray-700 pb-2">1. Datos del Embarque</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-gray-400 block mb-2 text-sm font-medium">Folio del Embarque</label>
              <input type="text" name="folio_embarque" value={embarque.folio_embarque} onChange={handleCabeceraChange} required disabled={embarqueGuardadoId !== null} 
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50" />
            </div>

            <div>
              <label className="text-gray-400 block mb-2 text-sm font-medium">Fecha y Hora de Salida</label>
              <input type="datetime-local" name="fecha_salida" value={embarque.fecha_salida} onChange={handleCabeceraChange} required disabled={embarqueGuardadoId !== null}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50" />
            </div>

            <div className="md:col-span-2">
              <label className="text-gray-400 block mb-2 text-sm font-medium">Cliente (Destino)</label>
              <select name="cliente_id" value={embarque.cliente_id} onChange={handleCabeceraChange} required disabled={embarqueGuardadoId !== null}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50">
                <option value="">-- Selecciona un Cliente --</option>
                {listaClientes.map(c => <option key={c.id} value={c.id}>{c.nombre_empresa} (Odette: {c.codigo_odette})</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-gray-400 block mb-2 text-sm font-medium">Línea Transportista</label>
              <select name="transportista_id" value={embarque.transportista_id} onChange={handleCabeceraChange} required disabled={embarqueGuardadoId !== null}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50">
                <option value="">-- Selecciona un Transportista --</option>
                {listaTransportistas.map(t => <option key={t.id} value={t.id}>{t.linea_transportista} - Chofer: {t.nombre_chofer} (Placas: {t.placas})</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* --- TARJETA 2: PIEZAS --- */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h3 className="text-xl text-blue-400 font-semibold mb-4 border-b border-gray-700 pb-2">2. Detalle de Material</h3>
          
          <div className="space-y-4">
            {embarque.detalles.map((pieza, index) => (
              <div key={index} className="flex gap-4 items-end bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <div className="text-gray-500 font-bold mb-3">#{index + 1}</div>
                <div className="flex-1">
                  <label className="text-gray-400 block mb-2 text-xs">Número de Parte</label>
                  <input type="text" name="numero_parte" value={pieza.numero_parte} onChange={(e) => handleDetalleChange(index, e)} required disabled={embarqueGuardadoId !== null} placeholder="Ej. PT-001"
                    className="w-full p-2.5 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50" />
                </div>
                <div className="w-1/4">
                  <label className="text-gray-400 block mb-2 text-xs">Cantidad</label>
                  <input type="number" name="cantidad" value={pieza.cantidad} onChange={(e) => handleDetalleChange(index, e)} required disabled={embarqueGuardadoId !== null}
                    className="w-full p-2.5 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50" />
                </div>
                <div className="w-1/4">
                  <label className="text-gray-400 block mb-2 text-xs">Peso Bruto (kg)</label>
                  <input type="number" step="0.01" name="peso_kg" value={pieza.peso_kg} onChange={(e) => handleDetalleChange(index, e)} required disabled={embarqueGuardadoId !== null}
                    className="w-full p-2.5 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50" />
                </div>
              </div>
            ))}
          </div>

          {!embarqueGuardadoId && (
            <button type="button" onClick={agregarPieza} className="mt-4 text-blue-400 hover:text-blue-300 font-semibold text-sm flex items-center gap-1 transition-colors">
              + Añadir otra partida de material
            </button>
          )}
        </div>

        {/* --- TARJETA 3: ACCIONES Y OFTP2 --- */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-wrap gap-4 items-center bg-gradient-to-r from-gray-800 to-gray-900">
          
          <button type="submit" disabled={embarqueGuardadoId !== null} 
            className={`px-6 py-3 rounded-lg font-bold transition-all shadow-lg ${embarqueGuardadoId ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/50'}`}>
            {embarqueGuardadoId ? '✓ Embarque Guardado' : '💾 Guardar en Base de Datos'}
          </button>

          {embarqueGuardadoId && (
            <>
              <button type="button" onClick={handleDescargarVDA} 
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-green-900/50 flex items-center gap-2">
                ⬇️ Descargar VDA
              </button>
              
              <button type="button" onClick={handleEnviarOftp2} 
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition-all shadow-lg shadow-orange-900/50 flex items-center gap-2 border border-orange-400">
                🚀 Transmitir por OFTP2
              </button>
            </>
          )}
        </div>

      </form>
    </div>
  );
};

export default NuevoEmbarque;