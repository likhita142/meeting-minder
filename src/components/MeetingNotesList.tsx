
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMeetings } from "@/services/meetingService";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface MeetingNotesListProps {
  searchQuery: string;
}

export function MeetingNotesList({ searchQuery }: MeetingNotesListProps) {
  const navigate = useNavigate();
  const { data: meetings, isLoading, error } = useMeetings();

  // Filter meetings based on search query
  const filteredMeetings = meetings?.filter((meeting) =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (meeting.date && meeting.date.toString().includes(searchQuery))
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-gray-50">
            <CardHeader className="p-4">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center space-x-4 text-sm">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        Error loading meetings. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredMeetings.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          {searchQuery ? "No meetings found matching your search." : "No meetings yet. Create your first meeting!"}
        </div>
      ) : (
        filteredMeetings.map((meeting) => (
          <Card
            key={meeting.id}
            className="hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => navigate(`/meeting/${meeting.id}`)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold">
                {meeting.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {format(parseISO(meeting.date), "yyyy-MM-dd")}
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {format(parseISO(meeting.date), "h:mm a")}
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {meeting.completedItemsCount}/{meeting.actionItemsCount || 0} action items
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
