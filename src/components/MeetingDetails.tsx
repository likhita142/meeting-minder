import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CalendarDays, Clock, CheckSquare, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export function MeetingDetails() {
  const { id } = useParams();

  // Mock data - will be replaced with real data in next iteration
  const meeting = {
    id: Number(id),
    title: id === "1" ? "Product Team Weekly Sync" : "Design Review",
    date: id === "1" ? "2024-03-10" : "2024-03-09",
    time: id === "1" ? "10:00 AM" : "2:30 PM",
    actionItems: [
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
    ],
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
              {meeting.date}
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              {meeting.time}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Action Items</h3>
          <div className="space-y-4">
            {meeting.actionItems.map((item) => (
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}