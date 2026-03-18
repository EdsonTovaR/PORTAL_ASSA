import { useState, useEffect } from 'react';
import { getClientes, crearCliente } from '../services/api';

const Clientes = () => {
  // 1. ESTADOS
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estado para el formulario del nuevo cliente
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    codigo_odette: ''
  });

  // 2. CARGAR DATOS (READ)
  const cargarClientes = async () => {
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    } finally {
      setCargando(false);
    }
  };

  // Se ejecuta al abrir la pantalla
  useEffect(() => {
    cargarClientes();
  }, []);

  // 3. MANEJADORES DEL FORMULARIO
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoCliente((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 4. GUARDAR DATOS (CREATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearCliente(nuevoCliente);
      alert("¡Cliente registrado exitosamente!");
      
      // Limpiamos el formulario
      setNuevoCliente({ nombre: '', codigo_odette: '' });
      
      // ¡Magia! Volvemos a pedir los datos a Python para que la tabla se actualice sola
      cargarClientes(); 
    } catch (error) {
      console.error("Error al crear cliente:", error);
      // Recuerda que FastAPI lanza un error 400 si el Código Odette está duplicado
      alert("Error al registrar. Verifica que el Código Odette no esté duplicado.");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h2 style={{ color: 'white', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
        Catálogo de Clientes
      </h2>

      {/* --- SECCIÓN 1: FORMULARIO DE REGISTRO --- */}
      <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ color: '#aaa', marginTop: 0 }}>Registrar Nuevo Cliente</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <label style={{ color: '#ccc', marginBottom: '5px' }}>Nombre de la Empresa:</label>
            <input type="text" name="nombre" value={nuevoCliente.nombre} onChange={handleChange} required placeholder="Ej. Volkswagen" style={{ padding: '8px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <label style={{ color: '#ccc', marginBottom: '5px' }}>Código Odette:</label>
            <input type="text" name="codigo_odette" value={nuevoCliente.codigo_odette} onChange={handleChange} required placeholder="Ej. VW-001" style={{ padding: '8px' }} />
          </div>

          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', height: '35px' }}>
            + Guardar Cliente
          </button>
        </form>
      </div>

      {/* --- SECCIÓN 2: TABLA DE CLIENTES --- */}
      {cargando ? (
        <p style={{ color: '#ccc' }}>Cargando catálogo...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee' }}>
          <thead>
            <tr style={{ backgroundColor: '#333', textAlign: 'left' }}>
              <th style={{ padding: '12px', border: '1px solid #555' }}>ID</th>
              <th style={{ padding: '12px', border: '1px solid #555' }}>Nombre</th>
              <th style={{ padding: '12px', border: '1px solid #555' }}>Código Odette</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '15px', textAlign: 'center', border: '1px solid #555' }}>
                  No hay clientes registrados.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.id} style={{ borderBottom: '1px solid #444' }}>
                  <td style={{ padding: '12px', border: '1px solid #555' }}>{cliente.id}</td>
                  <td style={{ padding: '12px', border: '1px solid #555', fontWeight: 'bold' }}>{cliente.nombre}</td>
                  <td style={{ padding: '12px', border: '1px solid #555' }}>{cliente.codigo_odette}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Clientes;