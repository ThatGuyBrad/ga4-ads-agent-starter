import { GoogleAdsApi } from 'google-ads-api';
import { ADS_FIELDS, DateRange } from './schema.js';

export type AdsQueryParams = {
  customerId: string;          // Google Ads customer ID without dashes
  gaql?: string;               // Optional direct GAQL query
  template?: keyof typeof ADS_FIELDS; // Or use a canned template
  dateRange?: DateRange;
  limit?: number;
};

function getClient() {
  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
  });
  return client;
}

export async function runAdsQuery(params: AdsQueryParams) {
  const {
    customerId,
    gaql,
    template = 'perf_by_campaign',
    dateRange = { startDate: lastNDays(7).start, endDate: yesterday() },
  } = params;

  let query = gaql || ADS_FIELDS[template];
  query = query.replace('%START%', dateRange.startDate).replace('%END%', dateRange.endDate);

  const client = getClient();
  const customer = client.Customer({
    customer_id: customerId,
    // Optional manager that owns the developer token (no dashes)
    login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || undefined,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
  });

  const rows = await customer.query(query);
  return rows;
}

function yesterday() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0,10);
}
function lastNDays(n: number) {
  const end = new Date(); end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(); start.setUTCDate(start.getUTCDate() - n);
  return { start: start.toISOString().slice(0,10), end: end.toISOString().slice(0,10) };
}
