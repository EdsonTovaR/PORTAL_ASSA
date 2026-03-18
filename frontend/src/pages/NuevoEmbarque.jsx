import { useState, useEffect } from 'react';
// 1. IMPORTAMOS LAS FUNCIONES DE LOS CATÁLOGOS
import { crearEmbarque, descargarVDA, getClientes, getTransportistas } from '../services/api'; 

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

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h2>Registrar Nuevo Embarque (VDA 4913)</h2>
      
      <form onSubmit={handleSubmit}>
        <fieldset style={{ marginBottom: '20px', padding: '15px' }}>
          <legend>Datos del Transporte</legend>
          
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Folio del Embarque:</label>
          <input type="text" name="folio_embarque" value={embarque.folio_embarque} onChange={handleCabeceraChange} required style={{ display: 'block', marginBottom: '15px', padding: '8px', width: '100%' }}/>

          {/* --- MAGIA APLICADA: EL SELECT DE CLIENTES --- */}
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Cliente (Destino):</label>
          <select name="cliente_id" value={embarque.cliente_id} onChange={handleCabeceraChange} required style={{ display: 'block', marginBottom: '15px', padding: '8px', width: '100%' }}>
            <option value="" disabled>-- Selecciona un Cliente --</option>
            {listaClientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} (Odette: {cliente.codigo_odette})
              </option>
            ))}
          </select>

          {/* --- MAGIA APLICADA: EL SELECT DE TRANSPORTISTAS --- */}
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Línea Transportista:</label>
          <select name="transportista_id" value={embarque.transportista_id} onChange={handleCabeceraChange} required style={{ display: 'block', marginBottom: '15px', padding: '8px', width: '100%' }}>
            <option value="" disabled>-- Selecciona un Transportista --</option>
            {listaTransportistas.map(trans => (
              <option key={trans.id} value={trans.id}>
                {trans.linea_transportista || trans.nombre_chofer} (Placas: {trans.placas})
              </option>
            ))}
          </select>

          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Fecha y Hora de Salida:</label>
          <input type="datetime-local" name="fecha_salida" value={embarque.fecha_salida} onChange={handleCabeceraChange} required style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%' }}/>
        </fieldset>

        {/* ... (El resto del código de los Detalles se queda exactamente igual) ... */}
        <fieldset style={{ marginBottom: '20px', padding: '15px' }}>
          <legend>Piezas a Enviar</legend>
          {embarque.detalles.map((detalle, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <span>#{index + 1}</span>
              <input type="text" name="numero_parte" placeholder="N° de Parte" value={detalle.numero_parte} onChange={(e) => handleDetalleChange(index, e)} required style={{ padding: '6px' }}/>
              <input type="number" name="cantidad" placeholder="Cantidad" value={detalle.cantidad} onChange={(e) => handleDetalleChange(index, e)} required style={{ padding: '6px' }}/>
              <input type="number" step="0.01" name="peso_kg" placeholder="Peso (kg)" value={detalle.peso_kg} onChange={(e) => handleDetalleChange(index, e)} style={{ padding: '6px' }}/>
            </div>
          ))}
          <button type="button" onClick={agregarPieza} style={{ marginTop: '10px', padding: '5px 10px' }}>+ Agregar otra pieza</button>
        </fieldset>

        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
          <button type="submit" disabled={embarqueGuardadoId !== null} style={{ padding: '10px 20px', backgroundColor: embarqueGuardadoId ? '#555' : '#0056b3', color: 'white', border: 'none', cursor: 'pointer' }}>
            {embarqueGuardadoId ? 'Guardado Exitoso' : 'Guardar Embarque'}
          </button>

          {embarqueGuardadoId && (
            <button type="button" onClick={handleDescargarVDA} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              ⬇️ Descargar Archivo VDA
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default NuevoEmbarque;