const express = require('express');
const mysql = require('mysql2');
const app = express();

const db = mysql.createConnection({
  host: 'sql210.infinityfree.com',
  port: 3306,
  user: 'if0_41948815',
  password: 'Leoornelas12',
  database: 'if0_41948815_ecoflowgarden',
  connectTimeout: 10000
});

db.connect(err => {
  if(err) console.log('Error BD:', err.message);
  else console.log('BD conectada OK');
});

app.get('/api', (req, res) => {
  const humedad = parseInt(req.query.h) || 0;
  const bomba   = parseInt(req.query.b) || 0;

  db.query(
    'UPDATE configuracion_riego SET humedad=?, bomba_activa=? WHERE id=1',
    [humedad, bomba],
    (err) => {
      if(err){ res.send('RIEGO:0'); return; }

      if(bomba === 1){
        db.query("INSERT INTO registros_riego (fecha, hora, fue_manual) VALUES (CURDATE(), CURTIME(), 0)");
      }

      db.query('SELECT riego_manual FROM configuracion_riego WHERE id=1', (err, rows) => {
        if(err || !rows || rows.length === 0){ res.send('RIEGO:0'); return; }
        res.send('RIEGO:' + rows[0].riego_manual);
      });
    }
  );
});

app.get('/test', (req, res) => {
  db.query('SELECT riego_manual FROM configuracion_riego WHERE id=1', (err, rows) => {
    if(err) return res.send('Error: ' + err.message);
    res.send('BD OK - riego_manual: ' + rows[0].riego_manual);
  });
});

app.listen(3000, () => console.log('Servidor corriendo'));
