export interface Row {
  power_now: number | null;
  energy_today: number | null;
  energy_total: number | null;
  alarm: string |null;
  utime: number | null;
  cover_sta_rssi: string | null;
  timestamp: Date;
};

export interface Database {
  logs: Row;
}

export interface Measurement {
  '': undefined;
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