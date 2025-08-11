# GA4 + Google Ads Metrics Proxy (for Chat-based Q&A)

This project is a small Express server that:

- Connects to **Google Analytics 4 (GA4)** via the Analytics Data API (service account authentication).
- Connects to **Google Ads** via the Google Ads API (developer token + OAuth refresh token).
- Exposes simple JSON endpoints so an LLM (like GPT-5 or Claude) can run reports directly.

## Features

- Friendly metric/dimension aliases in `src/schema.ts`.
- Canned GAQL templates for Google Ads.
- Secure credential storage via environment variables.
- Ready for integration as function-calling tools in LLMs.

---

## 1. Prerequisites

- **Node.js** 18 or newer
- A GA4 property with access
- Google Cloud service account for GA4
- Google Ads account with Developer Token + OAuth refresh token

---

## 2. Setup

Clone this repo:
```bash
git clone https://github.com/YOUR_USERNAME/ga4-ads-agent-starter.git
cd ga4-ads-agent-starter
