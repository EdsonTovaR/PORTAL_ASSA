import { useState, useEffect } from 'react';
import { getConfiguracion, actualizarConfiguracion } from '../services/api';
import { useContext } from 'react';
import { ConfigContext } from '../context/ConfigContext';

const Configuracion = () => {
  const { recargarConfiguracion } = useContext(ConfigContext);
  const [config, setConfig] = useState({
    nombre_empresa: '',
    direccion: ''
  });
  const [archivoLogo, setArchivoLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // 1. Cargamos la configuración actual al entrar a la pantalla
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await getConfiguracion();
        setConfig({
          nombre_empresa: data.nombre_empresa,
          direccion: data.direccion
        });
        
        // Si ya hay un logo guardado en el servidor, lo mostramos
        if (data.logo_url) {
          // Le pegamos la URL base del backend para que React sepa dónde buscar la imagen
          setPreviewLogo(`http://localhost:8000${data.logo_url}`);
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error);
      }
    };
    cargarDatos();
  }, []);

  // 2. Manejador para cuando el usuario selecciona una imagen
  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoLogo(file);
      // Creamos una URL temporal en la memoria del navegador para la previsualización
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  // 3. El momento de enviar la caja (FormData)
  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      // Fabricamos la caja de cartón (FormData)
      const formData = new FormData();
      formData.append('nombre_empresa', config.nombre_empresa);
      formData.append('direccion', config.direccion);
      
      // Solo metemos el archivo a la caja si el usuario seleccionó uno nuevo
      if (archivoLogo) {
        formData.append('logo', archivoLogo);
      }

      await actualizarConfiguracion(formData);
      alert("¡Configuración de la plataforma actualizada con éxito!");
      recargarConfiguracion();
      
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al actualizar la configuración.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-12">
      <div className="mb-8 border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-bold text-white">Configuración del Portal</h2>
        <p className="text-gray-400 mt-2">Personaliza la identidad visual y los datos de la empresa.</p>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden p-8">
        <form onSubmit={handleGuardar} className="flex flex-col gap-6">
          
          {/* SECCIÓN 1: DATOS DE TEXTO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-gray-400 block mb-2 text-sm font-medium">Nombre de la Empresa</label>
              <input 
                type="text" 
                value={config.nombre_empresa} 
                onChange={(e) => setConfig({...config, nombre_empresa: e.target.value})}
                required 
                className="w-full p-3 rounded bg-gray-900 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="text-gray-400 block mb-2 text-sm font-medium">Dirección Fiscal / Planta</label>
              <input 
                type="text" 
                value={config.direccion} 
                onChange={(e) => setConfig({...config, direccion: e.target.value})}
                required 
                className="w-full p-3 rounded bg-gray-900 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <hr className="border-gray-700 my-4" />

          {/* SECCIÓN 2: LOGOTIPO CORPORATIVO */}
          <div>
            <label className="text-gray-400 block mb-4 text-sm font-medium">Logotipo Corporativo (Documentos y Portal)</label>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Previsualización del Logo */}
              <div className="w-48 h-48 bg-gray-900 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center overflow-hidden">
                {previewLogo ? (
                  <img src={previewLogo} alt="Logo Preview" className="max-w-full max-h-full object-contain p-2" />
                ) : (
                  <span className="text-gray-500 text-sm text-center px-4">No hay logo<br/>configurado</span>
                )}
              </div>
              
              {/* Botón para subir archivo */}
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleArchivoChange}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-900 file:text-blue-300
                    hover:file:bg-blue-800 transition-colors cursor-pointer"
                />
                <p className="text-gray-500 text-xs mt-3">
                  Formatos recomendados: PNG (con fondo transparente) o JPG. Idealmente cuadrado o apaisado.
                </p>
              </div>
            </div>
          </div>

          {/* BOTÓN DE GUARDADO */}
          <div className="flex justify-end mt-6">
            <button 
              type="submit" 
              disabled={guardando}
              className={`px-8 py-3 rounded-lg font-bold transition-all shadow-lg ${
                guardando ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/50'
              }`}
            >
              {guardando ? 'Guardando cambios...' : 'Guardar Configuración'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default Configuracion;