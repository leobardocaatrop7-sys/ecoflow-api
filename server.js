const express = require('express');
const app = express();

app.get('/api', async (req, res) => {
  const h = req.query.h || 0;
  const b = req.query.b || 0;
  const url = `https://ecoflowgarden.infinityfreeapp.com/php/arduino.php?h=${h}&b=${b}`;

  try {
    // Primera petición para obtener cookie
    const r1 = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' },
      redirect: 'manual'
    });

    const setCookie = r1.headers.get('set-cookie') || '';
    const cookie = setCookie.split(';')[0];

    // Segunda petición con la cookie
    const r2 = await fetch(url + '&i=1', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Cookie': cookie
      }
    });

    const text = await r2.text();
    const idx = text.indexOf('RIEGO:');
    if(idx >= 0){
      res.send('RIEGO:' + text.charAt(idx + 6));
    } else {
      res.send('RIEGO:0');
    }
  } catch(e) {
    res.send('RIEGO:0');
  }
});

app.listen(3000, () => console.log('Servidor corriendo'));
