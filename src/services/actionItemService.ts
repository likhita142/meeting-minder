
import { supabase } from '@/integrations/supabase/client';

export interface ActionItem {
  id: string;
  description: string;
  owner: string;
  deadline: Date;
  status: 'pending' | 'in-progress' | 'completed';
  created_at: Date;
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

  async createActionItem(item: Omit<ActionItem, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('action_items')
      .insert([{ ...item }])
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
