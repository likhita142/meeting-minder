-- Meeting Minder Database Setup
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS meeting_participants CASCADE;
DROP TABLE IF EXISTS agenda_items CASCADE;
DROP TABLE IF EXISTS action_items CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;

-- Create meetings table
CREATE TABLE meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create action_items table
CREATE TABLE action_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agenda_items table (for future use)
CREATE TABLE agenda_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meeting_participants table (for future use)
CREATE TABLE meeting_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'participant',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_meetings_created_by ON meetings(created_by);
CREATE INDEX idx_meetings_date ON meetings(date);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_action_items_meeting_id ON action_items(meeting_id);
CREATE INDEX idx_action_items_status ON action_items(status);
CREATE INDEX idx_action_items_due_date ON action_items(due_date);
CREATE INDEX idx_action_items_created_by ON action_items(created_by);
CREATE INDEX idx_agenda_items_meeting_id ON agenda_items(meeting_id);
CREATE INDEX idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);

-- Enable Row Level Security (RLS)
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for meetings
CREATE POLICY "Users can view their own meetings" ON meetings
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create meetings" ON meetings
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own meetings" ON meetings
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own meetings" ON meetings
  FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for action_items
CREATE POLICY "Users can view action items from their meetings" ON action_items
  FOR SELECT USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = action_items.meeting_id 
      AND meetings.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create action items" ON action_items
  FOR INSERT WITH CHECK (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = action_items.meeting_id 
      AND meetings.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update action items" ON action_items
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = action_items.meeting_id 
      AND meetings.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete action items" ON action_items
  FOR DELETE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = action_items.meeting_id 
      AND meetings.created_by = auth.uid()
    )
  );

-- Create RLS policies for agenda_items
CREATE POLICY "Users can view agenda items from their meetings" ON agenda_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = agenda_items.meeting_id 
      AND meetings.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create agenda items" ON agenda_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = agenda_items.meeting_id 
      AND meetings.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update agenda items" ON agenda_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = agenda_items.meeting_id 
      AND meetings.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete agenda items" ON agenda_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = agenda_items.meeting_id 
      AND meetings.created_by = auth.uid()
    )
  );

-- Create RLS policies for meeting_participants
CREATE POLICY "Users can view participants from their meetings" ON meeting_participants
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = meeting_participants.meeting_id 
      AND meetings.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can add participants to their meetings" ON meeting_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = meeting_participants.meeting_id 
      AND meetings.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can remove participants from their meetings" ON meeting_participants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = meeting_participants.meeting_id 
      AND meetings.created_by = auth.uid()
    )
  );

-- Insert some sample data (optional)
-- Uncomment the following lines if you want sample data

/*
-- Sample meeting (you'll need to replace the UUID with an actual user ID after creating an account)
INSERT INTO meetings (title, description, date, created_by) VALUES 
('Team Standup', 'Daily team standup meeting', NOW() + INTERVAL '1 day', auth.uid());

-- Sample action items (will be linked to the meeting above)
INSERT INTO action_items (title, description, assigned_to, due_date, status, meeting_id, created_by) 
SELECT 
  'Review project requirements',
  'Go through the project requirements document and provide feedback',
  'John Doe',
  CURRENT_DATE + INTERVAL '3 days',
  'pending',
  m.id,
  m.created_by
FROM meetings m WHERE m.title = 'Team Standup' LIMIT 1;
*/

-- Verify the setup
SELECT 'Setup completed successfully!' as message;
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('meetings', 'action_items', 'agenda_items', 'meeting_participants');
