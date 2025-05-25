const fs = require('fs');
const path = require('path');

// Crear directorio de iconos si no existe
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

// Función para crear un SVG básico
function createSVGIcon(size) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo -->
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.1}"/>
  
  <!-- Iconos de personas -->
  <g fill="white">
    <!-- Persona 1 -->
    <circle cx="${size * 0.25}" cy="${size * 0.3}" r="${size * 0.08}"/>
    <rect x="${size * 0.186}" y="${size * 0.34}" width="${size * 0.128}" height="${size * 0.16}" rx="${size * 0.02}"/>
    
    <!-- Persona 2 -->
    <circle cx="${size * 0.75}" cy="${size * 0.3}" r="${size * 0.08}"/>
    <rect x="${size * 0.686}" y="${size * 0.34}" width="${size * 0.128}" height="${size * 0.16}" rx="${size * 0.02}"/>
    
    <!-- Texto CV -->
    <text x="${size * 0.5}" y="${size * 0.75}" font-family="Arial, sans-serif" font-size="${size * 0.15}" font-weight="bold" text-anchor="middle" fill="white">CV</text>
    
    <!-- Líneas decorativas -->
    <line x1="${size * 0.2}" y1="${size * 0.85}" x2="${size * 0.8}" y2="${size * 0.85}" stroke="rgba(255,255,255,0.3)" stroke-width="${size * 0.01}"/>
    <line x1="${size * 0.2}" y1="${size * 0.89}" x2="${size * 0.8}" y2="${size * 0.89}" stroke="rgba(255,255,255,0.3)" stroke-width="${size * 0.01}"/>
    <line x1="${size * 0.2}" y1="${size * 0.93}" x2="${size * 0.8}" y2="${size * 0.93}" stroke="rgba(255,255,255,0.3)" stroke-width="${size * 0.01}"/>
  </g>
</svg>`;
}

// Tamaños de iconos necesarios
const sizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];

// Crear archivos SVG para cada tamaño
sizes.forEach(size => {
    const svgContent = createSVGIcon(size);
    let filename;
    
    if (size === 16) filename = 'favicon-16x16.svg';
    else if (size === 32) filename = 'favicon-32x32.svg';
    else if (size === 180) filename = 'apple-touch-icon.svg';
    else filename = `icon-${size}x${size}.svg`;
    
    fs.writeFileSync(path.join(iconsDir, filename), svgContent);
    console.log(`✅ Creado: ${filename}`);
});

// Crear un favicon.ico básico (como SVG por simplicidad)
const faviconSVG = createSVGIcon(32);
fs.writeFileSync(path.join(__dirname, 'favicon.ico'), faviconSVG);
console.log('✅ Creado: favicon.ico');

// Crear archivos PNG básicos usando Canvas (si está disponible) o placeholders
function createPNGPlaceholder(size, filename) {
    // Como no tenemos Canvas en Node.js sin dependencias adicionales,
    // creamos un archivo de texto que indica que se debe reemplazar
    const placeholder = `<!-- PLACEHOLDER PNG ${size}x${size} -->
<!-- Para generar los PNG reales, abre generate-icons.html en tu navegador -->
<!-- y descarga los iconos generados -->`;
    
    fs.writeFileSync(path.join(iconsDir, filename), placeholder);
}

// Crear placeholders PNG
sizes.forEach(size => {
    let filename;
    
    if (size === 16) filename = 'favicon-16x16.png';
    else if (size === 32) filename = 'favicon-32x32.png';
    else if (size === 180) filename = 'apple-touch-icon.png';
    else filename = `icon-${size}x${size}.png`;
    
    createPNGPlaceholder(size, filename);
    console.log(`📝 Placeholder creado: ${filename}`);
});

console.log('\n🎉 ¡Iconos básicos creados!');
console.log('📌 Para generar los PNG reales:');
console.log('   1. Abre generate-icons.html en tu navegador');
console.log('   2. Haz clic en "Generar Todos los Iconos"');
console.log('   3. Haz clic en "Descargar Todos"');
console.log('   4. Mueve los archivos descargados a la carpeta /icons/');
console.log('\n🚀 Tu PWA está lista para funcionar!');
