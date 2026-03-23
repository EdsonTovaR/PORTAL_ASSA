from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    # Aquí guardaremos la contraseña encriptada (un texto muy largo y raro), NUNCA la original
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True) # Por si algún día se necesita dar de baja a alguien

class Cliente(Base):
    __tablename__ = "clientes"  # Debe coincidir exactamente con el nombre en PostgreSQL

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    codigo_odette = Column(String(50), unique=True, nullable=False)
    creado_en = Column(DateTime, default=datetime.datetime.utcnow)

class Transportista(Base):
    __tablename__ = "transportistas"
    id = Column(Integer, primary_key=True, index=True)
    nombre_chofer = Column(String(100), nullable=False)
    placas = Column(String(20), nullable=False)
    linea_transportista = Column(String(100), nullable=True)
    creado_en = Column(DateTime, default=datetime.datetime.utcnow)

    # Relación inversa
    #embarques = relationship("EmbarqueCabecera", back_populates="transportista")

class EmbarqueCabecera(Base):
    __tablename__ = "embarques_cabecera"

    id = Column(Integer, primary_key=True, index=True)
    folio_embarque = Column(String(50), unique=True, nullable=False)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    transportista_id = Column(Integer, ForeignKey("transportistas.id"), nullable=False)
    fecha_salida = Column(DateTime, nullable=False)
    estatus_edi = Column(String(20), default='PENDIENTE')
    creado_en = Column(DateTime, default=datetime.datetime.utcnow)

    # RELACIÓN: Le decimos a SQLAlchemy que un embarque tiene muchos detalles
    detalles = relationship("EmbarqueDetalle", back_populates="cabecera", cascade="all, delete")

class EmbarqueDetalle(Base):
    __tablename__ = "embarques_detalle"

    id = Column(Integer, primary_key=True, index=True)
    embarque_id = Column(Integer, ForeignKey("embarques_cabecera.id"), nullable=False)
    numero_parte = Column(String(50), nullable=False)
    cantidad = Column(Integer, nullable=False)
    peso_kg = Column(Numeric(10, 2))

    # RELACIÓN INVERSA: Le decimos a qué cabecera pertenece esta pieza
    cabecera = relationship("EmbarqueCabecera", back_populates="detalles")

class Configuracion(Base):
    __tablename__ = "configuracion"

    id = Column(Integer, primary_key=True, index=True)
    nombre_empresa = Column(String, default="Mi Empresa SaaS")
    direccion = Column(String, default="Dirección no configurada")
    # Guardaremos la ruta donde se guardó la imagen, no la imagen en sí
    logo_url = Column(String, nullable=True)