CREATE TABLE IF NOT EXISTS submissions (
  submission_id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  problem_id VARCHAR NOT NULL REFERENCES problems(problem_id),
  language VARCHAR NOT NULL,
  code TEXT NOT NULL,
  cleaned_code TEXT NOT NULL,
  function_name VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'queued',
  callback_url VARCHAR,
  results JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);