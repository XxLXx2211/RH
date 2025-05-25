# 🚀 Configuración de Turso para tu PWA

## ¿Qué es Turso?
Turso es SQLite en la nube. Perfecto para tu proyecto porque:
- ✅ **Gratis**: 500 bases de datos, 9GB almacenamiento
- ✅ **SQLite real**: No cambias tu código
- ✅ **Global**: Réplicas en todo el mundo
- ✅ **Rápido**: Edge computing

## Paso 1: Crear cuenta en Turso

1. Ve a [turso.tech](https://turso.tech)
2. Clic en "Sign up"
3. Conecta con GitHub
4. Verifica tu email

## Paso 2: Instalar Turso CLI

### En Windows:
```powershell
# Usando PowerShell
iwr -useb https://get.tur.so/install.ps1 | iex
```

### En Mac/Linux:
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

### Alternativa (usando npm):
```bash
npm install -g @turso/cli
```

## Paso 3: Autenticarse

```bash
# Autenticarse con GitHub
turso auth signup

# O si ya tienes cuenta
turso auth login
```

## Paso 4: Crear tu base de datos

```bash
# Crear base de datos
turso db create candidatos-db

# Ver información de la base de datos
turso db show candidatos-db
```

## Paso 5: Obtener credenciales

```bash
# Obtener URL de conexión
turso db show candidatos-db --url

# Crear token de acceso
turso db tokens create candidatos-db
```

## Paso 6: Migrar tus datos

```bash
# Subir tu esquema actual
turso db shell candidatos-db < database.sql

# O conectarse interactivamente
turso db shell candidatos-db
```

## Paso 7: Configurar variables de entorno

### Para desarrollo local:
Crea un archivo `.env`:
```env
NODE_ENV=development
```

### Para Vercel (producción):
En el dashboard de Vercel, agrega estas variables:

```
TURSO_DATABASE_URL=libsql://candidatos-db-tu-usuario.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
NODE_ENV=production
```

## Paso 8: Probar localmente

```bash
# Instalar dependencias (ya hecho)
npm install

# Ejecutar en modo desarrollo (usa SQLite local)
npm run dev

# Ejecutar en modo producción (usa Turso)
NODE_ENV=production npm start
```

## Comandos útiles de Turso

```bash
# Listar bases de datos
turso db list

# Ver esquema de la base de datos
turso db shell candidatos-db ".schema"

# Ver datos
turso db shell candidatos-db "SELECT * FROM candidatos LIMIT 5;"

# Hacer backup
turso db dump candidatos-db --output backup.sql

# Eliminar base de datos
turso db destroy candidatos-db
```

## Límites del plan gratuito

- ✅ **500 bases de datos**
- ✅ **9 GB de almacenamiento total**
- ✅ **1 millón de filas leídas/mes**
- ✅ **25,000 filas escritas/mes**
- ✅ **Réplicas ilimitadas**

## Monitoreo

```bash
# Ver estadísticas de uso
turso db inspect candidatos-db

# Ver logs
turso db shell candidatos-db ".log"
```

## Troubleshooting

### Error: "command not found: turso"
```bash
# Reiniciar terminal o agregar al PATH
export PATH="$HOME/.turso:$PATH"
```

### Error: "database not found"
```bash
# Verificar que la base de datos existe
turso db list
```

### Error de autenticación
```bash
# Re-autenticarse
turso auth login
```

## ¿Listo para desplegar?

Una vez configurado Turso:

1. ✅ Sube tu código a GitHub
2. ✅ Conecta con Vercel
3. ✅ Agrega las variables de entorno
4. ✅ ¡Despliega!

Tu PWA funcionará perfectamente con:
- 🔒 **HTTPS automático**
- 📱 **Botón de instalación**
- 🌍 **Base de datos global**
- ⚡ **Velocidad extrema**
