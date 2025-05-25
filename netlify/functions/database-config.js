const { createClient } = require('@libsql/client');

// Configuración de base de datos - Solo Turso
function createDatabase() {
    // Usar Turso siempre (desarrollo y producción)
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
        throw new Error('Variables de entorno TURSO_DATABASE_URL y TURSO_AUTH_TOKEN son requeridas');
    }

    return createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    });
}

// Función para ejecutar queries - Solo Turso
async function executeQuery(db, sql, params = []) {
    const result = await db.execute({
        sql: sql,
        args: params
    });
    return result;
}

// Función para obtener un registro - Solo Turso
async function getOne(db, sql, params = []) {
    const result = await db.execute({
        sql: sql,
        args: params
    });
    return result.rows[0] || null;
}

// Función para obtener múltiples registros - Solo Turso
async function getAll(db, sql, params = []) {
    const result = await db.execute({
        sql: sql,
        args: params
    });
    return result.rows;
}

// Función para inicializar la base de datos - No necesaria con Turso
async function initializeDatabase(db) {
    console.log('Database initialization skipped - using Turso cloud database');
    return;
}

module.exports = {
    createDatabase,
    executeQuery,
    getOne,
    getAll,
    initializeDatabase
};
