# diagnosticoDesis

## Requisitos del Sistema
- PHP 8.0
- PostgreSQL 15
- Docker y Docker Compose (Para base de datos si es que no se tiene en PC)

## Instalación

### 1. Configuración de la Base de Datos
El proyecto incluye un archivo `docker-compose.yml` para facilitar la instalación de PostgreSQL:

```bash
# Desde el directorio raíz del proyecto
docker-compose up -d
```

Esto creará automáticamente:
- Contenedor PostgreSQL en puerto 5432
- Base de datos: sistema_productos
- Usuario: user
- Contraseña: 1234


en db/init.sql se encuentra las tablas de la bases de datos "sistema_productos"

### 2. Configuración del Servidor Web
```bash
php -S localhost:8000
```

### 3. Verificar Instalación

1. Abrir navegador en http://localhost:8000
2. Verificar que el formulario se carga correctamente