from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal

# 1. Esquema Base (Lo que tienen en común crear y leer)
class ClienteBase(BaseModel):
    nombre: str
    codigo_odette: str

# 2. Esquema para CREAR (Lo que el usuario envía)
# Hereda de ClienteBase, así que ya tiene nombre y codigo_odette
class ClienteCreate(ClienteBase):
    pass

# 3. Esquema para LEER (Lo que la API devuelve)
# Le agregamos los campos que la base de datos genera automáticamente (id y creado_en)
class Cliente(ClienteBase):
    id: int
    creado_en: datetime

    # Esta clase Config le dice a Pydantic que lea los datos de SQLAlchemy sin problema
    class Config:
        from_attributes = True

# --- 1. ESQUEMAS PARA EL DETALLE (Las piezas) ---
class EmbarqueDetalleBase(BaseModel):
    numero_parte: str
    cantidad: int
    peso_kg: Optional[Decimal] = None # Optional significa que pueden dejarlo en blanco

class EmbarqueDetalleCreate(EmbarqueDetalleBase):
    pass

class EmbarqueDetalle(EmbarqueDetalleBase):
    id: int
    embarque_id: int

    class Config:
        from_attributes = True

# --- 2. ESQUEMAS PARA LA CABECERA (El camión) ---
class EmbarqueCabeceraBase(BaseModel):
    folio_embarque: str
    cliente_id: int
    transportista_id: int
    fecha_salida: datetime

class EmbarqueCabeceraCreate(EmbarqueCabeceraBase):
    # Le decimos que esperamos una lista de piezas dentro de la orden del camión
    detalles: List[EmbarqueDetalleCreate]

class EmbarqueCabecera(EmbarqueCabeceraBase):
    id: int
    estatus_edi: str
    creado_en: datetime
    # También incluimos los detalles cuando la API responda
    detalles: List[EmbarqueDetalle] = [] 

    class Config:
        from_attributes = True

# --- ESQUEMAS PARA TRANSPORTISTA ---
class TransportistaBase(BaseModel):
    nombre_chofer: str
    placas: str
    linea_transportista: Optional[str] = None

class TransportistaCreate(TransportistaBase):
    pass

class Transportista(TransportistaBase):
    id: int
    creado_en: datetime

    class Config:
        from_attributes = True

# --- ESQUEMAS PARA USUARIOS ---
class UsuarioBase(BaseModel):
    username: str

# Cuando alguien crea una cuenta, debe enviar su contraseña en texto plano
class UsuarioCreate(UsuarioBase):
    password: str

# Cuando FastAPI responde, NUNCA devuelve la contraseña, solo el ID y el nombre
class UsuarioResponse(UsuarioBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

# El esquema para el Token JWT que le devolveremos al Frontend
class Token(BaseModel):
    access_token: str
    token_type: str