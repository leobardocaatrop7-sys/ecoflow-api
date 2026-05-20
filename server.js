const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
app.use(express.json());

const db = mysql.createPool({
  host:     'ballast.proxy.rlwy.net',
  port:     46846,
  user:     'root',
  password: 'cgWmePdCkGFLdScsnORczJOvMTKXBHpP',
  database: 'railway',
  connectTimeout: 10000,
});

// Fix usuarios
app.get('/fix-usuarios', async (req, res) => {
  try {
    await db.query('DELETE FROM usuarios');
    await db.query(
      `INSERT INTO usuarios (id, usuario, nombre, contrasena, tipo_usuario, email, activo) VALUES 
      (1,'tilin','leobardo',?,'usuario','pajaro@gmail.com',1),
      (2,'pajaro','tilin',?,'admin','',1),
      (8,'LiamGn_','Liam Gonzalez',?,'admin','liamgonzalez1707@gmail.com',1)`,
      [
        '$2y$10$qRkFz3QXk753CXVfjaVsnO98tAX5KljsFFmIpDlfEGGIV3hRr7hxK',
        '$2y$10$qG48wY8gBTwLt1VZ/ku4AOHKW4n10AIqOAQKDVv7JNT2Cp0ZBp62q',
        '$2y$10$s0NZsWEb9vBOOpHTHjBiwuSqHNnXGZIjNGYtuPCRiRWCZQEPiBedu'
      ]
    );
    res.send('Usuarios corregidos!');
  } catch (e) {
    res.send('Error: ' + e.message);
  }
});

// Arduino
app.get('/api', async (req, res) => {
  const h = parseInt(req.query.h) || 0;
  const b = parseInt(req.query.b) || 0;
  try {
    await db.query('UPDATE configuracion_riego SET humedad = ?, bomba_activa = ? WHERE id = 1', [h, b]);
    if (b === 1) await db.query("INSERT INTO registros_riego (fecha, hora, fue_manual) VALUES (CURDATE(), CURTIME(), 0)");
    const [rows] = await db.query('SELECT riego_manual FROM configuracion_riego WHERE id = 1');
    res.send('RIEGO:' + (rows[0]?.riego_manual ?? 0));
  } catch (e) {
    res.send('RIEGO:0');
  }
});

// Login
app.get('/login', async (req, res) => {
  const { usuario } = req.query;
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE usuario = ? AND activo = 1', [usuario]);
    res.json(rows[0] || null);
  } catch (e) {
    res.json(null);
  }
});

// Registro
app.get('/registro', async (req, res) => {
  const { usuario, nombre, contrasena, email, tipo_usuario } = req.query;
  try {
    await db.query('INSERT INTO usuarios (usuario, nombre, contrasena, tipo_usuario, email) VALUES (?,?,?,?,?)',
      [usuario, nombre, contrasena, tipo_usuario, email]);
    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Contar usuarios
app.get('/contar-usuarios', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS total FROM usuarios');
    res.json({ total: rows[0].total });
  } catch (e) {
    res.json({ total: 0 });
  }
});

// Leer config riego
app.get('/riego', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT riego_manual, humedad, bomba_activa FROM configuracion_riego LIMIT 1');
    res.json(rows[0]);
  } catch (e) {
    res.json({ riego_manual: 0, humedad: 0, bomba_activa: 0 });
  }
});

// Actualizar riego manual
app.get('/riego-update', async (req, res) => {
  const { estado } = req.query;
  try {
    await db.query('UPDATE configuracion_riego SET riego_manual = ? WHERE id = 1', [estado]);
    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false });
  }
});

app.listen(3000, () => console.log('Servidor corriendo'));
