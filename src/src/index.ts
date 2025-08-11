import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { z } from 'zod';
import { runGA4Report } from './ga4.js';
import { runAdsQuery } from './ads.js';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(morgan('tiny'));
app.use(pinoHttp({ logger: pino() }));

app.get('/health', (_req, res) => res.json({ ok: true }));

const GA4Body = z.object({
  propertyId: z.string().min(1),
  metrics: z.array(z.string()).min(1),
  dimensions: z.array(z.string()).optional(),
  dateRange: z.object({ startDate: z.string(), endDate: z.string() }).optional(),
  filters: z.array(z.object({
    field: z.string(),
    op: z.enum(['EXACT','CONTAINS','REGEX']),
    value: z.string()
  })).optional(),
  limit: z.number().int().positive().optional()
});

app.post('/ga4/runReport', async (req, res) => {
  const body = GA4Body.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.flatten() });
  try {
    const result = await runGA4Report(body.data);
    res.json(result);
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: err.message || 'GA4 error' });
  }
});

const AdsBody = z.object({
  customerId: z.string().regex(/^\d+$/),
  gaql: z.string().optional(),
  template: z.string().optional(),
  dateRange: z.object({ startDate: z.string(), endDate: z.string() }).optional(),
});

app.post('/ads/query', async (req, res) => {
  const body = AdsBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.flatten() });
  try {
    const result = await runAdsQuery(body.data as any);
    res.json({ rows: result });
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: err.message || 'Ads error' });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`metrics proxy listening on http://localhost:${port}`);
});
