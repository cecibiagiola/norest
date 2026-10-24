# No Rest API

> Porque la toxicidad no descansa.

**No Rest API** Una API que devuelve reclamos absurdos que podes hacerle a tu pareja si te quedas sin ideas. Incluye niveles de toxicidad del 1 al 5 según las ganas que tengas de pelear en el momento.

> "Me di cuenta de que leíste mi mensaje y respondiste 4 minutos después. Necesitamos hablar."


**Disclaimer**
> Esto es EN CHISTE. Si no sabes entender chistes, retirate de acá por favor y no vengas a toxiquearla. Si la usas en serio para reclamar cosas, hacete un favor y anda a terapia. Muchas gracias.

## Stack

- Node.js + Express
- `cors` y `express-rate-limit`
- Los reclamos viven en `reclamos.json` (sin base de datos)

## Cómo correrlo localmente

Necesitás Node.js 18 o superior.

```bash
npm install
npm start          # http://localhost:3000
npm test           # corre los tests
```

Para usar otro puerto: `PORT=4000 npm start`.

### Con Docker

```bash
docker build -t no-rest-api .
docker run -p 3000:3000 no-rest-api
```

## Endpoints

| Método | Ruta | Qué hace |
| --- | --- | --- |
| GET | `/` | Bienvenida con el chiste y la lista de endpoints |
| GET | `/reclamo` | Un reclamo al azar |
| GET | `/reclamo?categoria=mensajes` | Un reclamo al azar de esa categoría (404 si no existe) |
| GET | `/reclamo?nivel=5` | Un reclamo al azar de ese nivel de toxicidad (1 a 5) |
| GET | `/categorias` | Lista las categorías |

Los filtros `categoria` y `nivel` se pueden combinar. La categoría ignora mayúsculas y acentos, así que `series-y-peliculas` funciona.

### Niveles de toxicidad

1. Queja leve
2. Queja con ganas
3. Reclamo en serio (pero no tanto)
4. Que Dios te ayude
5. Tercera Guerra Mundial

### Categorías

`mensajes`, `redes sociales`, `comida`, `planes`, `series y películas`, `familia y amigos`, `sin motivo aparente`, `pasatiempos`, `trabajo`

## Ejemplos con curl

La API está online en https://norest.vercel.app

```bash
curl https://norest.vercel.app/reclamo
```

```json
{
  "reclamo": "Me di cuenta de que leíste mi mensaje y respondiste 4 minutos después. Necesitamos hablar.",
  "categoria": "mensajes",
  "nivel_de_toxicidad": 3
}
```

```bash
curl "https://norest.vercel.app/reclamo?categoria=comida"
curl "https://norest.vercel.app/reclamo?nivel=5"
curl "https://norest.vercel.app/reclamo?categoria=planes&nivel=3"
curl https://norest.vercel.app/categorias
```

```json
{
  "categorias": ["mensajes", "redes sociales", "comida", "planes", "series y películas", "familia y amigos", "sin motivo aparente", "pasatiempos", "trabajo"]
}
```

### Errores

Categoría inexistente (`404`):

```json
{
  "error": "La categoría \"deportes\" no existe. Ni siquiera encontramos de qué quejarnos ahí.",
  "categorias_disponibles": ["mensajes", "..."]
}
```

Nivel inválido (`400`):

```json
{ "error": "El nivel de toxicidad va de 1 a 5." }
```

Rate limit (`429`), después de 100 requests por minuto por IP:

```json
{
  "error": "Basta, necesito mi espacio.",
  "detalle": "Hiciste más de 100 requests en un minuto. ¿Siempre sos asi de rompe huevos? Buscate un laburo."
}
```

## Estructura

```
app.js          # rutas, rate limit y lógica de filtrado
server.js       # arranca el servidor
reclamos.json   # los reclamos (reclamo, categoria, nivel_de_toxicidad)
app.test.js     # tests de los endpoints (node --test)
Dockerfile      # imagen para correrlo en un contenedor
```

