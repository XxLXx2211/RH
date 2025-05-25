const { createDatabase, executeQuery, getOne, getAll } = require('./database-config');

// Cargar variables de entorno
require('dotenv').config();

let db;
let dbInitialized = false;

async function ensureDB() {
    if (!dbInitialized) {
        try {
            db = createDatabase();
            console.log('🚀 Conectado a la base de datos Turso');
            dbInitialized = true;
        } catch (error) {
            console.error('❌ Error inicializando base de datos Turso:', error);
            throw error;
        }
    }
    return db;
}

// Función de utilidad para manejar respuestas de Netlify Function
function handlerResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', // Permite CORS para el frontend
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify(body),
    };
}

// Función para manejar solicitudes OPTIONS (preflight)
function handleOptions() {
    return {
        statusCode: 204, // No Content
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400', // Cache preflight por 24 horas
        },
        body: '',
    };
}

// Exportar cada ruta como una función Lambda
exports.handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
        return handleOptions();
    }

    const path = event.path.replace('/.netlify/functions/server', ''); // Ajustar la ruta para que coincida con las rutas de Express

    try {
        const database = await ensureDB();

        // Ruta de test
        if (path === '/api/test' && event.httpMethod === 'GET') {
            return handlerResponse(200, {
                message: 'Servidor funcionando en Netlify Function',
                env: process.env.NODE_ENV,
                turso_url: process.env.TURSO_DATABASE_URL ? 'Configurado' : 'No configurado',
                turso_token: process.env.TURSO_AUTH_TOKEN ? 'Configurado' : 'No configurado'
            });
        }

        // Obtener todos los candidatos con filtros
        if (path === '/api/candidatos' && event.httpMethod === 'GET') {
            let sql = 'SELECT * FROM candidatos WHERE 1=1';
            let params = [];
            const query = event.queryStringParameters || {};

            if (query.sexo) {
                sql += ' AND sexo = ?';
                params.push(query.sexo);
            }
            if (query.edad) {
                sql += ' AND edad = ?';
                params.push(parseInt(query.edad));
            }
            if (query.estatus) {
                sql += ' AND estatus = ?';
                params.push(query.estatus);
            }
            if (query.zona_reside) {
                sql += ' AND zona_reside = ?';
                params.push(query.zona_reside);
            }
            if (query.area_interes) {
                sql += ' AND area_interes = ?';
                params.push(query.area_interes);
            }
            if (query.search) {
                sql += ' AND (nombres_apellidos LIKE ? OR cedula LIKE ? OR telefonos LIKE ?)';
                const searchTerm = `%${query.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            sql += ' ORDER BY fecha_registro DESC';

            const rows = await getAll(database, sql, params);
            return handlerResponse(200, { candidatos: rows });
        }

        // Obtener un candidato por ID
        if (path.match(/^\/api\/candidatos\/[^/]+$/) && event.httpMethod === 'GET') {
            const id = path.split('/').pop();
            const sql = 'SELECT * FROM candidatos WHERE id = ?';
            const row = await getOne(database, sql, [id]);

            if (row) {
                return handlerResponse(200, { candidato: row });
            } else {
                return handlerResponse(404, { error: 'Candidato no encontrado' });
            }
        }

        // Crear nuevo candidato
        if (path === '/api/candidatos' && event.httpMethod === 'POST') {
            const body = JSON.parse(event.body);
            const {
                nombres_apellidos, cedula, sexo, edad, canal_recepcion, fuente, referido,
                tipo_contacto, fecha_contacto, citado_entrevista, fecha_entrevista,
                entrevistador_telefonico, entrevistador_presencial, solicitud_empleo,
                guia_entrevista, ubicacion, zona_reside, direccion, telefonos, experiencia,
                num_hijos, area_interes, cuenta_bancaria, expectativa_salarial, estatus,
                seguridad_bancaria, pds_asignado, comentarios
            } = body;

            // Validaciones básicas
            if (!nombres_apellidos || !cedula || !sexo || !edad || !canal_recepcion || !tipo_contacto || !fecha_contacto || !estatus) {
                return handlerResponse(400, { error: 'Los campos obligatorios son: nombres_apellidos, cedula, sexo, edad, canal_recepcion, tipo_contacto, fecha_contacto, estatus' });
            }

            if (edad < 16 || edad > 80) {
                return handlerResponse(400, { error: 'La edad debe estar entre 16 y 80 años' });
            }

            const sql = `INSERT INTO candidatos (
                nombres_apellidos, cedula, sexo, edad, canal_recepcion, fuente, referido,
                tipo_contacto, fecha_contacto, citado_entrevista, fecha_entrevista,
                entrevistador_telefonico, entrevistador_presencial, solicitud_empleo,
                guia_entrevista, ubicacion, zona_reside, direccion, telefonos, experiencia,
                num_hijos, area_interes, cuenta_bancaria, expectativa_salarial, estatus,
                seguridad_bancaria, pds_asignado, comentarios
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const result = await executeQuery(database, sql, [
                nombres_apellidos, cedula, sexo, edad, canal_recepcion, fuente, referido,
                tipo_contacto, fecha_contacto, citado_entrevista, fecha_entrevista,
                entrevistador_telefonico, entrevistador_presencial, solicitud_empleo,
                guia_entrevista, ubicacion, zona_reside, direccion, telefonos, experiencia,
                num_hijos || 0, area_interes, cuenta_bancaria, expectativa_salarial, estatus,
                seguridad_bancaria, pds_asignado, comentarios
            ]);

            return handlerResponse(200, {
                message: 'Candidato creado exitosamente',
                id: result.lastInsertRowid || result.meta?.last_insert_rowid
            });
        }

        // Actualizar candidato
        if (path.match(/^\/api\/candidatos\/[^/]+$/) && event.httpMethod === 'PUT') {
            const id = path.split('/').pop();
            const body = JSON.parse(event.body);
            const {
                nombres_apellidos, cedula, sexo, edad, canal_recepcion, fuente, referido,
                tipo_contacto, fecha_contacto, citado_entrevista, fecha_entrevista,
                entrevistador_telefonico, entrevistador_presencial, solicitud_empleo,
                guia_entrevista, ubicacion, zona_reside, direccion, telefonos, experiencia,
                num_hijos, area_interes, cuenta_bancaria, expectativa_salarial, estatus,
                seguridad_bancaria, pds_asignado, comentarios
            } = body;

            const sql = `UPDATE candidatos SET
                nombres_apellidos = ?, cedula = ?, sexo = ?, edad = ?, canal_recepcion = ?,
                fuente = ?, referido = ?, tipo_contacto = ?, fecha_contacto = ?,
                citado_entrevista = ?, fecha_entrevista = ?, entrevistador_telefonico = ?,
                entrevistador_presencial = ?, solicitud_empleo = ?, guia_entrevista = ?,
                ubicacion = ?, zona_reside = ?, direccion = ?, telefonos = ?, experiencia = ?,
                num_hijos = ?, area_interes = ?, cuenta_bancaria = ?, expectativa_salarial = ?,
                estatus = ?, seguridad_bancaria = ?, pds_asignado = ?, comentarios = ?
                WHERE id = ?`;

            const result = await executeQuery(database, sql, [
                nombres_apellidos, cedula, sexo, edad, canal_recepcion, fuente, referido,
                tipo_contacto, fecha_contacto, citado_entrevista, fecha_entrevista,
                entrevistador_telefonico, entrevistador_presencial, solicitud_empleo,
                guia_entrevista, ubicacion, zona_reside, direccion, telefonos, experiencia,
                num_hijos || 0, area_interes, cuenta_bancaria, expectativa_salarial, estatus,
                seguridad_bancaria, pds_asignado, comentarios, id
            ]);

            if (result.rowsAffected === 0) {
                return handlerResponse(404, { error: 'Candidato no encontrado' });
            } else {
                return handlerResponse(200, { message: 'Candidato actualizado exitosamente' });
            }
        }

        // Eliminar candidato
        if (path.match(/^\/api\/candidatos\/[^/]+$/) && event.httpMethod === 'DELETE') {
            const id = path.split('/').pop();
            const sql = 'DELETE FROM candidatos WHERE id = ?';
            const result = await executeQuery(database, sql, [id]);

            if (result.rowsAffected === 0) {
                return handlerResponse(404, { error: 'Candidato no encontrado' });
            } else {
                return handlerResponse(200, { message: 'Candidato eliminado exitosamente' });
            }
        }

        // Si ninguna ruta coincide
        return handlerResponse(404, { error: 'Ruta no encontrada' });

    } catch (error) {
        console.error('Error en Netlify Function:', error);
        if (error.message.includes('UNIQUE constraint failed') || error.message.includes('UNIQUE')) {
            return handlerResponse(400, { error: 'La cédula ya existe en la base de datos' });
        } else {
            return handlerResponse(500, { error: error.message });
        }
    }
};
