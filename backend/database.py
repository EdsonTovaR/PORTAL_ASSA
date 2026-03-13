from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# La URL de conexión tiene este formato: postgresql://usuario:password@host:puerto/nombre_bd
# OJO: El host es 'db', que es el nombre del servicio que le dimos en docker-compose.yml
SQLALCHEMY_DATABASE_URL = "postgresql://assa_admin:password_seguro_123@db:5432/portal_assa"

# El 'engine' es el motor de la conexión
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal es una fábrica de sesiones. Cada vez que alguien entre al portal, le daremos una sesión nueva.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base es la clase madre de la cual heredarán todos nuestros modelos
Base = declarative_base()