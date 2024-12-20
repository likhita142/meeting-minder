import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MeetingNotesListProps {
  searchQuery: string;
}

export function MeetingNotesList({ searchQuery }: MeetingNotesListProps) {
  const navigate = useNavigate();

  // Mock data - will be replaced with real data in next iteration
  const meetings = [
    {
      id: 1,
      title: "Product Team Weekly Sync",
      date: "2024-03-10",
      time: "10:00 AM",
      actionItems: 3,
      completedItems: 1,
    },
    {
      id: 2,
      title: "Design Review",
      date: "2024-03-09",
      time: "2:30 PM",
      actionItems: 5,
      completedItems: 4,
    },
  ];

  // Filter meetings based on search query
  const filteredMeetings = meetings.filter((meeting) =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.date.includes(searchQuery) ||
    meeting.time.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {filteredMeetings.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No meetings found matching your search.
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
                  {meeting.date}
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {meeting.time}
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {meeting.completedItems}/{meeting.actionItems} action items
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}