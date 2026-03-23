from fastapi.responses import PlainTextResponse
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import models, schemas,vda_generator,auth
from database import SessionLocal, engine
from fastapi.security import OAuth2PasswordBearer
import os
from pydantic import BaseModel
from sqlalchemy import func

from fastapi import File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
import shutil
import os



# Inicializamos la app
app = FastAPI(title="API Portal ASSA")

# --- CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS ---
# Creamos la carpeta físicamente si no existe
os.makedirs("static/logos", exist_ok=True)

# Le decimos a FastAPI que haga pública esta carpeta
app.mount("/static", StaticFiles(directory="static"), name="static")

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

# ---Estadísticas para el Dashboard ---
@app.get("/estadisticas")
def obtener_estadisticas(db: Session = Depends(get_db), token: str = Depends(obtener_usuario_actual)):
    # 1. Los conteos rápidos se quedan igual
    total_clientes = db.query(models.Cliente).count()
    total_transportistas = db.query(models.Transportista).count()
    total_embarques = db.query(models.EmbarqueCabecera).count()
    
    # 2. Obtenemos los últimos 5 embarques
    ultimos_embarques = db.query(models.EmbarqueCabecera).order_by(models.EmbarqueCabecera.id.desc()).limit(5).all()
    
    # 3. TRADUCCIÓN DE ID A NOMBRE PARA UX
    actividad_formateada = []
    for emb in ultimos_embarques:
        # Buscamos al cliente en la BD
        cliente_db = db.query(models.Cliente).filter(models.Cliente.id == emb.cliente_id).first()
        
        # Armamos un diccionario a la medida para React
        actividad_formateada.append({
            "id": emb.id,
            "folio_embarque": emb.folio_embarque,
            "fecha_salida": emb.fecha_salida,
            # Si el cliente existe mandamos su nombre, si no, decimos "Desconocido"
            "cliente_nombre": cliente_db.nombre if cliente_db else "Desconocido" 
        })
    
    return {
        "totales": {
            "clientes": total_clientes,
            "transportistas": total_transportistas,
            "embarques": total_embarques
        },
        "actividad_reciente": actividad_formateada
    }

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

# --- ESQUEMA DE VALIDACIÓN ---
# Esto le dice a FastAPI exactamente qué datos esperar desde React
class ClienteActualizar(BaseModel):
    nombre: str
    codigo_odette: str

# ---Actualizar Cliente (PUT) ---
@app.put("/clientes/{cliente_id}")
def actualizar_cliente(
    cliente_id: int, 
    cliente_data: ClienteActualizar, 
    db: Session = Depends(get_db), 
    token: str = Depends(obtener_usuario_actual)
):
    # 1. Buscamos al cliente en la base de datos usando el ID de la URL
    cliente_db = db.query(models.Cliente).filter(models.Cliente.id == cliente_id).first()
    
    # 2. Si alguien intenta editar un ID que no existe, lanzamos el escudo
    if not cliente_db:
        raise HTTPException(status_code=404, detail="Cliente no encontrado en la base de datos")
        
    # 3. Reemplazamos los datos viejos con los datos nuevos que llegaron
    cliente_db.nombre = cliente_data.nombre
    cliente_db.codigo_odette = cliente_data.codigo_odette
    
    # 4. Confirmamos el guardado en el disco duro y refrescamos la memoria
    db.commit()
    db.refresh(cliente_db)
    
    return {"mensaje": "Cliente actualizado exitosamente", "cliente": cliente_db}

# --- ESQUEMA DE VALIDACIÓN ---
class TransportistaActualizar(BaseModel):
    linea_transportista: str
    nombre_chofer: str
    placas: str

# --- RUTA: Actualizar Transportista (PUT) ---
@app.put("/transportistas/{transp_id}")
def actualizar_transportista(
    transp_id: int, 
    transp_data: TransportistaActualizar, 
    db: Session = Depends(get_db), 
    token: str = Depends(obtener_usuario_actual)
):
    transp_db = db.query(models.Transportista).filter(models.Transportista.id == transp_id).first()
    
    if not transp_db:
        raise HTTPException(status_code=404, detail="Transportista no encontrado")
        
    transp_db.linea_transportista = transp_data.linea_transportista
    transp_db.nombre_chofer = transp_data.nombre_chofer
    transp_db.placas = transp_data.placas
    
    db.commit()
    db.refresh(transp_db)
    
    return {"mensaje": "Transportista actualizado", "transportista": transp_db}

# --- Obtener detalles de un embarque específico ---
@app.get("/embarques/{embarque_id}/detalles")
def obtener_detalle_embarque(embarque_id: int, db: Session = Depends(get_db), token: str = Depends(obtener_usuario_actual)):
    # Buscamos la cabecera
    cabecera = db.query(models.EmbarqueCabecera).filter(models.EmbarqueCabecera.id == embarque_id).first()
    if not cabecera:
        raise HTTPException(status_code=404, detail="Embarque no encontrado")
        
    # Buscamos las piezas que le pertenecen a ese embarque
    detalles = db.query(models.EmbarqueDetalle).filter(models.EmbarqueDetalle.embarque_id == embarque_id).all()
    
    # Empaquetamos todo junto
    return {"cabecera": cabecera, "detalles": detalles}

# ==========================================
# RUTAS DE CONFIGURACIÓN GLOBAL (MARCA BLANCA)
# ==========================================

@app.get("/configuracion", response_model=schemas.ConfiguracionResponse)
def obtener_configuracion(db: Session = Depends(get_db)):
    config = db.query(models.Configuracion).first()
    
    # Si es la primera vez que abrimos el sistema y no hay nada, creamos el "Registro 1"
    if not config:
        config = models.Configuracion(
            nombre_empresa="ASSA Industrial", 
            direccion="San Buenaventura, Coahuila"
        )
        db.add(config)
        db.commit()
        db.refresh(config)
        
    return config

@app.put("/configuracion", response_model=schemas.ConfiguracionResponse)
def actualizar_configuracion(
    # Fíjate cómo aquí no usamos BaseModel, usamos Form() y File()
    nombre_empresa: str = Form(...),
    direccion: str = Form(...),
    logo: UploadFile = File(None), # El logo es opcional (puede que solo cambien el nombre)
    db: Session = Depends(get_db),
    token: str = Depends(obtener_usuario_actual)
):
    config = db.query(models.Configuracion).first()
    
    # Actualizamos los textos
    config.nombre_empresa = nombre_empresa
    config.direccion = direccion
    
    # Si el usuario mandó un archivo nuevo...
    if logo:
        # Sacamos la extensión (ej. .png o .jpg)
        extension = logo.filename.split(".")[-1]
        nombre_archivo = f"logo_corporativo.{extension}"
        ruta_fisica = f"static/logos/{nombre_archivo}"
        
        # Guardamos el archivo físicamente en el disco duro del servidor
        with open(ruta_fisica, "wb") as buffer:
            shutil.copyfileobj(logo.file, buffer)
            
        # Guardamos la URL pública en PostgreSQL
        config.logo_url = f"/static/logos/{nombre_archivo}"
        
    db.commit()
    db.refresh(config)
    
    return config

