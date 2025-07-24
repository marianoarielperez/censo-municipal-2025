const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL connected'
  });
});

// Ruta para enviar el formulario del censo
app.post('/api/submit-censo', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      email, apellidoNombre, tipoDocumento, cuil, fechaNacimiento, edad, sexo, estadoCivil, telefono,
      domicilioReal, barrio, traslado, condicionVivienda, beneficiarios, domicilioLaboral, modalidad,
      interno, legajo, cupoLey, adscripto, lugarAdscripcion, secretaria, subsecretaria, direccionGeneral,
      nivelJerarquico, direccion, departamento, division, profesionalAdjunto, otroCargo
    } = req.body;

    // Validación básica
    if (!email || !apellidoNombre || !tipoDocumento || !cuil) {
      return res.status(400).json({ 
        error: 'Faltan campos obligatorios',
        message: 'Email, apellido y nombre, tipo de documento y CUIL son requeridos'
      });
    }

    // Verificar si el email ya existe
    const existingEntry = await client.query(
      'SELECT id FROM censo_municipal WHERE email = $1',
      [email]
    );

    if (existingEntry.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Email ya registrado',
        message: 'Ya existe un registro con este email. Contacte al administrador para actualizar.'
      });
    }

    // Insertar nuevo registro
    const insertQuery = `
      INSERT INTO censo_municipal (
        email, apellido_nombre, tipo_documento, cuil, fecha_nacimiento, edad, sexo, estado_civil, telefono,
        domicilio_real, barrio, traslado, condicion_vivienda, beneficiarios, domicilio_laboral, modalidad,
        interno, legajo, cupo_ley, adscripto, lugar_adscripcion, secretaria, subsecretaria, direccion_general,
        nivel_jerarquico, direccion, departamento, division, profesional_adjunto, otro_cargo, fecha_registro
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, NOW()
      ) RETURNING id
    `;

    const values = [
      email, apellidoNombre, tipoDocumento, cuil, fechaNacimiento, edad, sexo, estadoCivil, telefono,
      domicilioReal, barrio, traslado, condicionVivienda, beneficiarios, domicilioLaboral, modalidad,
      interno, legajo, cupoLey, adscripto, lugarAdscripcion, secretaria, subsecretaria, direccionGeneral,
      nivelJerarquico, direccion, departamento, division, profesionalAdjunto, otroCargo
    ];

    const result = await client.query(insertQuery, values);

    console.log(`Nuevo censo registrado: ID ${result.rows[0].id}, Email: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Censo registrado exitosamente',
      id: result.rows[0].id
    });

  } catch (error) {
    console.error('Error al registrar censo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo registrar el censo. Intente nuevamente.'
    });
  } finally {
    client.release();
  }
});

// Ruta para obtener todos los registros (admin)
app.get('/api/census-data', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT * FROM censo_municipal 
      ORDER BY fecha_registro DESC
    `);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Error al obtener datos del censo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los datos del censo.'
    });
  } finally {
    client.release();
  }
});

// Ruta para exportar a CSV
app.get('/api/export-csv', async (req, res) => {
  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT * FROM censo_municipal 
      ORDER BY fecha_registro DESC
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'No hay datos para exportar'
      });
    }

    // Configurar el escritor CSV
    const csvWriter = createCsvWriter({
      path: path.join(__dirname, 'exports', 'censo_municipal.csv'),
      header: [
        {id: 'id', title: 'ID'},
        {id: 'email', title: 'Email'},
        {id: 'apellido_nombre', title: 'Apellido y Nombre'},
        {id: 'tipo_documento', title: 'Tipo Documento'},
        {id: 'cuil', title: 'CUIL'},
        {id: 'fecha_nacimiento', title: 'Fecha Nacimiento'},
        {id: 'edad', title: 'Edad'},
        {id: 'sexo', title: 'Sexo'},
        {id: 'estado_civil', title: 'Estado Civil'},
        {id: 'telefono', title: 'Teléfono'},
        {id: 'domicilio_real', title: 'Domicilio Real'},
        {id: 'barrio', title: 'Barrio'},
        {id: 'traslado', title: 'Traslado'},
        {id: 'condicion_vivienda', title: 'Condición Vivienda'},
        {id: 'beneficiarios', title: 'Beneficiarios'},
        {id: 'domicilio_laboral', title: 'Domicilio Laboral'},
        {id: 'modalidad', title: 'Modalidad'},
        {id: 'interno', title: 'Interno'},
        {id: 'legajo', title: 'Legajo'},
        {id: 'cupo_ley', title: 'Cupo Ley'},
        {id: 'adscripto', title: 'Adscripto'},
        {id: 'lugar_adscripcion', title: 'Lugar Adscripción'},
        {id: 'secretaria', title: 'Secretaría'},
        {id: 'subsecretaria', title: 'Subsecretaría'},
        {id: 'direccion_general', title: 'Dirección General'},
        {id: 'nivel_jerarquico', title: 'Nivel Jerárquico'},
        {id: 'direccion', title: 'Dirección'},
        {id: 'departamento', title: 'Departamento'},
        {id: 'division', title: 'División'},
        {id: 'profesional_adjunto', title: 'Profesional Adjunto'},
        {id: 'otro_cargo', title: 'Otro Cargo'},
        {id: 'fecha_registro', title: 'Fecha Registro'}
      ]
    });

    // Crear directorio de exports si no existe
    const fs = require('fs');
    const exportsDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Escribir CSV
    await csvWriter.writeRecords(result.rows);

    // Enviar archivo
    const filename = `censo_municipal_${new Date().toISOString().split('T')[0]}.csv`;
    res.download(path.join(__dirname, 'exports', 'censo_municipal.csv'), filename);

  } catch (error) {
    console.error('Error al exportar CSV:', error);
    res.status(500).json({
      error: 'Error al exportar datos',
      message: 'No se pudo generar el archivo CSV.'
    });
  } finally {
    client.release();
  }
});

// Ruta para estadísticas básicas
app.get('/api/stats', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const totalQuery = 'SELECT COUNT(*) as total FROM censo_municipal';
    const sexoQuery = `
      SELECT sexo, COUNT(*) as cantidad 
      FROM censo_municipal 
      GROUP BY sexo
    `;
    const modalidadQuery = `
      SELECT modalidad, COUNT(*) as cantidad 
      FROM censo_municipal 
      GROUP BY modalidad
    `;

    const [totalResult, sexoResult, modalidadResult] = await Promise.all([
      client.query(totalQuery),
      client.query(sexoQuery),
      client.query(modalidadQuery)
    ]);

    res.json({
      success: true,
      stats: {
        total: parseInt(totalResult.rows[0].total),
        porSexo: sexoResult.rows,
        porModalidad: modalidadResult.rows
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las estadísticas.'
    });
  } finally {
    client.release();
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('🛑 Cerrando servidor...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Cerrando servidor...');
  await pool.end();
  process.exit(0);
});
