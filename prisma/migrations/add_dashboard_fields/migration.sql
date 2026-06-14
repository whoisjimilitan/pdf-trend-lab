-- Add pipeline_stage to b2b_leads
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'NEW';

-- Add last_engagement_type
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS last_engagement_type TEXT;

-- Add engaged_today boolean
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS engaged_today BOOLEAN DEFAULT false;

-- Create indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_b2b_leads_engaged_today ON b2b_leads(engaged_today);
CREATE INDEX IF NOT EXISTS idx_b2b_leads_pipeline_stage ON b2b_leads(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_b2b_leads_engagement ON b2b_leads(engagement_score DESC, last_engagement_at DESC NULLS LAST);
