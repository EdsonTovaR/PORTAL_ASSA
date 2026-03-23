import { useState, useEffect } from 'react';
import { getEmbarques, getClientes, getDetalleEmbarque } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Historial = () => {
  const [embarques, setEmbarques] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // BUENA PRÁCTICA: Promise.all dispara ambas peticiones al mismo tiempo
    // en lugar de esperar a que termine una para empezar la otra.
    const cargarDatos = async () => {
      try {
        const [datosEmbarques, datosClientes] = await Promise.all([
          getEmbarques(),
          getClientes()
        ]);
        setEmbarques(datosEmbarques);
        setClientes(datosClientes);
      } catch (error) {
        console.error("Error al cargar el historial:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  // Función "Traductora" (Convierte el ID en el Nombre Real)
  const obtenerNombreCliente = (id) => {
    const cliente = clientes.find(c => c.id === id);
    return cliente ? cliente.nombre : 'Desconocido';
  };

  // EL CEREBRO DEL BUSCADOR
  const embarquesFiltrados = embarques.filter(emb => {
    const folio = emb.folio_embarque.toLowerCase();
    const nombreEmpresa = obtenerNombreCliente(emb.cliente_id).toLowerCase();
    const termino = busqueda.toLowerCase();
    
    // Dejamos pasar si el texto coincide con el folio o con la empresa destino
    return folio.includes(termino) || nombreEmpresa.includes(termino);
  });

  // ==========================================
  // MAGIA 1: EXPORTAR A EXCEL (CSV)
  // ==========================================
  const descargarCSV = async (embarque) => {
    try {
      const data = await getDetalleEmbarque(embarque.id);
      
      // Armamos el texto separando por comas
      let csvContent = "Numero de Parte,Cantidad,Peso Neto (kg)\n";
      
      data.detalles.forEach(pieza => {
        csvContent += `${pieza.numero_parte},${pieza.cantidad},${pieza.peso_kg}\n`;
      });

      // Creamos un archivo virtual en la memoria del navegador
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Simulamos un clic para descargarlo
      const link = document.createElement("a");
      link.href = url;
      link.download = `Reporte_${embarque.folio_embarque}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error REAL:", error); // <-- ¡Esto te salva la vida!
      alert("Error al generar el PDF.");
    }
  };

  // ==========================================
  // MAGIA 2: EXPORTAR A PDF (PACKING LIST)
  // ==========================================
  const descargarPDF = async (embarque) => {
    try {
      const data = await getDetalleEmbarque(embarque.id);
      const nombreEmpresa = obtenerNombreCliente(embarque.cliente_id);
      
      // Inicializamos el documento PDF
      const doc = new jsPDF();
      
      // Dibujamos el Encabezado Corporativo
      doc.setFontSize(22);
      doc.setTextColor(0, 86, 179); // Azul ASSA
      doc.text("PORTAL ASSA", 14, 20);
      
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text("Packing List Oficial", 14, 30);
      
      // Datos Generales
      doc.setFontSize(11);
      doc.text(`Folio Interno: ${embarque.folio_embarque}`, 14, 45);
      doc.text(`Cliente Destino: ${nombreEmpresa}`, 14, 52);
      doc.text(`Fecha de Salida: ${new Date(embarque.fecha_salida).toLocaleString('es-MX')}`, 14, 59);

      // Preparamos los datos de las piezas para la tabla
      const filasTabla = data.detalles.map(pieza => [
        pieza.numero_parte, 
        pieza.cantidad.toString(), 
        `${pieza.peso_kg} kg`
      ]);

      // Dibujamos la tabla
      autoTable(doc, {
        startY: 70,
        head: [['Número de Parte', 'Cantidad', 'Peso Neto']],
        body: filasTabla,
        theme: 'grid',
        headStyles: { fillColor: [0, 86, 179] } // Cabecera azul corporativo
      });

      // Guardamos el PDF
      doc.save(`Packing_List_${embarque.folio_embarque}.pdf`);
    } catch (error) {
      alert("Error al generar el PDF.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 mb-12">
      
      {/* ENCABEZADO Y BUSCADOR */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-white">Historial de Embarques</h2>
        
        <input 
          type="text" 
          placeholder="🔍 Buscar por Folio o Empresa Destino..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full md:w-80 p-2.5 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      {/* TABLA DE DATOS */}
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/80 text-gray-400 text-sm uppercase tracking-wider border-b border-gray-700">
                <th className="p-4 font-semibold w-24">ID Int.</th>
                <th className="p-4 font-semibold">Folio de Embarque</th>
                <th className="p-4 font-semibold">Empresa Destino</th>
                <th className="p-4 font-semibold">Fecha de Salida</th>
                <th className="p-4 font-semibold text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              
              {cargando ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-blue-400 font-medium animate-pulse">
                    Descargando historial logístico...
                  </td>
                </tr>
              ) : (
                embarquesFiltrados.map((emb) => (
                  <tr key={emb.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 text-gray-500 font-mono">#{emb.id}</td>
                    <td className="p-4 text-blue-400 font-bold font-mono tracking-wide">{emb.folio_embarque}</td>
                    <td className="p-4 text-emerald-400 font-semibold">{obtenerNombreCliente(emb.cliente_id)}</td>
                    <td className="p-4 text-gray-300">{new Date(emb.fecha_salida).toLocaleString('es-MX')}</td>
                    
                    {/* NUEVA COLUMNA CON LOS DOS BOTONES DE DESCARGA */}
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => descargarPDF(emb)} 
                          className="bg-red-600/20 text-red-400 border border-red-800 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-xs font-bold uppercase transition-colors"
                          title="Descargar Packing List en PDF"
                        >
                          📄 PDF
                        </button>
                        <button 
                          onClick={() => descargarCSV(emb)} 
                          className="bg-green-600/20 text-green-400 border border-green-800 hover:bg-green-600 hover:text-white px-3 py-1 rounded text-xs font-bold uppercase transition-colors"
                          title="Descargar tabla en formato Excel/CSV"
                        >
                          📊 CSV
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Historial;