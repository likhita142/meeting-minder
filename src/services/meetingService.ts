
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Type for meeting with action items count
export interface MeetingWithActions extends Tables<"meetings"> {
  actionItemsCount?: number;
  completedItemsCount?: number;
}

export const meetingService = {
  async getMeetings(): Promise<MeetingWithActions[]> {
    const { data: meetings, error } = await supabase
      .from("meetings")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    // Get action items counts for each meeting
    const meetingsWithActions = await Promise.all(
      meetings.map(async (meeting) => {
        const { count: actionItemsCount } = await supabase
          .from("action_items")
          .select("*", { count: "exact", head: true })
          .eq("meeting_id", meeting.id);

        const { count: completedItemsCount } = await supabase
          .from("action_items")
          .select("*", { count: "exact", head: true })
          .eq("meeting_id", meeting.id)
          .eq("status", "completed");

        return {
          ...meeting,
          actionItemsCount: actionItemsCount || 0,
          completedItemsCount: completedItemsCount || 0,
        };
      })
    );

    return meetingsWithActions;
  },

  async getMeetingById(id: string): Promise<MeetingWithActions | null> {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    
    // Get action items count
    const { count: actionItemsCount } = await supabase
      .from("action_items")
      .select("*", { count: "exact", head: true })
      .eq("meeting_id", data.id);

    const { count: completedItemsCount } = await supabase
      .from("action_items")
      .select("*", { count: "exact", head: true })
      .eq("meeting_id", data.id)
      .eq("status", "completed");

    return {
      ...data,
      actionItemsCount: actionItemsCount || 0,
      completedItemsCount: completedItemsCount || 0,
    };
  },

  async createMeeting(meeting: {
    title: string;
    date: string;
    description?: string;
  }): Promise<MeetingWithActions> {
    const { data, error } = await supabase
      .from("meetings")
      .insert([meeting])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// React Query hooks
export const useMeetings = () => {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: meetingService.getMeetings,
  });
};

export const useMeeting = (id: string) => {
  return useQuery({
    queryKey: ["meeting", id],
    queryFn: () => meetingService.getMeetingById(id),
    enabled: !!id,
  });
};

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: meetingService.createMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
};
