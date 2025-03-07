
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

  async createActionItem(item: { 
    title: string;
    description?: string;
    assigned_to?: string;
    due_date?: string;
    meeting_id?: string;
    status?: ActionItem['status']; 
  }) {
    const { data, error } = await supabase
      .from('action_items')
      .insert([{ 
        ...item,
        status: item.status || 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
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
