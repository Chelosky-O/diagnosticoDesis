CREATE TABLE bodegas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE sucursales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    bodega_id INTEGER REFERENCES bodegas(id) ON DELETE CASCADE
);

CREATE TABLE monedas (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL,
    nombre VARCHAR(50) NOT NULL
);  

CREATE TABLE materiales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(15) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    bodega_id INTEGER REFERENCES bodegas(id) ON DELETE SET NULL,
    sucursal_id INTEGER REFERENCES sucursales(id) ON DELETE SET NULL,
    moneda_id INTEGER REFERENCES monedas(id) ON DELETE SET NULL,
    precio DECIMAL(10,2) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE producto_materiales (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    material_id INTEGER REFERENCES materiales(id) ON DELETE CASCADE,
    UNIQUE(producto_id, material_id)
);

-- Data Inicial --

INSERT INTO bodegas (nombre) VALUES 
    ('Bodega Central'),
    ('Bodega Norte'),
    ('Bodega Sur'),
    ('Bodega Este');

INSERT INTO sucursales (nombre, bodega_id) VALUES 
    ('Sucursal Centro', 1),
    ('Sucursal Plaza', 1),
    ('Sucursal Norte 1', 2),
    ('Sucursal Norte 2', 2),
    ('Sucursal Sur Principal', 3),
    ('Sucursal Sur Secundaria', 3),
    ('Sucursal Este 1', 4),
    ('Sucursal Este 2', 4);

INSERT INTO monedas (codigo, nombre) VALUES 
    ('CLP', 'Peso Chileno'),
    ('USD', 'Dolar'),
    ('EUR', 'Euro'),
    ('PEN', 'Sol');

INSERT INTO materiales (nombre) VALUES 
    ('Plástico'),
    ('Metal'),
    ('Madera'),
    ('Vidrio'),
    ('Textil');