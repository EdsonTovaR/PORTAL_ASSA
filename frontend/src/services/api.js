import axios from 'axios';

// Conexión base apuntando al contenedor de FastAPI
const api = axios.create({
    baseURL: 'http://localhost:8000', // La dirección del backend
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
    //El VDA no es JSON, es texto plano, por eso configuramos el tipo de respuesta
    const response = await api.get(`/embarques/${embarqueId}/vda`, { responseType: 'text' });
    return response.data;
};

export const getEmbarques = async () => {
    const response = await api.get('/embarques');
    return response.data;
};

// --- FUNCIONES PARA TRANSPORTISTAS ---
export const getTransportistas = async () => {
    const response = await api.get('/transportistas');
    return response.data;
};

export const crearTransportista = async (datosTransportista) => {
    const response = await api.post('/transportistas', datosTransportista);
    return response.data;
};

// --- FUNCIONES DE SEGURIDAD ---
export const loginUsuario = async (username, password) => {
    // FastAPI (OAuth2) exige que el login se envíe como Form-Data, no como JSON
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/login', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    return response.data;
};

export default api;