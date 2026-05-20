const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

const db = mysql.createPool({
  host:     'ballast.proxy.rlwy.net',
  port:     46846,
  user:     'root',
  password: 'cgWmePdCkGFLdScsnORczJOvMTKXBHpP',
  database: 'railway',
  connectTimeout: 10000,
});

app.get('/setup', async (req, res) => {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS usuarios (
      id int(11) NOT NULL AUTO_INCREMENT,
      usuario varchar(50) NOT NULL,
      nombre varchar(100) NOT NULL,
      contrasena varchar(255) NOT NULL,
      tipo_usuario varchar(30) NOT NULL DEFAULT 'usuario',
      email varchar(100) DEFAULT NULL,
      activo tinyint(1) DEFAULT 1,
      PRIMARY KEY (id),
      UNIQUE KEY usuario (usuario)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await db.query(`CREATE TABLE IF NOT EXISTS configuracion_riego (
      id int(11) NOT NULL AUTO_INCREMENT,
      hora_inicio time NOT NULL,
      duracion_minutos int(11) NOT NULL,
      lunes tinyint(1) DEFAULT 0,
      martes tinyint(1) DEFAULT 0,
      miercoles tinyint(1) DEFAULT 0,
      jueves tinyint(1) DEFAULT 0,
      viernes tinyint(1) DEFAULT 0,
      sabado tinyint(1) DEFAULT 0,
      domingo tinyint(1) DEFAULT 0,
      actualizado_por int(11) DEFAULT NULL,
      fecha_actualizacion datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      riego_manual tinyint(1) DEFAULT 0,
      humedad int(11) DEFAULT 0,
      bomba_activa tinyint(1) DEFAULT 0,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await db.query(`CREATE TABLE IF NOT EXISTS registros_riego (
      id_registro int(11) NOT NULL AUTO_INCREMENT,
      fecha date NOT NULL,
      hora time NOT NULL,
      id_usuario int(11) DEFAULT NULL,
      fue_manual tinyint(1) DEFAULT 0,
      PRIMARY KEY (id_registro)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await db.query(`INSERT IGNORE INTO usuarios VALUES 
      (1,'tilin','leobardo','$2y$10$qRkFz3QXk753CXVfjaVsnO98tAX5KljsFFmIpDlfEGGIV3hRr7hxK','usuario','pajaro@gmail.com',1),
      (2,'pajaro','tilin','$2y$10$qG48wY8gBTwLt1VZ/ku4AOHKW4n10AIqOAQKDVv7JNT2Cp0ZBp62q','admin','',1),
      (8,'LiamGn_','Liam Gonzalez','$2y$10$s0NZsWEb9vBOOpHTHjBiwuSqHNnXGZIjNGYtuPCRiRWCZQEPiBedu','admin','liamgonzalez1707@gmail.com',1)`);

    await db.query(`INSERT IGNORE INTO configuracion_riego VALUES 
      (1,'09:10:00',5,1,0,0,1,0,0,1,2,'2026-05-18 23:50:39',0,50,0)`);

    res.send('Tablas creadas correctamente!');
  } catch (e) {
    res.send('Error: ' + e.message);
  }
});

app.get('/api', async (req, res) => {
  const h = parseInt(req.query.h) || 0;
  const b = parseInt(req.query.b) || 0;
  try {
    await db.query('UPDATE configuracion_riego SET humedad = ?, bomba_activa = ? WHERE id = 1', [h, b]);
    if (b === 1) {
      await db.query("INSERT INTO registros_riego (fecha, hora, fue_manual) VALUES (CURDATE(), CURTIME(), 0)");
    }
    const [rows] = await db.query('SELECT riego_manual FROM configuracion_riego WHERE id = 1');
    res.send('RIEGO:' + (rows[0]?.riego_manual ?? 0));
  } catch (e) {
    console.error('DB ERROR:', e.message);
    res.send('RIEGO:0');
  }
});

app.listen(3000, () => console.log('Servidor corriendo'));
