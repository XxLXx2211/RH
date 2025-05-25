# 🚀 Configurar Turso (SQLite en la nube)

## Paso 1: Crear cuenta en Turso
1. Ve a [turso.tech](https://turso.tech)
2. Clic en "Sign up" y conecta con GitHub
3. Verifica tu email

## Paso 2: Instalar Turso CLI
```bash
# En tu terminal
npm install -g @libsql/client
```

## Paso 3: Crear tu base de datos
```bash
# Instalar CLI de Turso
curl -sSfL https://get.tur.so/install.sh | bash

# Crear base de datos
turso db create candidatos-db

# Obtener URL de conexión
turso db show candidatos-db

# Crear token de acceso
turso db tokens create candidatos-db
```

## Paso 4: Migrar tus datos
```bash
# Subir tu base de datos actual
turso db shell candidatos-db < database.sql
```

## Paso 5: Actualizar tu código
Instalar el cliente:
```bash
npm install @libsql/client
```

## Variables de entorno para Vercel:
```
TURSO_DATABASE_URL=libsql://tu-db.turso.io
TURSO_AUTH_TOKEN=tu-token-aqui
```

## Ventajas:
- ✅ Mismo código SQLite
- ✅ 500 DBs gratis
- ✅ 9GB almacenamiento
- ✅ Backups automáticos
- ✅ Edge locations globales
