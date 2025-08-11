# Agent Integration

Expose two tools from your backend API to the LLM:

- **GA4 Report Tool** → POST `http://localhost:8787/ga4/runReport`
- **Google Ads Report Tool** → POST `http://localhost:8787/ads/query`

## Mapping Tips

- "Organic" → filter: `{ field: "default_channel_group", op: "EXACT", value: "Organic Search" }`
- "Conversion rate" → metric: `"sessionConversionRate"`
- "Last 7 days vs previous" → either run two separate calls or compute deltas client-side after retrieving one dataset.

## Usage Pattern

When the LLM receives a natural language question, it should:

1. Map friendly metric/dimension names to their API equivalents.
2. Apply date ranges and filters as described.
3. Call the correct API endpoint.
4. Summarize the results in text and optionally include a small table.

You can extend the mapping rules in `src/schema.ts` to cover more of your common terms and synonyms.
