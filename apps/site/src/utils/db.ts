import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import type { Database } from '../../../../shared/types'

export const db = new Kysely<Database>({
  dialect: new MysqlDialect({
    pool: createPool({ uri: process.env.DATABASE_URL })
  })
});
