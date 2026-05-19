const express = require('express');
const app = express();

app.get('/api', async (req, res) => {
  const h = req.query.h || 0;
  const b = req.query.b || 0;

  try {
    const url = `https://ecoflowgarden.infinityfreeapp.com/php/arduino.php?h=${h}&b=${b}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Cookie': ''
      }
    });
    const text = await response.text();
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
