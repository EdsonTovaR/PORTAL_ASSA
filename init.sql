-- 1. TABLAS CATÁLOGO (Se crean primero porque no dependen de nadie)

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo_odette VARCHAR(50) UNIQUE NOT NULL, -- Clave vital para el estándar VDA/OFTP2
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transportistas (
    id SERIAL PRIMARY KEY,
    nombre_chofer VARCHAR(100) NOT NULL,
    placas VARCHAR(20) NOT NULL,
    linea_transportista VARCHAR(100),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA TRANSACCIONAL CABECERA (La 1ra Forma Normal)

CREATE TABLE embarques_cabecera (
    id SERIAL PRIMARY KEY,
    folio_embarque VARCHAR(50) UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    transportista_id INT NOT NULL,
    fecha_salida TIMESTAMP NOT NULL,
    estatus_edi VARCHAR(20) DEFAULT 'PENDIENTE', -- Puede ser: PENDIENTE, ENVIADO, ERROR
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Buenas prácticas: Integridad Referencial
    CONSTRAINT fk_cliente FOREIGN KEY(cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    CONSTRAINT fk_transportista FOREIGN KEY(transportista_id) REFERENCES transportistas(id) ON DELETE RESTRICT
);

-- 3. TABLA TRANSACCIONAL DETALLE (La 2da Forma Normal)

CREATE TABLE embarques_detalle (
    id SERIAL PRIMARY KEY,
    embarque_id INT NOT NULL,
    numero_parte VARCHAR(50) NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    peso_kg DECIMAL(10,2),
    
    -- Relación con la cabecera
    CONSTRAINT fk_embarque FOREIGN KEY(embarque_id) REFERENCES embarques_cabecera(id) ON DELETE CASCADE
);

-- TABLA DE USUARIOS (Para el Login y Seguridad JWT)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE configuracion (
    id SERIAL PRIMARY KEY,
    nombre_empresa VARCHAR(50),
    direccion VARCHAR(50),
    logo_url VARCHAR
);