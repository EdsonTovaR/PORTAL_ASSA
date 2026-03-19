from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

# --- CONFIGURACIÓN DE SEGURIDAD ---
# OJO: En un entorno de producción real, esta clave secreta debe vivir en un archivo .env
SECRET_KEY = "super_secreta_clave_portal_assa_2026_!#" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 # El token durará 1 hora antes de caducar

# Le decimos a Python que use el algoritmo 'bcrypt' (el estándar de la industria)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 1. Encriptar contraseña (Para cuando registremos a un usuario de Logística)
def obtener_password_hash(password: str):
    return pwd_context.hash(password)

# 2. Verificar contraseña (Para el Login)
def verificar_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# 3. Fabricar el Token JWT
def crear_token_acceso(data: dict):
    to_encode = data.copy() # Copiamos los datos (ej. el nombre de usuario)
    
    # Calculamos la fecha y hora exacta en la que el token dejará de servir
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Firmamos matemáticamente el token usando nuestra SECRET_KEY
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt