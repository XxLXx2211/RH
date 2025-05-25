const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno
require('dotenv').config();

// Importar configuración de base de datos
const {
    createDatabase,
    executeQuery,
    getOne,
    getAll,
    initializeDatabase
} = require('./database-config');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar base de datos
let db;
async function initDB() {
    try {
        db = createDatabase();
        await initializeDatabase(db);
        console.log('🚀 Base de datos lista');
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        process.exit(1);
    }
}

// Inicializar DB al arrancar
initDB();

// Middleware
app.use(cors());
app.use(express.json());

// Configurar headers para PWA
app.use((req, res, next) => {
    // Headers de seguridad para PWA
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Headers específicos para archivos PWA
    if (req.url === '/manifest.json') {
        res.setHeader('Content-Type', 'application/manifest+json');
    }
    if (req.url === '/sw.js') {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Service-Worker-Allowed', '/');
    }

    next();
});

// Servir archivos estáticos
app.use(express.static('.', {
    setHeaders: (res, path) => {
        // Cache para iconos y recursos estáticos
        if (path.includes('/icons/') || path.endsWith('.css') || path.endsWith('.js')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 año
        }
        // Cache corto para HTML
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hora
        }
    }
}));



// Rutas API

// Obtener todos los candidatos con filtros
app.get('/api/candidatos', async (req, res) => {
    try {
        let sql = 'SELECT * FROM candidatos WHERE 1=1';
        let params = [];

        // Aplicar filtros
        if (req.query.sexo) {
            sql += ' AND sexo = ?';
            params.push(req.query.sexo);
        }
        if (req.query.edad) {
            sql += ' AND edad = ?';
            params.push(parseInt(req.query.edad));
        }
        if (req.query.estatus) {
            sql += ' AND estatus = ?';
            params.push(req.query.estatus);
        }
        if (req.query.zona_reside) {
            sql += ' AND zona_reside = ?';
            params.push(req.query.zona_reside);
        }
        if (req.query.area_interes) {
            sql += ' AND area_interes = ?';
            params.push(req.query.area_interes);
        }
        if (req.query.search) {
            sql += ' AND (nombres_apellidos LIKE ? OR cedula LIKE ? OR telefonos LIKE ?)';
            const searchTerm = `%${req.query.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        sql += ' ORDER BY fecha_registro DESC';

        const rows = await getAll(db, sql, params);
        res.json({ candidatos: rows });
    } catch (error) {
        console.error('Error obteniendo candidatos:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener un candidato por ID
app.get('/api/candidatos/:id', (req, res) => {
    const sql = 'SELECT * FROM candidatos WHERE id = ?';
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            res.json({ candidato: row });
        } else {
            res.status(404).json({ error: 'Candidato no encontrado' });
        }
    });
});

// Crear nuevo candidato
app.post('/api/candidatos', (req, res) => {
    const {
        nombres_apellidos, cedula, sexo, edad, canal_recepcion, fuente, referido,
        tipo_contacto, fecha_contacto, citado_entrevista, fecha_entrevista,
        entrevistador_telefonico, entrevistador_presencial, solicitud_empleo,
        guia_entrevista, ubicacion, zona_reside, direccion, telefonos, experiencia,
        num_hijos, area_interes, cuenta_bancaria, expectativa_salarial, estatus,
        seguridad_bancaria, pds_asignado, comentarios
    } = req.body;

    // Validaciones básicas
    if (!nombres_apellidos || !cedula || !sexo || !edad || !canal_recepcion || !tipo_contacto || !fecha_contacto || !estatus) {
        return res.status(400).json({ error: 'Los campos obligatorios son: nombres_apellidos, cedula, sexo, edad, canal_recepcion, tipo_contacto, fecha_contacto, estatus' });
    }

    if (edad < 16 || edad > 80) {
        return res.status(400).json({ error: 'La edad debe estar entre 16 y 80 años' });
    }

    const sql = `INSERT INTO candidatos (
        nombres_apellidos, cedula, sexo, edad, canal_recepcion, fuente, referido,
        tipo_contacto, fecha_contacto, citado_entrevista, fecha_entrevista,
        entrevistador_telefonico, entrevistador_presencial, solicitud_empleo,
        guia_entrevista, ubicacion, zona_reside, direccion, telefonos, experiencia,
        num_hijos, area_interes, cuenta_bancaria, expectativa_salarial, estatus,
        seguridad_bancaria, pds_asignado, comentarios
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [
        nombres_apellidos, cedula, sexo, edad, canal_recepcion, fuente, referido,
        tipo_contacto, fecha_contacto, citado_entrevista, fecha_entrevista,
        entrevistador_telefonico, entrevistador_presencial, solicitud_empleo,
        guia_entrevista, ubicacion, zona_reside, direccion, telefonos, experiencia,
        num_hijos || 0, area_interes, cuenta_bancaria, expectativa_salarial, estatus,
        seguridad_bancaria, pds_asignado, comentarios
    ], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ error: 'La cédula ya existe en la base de datos' });
            } else {
                res.status(500).json({ error: err.message });
            }
            return;
        }
        res.json({
            message: 'Candidato creado exitosamente',
            id: this.lastID
        });
    });
});

// Actualizar candidato
app.put('/api/candidatos/:id', (req, res) => {
    const {
        nombres_apellidos, cedula, sexo, edad, canal_recepcion, fuente, referido,
        tipo_contacto, fecha_contacto, citado_entrevista, fecha_entrevista,
        entrevistador_telefonico, entrevistador_presencial, solicitud_empleo,
        guia_entrevista, ubicacion, zona_reside, direccion, telefonos, experiencia,
        num_hijos, area_interes, cuenta_bancaria, expectativa_salarial, estatus,
        seguridad_bancaria, pds_asignado, comentarios
    } = req.body;

    const sql = `UPDATE candidatos SET
        nombres_apellidos = ?, cedula = ?, sexo = ?, edad = ?, canal_recepcion = ?,
        fuente = ?, referido = ?, tipo_contacto = ?, fecha_contacto = ?,
        citado_entrevista = ?, fecha_entrevista = ?, entrevistador_telefonico = ?,
        entrevistador_presencial = ?, solicitud_empleo = ?, guia_entrevista = ?,
        ubicacion = ?, zona_reside = ?, direccion = ?, telefonos = ?, experiencia = ?,
        num_hijos = ?, area_interes = ?, cuenta_bancaria = ?, expectativa_salarial = ?,
        estatus = ?, seguridad_bancaria = ?, pds_asignado = ?, comentarios = ?
        WHERE id = ?`;

    db.run(sql, [
        nombres_apellidos, cedula, sexo, edad, canal_recepcion, fuente, referido,
        tipo_contacto, fecha_contacto, citado_entrevista, fecha_entrevista,
        entrevistador_telefonico, entrevistador_presencial, solicitud_empleo,
        guia_entrevista, ubicacion, zona_reside, direccion, telefonos, experiencia,
        num_hijos || 0, area_interes, cuenta_bancaria, expectativa_salarial, estatus,
        seguridad_bancaria, pds_asignado, comentarios, req.params.id
    ], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Candidato no encontrado' });
        } else {
            res.json({ message: 'Candidato actualizado exitosamente' });
        }
    });
});

// Eliminar candidato
app.delete('/api/candidatos/:id', (req, res) => {
    const sql = 'DELETE FROM candidatos WHERE id = ?';
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Candidato no encontrado' });
        } else {
            res.json({ message: 'Candidato eliminado exitosamente' });
        }
    });
});

// Servir página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Servir página de candidatos
app.get('/candidatos', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-candidatos.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

// Cerrar base de datos al terminar la aplicación
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Conexión a la base de datos cerrada.');
        process.exit(0);
    });
});
