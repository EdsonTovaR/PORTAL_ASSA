import vda_generator
from fastapi.responses import PlainTextResponse
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas
from database import SessionLocal, engine

# Inicializamos la app
app = FastAPI(title="API Portal ASSA")

# PERMISOS CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Le damos permiso exclusivo a tu React
    allow_credentials=True,
    allow_methods=["*"], # Permite POST, GET, PUT, DELETE
    allow_headers=["*"], # Permite cualquier tipo de encabezado
)

# Buena práctica: Función generadora de sesiones (Dependency Injection)
# Abre la conexión cuando llega una petición y la cierra de forma segura cuando termina
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def leer_raiz():
    return {"mensaje": "Portal ASSA Backend Activo"}

# NUEVA RUTA: Obtener todos los clientes
@app.get("/clientes")
def obtener_clientes(db: Session = Depends(get_db)):
    # Usamos el ORM para traer todos los registros de la tabla clientes
    clientes = db.query(models.Cliente).all()
    return clientes

# NUEVA RUTA: Crear un nuevo cliente (Metodo POST)
@app.post("/clientes", response_model=schemas.Cliente)
def crear_cliente(cliente: schemas.ClienteCreate, db: Session = Depends(get_db)):
    
    # 1. Validación de negocio: ¿El código Odette ya existe?
    db_cliente = db.query(models.Cliente).filter(models.Cliente.codigo_odette == cliente.codigo_odette).first()
    if db_cliente:
        raise HTTPException(status_code=400, detail="Este Código Odette ya está registrado.")
    
    # 2. Preparamos el objeto para la base de datos (Usamos el modelo SQLAlchemy)
    nuevo_cliente = models.Cliente(nombre=cliente.nombre, codigo_odette=cliente.codigo_odette)
    
    # 3. Lo guardamos en PostgreSQL
    db.add(nuevo_cliente)
    db.commit()          # Confirmamos la transacción
    db.refresh(nuevo_cliente) # Refrescamos para obtener el ID que le asignó la base de datos
    
    return nuevo_cliente

#Registrar un embarque completo (Cabecera + Detalles)
@app.post("/embarques", response_model=schemas.EmbarqueCabecera)
def crear_embarque(embarque: schemas.EmbarqueCabeceraCreate, db: Session = Depends(get_db)):
    
    # 1. Guardamos la Cabecera primero
    db_embarque = models.EmbarqueCabecera(
        folio_embarque=embarque.folio_embarque,
        cliente_id=embarque.cliente_id,
        transportista_id=embarque.transportista_id,
        fecha_salida=embarque.fecha_salida
    )
    db.add(db_embarque)
    db.commit()
    db.refresh(db_embarque) # Ahora db_embarque ya tiene su ID real (ej. ID = 1)

    # 2. Recorremos la lista de piezas y las guardamos asociadas a la cabecera
    for detalle in embarque.detalles:
        db_detalle = models.EmbarqueDetalle(
            embarque_id=db_embarque.id, # Usamos el ID de la cabecera que acabamos de crear
            numero_parte=detalle.numero_parte,
            cantidad=detalle.cantidad,
            peso_kg=detalle.peso_kg
        )
        db.add(db_detalle)
    
    # Confirmamos los detalles y refrescamos la cabecera para que la respuesta muestre todo
    db.commit()
    db.refresh(db_embarque) 
    
    return db_embarque

#Obtener el historial de todos los embarques
@app.get("/embarques", response_model=list[schemas.EmbarqueCabecera])
def obtener_embarques(db: Session = Depends(get_db)):
    # Usamos .order_by(.desc()) para que el embarque más reciente salga arriba en la tabla
    embarques = db.query(models.EmbarqueCabecera).order_by(models.EmbarqueCabecera.id.desc()).all()
    return embarques

#Generar y ver el archivo VDA 4913
@app.get("/embarques/{embarque_id}/vda", response_class=PlainTextResponse)
def descargar_vda(embarque_id: int, db: Session = Depends(get_db)):
    # 1. Buscamos el embarque en la base de datos
    embarque = db.query(models.EmbarqueCabecera).filter(models.EmbarqueCabecera.id == embarque_id).first()
    
    # 2. Si no existe, devolvemos error 404
    if not embarque:
        raise HTTPException(status_code=404, detail="Embarque no encontrado")
        
    # 3. Pasamos el embarque a nuestra máquina traductora
    texto_vda = vda_generator.generar_vda_4913(embarque)
    
    # 4. Devolvemos el texto plano
    return texto_vda

# NUEVA RUTA: Obtener todos los transportistas
@app.get("/transportistas", response_model=list[schemas.Transportista])
def obtener_transportistas(db: Session = Depends(get_db)):
    return db.query(models.Transportista).all()

# NUEVA RUTA: Crear un transportista
@app.post("/transportistas", response_model=schemas.Transportista)
def crear_transportista(transportista: schemas.TransportistaCreate, db: Session = Depends(get_db)):
    nuevo_transportista = models.Transportista(
        nombre_chofer=transportista.nombre_chofer,
        placas=transportista.placas,
        linea_transportista=transportista.linea_transportista
    )
    db.add(nuevo_transportista)
    db.commit()
    db.refresh(nuevo_transportista)
    return nuevo_transportista