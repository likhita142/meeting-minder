
import { supabase } from '@/integrations/supabase/client';

export interface ActionItem {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  due_date: string | null;
  status: 'pending' | 'in-progress' | 'completed';
  meeting_id: string | null;
  created_at: string | null;
  created_by: string | null;
}

export const actionItemService = {
  async getActionItems() {
    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ActionItem[];
  },

  async getActionItemsByMeeting(meetingId: string) {
    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ActionItem[];
  },

  async createActionItem(item: { 
    title: string;
    description?: string;
    assigned_to?: string;
    due_date?: string;
    meeting_id?: string;
    status?: ActionItem['status']; 
  }) {
    // Only including defined fields to avoid null/undefined issues
    const payload: any = { 
      title: item.title,
      status: item.status || 'pending'
    };
    
    // Only add optional fields if they are provided and not empty
    if (item.description) payload.description = item.description;
    if (item.due_date) payload.due_date = item.due_date;
    if (item.meeting_id) payload.meeting_id = item.meeting_id;
    
    // Handle assigned_to as a text description rather than a UUID
    // This means we store the person's name, not their user ID
    if (item.assigned_to && item.assigned_to.trim() !== '') {
      payload.assigned_to = item.assigned_to;
    }
    
    const { data, error } = await supabase
      .from('action_items')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Error creating action item:", error);
      throw error;
    }
    
    return data as ActionItem;
  },

  async updateActionItemStatus(id: string, status: ActionItem['status']) {
    const { data, error } = await supabase
      .from('action_items')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ActionItem;
  },

  async deleteActionItem(id: string) {
    const { error } = await supabase
      .from('action_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
