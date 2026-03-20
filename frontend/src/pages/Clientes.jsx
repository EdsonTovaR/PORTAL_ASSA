import { useState, useEffect } from 'react';
import { getClientes, crearCliente, actualizarCliente } from '../services/api';

const Clientes = () => {
  // 1. ESTADOS
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  // --- ESTADOS PARA LA EDICIÓN (MODAL) ---
const [isModalOpen, setIsModalOpen] = useState(false);
const [clienteEditando, setClienteEditando] = useState({ id: null, nombre: '', codigo_odette: '' });

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

  // 1. Cuando el usuario hace clic en el lápiz
  const abrirModal = (cliente) => {
    setClienteEditando(cliente); // Copiamos los datos de esa fila al formulario flotante
    setIsModalOpen(true); // Encendemos la ventana
  };

  // Abre la ventana totalmente en blanco para un registro nuevo
  const abrirModalParaCrear = () => {
    setClienteEditando({ id: null, nombre: '', codigo_odette: '' });
    setIsModalOpen(true);
  };

  // 2. Cuando el usuario cancela o termina
  const cerrarModal = () => {
    setIsModalOpen(false); // Apagamos la ventana
    setClienteEditando({ id: null, nombre: '', codigo_odette: '' }); // Limpiamos la memoria
  };

  

  

  // Controlador unificado: Decide si hace POST (Crear) o PUT (Actualizar)
  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (clienteEditando.id) {
        // --- MODO ACTUALIZAR (PUT) ---
        await actualizarCliente(clienteEditando.id, {
          nombre: clienteEditando.nombre,
          codigo_odette: clienteEditando.codigo_odette
        });
        // Actualizamos la memoria local
        setClientes(clientes.map(c => c.id === clienteEditando.id ? clienteEditando : c));
        alert("¡Cliente actualizado con éxito!");
      } else {
        // --- MODO CREAR (POST) ---
        const nuevoCliente = await crearCliente({
          nombre: clienteEditando.nombre,
          codigo_odette: clienteEditando.codigo_odette
        });
        // Agregamos el nuevo cliente a la lista actual en pantalla
        setClientes([...clientes, nuevoCliente]);
        alert("¡Cliente registrado exitosamente!");
      }
      cerrarModal(); // Cerramos la ventana al terminar
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar. Verifica que el Código Odette no esté duplicado.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Catálogo de Clientes</h2>
        <button onClick={abrirModalParaCrear} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-blue-900/50">
        + Nuevo Cliente
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/80 text-gray-400 text-sm uppercase tracking-wider border-b border-gray-700">
                <th className="p-4 font-semibold w-16">ID</th>
                <th className="p-4 font-semibold">Empresa Destino</th>
                <th className="p-4 font-semibold">Código Odette</th>
                <th className="p-4 font-semibold text-center w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 text-gray-500 font-mono">#{cliente.id}</td>
                  <td className="p-4 text-white font-medium">{cliente.nombre}</td>
                  <td className="p-4 text-blue-400 font-mono tracking-wide">{cliente.codigo_odette}</td>
                  <td className="p-4 text-center">
                    <button 
                    onClick={() => abrirModal(cliente)} 
                    className="text-gray-400 hover:text-blue-400 transition-colors p-1" 
                    title="Editar"
                    >
                    ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mensaje por si la tabla está vacía */}
        {clientes.length === 0 && (
          <div className="p-8 text-center text-gray-500 font-medium">
            No hay clientes registrados en la base de datos.
          </div>
        )}
      </div>
      {/* --- VENTANA MODAL FLOTANTE --- */}
      {isModalOpen && (
        // Fondo negro semi-transparente (z-50 lo pone por encima de todo)
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center backdrop-blur-sm">
          
          {/* Tarjeta del formulario emergente */}
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
            {clienteEditando.id ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h3>
            
            <form onSubmit={handleGuardar} className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 block mb-2 text-sm font-medium">Nombre de la Empresa</label>
                <input 
                  type="text" 
                  value={clienteEditando.nombre} 
                  onChange={(e) => setClienteEditando({...clienteEditando, nombre: e.target.value})}
                  required 
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-2 text-sm font-medium">Código Odette</label>
                <input 
                  type="text" 
                  value={clienteEditando.codigo_odette} 
                  onChange={(e) => setClienteEditando({...clienteEditando, codigo_odette: e.target.value})}
                  required 
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={cerrarModal} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded font-medium transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-colors shadow-lg shadow-blue-900/50">
                  Guardar Cambios
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;