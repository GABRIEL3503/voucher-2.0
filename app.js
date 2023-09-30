const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express();


app.use(session({ secret: 'tu_secreto_aqui', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  function(username, password, done) {
    if (username === "tu_usuario" && password === "tu_contraseña") {
      return done(null, { id: 1, name: "Usuario" });
    } else {
      return done(null, false);
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  done(null, { id: 1, name: "Usuario" });
});
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
app.use((req, res, next) => {
  console.log('Sesión:', req.session);
  console.log('Usuario autenticado:', req.isAuthenticated());
  next();
});


app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
  app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
  });
  

// Crear una nueva base de datos o abrir una existente
const db = new sqlite3.Database('./voucher_system.db');

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS vouchers (
    id TEXT PRIMARY KEY,
    message TEXT,
    redeemed INTEGER
)`);


// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
// Endpoint para crear un nuevo voucher
// Para servir la página HTML de creación de vouchers
app.get('/create', ensureAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/public/create.html');
});

// Para manejar la lógica de creación de un voucher
app.post('/create', ensureAuthenticated, (req, res) => {
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
app.get('/validate/:id', ensureAuthenticated, async (req, res) => {
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
