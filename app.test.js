const test = require('node:test');
const assert = require('node:assert');
const app = require('./app');

let server;
let base;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve); // puerto 0 = el sistema elige uno libre
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => server.close());

const get = async (ruta) => {
  const res = await fetch(base + ruta);
  return { status: res.status, body: await res.json() };
};

test('GET / devuelve la bienvenida con los endpoints', async () => {
  const { status, body } = await get('/');
  assert.strictEqual(status, 200);
  assert.ok(body.mensaje.includes('No Rest API'));
  assert.ok(body.endpoints['GET /reclamo']);
});

test('GET /reclamo devuelve un reclamo con la forma correcta', async () => {
  const { status, body } = await get('/reclamo');
  assert.strictEqual(status, 200);
  assert.strictEqual(typeof body.reclamo, 'string');
  assert.strictEqual(typeof body.categoria, 'string');
  assert.ok(body.nivel_de_toxicidad >= 1 && body.nivel_de_toxicidad <= 5);
});

test('GET /reclamo?categoria=mensajes filtra por categoría', async () => {
  for (let i = 0; i < 10; i++) {
    const { status, body } = await get('/reclamo?categoria=mensajes');
    assert.strictEqual(status, 200);
    assert.strictEqual(body.categoria, 'mensajes');
  }
});

test('la categoría ignora acentos y mayúsculas', async () => {
  const { status, body } = await get('/reclamo?categoria=Series-y-Peliculas');
  assert.strictEqual(status, 200);
  assert.strictEqual(body.categoria, 'series y películas');
});

test('categoría inexistente devuelve 404 gracioso', async () => {
  const { status, body } = await get('/reclamo?categoria=inexistente');
  assert.strictEqual(status, 404);
  assert.ok(body.error.includes('no existe'));
});

test('GET /reclamo?nivel=5 filtra por toxicidad', async () => {
  for (let i = 0; i < 10; i++) {
    const { status, body } = await get('/reclamo?nivel=5');
    assert.strictEqual(status, 200);
    assert.strictEqual(body.nivel_de_toxicidad, 5);
  }
});

test('nivel inválido devuelve 400', async () => {
  const { status } = await get('/reclamo?nivel=9');
  assert.strictEqual(status, 400);
});

test('se pueden combinar categoría y nivel', async () => {
  const { status, body } = await get('/reclamo?categoria=comida&nivel=3');
  assert.strictEqual(status, 200);
  assert.strictEqual(body.categoria, 'comida');
  assert.strictEqual(body.nivel_de_toxicidad, 3);
});

test('GET /categorias lista las categorías', async () => {
  const { status, body } = await get('/categorias');
  assert.strictEqual(status, 200);
  assert.ok(body.categorias.includes('mensajes'));
  assert.ok(body.categorias.length >= 7);
});

test('después de 100 requests por minuto, rate limit con mensaje gracioso', async () => {
  let ultimo;
  for (let i = 0; i < 101; i++) ultimo = await get('/categorias');
  assert.strictEqual(ultimo.status, 429);
  assert.ok(ultimo.body.error.includes('necesito mi espacio'));
});
