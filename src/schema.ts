export const GA4_METRIC_ALIASES: Record<string,string> = {
  "sessions": "sessions",
  "users": "totalUsers",
  "engaged_sessions": "engagedSessions",
  "engagement_rate": "engagementRate",
  "conversions": "conversions",
  "conversion_rate": "sessionConversionRate",
  "avg_session_duration": "averageSessionDuration"
};

export const GA4_DIM_ALIASES: Record<string,string> = {
  "date": "date",
  "source": "sessionSource",
  "medium": "sessionMedium",
  "source_medium": "sessionSourceMedium",
  "default_channel_group": "sessionDefaultChannelGroup",
  "country": "country",
  "page_path": "pagePath",
  "campaign": "campaignName"
};

export const DEFAULT_GA4_DATE_RANGE = { startDate: "7daysAgo", endDate: "yesterday" };

// Common channel synonyms for filtering
export const CHANNEL_SYNONYMS: Record<string,string> = {
  "paid search": "Paid Search",
  "organic": "Organic Search",
  "organic search": "Organic Search",
  "direct": "Direct",
  "email": "Email",
  "display": "Display",
  "paid social": "Paid Social",
  "organic social": "Organic Social",
  "referral": "Referral"
};

// Basic Ads GAQL snippets
export const ADS_FIELDS = {
  perf_by_campaign: `
    SELECT
      campaign.id,
      campaign.name,
      metrics.clicks,
      metrics.impressions,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value,
      metrics.ctr,
      metrics.average_cpc
    FROM campaign
    WHERE segments.date BETWEEN '%START%' AND '%END%'
    ORDER BY metrics.cost_micros DESC
    LIMIT 100
  `,
};

export type DateRange = { startDate: string, endDate: string };
