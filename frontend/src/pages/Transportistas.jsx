import { useState, useEffect } from 'react';
import { getTransportistas, crearTransportista } from '../services/api';

const Transportistas = () => {
  const [transportistas, setTransportistas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [nuevoTransportista, setNuevoTransportista] = useState({
    nombre_chofer: '',
    placas: '',
    linea_transportista: ''
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoTransportista((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearTransportista(nuevoTransportista);
      alert("¡Transportista registrado exitosamente!");
      setNuevoTransportista({ nombre_chofer: '', placas: '', linea_transportista: '' });
      cargarTransportistas(); 
    } catch (error) {
      console.error("Error al crear transportista:", error);
      alert("Error al registrar el transportista.");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h2 style={{ color: 'white', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
        Catálogo de Transportistas
      </h2>

      {/* FORMULARIO */}
      <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ color: '#aaa', marginTop: 0 }}>Registrar Nuevo Transportista</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '200px' }}>
            <label style={{ color: '#ccc', marginBottom: '5px' }}>Nombre del Chofer:</label>
            <input type="text" name="nombre_chofer" value={nuevoTransportista.nombre_chofer} onChange={handleChange} required placeholder="Ej. Juan Pérez" style={{ padding: '8px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '150px' }}>
            <label style={{ color: '#ccc', marginBottom: '5px' }}>Placas:</label>
            <input type="text" name="placas" value={nuevoTransportista.placas} onChange={handleChange} required placeholder="Ej. 123-ABC" style={{ padding: '8px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '200px' }}>
            <label style={{ color: '#ccc', marginBottom: '5px' }}>Línea Transportista:</label>
            <input type="text" name="linea_transportista" value={nuevoTransportista.linea_transportista} onChange={handleChange} required placeholder="Ej. Transportes del Norte" style={{ padding: '8px' }} />
          </div>

          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', height: '35px' }}>
            + Guardar
          </button>
        </form>
      </div>

      {/* TABLA */}
      {cargando ? (
        <p style={{ color: '#ccc' }}>Cargando catálogo...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee' }}>
          <thead>
            <tr style={{ backgroundColor: '#333', textAlign: 'left' }}>
              <th style={{ padding: '12px', border: '1px solid #555' }}>ID</th>
              <th style={{ padding: '12px', border: '1px solid #555' }}>Chofer</th>
              <th style={{ padding: '12px', border: '1px solid #555' }}>Placas</th>
              <th style={{ padding: '12px', border: '1px solid #555' }}>Línea</th>
            </tr>
          </thead>
          <tbody>
            {transportistas.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '15px', textAlign: 'center', border: '1px solid #555' }}>
                  No hay transportistas registrados.
                </td>
              </tr>
            ) : (
              transportistas.map((trans) => (
                <tr key={trans.id} style={{ borderBottom: '1px solid #444' }}>
                  <td style={{ padding: '12px', border: '1px solid #555' }}>{trans.id}</td>
                  <td style={{ padding: '12px', border: '1px solid #555', fontWeight: 'bold' }}>{trans.nombre_chofer}</td>
                  <td style={{ padding: '12px', border: '1px solid #555' }}>{trans.placas}</td>
                  <td style={{ padding: '12px', border: '1px solid #555' }}>{trans.linea_transportista}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Transportistas;