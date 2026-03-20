from fastapi.responses import PlainTextResponse
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import models, schemas,vda_generator,auth
from database import SessionLocal, engine
from fastapi.security import OAuth2PasswordBearer
import os



# Inicializamos la app
app = FastAPI(title="API Portal ASSA")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Esta función es el "cadenero" que pide el gafete (Token)
def obtener_usuario_actual(token: str = Depends(oauth2_scheme)):
    # Por ahora solo verificamos que el token esté presente
    # En la siguiente fase, aquí validaremos matemáticamente si el token es real
    return token

# NUEVA RUTA PROTEGIDA (El candado)
@app.get("/usuarios/me")
def leer_perfil_usuario(token: str = Depends(obtener_usuario_actual)):
    return {"mensaje": "¡Entraste a la zona VIP!", "tu_token": token}

# PERMISOS CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Le damos permiso exclusivo a React
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

# ==========================================
# RUTAS DE SEGURIDAD Y USUARIOS
# ==========================================

# 1. Registrar un nuevo usuario (Solo lo usarás tú como Admin por ahora)
@app.post("/usuarios/registro", response_model=schemas.UsuarioResponse)
def registrar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    # Verificamos si el usuario ya existe
    db_user = db.query(models.Usuario).filter(models.Usuario.username == usuario.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está registrado")
    
    # Encriptamos la contraseña ANTES de guardarla
    password_encriptada = auth.obtener_password_hash(usuario.password)
    
    nuevo_usuario = models.Usuario(
        username=usuario.username,
        hashed_password=password_encriptada
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

# 2. Iniciar Sesión (Login) y devolver el Token JWT
@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Buscamos al usuario en la base de datos
    usuario = db.query(models.Usuario).filter(models.Usuario.username == form_data.username).first()
    
    # Si no existe, o si la contraseña no coincide con el hash guardado...
    if not usuario or not auth.verificar_password(form_data.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Si todo es correcto, le fabricamos su gafete (Token)
    access_token = auth.crear_token_acceso(data={"sub": usuario.username})
    
    # Se lo entregamos
    return {"access_token": access_token, "token_type": "bearer"}

# NUEVA RUTA: Enviar a la Drop Zone de Mendelson
@app.post("/embarques/{embarque_id}/enviar-oftp2")
def enviar_embarque_oftp2(embarque_id: int, db: Session = Depends(get_db), token: str = Depends(obtener_usuario_actual)):
    
    # 1. PRIMERO buscamos el objeto completo en la base de datos
    embarque = db.query(models.EmbarqueCabecera).filter(models.EmbarqueCabecera.id == embarque_id).first()
    
    if not embarque:
        raise HTTPException(status_code=404, detail="Embarque no encontrado")
        
    # 2. AHORA SÍ, le pasamos el objeto completo a la máquina traductora
    texto_vda = vda_generator.generar_vda_4913(embarque)
    
    # 3. Definimos el nombre del archivo y la ruta de la Drop Zone
    nombre_archivo = f"VDA4913_{embarque.folio_embarque}.txt"
    ruta_outbox = os.path.join("/app/ediprocessing/outbox", nombre_archivo)
    
    # 4. Escribimos el archivo en el disco duro
    try:
        with open(ruta_outbox, "w") as archivo:
            archivo.write(texto_vda)
        return {"mensaje": f"Archivo {nombre_archivo} depositado con éxito en la Drop Zone para Mendelson"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al escribir en disco: {str(e)}")