import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '../services/api';

const Login = () => {
  const [credenciales, setCredenciales] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Herramienta para redirigir al usuario

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiamos errores previos

    try {
      // 1. Vamos a FastAPI a pedir el Token
      const respuesta = await loginUsuario(credenciales.username, credenciales.password);
      
      // 2. Guardamos el Token en la caja fuerte del navegador
      localStorage.setItem('token', respuesta.access_token);
      
      // 3. Lo mandamos al Dashboard principal
      navigate('/');
    } catch (err) {
      console.error("Error en login:", err);
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#121212' }}>
      <div style={{ backgroundColor: '#1e1e1e', padding: '40px', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
        
        <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '30px' }}>Portal ASSA</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>Usuario:</label>
            <input type="text" name="username" value={credenciales.username} onChange={handleChange} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>Contraseña:</label>
            <input type="password" name="password" value={credenciales.password} onChange={handleChange} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }} />
          </div>

          {/* Si hay error, mostramos este mensaje en rojo */}
          {error && <div style={{ color: '#ff4d4d', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

          <button type="submit" style={{ padding: '12px', backgroundColor: '#0056b3', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}>
            Iniciar Sesión
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;