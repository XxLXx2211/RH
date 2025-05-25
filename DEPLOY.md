# 🚀 Guía de Despliegue en Vercel

## Pasos para desplegar tu PWA en Vercel:

### 1. **Crear cuenta en GitHub (si no tienes)**
- Ve a [github.com](https://github.com)
- Crea una cuenta gratuita

### 2. **Subir tu proyecto a GitHub**

#### Opción A: Usando GitHub Desktop (Fácil)
1. Descarga [GitHub Desktop](https://desktop.github.com/)
2. Instala y conecta tu cuenta
3. Clic en "Add an Existing Repository from your Hard Drive"
4. Selecciona la carpeta de tu proyecto
5. Clic en "Publish repository"
6. Marca "Keep this code private" si quieres que sea privado
7. Clic en "Publish Repository"

#### Opción B: Usando línea de comandos
```bash
# En la carpeta de tu proyecto
git init
git add .
git commit -m "Initial commit - PWA Sistema de Gestión de Candidatos"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

### 3. **Desplegar en Vercel**

1. **Ve a [vercel.com](https://vercel.com)**
2. **Clic en "Sign Up" y conecta con GitHub**
3. **Clic en "New Project"**
4. **Selecciona tu repositorio** de la lista
5. **Configura el proyecto:**
   - Framework Preset: `Other`
   - Root Directory: `./` (dejar por defecto)
   - Build Command: `npm run build`
   - Output Directory: `./` (dejar por defecto)
   - Install Command: `npm install`

6. **Variables de entorno (si necesitas):**
   - Por ahora no necesitas ninguna

7. **Clic en "Deploy"**

### 4. **¡Listo! Tu PWA estará disponible en:**
```
https://tu-proyecto.vercel.app
```

## 🔧 Configuración incluida:

- ✅ **vercel.json** - Configuración de rutas y headers
- ✅ **Soporte para API** - Todas tus rutas `/api/*` funcionarán
- ✅ **Headers PWA** - Manifest y Service Worker configurados
- ✅ **HTTPS automático** - Certificado SSL incluido
- ✅ **Dominio personalizado** - Puedes agregar tu propio dominio

## 📱 Después del despliegue:

1. **Abre tu app en el navegador**
2. **Verifica que aparezca el botón de instalación**
3. **Prueba instalar la PWA**
4. **Comparte el link con tus usuarios**

## 🔄 Actualizaciones automáticas:

Cada vez que hagas `git push` a tu repositorio, Vercel automáticamente:
- ✅ Detecta los cambios
- ✅ Hace build del proyecto
- ✅ Despliega la nueva versión
- ✅ Actualiza tu PWA

## 🌐 Dominio personalizado (opcional):

1. En el dashboard de Vercel
2. Ve a tu proyecto → Settings → Domains
3. Agrega tu dominio personalizado
4. Configura los DNS según las instrucciones

## 🆘 Solución de problemas:

### Si el build falla:
- Revisa que todas las dependencias estén en `package.json`
- Verifica que no haya errores en el código
- Revisa los logs en el dashboard de Vercel

### Si la base de datos no funciona:
- Vercel es serverless, necesitarás una base de datos externa
- Opciones: PlanetScale, Supabase, Railway
- O usar Vercel KV para datos simples

### Si el Service Worker no funciona:
- Verifica que `sw.js` esté en la raíz
- Revisa que los headers estén configurados en `vercel.json`
- Comprueba la consola del navegador

## 🎉 ¡Tu PWA estará lista para instalar!

Una vez desplegada en Vercel con HTTPS, el botón de instalación del navegador aparecerá automáticamente.
