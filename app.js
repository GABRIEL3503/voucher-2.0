const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

// Crear una nueva base de datos o abrir una existente
const db = new sqlite3.Database('./voucher_system.db');

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS vouchers (
    id TEXT PRIMARY KEY,
    message TEXT,
    redeemed INTEGER
)`);

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
// Endpoint para crear un nuevo voucher
app.post('/create', (req, res) => {
    console.log("Petición recibida en /create:", req.body);
  const { id, message } = req.body;
  const query = 'INSERT INTO vouchers (id, message, redeemed) VALUES (?, ?, 0)';
  db.run(query, [id, message], function(err) {
    if (err) {
      res.status(500).send('Error al crear el voucher');
      return;
    }
    res.status(200).send('Voucher creado exitosamente');
  });
});


// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
// Endpoint para validar un voucher
app.get('/validate/:id', async (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM vouchers WHERE id = ? AND redeemed = 0';
    db.get(query, [id], (err, row) => {
      if (err || !row) {
        res.status(404).send('Voucher no encontrado o ya canjeado');
        return;
      }
  
      // Marcar como canjeado
      db.run('UPDATE vouchers SET redeemed = 1 WHERE id = ?', [id], function(err) {
        if (err) {
          res.status(500).send('Error al actualizar el estado del voucher');
          return;
        }
        res.status(200).json({ message: row.message });
      });
    });
  });
  