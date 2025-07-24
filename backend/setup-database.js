const { Pool } = require('pg');
require('dotenv').config();

// Configuración de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Configurando base de datos...');

    // Crear tabla principal para el censo
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS censo_municipal (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        apellido_nombre VARCHAR(255) NOT NULL,
        tipo_documento VARCHAR(50) NOT NULL,
        cuil VARCHAR(20) NOT NULL,
        fecha_nacimiento DATE,
        edad INTEGER,
        sexo VARCHAR(20),
        estado_civil VARCHAR(50),
        telefono VARCHAR(50),
        domicilio_real TEXT,
        barrio VARCHAR(255),
        traslado VARCHAR(100),
        condicion_vivienda VARCHAR(100),
        beneficiarios TEXT,
        domicilio_laboral TEXT,
        modalidad VARCHAR(100),
        interno VARCHAR(100),
        legajo VARCHAR(100),
        cupo_ley VARCHAR(100),
        adscripto VARCHAR(10),
        lugar_adscripcion TEXT,
        secretaria VARCHAR(255),
        subsecretaria VARCHAR(255),
        direccion_general VARCHAR(255),
        nivel_jerarquico VARCHAR(100),
        direccion VARCHAR(255),
        departamento VARCHAR(255),
        division VARCHAR(255),
        profesional_adjunto VARCHAR(255),
        otro_cargo VARCHAR(255),
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(createTableQuery);
    console.log('✅ Tabla censo_municipal creada exitosamente');

    // Crear índices para mejorar rendimiento
    const createIndexesQueries = [
      'CREATE INDEX IF NOT EXISTS idx_censo_email ON censo_municipal(email);',
      'CREATE INDEX IF NOT EXISTS idx_censo_cuil ON censo_municipal(cuil);',
      'CREATE INDEX IF NOT EXISTS idx_censo_fecha_registro ON censo_municipal(fecha_registro);',
      'CREATE INDEX IF NOT EXISTS idx_censo_secretaria ON censo_municipal(secretaria);',
      'CREATE INDEX IF NOT EXISTS idx_censo_modalidad ON censo_municipal(modalidad);'
    ];

    for (const query of createIndexesQueries) {
      await client.query(query);
    }
    console.log('✅ Índices creados exitosamente');

    // Crear trigger para actualizar fecha_actualizacion automáticamente
    const createTriggerQuery = `
      CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS trigger_update_fecha_actualizacion ON censo_municipal;
      
      CREATE TRIGGER trigger_update_fecha_actualizacion
        BEFORE UPDATE ON censo_municipal
        FOR EACH ROW
        EXECUTE FUNCTION update_fecha_actualizacion();
    `;

    await client.query(createTriggerQuery);
    console.log('✅ Trigger de actualización creado exitosamente');

    // Verificar estructura de la tabla
    const tableInfoQuery = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'censo_municipal'
      ORDER BY ordinal_position;
    `;

    const tableInfo = await client.query(tableInfoQuery);
    console.log('\n📋 Estructura de la tabla censo_municipal:');
    console.table(tableInfo.rows);

    // Verificar índices
    const indexQuery = `
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'censo_municipal';
    `;

    const indexes = await client.query(indexQuery);
    console.log('\n📊 Índices creados:');
    indexes.rows.forEach(index => {
      console.log(`- ${index.indexname}`);
    });

    console.log('\n✨ Base de datos configurada exitosamente!');
    console.log('\n📝 Comandos útiles:');
    console.log('- npm run dev (desarrollo)');
    console.log('- npm start (producción)');
    console.log('- Endpoint principal: POST /api/submit-censo');
    console.log('- Ver datos: GET /api/census-data');
    console.log('- Exportar CSV: GET /api/export-csv');
    console.log('- Estadísticas: GET /api/stats');

  } catch (error) {
    console.error('❌ Error al configurar la base de datos:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar setup
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('\n🎉 Setup completado exitosamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en el setup:', error.message);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
