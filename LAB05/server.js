const http = require('http');
const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, 'data', 'estudiantes.json');
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8'
};
const server = http.createServer((req, res) => {
  console.log(`Petición recibida: ${req.method} ${req.url}`);

  // ---------- 3a. GET /api/estudiantes ----------
  if (req.url === '/api/estudiantes' && req.method === 'GET') {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Error interno del servidor' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
      }
    });
  // ---------- 3b. POST /api/estudiantes ----------
  } else if (req.url === '/api/estudiantes' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      const nuevo = JSON.parse(body);

      fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        const lista = JSON.parse(data);
        lista.push(nuevo);

        fs.writeFile(DATA_FILE, JSON.stringify(lista, null, 2), () => {
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(nuevo));
        });
      });
    });

  // ---------- Punto 2: archivos estáticos desde /public ----------
  } else if (req.method === 'GET' && !req.url.startsWith('/api/')) {
    const archivo = req.url === '/' ? '/index.html' : req.url;
    const filePath = path.join(__dirname, 'public', archivo);
    const tipo = TIPOS[path.extname(filePath)] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Recurso no encontrado' }));
      } else {
        res.writeHead(200, { 'Content-Type': tipo });
        res.end(content);
      }
    });

  // ---------- 3c. Rutas no existentes (404) ----------
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Recurso no encontrado' }));
  }
});

server.listen(3000, () => {
  console.log(`Servidor escuchando en http://localhost:3000`);
});