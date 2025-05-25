const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
function createDatabase() {
    // En desarrollo (local) usar SQLite
    if (process.env.NODE_ENV !== 'production') {
        const sqlite3 = require('sqlite3').verbose();
        return new sqlite3.Database('./candidatos.db', (err) => {
            if (err) {
                console.error('Error al conectar con SQLite local:', err.message);
            } else {
                console.log('✅ Conectado a SQLite local (desarrollo)');
            }
        });
    }
    
    // En producción usar Turso
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
        console.error('❌ Variables de entorno de Turso no configuradas');
        console.log('Necesitas configurar:');
        console.log('- TURSO_DATABASE_URL');
        console.log('- TURSO_AUTH_TOKEN');
        process.exit(1);
    }

    const client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    });

    console.log('✅ Conectado a Turso (producción)');
    return client;
}

// Función para ejecutar queries compatibles con ambos
async function executeQuery(db, sql, params = []) {
    if (process.env.NODE_ENV !== 'production') {
        // SQLite local
        return new Promise((resolve, reject) => {
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve({ rows });
                });
            } else {
                db.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve({ 
                        lastInsertRowid: this.lastID,
                        changes: this.changes 
                    });
                });
            }
        });
    } else {
        // Turso
        try {
            const result = await db.execute({
                sql: sql,
                args: params
            });
            return result;
        } catch (error) {
            throw error;
        }
    }
}

// Función para obtener un registro
async function getOne(db, sql, params = []) {
    if (process.env.NODE_ENV !== 'production') {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    } else {
        const result = await db.execute({
            sql: sql,
            args: params
        });
        return result.rows[0] || null;
    }
}

// Función para obtener múltiples registros
async function getAll(db, sql, params = []) {
    if (process.env.NODE_ENV !== 'production') {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    } else {
        const result = await db.execute({
            sql: sql,
            args: params
        });
        return result.rows;
    }
}

// Función para inicializar la base de datos
async function initializeDatabase(db) {
    const sqlScript = fs.readFileSync('./database.sql', 'utf8');
    
    if (process.env.NODE_ENV !== 'production') {
        // SQLite local
        return new Promise((resolve, reject) => {
            db.exec(sqlScript, (err) => {
                if (err) {
                    console.error('Error al ejecutar el script SQL:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Base de datos local inicializada correctamente.');
                    resolve();
                }
            });
        });
    } else {
        // Turso - ejecutar comandos uno por uno
        const statements = sqlScript
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        for (const statement of statements) {
            try {
                await db.execute(statement);
            } catch (error) {
                // Ignorar errores de "table already exists"
                if (!error.message.includes('already exists')) {
                    console.error('Error ejecutando:', statement, error);
                }
            }
        }
        console.log('✅ Base de datos Turso inicializada correctamente.');
    }
}

module.exports = {
    createDatabase,
    executeQuery,
    getOne,
    getAll,
    initializeDatabase
};
