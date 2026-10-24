const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const reclamos = require('./reclamos.json');

const app = express();

// Detrás de un proxy (Docker, Heroku, etc.) hay que confiar en él para ver la IP real.
app.set('trust proxy', 1);
app.use(cors());

// 100 requests por minuto por IP.
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Basta, necesito mi espacio.',
      detalle: 'Hiciste más de 100 requests en un minuto. ¿Siempre sos asi de rompe huevos? Volvé en un ratito.',
    },
  })
);

// "Series y Películas" y "series-y-peliculas" tienen que ser lo mismo.
const normalizar = (texto) =>
  String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[-_+]/g, ' ')
    .trim();

const categorias = [...new Set(reclamos.map((r) => r.categoria))];

const alAzar = (lista) => lista[Math.floor(Math.random() * lista.length)];

app.get('/', (req, res) => {
  res.json({
    mensaje: 'Bienvenido a No Rest API, porque la toxicidad no descansa nunca.',
    endpoints: {
      'GET /': 'Esta bienvenida, que ya tardaste en leer.',
      'GET /reclamo': 'Un reclamo al azar.',
      'GET /reclamo?categoria=mensajes': 'Un reclamo al azar de una categoría.',
      'GET /reclamo?nivel=5': 'Un reclamo al azar de un nivel de toxicidad (1 a 5).',
      'GET /categorias': 'Las categorías disponibles.',
    },
  });
});

app.get('/categorias', (req, res) => {
  res.json({ categorias });
});

app.get('/reclamo', (req, res) => {
  let lista = reclamos;
  const { categoria, nivel } = req.query;

  if (categoria !== undefined) {
    const buscada = normalizar(categoria);
    lista = lista.filter((r) => normalizar(r.categoria) === buscada);
    if (lista.length === 0) {
      return res.status(404).json({
        error: `La categoría "${categoria}" no existe. Ni siquiera encontramos de qué quejarnos ahí.`,
        categorias_disponibles: categorias,
      });
    }
  }

  if (nivel !== undefined) {
    const n = Number(nivel);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      return res.status(400).json({
        error: 'El nivel de toxicidad va de 1 a 5, aflojá Chernobyl',
      });
    }
    lista = lista.filter((r) => r.nivel_de_toxicidad === n);
    if (lista.length === 0) {
      return res.status(404).json({
        error: `No hay reclamos de nivel ${n} con esos filtros. Por esta vez zafaste.`,
      });
    }
  }

  res.json(alAzar(lista));
});

// Cualquier otra ruta.
app.use((req, res) => {
  res.status(404).json({
    error: 'Esa ruta no existe. Como tu problema honesto.',
    pista: 'Probá con GET /',
  });
});

module.exports = app;
