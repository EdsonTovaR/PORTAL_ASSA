import { createContext, useState, useEffect } from 'react';
import { getConfiguracion } from '../services/api';

// 1. Creamos el "molde" del contexto
export const ConfigContext = createContext();

// 2. Creamos el "Proveedor" (La nube que envolverá a toda la app)
export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    nombre_empresa: 'PORTAL ASSA',
    direccion: '',
    logo_url: null
  });

  // Función para ir al backend por los datos
  const recargarConfiguracion = async () => {
    try {
      const data = await getConfiguracion();
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error("Error al cargar el cerebro global:", error);
    }
  };

  // Se ejecuta automáticamente al abrir la página web
  useEffect(() => {
    recargarConfiguracion();
  }, []);

  return (
    // Exponemos los datos (config) y la función para actualizarla
    <ConfigContext.Provider value={{ config, recargarConfiguracion }}>
      {children}
    </ConfigContext.Provider>
  );
};