const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'NexusDB', //Nombre de Base de datos
  password: 'sol1',  //Contraseña de Postgres
  port: 5432,
});

pool.on('connect', () => {
  console.log('¡Conexión exitosa a PostgreSQL!');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};