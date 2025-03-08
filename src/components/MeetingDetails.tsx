
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CalendarDays, Clock, CheckSquare, User, Plus } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useMeeting } from "@/services/meetingService";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionItem, actionItemService } from "@/services/actionItemService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ActionItemForm } from "./ActionItemForm";
import { useState } from "react";

export function MeetingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { data: meeting, isLoading: meetingLoading, error: meetingError } = useMeeting(id || "");
  
  const { data: actionItems = [], isLoading: actionItemsLoading } = useQuery({
    queryKey: ['actionItems', id],
    queryFn: async () => {
      if (!id) return [];
      
      const items = await actionItemService.getActionItems();
      // Filter for items related to this meeting
      return items.filter(item => item.meeting_id === id);
    },
    enabled: !!id,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ActionItem['status'] }) =>
      actionItemService.updateActionItemStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actionItems', id] });
    },
  });

  if (meetingLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Meetings
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader className="p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (meetingError || !meeting) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Meetings
            </Button>
          </Link>
        </div>
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="text-center text-red-500 py-8">
              {meetingError ? "Error loading meeting details" : "Meeting not found"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddActionItem = (item: any) => {
    if (id) {
      const newItem = { ...item, meeting_id: id };
      actionItemService.createActionItem(newItem)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['actionItems', id] });
          setShowAddForm(false);
        })
        .catch(err => console.error("Error adding action item:", err));
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Meetings
          </Button>
        </Link>
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl font-bold">{meeting.title}</CardTitle>
          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4" />
              {format(parseISO(meeting.date), "yyyy-MM-dd")}
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              {format(parseISO(meeting.date), "h:mm a")}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {meeting.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{meeting.description}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Action Items</h3>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)} 
              size="sm"
              variant={showAddForm ? "outline" : "default"}
            >
              {showAddForm ? "Cancel" : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </>
              )}
            </Button>
          </div>

          {showAddForm && (
            <div className="mb-6 p-4 border rounded-lg bg-slate-50">
              <h4 className="text-md font-medium mb-3">New Action Item</h4>
              <ActionItemForm onSubmit={handleAddActionItem} />
            </div>
          )}
          
          {actionItemsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : actionItems.length > 0 ? (
            <div className="space-y-4">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50"
                >
                  <div 
                    className={`h-5 w-5 mt-0.5 flex-shrink-0 cursor-pointer rounded-sm border ${
                      item.status === 'completed' 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300'
                    }`}
                    onClick={() => updateStatus({
                      id: item.id,
                      status: item.status === 'completed' ? 'pending' : 'completed'
                    })}
                  >
                    {item.status === 'completed' && (
                      <CheckSquare className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      item.status === 'completed' ? 'line-through text-gray-500' : ''
                    }`}>{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    )}
                    {item.assigned_to && (
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <User className="h-3 w-3 mr-1" />
                        {item.assigned_to}
                      </div>
                    )}
                    {item.due_date && (
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        {format(new Date(item.due_date), "PPP")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No action items for this meeting yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
