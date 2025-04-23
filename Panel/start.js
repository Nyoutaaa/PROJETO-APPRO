import { createServer } from 'http';
import { createReadStream, existsSync, readdirSync } from 'fs';
import { resolve, join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 8080;
const DIST_DIR = resolve(__dirname, './dist');

console.log('Diretório de build:', DIST_DIR);
console.log('Verificando se o diretório existe:', existsSync(DIST_DIR));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.map': 'application/json',
};

// Função para registrar logs com timestamps
const log = (message, ...args) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, ...args);
};

const server = createServer((req, res) => {
  log(`${req.method} ${req.url}`);
  
  // Lidar com CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
  // Responde ao healthcheck
  if (req.url === '/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('OK');
    log('Health check respondido com sucesso');
    return;
  }

  // Remover query string da URL para acessar arquivos estáticos corretamente
  const urlWithoutQuery = req.url.split('?')[0];
  
  // Tratar caminhos específicos de recursos
  let filePath = '';
  
  // Verificar se é um recurso estático com extensão
  const extension = extname(urlWithoutQuery);
  if (extension && MIME_TYPES[extension]) {
    filePath = join(DIST_DIR, urlWithoutQuery);
    log(`Recurso estático detectado: ${urlWithoutQuery}, Tentando servir: ${filePath}`);
  } else {
    // SPA: todos os pedidos sem extensão específica vão para index.html
    filePath = join(DIST_DIR, 'index.html');
    log(`Rota SPA detectada, servindo index.html para: ${urlWithoutQuery}`);
  }

  // Verificar se o arquivo existe
  if (existsSync(filePath)) {
    log(`Arquivo encontrado: ${filePath}`);
    const contentType = MIME_TYPES[extension] || 'text/html; charset=utf-8';
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    createReadStream(filePath).pipe(res);
  } else {
    log(`Arquivo não encontrado: ${filePath}, verificando fallback para index.html`);
    
    // Se o arquivo não existir, servir index.html
    const indexPath = join(DIST_DIR, 'index.html');
    if (existsSync(indexPath)) {
      log(`Servindo index.html como fallback`);
      res.writeHead(200, { 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      createReadStream(indexPath).pipe(res);
    } else {
      log(`Arquivo index.html não encontrado! ERRO CRÍTICO`);
      res.statusCode = 404;
      res.end('Arquivo não encontrado');
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  log(`Servidor rodando em http://0.0.0.0:${PORT}/`);
  log(`Diretório de build: ${DIST_DIR}`);
  
  // Listar conteúdo do diretório dist (se existir)
  if (existsSync(DIST_DIR)) {
    try {
      const files = readdirSync(DIST_DIR);
      log(`Conteúdo do diretório dist (${files.length} arquivos):`);
      files.forEach(file => log(` - ${file}`));
      
      // Verificar se há pasta assets e listar seu conteúdo
      const assetsDir = join(DIST_DIR, 'assets');
      if (existsSync(assetsDir)) {
        const assetsFiles = readdirSync(assetsDir);
        log(`Conteúdo da pasta assets (${assetsFiles.length} arquivos):`);
        assetsFiles.forEach(file => log(` - assets/${file}`));
      } else {
        log(`Pasta assets não encontrada!`);
      }
    } catch (error) {
      log(`Erro ao listar arquivos: ${error.message}`);
    }
  } else {
    log(`ALERTA: Diretório de build não existe: ${DIST_DIR}`);
  }
}); 