const express = require('express');
const mysql = require('mysql2');
const app = express();

const db = mysql.createConnection({
  host: 'sql210.infinityfree.com',
  user: 'if0_41948815',
  password: 'Leoornelas12',
  database: 'if0_41948815_ecoflowgarden'
});

db.connect(err => {
  if(err) console.log('Error BD:', err);
  else console.log('BD conectada');
});

app.get('/api', (req, res) => {
  const humedad = parseInt(req.query.h) || 0;
  const bomba   = parseInt(req.query.b) || 0;

  db.query(
    'UPDATE configuracion_riego SET humedad = ?, bomba_activa = ? WHERE id = 1',
    [humedad, bomba],
    () => {
      if(bomba === 1){
        db.query("INSERT INTO registros_riego (fecha, hora, fue_manual) VALUES (CURDATE(), CURTIME(), 0)");
      }
      db.query('SELECT riego_manual FROM configuracion_riego WHERE id = 1', (err, rows) => {
        const valor = rows ? rows[0].riego_manual : 0;
        res.send('RIEGO:' + valor);
      });
    }
  );
});

app.listen(3000, () => console.log('Servidor corriendo'));
