import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '../services/api';

const Login = () => {
  const [credenciales, setCredenciales] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const respuesta = await loginUsuario(credenciales.username, credenciales.password);
      localStorage.setItem('token', respuesta.access_token);
      navigate('/');
    } catch (err) {
      console.error("Error en login:", err);
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    // Fondo de pantalla completa, centrado y con un gris muy oscuro
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      
      {/* Tarjeta del formulario con sombras, bordes redondeados y un gris más claro */}
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        
        <h2 className="text-3xl text-white font-bold text-center mb-8 tracking-wider">
          PORTAL <span className="text-blue-500">ASSA</span>
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <div>
            <label className="text-gray-400 block mb-2 text-sm font-medium">Usuario</label>
            <input 
              type="text" 
              name="username" 
              value={credenciales.username} 
              onChange={handleChange} 
              required 
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Ej. admin"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-2 text-sm font-medium">Contraseña</label>
            <input 
              type="password" 
              name="password" 
              value={credenciales.password} 
              onChange={handleChange} 
              required 
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="text-red-400 text-sm text-center font-medium bg-red-900/30 p-2 rounded">{error}</div>}

          <button 
            type="submit" 
            className="w-full p-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors shadow-lg shadow-blue-900/50"
          >
            Iniciar Sesión
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;