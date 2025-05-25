// Prueba de conexión a Turso
require('dotenv').config();
const { createClient } = require('@libsql/client');

async function testTurso() {
    try {
        console.log('🔗 Probando conexión a Turso...');
        
        const client = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });

        // Probar consulta simple
        const result = await client.execute('SELECT COUNT(*) as count FROM candidatos');
        
        console.log('✅ ¡Conexión exitosa a Turso!');
        console.log('📊 Registros en la base de datos:', result.rows[0].count);
        console.log('🌍 URL de la base de datos:', process.env.TURSO_DATABASE_URL);
        
        // Probar inserción de datos de prueba
        await client.execute({
            sql: 'INSERT INTO candidatos (nombres_apellidos, cedula, sexo, edad, canal_recepcion, tipo_contacto, fecha_contacto, estatus, zona_reside, area_interes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            args: ['Juan Pérez (Prueba)', '12345678', 'Masculino', 25, 'Web', 'Telefónico', '2024-01-25', 'Activo', 'Norte', 'Tecnología']
        });
        
        console.log('✅ Datos de prueba insertados correctamente');
        
        // Verificar inserción
        const newCount = await client.execute('SELECT COUNT(*) as count FROM candidatos');
        console.log('📊 Nuevos registros:', newCount.rows[0].count);
        
    } catch (error) {
        console.error('❌ Error conectando a Turso:', error.message);
        console.error('🔍 Verifica que las variables de entorno estén configuradas correctamente');
    }
}

testTurso();
