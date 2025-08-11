import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { GA4_METRIC_ALIASES, GA4_DIM_ALIASES, CHANNEL_SYNONYMS, DateRange } from './schema.js';

const ga4 = new BetaAnalyticsDataClient();

export type GA4ReportParams = {
  propertyId: string;
  metrics: string[]; // friendly or raw names
  dimensions?: string[];
  dateRange?: DateRange;
  filters?: { field: string; op: 'EXACT'|'CONTAINS'|'REGEX'; value: string }[];
  limit?: number;
};

function toApiMetric(name: string) {
  return GA4_METRIC_ALIASES[name] || name;
}
function toApiDimension(name: string) {
  return GA4_DIM_ALIASES[name] || name;
}

export async function runGA4Report(params: GA4ReportParams) {
  const {
    propertyId,
    metrics,
    dimensions = ['date'],
    dateRange = { startDate: '7daysAgo', endDate: 'yesterday' },
    filters = [],
    limit = 1000
  } = params;

  const metricObjects = metrics.map(m => ({ name: toApiMetric(m) }));
  const dimensionObjects = dimensions.map(d => ({ name: toApiDimension(d) }));

  // Build simple AND filter group for dimensions/metrics
  const filterExpressions = filters.map(f => {
    const fieldName = toApiDimension(f.field) || toApiMetric(f.field) || f.field;
    const val = CHANNEL_SYNONYMS[f.value.toLowerCase()] || f.value;
    if (f.op === 'EXACT') {
      return { filter: { fieldName, stringFilter: { matchType: 'EXACT', value: val } } };
    }
    if (f.op === 'CONTAINS') {
      return { filter: { fieldName, stringFilter: { matchType: 'CONTAINS', value: val } } };
    }
    return { filter: { fieldName, stringFilter: { matchType: 'FULL_REGEXP', value: val } } };
  });

  let dimensionFilter: any | undefined = undefined;
  if (filterExpressions.length === 1) {
    dimensionFilter = filterExpressions[0];
  } else if (filterExpressions.length > 1) {
    dimensionFilter = { andGroup: { expressions: filterExpressions } };
  }

  const [resp] = await ga4.runReport({
    property: `properties/${propertyId}`,
    dimensions: dimensionObjects,
    metrics: metricObjects,
    dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
    dimensionFilter,
    limit: BigInt(limit),
  });

  const headers = [
    ...(resp.dimensionHeaders ?? []).map(h => h.name),
    ...(resp.metricHeaders ?? []).map(h => h.name),
  ];

  const rows = (resp.rows ?? []).map(r => {
    const values = [
      ...(r.dimensionValues ?? []).map(v => v.value ?? ''),
      ...(r.metricValues ?? []).map(v => v.value ?? ''),
    ];
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i]; });
    return obj;
  });

  return { headers, rows, rowCount: rows.length };
}
