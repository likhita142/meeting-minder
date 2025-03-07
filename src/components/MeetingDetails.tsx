
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CalendarDays, Clock, CheckSquare, User } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useMeeting } from "@/services/meetingService";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function MeetingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: meeting, isLoading, error } = useMeeting(id || "");

  // Mock action items data - will be replaced with real data in next iteration
  const actionItems = [
    {
      id: 1,
      description: "Update wireframes for mobile view",
      assignee: "Sarah",
      completed: true,
    },
    {
      id: 2,
      description: "Schedule user testing sessions",
      assignee: "Mike",
      completed: false,
    },
    {
      id: 3,
      description: "Review competitor analysis",
      assignee: "John",
      completed: false,
    },
  ];

  if (isLoading) {
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

  if (error || !meeting) {
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
              {error ? "Error loading meeting details" : "Meeting not found"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          
          <h3 className="text-lg font-semibold mb-4">Action Items</h3>
          <div className="space-y-4">
            {actionItems.length > 0 ? (
              actionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50"
                >
                  <CheckSquare
                    className={`h-5 w-5 mt-0.5 ${
                      item.completed ? "text-green-500" : "text-gray-400"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.description}</p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <User className="h-3 w-3 mr-1" />
                      {item.assignee}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No action items for this meeting yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
