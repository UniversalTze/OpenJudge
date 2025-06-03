CREATE TABLE IF NOT EXISTS problems (
  problem_id VARCHAR PRIMARY KEY,
  function_name VARCHAR NOT NULL,
  test_inputs JSONB NOT NULL,
  test_outputs JSONB NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

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

-- Sample data for problems
INSERT INTO problems (problem_id, function_name, test_inputs, test_outputs) VALUES
  ('prob1', 'solve',
    '[ [1, 2], [3, 4] ]',
    '[ 3, 7 ]'
  );
