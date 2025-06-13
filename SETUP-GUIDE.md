# Meeting Minder Setup Guide

## 🚨 Quick Fix for "Failed to fetch" Error

The "Failed to fetch" error you're seeing indicates that the database tables haven't been created in your Supabase project yet. Follow these steps to fix it:

### Step 1: Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Navigate to your project: `mxxxezsrlfecegpfychw`

### Step 2: Create Database Tables

1. In your Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy the entire contents of the `database-setup.sql` file
4. Paste it into the SQL editor
5. Click **"Run"** to execute the script

### Step 3: Verify Setup

After running the SQL script, you should see:
- ✅ "Setup completed successfully!" message
- ✅ List of created tables: meetings, action_items, agenda_items, meeting_participants

### Step 4: Test the Application

1. Refresh your browser at `http://localhost:8082`
2. The connection test panel should now show all green checkmarks
3. Try creating an account using the sign-up form
4. Once signed up, you should be redirected to the main dashboard

## 🔧 Alternative: Manual Table Creation

If you prefer to create tables manually, here are the essential tables:

### meetings table
```sql
CREATE TABLE meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### action_items table
```sql
CREATE TABLE action_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔐 Enable Row Level Security

Don't forget to enable RLS and create policies:

```sql
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- Basic policies (see database-setup.sql for complete policies)
CREATE POLICY "Users can manage their own meetings" ON meetings
  USING (auth.uid() = created_by);

CREATE POLICY "Users can manage their action items" ON action_items
  USING (auth.uid() = created_by);
```

## 🎯 Expected Behavior After Setup

1. **Connection Test**: All three tests should pass (green checkmarks)
2. **Sign Up**: You can create a new account
3. **Sign In**: You can sign in with existing credentials
4. **Dashboard**: After signing in, you'll see the main dashboard with:
   - Statistics overview
   - Meeting management
   - Action item tracking
   - Search and filtering capabilities

## 🐛 Troubleshooting

### Still getting "Failed to fetch"?

1. **Check Supabase URL**: Ensure your Supabase URL is correct in `.env`
2. **Check API Key**: Verify the anon key is correct
3. **Check RLS Policies**: Make sure Row Level Security policies are properly set
4. **Check Browser Console**: Look for detailed error messages in browser dev tools

### Authentication not working?

1. **Email Confirmation**: Check if email confirmation is required in Supabase Auth settings
2. **Auth Providers**: Ensure email/password auth is enabled in Supabase
3. **Redirect URLs**: Verify redirect URLs are configured in Supabase Auth settings

### Database connection issues?

1. **Project Status**: Check if your Supabase project is active
2. **API Keys**: Regenerate API keys if needed
3. **Network**: Check if there are any firewall/network restrictions

## 📞 Need Help?

If you're still experiencing issues:

1. Check the browser console for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure your Supabase project is active and properly configured
4. Try creating a simple test query in the Supabase SQL editor

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Connection test shows all green checkmarks
- ✅ You can successfully sign up/sign in
- ✅ Dashboard loads with statistics and empty state messages
- ✅ You can create your first meeting
- ✅ You can add action items to meetings

Once these steps are complete, your Meeting Minder application will be fully functional!
