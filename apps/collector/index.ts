import axios from 'axios';
import { MySQL2Extended } from 'mysql2-extended';
import { createPool, Pool } from 'mysql2/promise';
import 'dotenv/config'

type Record = {
  '': undefined
  webdata_sn: string;
  webdata_msvn: string;
  webdata_ssvn: string;
  webdata_pv_type: string;
  webdata_rate_p: string;
  webdata_now_p: string;
  webdata_today_e: string;
  webdata_total_e: string;
  webdata_alarm: string;
  webdata_utime: string;
  cover_mid: string;
  cover_ver: string;
  cover_wmode: string;
  cover_ap_ssid: string;
  cover_ap_ip: string
  cover_ap_mac: string;
  cover_sta_ssid: string;
  cover_sta_rssi: string;
  cover_sta_ip: string;
  cover_sta_mac: string;
  status_a: string;
  status_b: string;
  status_c: string;
};

type PreparedRecord = Awaited<ReturnType<typeof getRow>>;

let interval: NodeJS.Timer;
let pool: Pool;
let db: MySQL2Extended;

(async () => {
  pool = createPool({uri: process.env.DATABASE_URL});
  db = new MySQL2Extended(pool);

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
  await pool.end();
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

  const record: Record = Object.fromEntries(data);

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

async function insertRow(row: PreparedRecord) {
  db.insert<PreparedRecord>('logs', row);
}