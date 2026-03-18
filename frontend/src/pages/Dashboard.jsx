import { useState, useEffect } from 'react';
import { getEmbarques, descargarVDA } from '../services/api';

const Dashboard = () => {
  // 1. EL ESTADO INICIAL: Empieza como un arreglo vacío []
  const [embarques, setEmbarques] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 2. EL EFECTO: Se ejecuta una sola vez al cargar la página
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const datos = await getEmbarques();
        setEmbarques(datos);
      } catch (error) {
        console.error("Error al cargar embarques:", error);
      } finally {
        setCargando(false); // Apagamos el indicador de carga
      }
    };

    cargarDatos();
  }, []); // <-- El arreglo vacío significa "Ejecuta esto solo al inicio"

  // 3. FUNCIÓN PARA DESCARGAR DESDE LA TABLA
  const handleDescargar = async (id, folio) => {
    try {
      const textoVDA = await descargarVDA(id);
      const blob = new Blob([textoVDA], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.setAttribute('download', `VDA4913_${folio}.txt`);
      document.body.appendChild(enlace);
      enlace.click();
      enlace.parentNode.removeChild(enlace);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error al descargar el archivo VDA.");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
      <h2 style={{ color: 'white', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
        Historial de Embarques EDI
      </h2>

      {/* Si está cargando, mostramos un mensaje, si no, mostramos la tabla */}
      {cargando ? (
        <p style={{ color: '#ccc' }}>Cargando datos desde PostgreSQL...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', color: '#eee' }}>
          <thead>
            <tr style={{ backgroundColor: '#333', textAlign: 'left' }}>
              <th style={{ padding: '12px', border: '1px solid #555' }}>ID</th>
              <th style={{ padding: '12px', border: '1px solid #555' }}>Folio</th>
              <th style={{ padding: '12px', border: '1px solid #555' }}>Fecha Salida</th>
              <th style={{ padding: '12px', border: '1px solid #555' }}>Estatus EDI</th>
              <th style={{ padding: '12px', border: '1px solid #555', textAlign: 'center' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {/* Si no hay datos, mostramos una fila vacía */}
            {embarques.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '15px', textAlign: 'center', border: '1px solid #555' }}>
                  No hay embarques registrados aún.
                </td>
              </tr>
            ) : (
              /* Si hay datos, los mapeamos (dibujamos) fila por fila */
              embarques.map((emb) => (
                <tr key={emb.id} style={{ borderBottom: '1px solid #444' }}>
                  <td style={{ padding: '12px', border: '1px solid #555' }}>{emb.id}</td>
                  <td style={{ padding: '12px', border: '1px solid #555', fontWeight: 'bold' }}>{emb.folio_embarque}</td>
                  <td style={{ padding: '12px', border: '1px solid #555' }}>
                    {new Date(emb.fecha_salida).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #555' }}>
                    <span style={{ backgroundColor: '#28a745', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {emb.estatus_edi}
                    </span>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #555', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleDescargar(emb.id, emb.folio_embarque)}
                      style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px' }}
                    >
                      Descargar VDA
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;