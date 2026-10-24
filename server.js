const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`No Rest API escuchando en http://localhost:${PORT} (y sin descansar)`);
});
