# Configuración de Variables de Entorno en Vercel

## Variables requeridas:

1. **NODE_ENV**: `production`
2. **TURSO_DATABASE_URL**: `libsql://candidatos-db-xxlxx2211.aws-us-east-1.turso.io`
3. **TURSO_AUTH_TOKEN**: `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDgxMzI1NzMsImlkIjoiYzFkMTM3NDYtYzBjMy00MWY2LTk3MGUtMzY3MzkyNzM2YzlkIiwicmlkIjoiMzMzNjUwNmMtMTc3OS00OGI4LTlkY2ItNmU2MjMyNGI0MmEzIn0.CFxwIJjSKqMtYeUEc27WEQgyj4H_9R9pWnEzOmXBJ3R7dltSuUnvCfS8xTYj90tAaJsVxCMGdoj2v_yrjwSpBg`

## Pasos para configurar en Vercel:

1. Ir a https://vercel.com/dashboard
2. Seleccionar el proyecto RH
3. Ir a Settings > Environment Variables
4. Agregar cada variable con su valor correspondiente
5. Redeploy el proyecto

## Rutas de prueba:

- `/api/test` - Verificar configuración
- `/candidatos` - Página principal
- `/` - Página de inicio
