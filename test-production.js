// Prueba rápida para producción
process.env.NODE_ENV = 'production';
process.env.TURSO_DATABASE_URL = 'libsql://candidatos-db-xxlxx2211.aws-us-east-1.turso.io';
process.env.TURSO_AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDgxMzI1NzMsImlkIjoiYzFkMTM3NDYtYzBjMy00MWY2LTk3MGUtMzY3MzkyNzM2YzlkIiwicmlkIjoiMzMzNjUwNmMtMTc3OS00OGI4LTlkY2ItNmU2MjMyNGI0MmEzIn0.CFxwIJjSKqMtYeUEc27WEQgyj4H_9R9pWnEzOmXBJ3R7dltSuUnvCfS8xTYj90tAaJsVxCMGdoj2v_yrjwSpBg';

const { createDatabase, getAll } = require('./database-config');

async function testProduction() {
    try {
        console.log('🧪 Probando configuración de producción...');
        
        const db = createDatabase();
        console.log('✅ Base de datos creada');
        
        const result = await getAll(db, 'SELECT COUNT(*) as count FROM candidatos');
        console.log('✅ Consulta exitosa:', result);
        console.log('📊 Total de candidatos:', result[0].count);
        
        console.log('🎉 ¡Todo funciona correctamente!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testProduction();
