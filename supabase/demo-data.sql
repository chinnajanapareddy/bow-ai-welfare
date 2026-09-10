-- Demo data for BOW app
-- Run this in the Supabase SQL editor after creating the tables.

INSERT INTO users (id, name, email, password, joined_at)
VALUES
  ('demo-user', 'Ananya Rao', 'hello@bow.org', 'demo123', '2025-01-12T08:30:00Z'),
  ('user-2', 'Rohan Iyer', 'rohan@bow.org', 'demo123', '2025-02-18T10:15:00Z'),
  ('user-3', 'Meera Nair', 'meera@bow.org', 'demo123', '2025-03-03T14:42:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reports (id, email, location, description, voiceText, concern, priority, status, "createdAt")
VALUES
  (
    'PC-1047',
    'hello@bow.org',
    'Besant Nagar, Chennai',
    'Dog showing signs of weakness and a possible injury near the bus stop.',
    'There is a dog near the bus stop and it looks like it cannot walk steadily.',
    'Possible mobility issue',
    'High',
    'Reviewed',
    '2025-05-06T19:25:00Z'
  ),
  (
    'PC-1048',
    'rohan@bow.org',
    'Mylapore, Chennai',
    'Stray dog appears hungry and tired, following people near the market road.',
    'Dog is thin and keeps following nearby vendors for food.',
    'Needs food and monitoring',
    'Medium',
    'Submitted',
    '2025-05-07T09:10:00Z'
  ),
  (
    'PC-1049',
    'meera@bow.org',
    'Velachery, Chennai',
    'Dog is resting quietly but looks older and underweight.',
    'The dog is calm but appears weak and requires observation.',
    'Needs welfare check',
    'Medium',
    'In Review',
    '2025-05-08T13:40:00Z'
  ),
  (
    'PC-1050',
    'hello@bow.org',
    'Adyar, Chennai',
    'Dog is friendly and seems healthy but has a small wound on one paw.',
    'Minor paw injury noticed while dog was walking near the park.',
    'Minor wound',
    'Low',
    'Resolved',
    '2025-05-09T07:55:00Z'
  )
ON CONFLICT (id) DO NOTHING;
