import axios from 'axios';

// Creamos la conexión base apuntando a nuestro contenedor de FastAPI
const api = axios.create({
    baseURL: 'http://localhost:8000', // La dirección de tu backend
    headers: {
        'Content-Type': 'application/json'
    }
});

// --- FUNCIONES PARA CLIENTES ---
export const getClientes = async () => {
    const response = await api.get('/clientes');
    return response.data;
};

export const crearCliente = async (datosCliente) => {
    const response = await api.post('/clientes', datosCliente);
    return response.data;
};

// --- FUNCIONES PARA EMBARQUES (VDA 4913) ---
export const crearEmbarque = async (datosEmbarque) => {
    const response = await api.post('/embarques', datosEmbarque);
    return response.data;
};

export const descargarVDA = async (embarqueId) => {
    // Nota: El VDA no es JSON, es texto plano, por eso configuramos el tipo de respuesta
    const response = await api.get(`/embarques/${embarqueId}/vda`, { responseType: 'text' });
    return response.data;
};

export default api;