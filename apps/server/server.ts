import Fastify from 'fastify';
import { createPool } from 'mysql2';
import 'dotenv/config';
import { Kysely, MysqlDialect } from 'kysely';
import type { Database } from '../../types';

const db = new Kysely<Database>({
  dialect: new MysqlDialect({
    pool: createPool({ uri: process.env.DATABASE_URL })
  })
});

const fastify = Fastify({ logger: true })

fastify.get('/basic', async (_request, reply) => {
  reply.type('application/json').code(200);
  
  const res = await db.selectFrom('logs').selectAll().limit(5).execute();

  return res;
});

fastify.listen({ port: 3000 }, (error, address) => {
  if (error) {
    throw error;
  }
});