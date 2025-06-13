-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create action_items table
CREATE TABLE IF NOT EXISTS action_items (
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

-- Create agenda_items table
CREATE TABLE IF NOT EXISTS agenda_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meeting_participants table
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'participant',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);
CREATE INDEX IF NOT EXISTS idx_action_items_meeting_id ON action_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON action_items(status);
CREATE INDEX IF NOT EXISTS idx_action_items_due_date ON action_items(due_date);
CREATE INDEX IF NOT EXISTS idx_agenda_items_meeting_id ON agenda_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);

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
