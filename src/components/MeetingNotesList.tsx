
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMeetings } from "@/services/meetingService";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchFilters } from "./SearchAndFilter";

interface MeetingNotesListProps {
  filters: SearchFilters;
}

export function MeetingNotesList({ filters }: MeetingNotesListProps) {
  const navigate = useNavigate();
  const { data: meetings, isLoading, error } = useMeetings();

  // Filter meetings based on filters
  const filteredMeetings = meetings?.filter((meeting) => {
    // Text search
    const matchesQuery = !filters.query ||
      meeting.title.toLowerCase().includes(filters.query.toLowerCase()) ||
      (meeting.description && meeting.description.toLowerCase().includes(filters.query.toLowerCase())) ||
      meeting.date.toString().includes(filters.query);

    // Date range filter
    const meetingDate = parseISO(meeting.date);
    const matchesDateFrom = !filters.dateFrom || isAfter(meetingDate, filters.dateFrom) ||
      meetingDate.toDateString() === filters.dateFrom.toDateString();
    const matchesDateTo = !filters.dateTo || isBefore(meetingDate, filters.dateTo) ||
      meetingDate.toDateString() === filters.dateTo.toDateString();

    return matchesQuery && matchesDateFrom && matchesDateTo;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
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
      <div className="text-center text-destructive py-8">
        Error loading meetings. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredMeetings.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          {filters.query || filters.dateFrom || filters.dateTo ? "No meetings found matching your filters." : "No meetings yet. Create your first meeting!"}
        </div>
      ) : (
        filteredMeetings.map((meeting) => (
          <Card
            key={meeting.id}
            className="hover:bg-accent transition-colors cursor-pointer"
            onClick={() => navigate(`/meeting/${meeting.id}`)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold">
                {meeting.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
