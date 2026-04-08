# Arquitectura del Sistema - MotoParts Market

## Visión General

MotoParts Market es una API serverless para la gestión de un catálogo de partes de motocicletas.  
El sistema permite registrar nuevas partes y consultarlas por tipo, usando una arquitectura desacoplada por capas y ejecutándose completamente en local, sin acceso a AWS real.

La solución utiliza **Serverless Framework** y **Serverless Offline** para simular funciones Lambda y exponer endpoints REST, mientras que la persistencia se realiza con **DynamoDB Local**.

---

## Technology Stack

### Backend & Runtime
- **Runtime**: Node.js 20.x
- **Framework**: Serverless Framework
- **Servidor Local**: Serverless Offline

### Persistencia & Base de Datos
- **Base de Datos (desarrollo y pruebas)**: DynamoDB Local
- **SDK**: AWS SDK v3 (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`)

### Herramientas de Desarrollo
- **Testing**: Jest
- **Gestor de Paquetes**: npm
- **Generador de IDs**: uuid
- **Cliente HTTP de prueba**: curl, navegador, Postman o Insomnia

### Control & Automatización
- **Control de Versiones**: Git
- **Infraestructura como configuración**: `serverless.yml`
- **Scripts de automatización**: npm scripts (`db:init`, `seed`, `offline`, `deploy:sim`)

---

## Arquitectura del Sistema

### Capas de la Aplicación

#### 1. Capa de Presentación (Handlers)
- **Ubicación**: `src/handlers/`
- **Archivos**:
  - `health.js`
  - `createPart.js`
  - `getParts.js`

**Responsabilidades**:
- recibir eventos HTTP
- extraer body o query params
- invocar la lógica de negocio
- construir respuestas HTTP con códigos de estado y JSON

**Endpoints expuestos localmente**:
- `GET /dev`
- `POST /dev/partes`
- `GET /dev/partes?tipo=...`

---

#### 2. Capa de Lógica de Negocio (Business)
- **Ubicación**: `src/business/`
- **Archivo principal**: `partService.js`

**Responsabilidades**:
- validar datos de entrada
- aplicar reglas de negocio
- crear entidades del dominio
- coordinar la interacción con el repositorio

**Validaciones principales**:
- `nombre` es obligatorio
- `tipo` es obligatorio
- `precio` debe ser un número positivo

---

#### 3. Capa de Acceso a Datos (Repositories)
- **Ubicación**: `src/repositories/`
- **Archivo principal**: `partRepository.js`

**Responsabilidades**:
- guardar partes en DynamoDB Local
- consultar partes filtradas por `tipo`
- encapsular el acceso a la base de datos mediante AWS SDK v3

Esta capa desacopla la lógica de negocio de los detalles de persistencia.

---

#### 4. Capa de Modelos (Models)
- **Ubicación**: `src/models/`
- **Archivo principal**: `Part.js`

**Responsabilidades**:
- representar la entidad del dominio
- definir la estructura de una parte de motocicleta
- estandarizar los datos almacenados y devueltos

**Campos principales**:
- `id`
- `nombre`
- `tipo`
- `precio`
- `createdAt`

---

## Diagrama de Flujo

```text
HTTP Request
    ↓
Serverless Offline
    ↓
Lambda Handler
    ↓
Business Service
    ↓
Repository
    ↓
DynamoDB Local
    ↓
HTTP Response (JSON + status code)
```

---

## Topología del Sistema

El flujo general del sistema es:

Cliente (curl / Postman / navegador)  
→ Serverless Offline  
→ Lambda Handler  
→ Business Logic  
→ Repository  
→ DynamoDB Local

Esta topología permite simular una arquitectura serverless real de manera local, manteniendo separadas las responsabilidades de entrada HTTP, validación, lógica de negocio y persistencia.

---

## Seguridad

### Validación & Sanitización
- verificación de campos requeridos
- validación de tipos de datos
- validación de rango numérico (`precio > 0`)
- normalización básica de strings (`trim()`)

### Control de Errores
- **400 Bad Request** para errores de validación
- **200 OK** para lecturas exitosas
- **201 Created** para creación exitosa
- **500 Internal Server Error** para errores inesperados

### Autenticación & Autorización
- **Estado actual**: API abierta, sin autenticación
- **Posible mejora futura**:
  - autenticación con JWT
  - control de acceso por usuario
  - CORS más específico para clientes reales

### Gestión de Configuración
- variables de entorno para:
  - `DYNAMODB_TABLE`
  - `DYNAMODB_ENDPOINT`
  - `AWS_REGION`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`

### Transporte
- **En desarrollo local**: HTTP (`localhost`)
- **En un despliegue real**: HTTPS mediante API Gateway o infraestructura equivalente

---

## Persistencia

### Base de Datos
La persistencia se realiza en **DynamoDB Local**, ejecutándose en:

- `http://127.0.0.1:8000`

### Tabla Principal
- `PartsTable`

### Clave Primaria
- `id` (HASH)

### Índice Secundario Global
- `TipoIndex`

Este índice permite consultas eficientes por el atributo `tipo`, requisito fundamental del endpoint de lectura.

---

## Endpoints

### Definición lógica del sistema
- `GET /`
- `POST /partes`
- `GET /partes?tipo=...`

### Exposición real en entorno local
- `GET /dev`
- `POST /dev/partes`
- `GET /dev/partes?tipo=...`

### Descripción funcional

#### `GET /dev`
Health check de la API.

#### `POST /dev/partes`
Registra una nueva parte con:
- `nombre`
- `tipo`
- `precio`

#### `GET /dev/partes?tipo=...`
Recupera las partes que coinciden con el tipo solicitado.

---

## Deployment & Infraestructura

### Ambiente actual: Desarrollo local
- **Servidor**: Serverless Offline
- **Base de Datos**: DynamoDB Local
- **Puerto API**: `localhost:3000`
- **Puerto DynamoDB Local**: `127.0.0.1:8000`

### Ejecución local
1. levantar DynamoDB Local
2. inicializar la tabla
3. sembrar datos de prueba
4. iniciar Serverless Offline

### Script de empaquetado simulado
- `npm run deploy:sim`

Este script genera un empaquetado de despliegue para producción de forma simulada, sin usar AWS real.

---

## Scripts Principales

### `npm run db:init`
Crea la tabla `PartsTable` en DynamoDB Local si no existe.

### `npm run seed`
Inserta datos mínimos de prueba en la base local.

### `npm run offline`
Levanta la API local con Serverless Offline.

### `npm run deploy:sim`
Empaqueta el proyecto como simulación de despliegue.

### `npm test`
Ejecuta las pruebas del proyecto.

### `npm run test:integration`
Ejecuta las pruebas de integración.

---

## Testing

### Estrategia de Testing

#### Unit Tests
- **Ubicación**: `test/unit/`
- **Objetivo**: validar reglas de negocio y casos de error

#### Integration Tests
- **Ubicación**: `test/integration/`
- **Objetivo**: comprobar el flujo de la API y la interacción entre capas

### Flujo validado manualmente
Además de los tests, el sistema fue validado manualmente con:

- `GET /dev`
- `POST /dev/partes`
- `GET /dev/partes?tipo=frenos`

Esto confirmó:
- creación correcta de registros
- persistencia real en DynamoDB Local
- recuperación de datos por tipo

---

## Estructura de Directorios

```text
MotoPart-Market/
├── src/
│   ├── handlers/
│   │   ├── health.js
│   │   ├── createPart.js
│   │   └── getParts.js
│   ├── business/
│   │   └── partService.js
│   ├── repositories/
│   │   └── partRepository.js
│   └── models/
│       └── Part.js
├── scripts/
│   ├── init-dynamodb.js
│   ├── seed-dynamodb.js
│   └── seed-data.json
├── test/
│   ├── unit/
│   │   └── partService.test.js
│   └── integration/
│       └── api.test.js
├── jest.config.js
├── jest.setup.js
├── serverless.yml
├── package.json
├── README.md
├── ARCHITECTURE.md
└── .gitignore
```

---

## Configuración Local para Desarrollo

### Requisitos
- Node.js 20.x o superior
- npm
- Docker Desktop
- Git

### Inicio Rápido
```bash
npm install
npm run db:init
npm run seed
npm run offline
```

---

## Vista de Datos

### Modelo de Datos (Part)
```json
{
  "id": "uuid-v4-string",
  "nombre": "string",
  "tipo": "string",
  "precio": "number",
  "createdAt": "ISO-8601 timestamp"
}
```

### Ejemplo de registro almacenado
```json
{
  "id": "seed-001",
  "nombre": "Freno de disco delantero",
  "tipo": "frenos",
  "precio": 45.99,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

## Manejo de Errores

### Estrategia
- validación temprana de entradas
- propagación controlada de errores
- respuestas HTTP coherentes
- separación entre errores del cliente y errores internos

### Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| 400 Bad Request | Datos inválidos o faltantes | Revisar body o query params |
| 500 Internal Error | Error interno inesperado | Revisar consola/logs |
| DynamoDB connection refused | DynamoDB Local no está levantado | Iniciar contenedor/servicio local |
| Route not found | Ruta incorrecta | Usar prefijo `/dev` en local |

---

## Paradigma y Estilo de Diseño

La solución sigue un enfoque de:

- **arquitectura por capas**
- **separación de responsabilidades**
- **desacoplamiento entre lógica y persistencia**
- **modelo serverless simulado localmente**

Esto facilita:
- mantenimiento
- pruebas
- crecimiento del sistema
- comprensión de la topología en la revisión oral

---

## Escalabilidad

### Ventajas del enfoque serverless
- separación clara entre funciones
- posibilidad de crecimiento modular
- bajo acoplamiento entre capas
- adaptación sencilla a un despliegue cloud real

### Limitaciones actuales
- API sin autenticación
- dominio pequeño, centrado en catálogo básico
- sin operaciones avanzadas como actualización o eliminación
- entorno pensado para desarrollo local y demostración académica

---

## Conclusión

La arquitectura implementada cumple con los requerimientos del ejercicio:

- arquitectura serverless con funciones desacopladas
- API REST
- DynamoDB Local
- capas `handlers`, `business`, `repositories` y `models`
- uso de AWS SDK local
- uso de Serverless Offline
- ejecución completamente local sin AWS real
- documentación suficiente para explicar implementación, tecnología, paradigma y topología