const http = require('node:http');
const os = require('node:os');
const defaultConfig = require('./config');
const { createDatabase } = require('./db/database');
const { createApp } = require('./app');

/** Endereços IPv4 da máquina na rede local (para configurar o app no celular). */
function localNetworkAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((iface) => iface && iface.family === 'IPv4' && !iface.internal)
    .map((iface) => iface.address);
}

async function startServer(overrides = {}) {
  const config = { ...defaultConfig, ...overrides };
  const db = await createDatabase(config.dbFile);
  const server = http.createServer(createApp({ db, config }));

  await new Promise((resolve) => server.listen(config.port, resolve));
  server.db = db;
  return server;
}

if (require.main === module) {
  startServer()
    .then((server) => {
      const { port } = server.address();
      console.log(`\nBlog Escolar API rodando na porta ${port}`);
      console.log(`  Local:            http://localhost:${port}`);
      for (const address of localNetworkAddresses()) {
        console.log(`  Rede (celular):   http://${address}:${port}`);
      }
      console.log('\nUsuários de demonstração (senha 123456):');
      console.log('  Professor: professor@escola.com');
      console.log('  Aluno:     aluno@escola.com\n');
    })
    .catch((error) => {
      console.error('Falha ao iniciar a API:', error);
      process.exit(1);
    });
}

module.exports = { startServer };
