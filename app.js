const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

const app = express();  // Mueve esta línea hacia arriba

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/authenticate', (req, res) => {
  const { username, password } = req.body;
  if(username === "usuario" && password === "usuario123") {
    const accessToken = jwt.sign({ username }, 'tu_secreto_aqui', { expiresIn: '1h' });
    const refreshToken = jwt.sign({ username }, 'tu_secreto_refresh_aqui', { expiresIn: '7d' });
    res.json({ accessToken, refreshToken });
  } else {
    res.status(401).send('Credenciales incorrectas');
  }
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  
  jwt.verify(token, 'tu_secreto_aqui', function(err, decoded) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    
    // Si todo está bien, guarda el ID para usar en otras rutas
    req.userId = decoded.id;
    next();
  });
}



// Crear una nueva base de datos o abrir una existente
const db = new sqlite3.Database('./voucher_system.db');

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS vouchers (
    id TEXT PRIMARY KEY,
    message TEXT,
    redeemed INTEGER
)`);

// Endpoint para crear un nuevo voucher
app.post('/create', (req, res) => {
  console.log("Petición recibida en /create:", req.body);
  const { id, message, from_text, to_text, valid_until } = req.body;  // Agregar nuevos campos
  const query = 'INSERT INTO vouchers (id, message, from_text, to_text, valid_until, redeemed) VALUES (?, ?, ?, ?, ?, 0)';  // Actualizar query
  db.run(query, [id, message, from_text, to_text, valid_until], function(err) {  // Agregar nuevos parámetros
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
app.get('/validate/:id', verifyJWT, async  (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM vouchers WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      res.status(500).send('Error interno del servidor');
      return;
    }

    if (!row) {
      res.status(404).send('Voucher no encontrado');
      return;
    }

    if (row.redeemed === 1) {
      res.status(409).send('Voucher ya canjeado');
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



  // Endpoint para obtener el historial de vouchers
app.get('/history', (req, res) => {
  const query = 'SELECT id, message, from_text, to_text, valid_until FROM vouchers ORDER BY valid_until DESC';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).send('Error al recuperar el historial');
      return;
    }
    res.status(200).json(rows);
  });
});


app.get('/voucher/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM vouchers WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      res.status(500).send('Error interno del servidor');
      return;
    }
    if (!row) {
      res.status(404).send('Voucher no encontrado');
      return;
    }
    res.status(200).json(row);
  });
});

app.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).send('No token provided.');

  jwt.verify(refreshToken, 'tu_secreto_refresh_aqui', (err, decoded) => {
    if (err) return res.status(403).send('Invalid token.');
    
    const accessToken = jwt.sign({ username: decoded.username }, 'tu_secreto_aqui', { expiresIn: '1h' });
    res.json({ accessToken });
  });
});
