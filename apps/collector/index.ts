import axios from 'axios';
import { createPool } from 'mysql2/promise';
import 'dotenv/config'
import type { Database, Measurement, Row } from '../../types';
import { Kysely, MysqlDialect } from 'kysely';

let interval: NodeJS.Timer;
let db: Kysely<Database>;

(async () => {
  db = new Kysely<Database>({
    dialect: new MysqlDialect({
      pool: createPool({ uri: process.env.DATABASE_URL })
    })
  });

  interval = setInterval(async () => {
    try {
      const row = await getRow();
      await insertRow(row);
    } catch (error) {
      console.log(error);
    }
  }, 1_000)
})();

process.on('exit', async () => {
  await db.destroy();
  clearInterval(interval);
})

async function getRow() {
  const response = await axios.get<string>(process.env.STATUS_URL ?? '', {
    auth: {
      username: process.env.AUTH_USER ?? '',
      password: process.env.AUTH_PASSWORD ?? '',
    }
  });

  const scriptTag = '<script type="text/javascript">';
  const firstScriptTag = response.data.indexOf('<script type="text/javascript">');
  const startIndex = response.data.indexOf('<script type="text/javascript">', firstScriptTag + 1) + scriptTag.length
  const endIndex = response.data.indexOf('function initPageText()', startIndex);

  const data = response.data
    .slice(startIndex, endIndex)
    .split('\n')
    .map((item) => item.split('='))
    .map((item) => item.map((i) => i.replace('var', '').replace(/\"/g, '').replace(';', '').trim()))

  const record: Measurement = Object.fromEntries(data);

  return {
    power_now: Number(record.webdata_now_p),
    energy_today: Number(record.webdata_today_e),
    energy_total: Number(record.webdata_total_e),
    alarm: record.webdata_alarm,
    utime: Number(record.webdata_utime),
    cover_sta_rssi: record.cover_sta_rssi,
    timestamp: new Date()
  }
}

async function insertRow(row: Row) {
  return db.insertInto('logs').values(row).execute();
}