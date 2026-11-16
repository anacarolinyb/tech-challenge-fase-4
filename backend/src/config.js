const path = require('node:path');

/**
 * Configurações da API. Todas podem ser sobrescritas por variáveis de ambiente.
 *
 * PORT            Porta HTTP (padrão 3000)
 * JWT_SECRET      Segredo usado para assinar os tokens
 * JWT_EXPIRES_IN  Validade do token em segundos (padrão 8 horas)
 * DB_FILE         Caminho do arquivo JSON usado como banco (":memory:" = só em memória)
 */
const config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'blog-escolar-dev-secret-troque-em-producao',
  jwtExpiresIn: Number(process.env.JWT_EXPIRES_IN) || 60 * 60 * 8,
  dbFile: process.env.DB_FILE || path.join(__dirname, '..', 'data', 'db.json'),
  bodyLimitBytes: 1_000_000,
};

module.exports = config;
