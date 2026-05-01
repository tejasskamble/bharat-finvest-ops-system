const mysql = require('mysql2/promise');

const host = process.env.DB_HOST || 'localhost';
const configuredPort = Number(process.env.DB_PORT || 3306);
const fallbackPort = 3306;
const shouldTryPortFallback =
  ['localhost', '127.0.0.1', '::1'].includes(host) && configuredPort !== fallbackPort;

const baseConfig = {
  host,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const createPool = (port) =>
  mysql.createPool({
    ...baseConfig,
    port
  });

const primaryPool = createPool(configuredPort);
let fallbackPool = shouldTryPortFallback ? createPool(fallbackPort) : null;
let activePool = primaryPool;
let usingFallback = false;

const query = async (...args) => {
  try {
    return await activePool.query(...args);
  } catch (error) {
    const isConnectionRefused = error?.code === 'ECONNREFUSED';

    if (!usingFallback && fallbackPool && isConnectionRefused) {
      console.warn(`[db] Connection to ${host}:${configuredPort} refused. Trying ${host}:${fallbackPort}.`);
      const result = await fallbackPool.query(...args);
      usingFallback = true;
      activePool = fallbackPool;
      return result;
    }

    throw error;
  }
};

const end = async () => {
  const pools = [primaryPool];
  if (fallbackPool) {
    pools.push(fallbackPool);
  }
  await Promise.allSettled(pools.map((pool) => pool.end()));
};

module.exports = {
  query,
  end
};
