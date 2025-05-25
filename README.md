# Sistema de Gestión de Personas

Una aplicación web completa para gestionar información de personas utilizando HTML, CSS, JavaScript y una base de datos SQL (SQLite).

## Características

- ✅ **CRUD Completo**: Crear, leer, actualizar y eliminar personas
- 🗄️ **Base de Datos SQL**: Utiliza SQLite para almacenar la información
- 🔍 **Búsqueda en Tiempo Real**: Busca por nombre, cédula o teléfono
- 📱 **Diseño Responsivo**: Funciona en dispositivos móviles y escritorio
- ✨ **Interfaz Moderna**: Diseño atractivo con animaciones y efectos
- 🔔 **Notificaciones**: Feedback visual para todas las acciones
- ✅ **Validaciones**: Validación tanto en frontend como backend

## Campos de la Base de Datos

- **Nombre Completo**: Texto (obligatorio)
- **Edad**: Número entero entre 0 y 150 (obligatorio)
- **Cédula**: Texto único (obligatorio)
- **Número de Teléfono**: Texto (obligatorio)
- **Fecha de Registro**: Timestamp automático

## Instalación y Uso

### Prerrequisitos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

### Pasos de Instalación

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar el servidor**:
   ```bash
   npm start
   ```

3. **Abrir en el navegador**:
   - Visita: `http://localhost:3000`

### Para Desarrollo

Si quieres hacer cambios y que se recargue automáticamente:

```bash
npm run dev
```

## Estructura del Proyecto

```
├── database.sql          # Script SQL para crear la tabla
├── server.js             # Servidor backend con Express
├── package.json          # Configuración del proyecto
├── index.html            # Página principal
├── style.css             # Estilos CSS
├── script.js             # JavaScript del frontend
├── README.md             # Este archivo
└── personas.db           # Base de datos SQLite (se crea automáticamente)
```

## API Endpoints

- `GET /api/personas` - Obtener todas las personas
- `GET /api/personas/:id` - Obtener una persona por ID
- `POST /api/personas` - Crear nueva persona
- `PUT /api/personas/:id` - Actualizar persona existente
- `DELETE /api/personas/:id` - Eliminar persona

## Tecnologías Utilizadas

### Backend
- **Node.js**: Entorno de ejecución
- **Express.js**: Framework web
- **SQLite3**: Base de datos
- **CORS**: Manejo de CORS

### Frontend
- **HTML5**: Estructura
- **CSS3**: Estilos y animaciones
- **JavaScript (ES6+)**: Lógica del frontend
- **Fetch API**: Comunicación con el backend

## Funcionalidades

### Gestión de Personas
- Agregar nuevas personas con validación
- Editar información existente
- Eliminar personas con confirmación
- Ver lista completa de personas

### Búsqueda y Filtrado
- Búsqueda en tiempo real
- Filtrado por nombre, cédula o teléfono
- Actualización manual de la lista

### Interfaz de Usuario
- Diseño moderno y responsivo
- Notificaciones para feedback
- Modal de confirmación para eliminaciones
- Animaciones suaves

## Validaciones

### Frontend
- Campos obligatorios
- Rango de edad (0-150)
- Formato de entrada

### Backend
- Validación de datos requeridos
- Restricción de edad
- Cédula única
- Manejo de errores SQL

## Personalización

Puedes personalizar fácilmente:

1. **Estilos**: Modifica `style.css`
2. **Campos**: Actualiza `database.sql`, `server.js` y los formularios
3. **Validaciones**: Ajusta las reglas en `server.js` y `script.js`
4. **Puerto**: Cambia la variable `PORT` en `server.js`

## Solución de Problemas

### Error de Puerto en Uso
Si el puerto 3000 está ocupado, cambia la variable `PORT` en `server.js`:

```javascript
const PORT = 3001; // o cualquier otro puerto disponible
```

### Problemas de Base de Datos
La base de datos se crea automáticamente. Si hay problemas, elimina el archivo `personas.db` y reinicia el servidor.

### Dependencias Faltantes
Ejecuta `npm install` para instalar todas las dependencias necesarias.

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
