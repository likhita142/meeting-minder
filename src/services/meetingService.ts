
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

    if (error) {
      console.error('Error fetching meetings:', error);
      throw new Error(`Failed to fetch meetings: ${error.message}`);
    }

    if (!meetings) return [];

    // Get action items counts for each meeting
    const meetingsWithActions = await Promise.all(
      meetings.map(async (meeting) => {
        try {
          const { count: actionItemsCount, error: actionError } = await supabase
            .from("action_items")
            .select("*", { count: "exact", head: true })
            .eq("meeting_id", meeting.id);

          if (actionError) {
            console.warn('Error fetching action items count:', actionError);
          }

          const { count: completedItemsCount, error: completedError } = await supabase
            .from("action_items")
            .select("*", { count: "exact", head: true })
            .eq("meeting_id", meeting.id)
            .eq("status", "completed");

          if (completedError) {
            console.warn('Error fetching completed items count:', completedError);
          }

          return {
            ...meeting,
            actionItemsCount: actionItemsCount || 0,
            completedItemsCount: completedItemsCount || 0,
          };
        } catch (error) {
          console.warn('Error processing meeting:', meeting.id, error);
          return {
            ...meeting,
            actionItemsCount: 0,
            completedItemsCount: 0,
          };
        }
      })
    );

    return meetingsWithActions;
  },

  async getMeetingById(id: string): Promise<MeetingWithActions | null> {
    if (!id) {
      throw new Error('Meeting ID is required');
    }

    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error('Error fetching meeting:', error);
      if (error.code === 'PGRST116') {
        return null; // Meeting not found
      }
      throw new Error(`Failed to fetch meeting: ${error.message}`);
    }
    
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
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User must be logged in to create a meeting");
    }

    const { data, error } = await supabase
      .from("meetings")
      .insert([{
        ...meeting,
        created_by: user.id, // Add the user ID as created_by
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating meeting:", error);
      throw error;
    }
    
    return {
      ...data,
      actionItemsCount: 0,
      completedItemsCount: 0,
    };
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
