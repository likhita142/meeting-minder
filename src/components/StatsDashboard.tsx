import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMeetings } from "@/services/meetingService";
import { actionItemService } from "@/services/actionItemService";
import { format, isAfter, isBefore, addDays, parseISO } from "date-fns";

export function StatsDashboard() {
  const { data: meetings = [] } = useMeetings();
  const { data: actionItems = [] } = useQuery({
    queryKey: ['actionItems'],
    queryFn: actionItemService.getActionItems,
  });

  // Calculate meeting stats
  const totalMeetings = meetings.length;
  const thisMonthMeetings = meetings.filter(meeting => {
    const meetingDate = parseISO(meeting.date);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return isAfter(meetingDate, startOfMonth);
  }).length;

  // Calculate action item stats
  const totalActionItems = actionItems.length;
  const completedActionItems = actionItems.filter(item => item.status === 'completed').length;
  const pendingActionItems = actionItems.filter(item => item.status === 'pending').length;
  const inProgressActionItems = actionItems.filter(item => item.status === 'in-progress').length;

  // Calculate overdue items
  const now = new Date();
  const overdueItems = actionItems.filter(item => 
    item.status !== 'completed' && 
    item.due_date && 
    isBefore(parseISO(item.due_date), now)
  ).length;

  // Calculate due soon items (next 7 days)
  const nextWeek = addDays(now, 7);
  const dueSoonItems = actionItems.filter(item => 
    item.status !== 'completed' && 
    item.due_date && 
    isAfter(parseISO(item.due_date), now) &&
    isBefore(parseISO(item.due_date), nextWeek)
  ).length;

  const completionRate = totalActionItems > 0 ? (completedActionItems / totalActionItems) * 100 : 0;

  const stats = [
    {
      title: "Total Meetings",
      value: totalMeetings,
      icon: Calendar,
      description: `${thisMonthMeetings} this month`,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Action Items",
      value: totalActionItems,
      icon: CheckCircle2,
      description: `${completedActionItems} completed`,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Completion Rate",
      value: `${Math.round(completionRate)}%`,
      icon: TrendingUp,
      description: "Overall progress",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Overdue Items",
      value: overdueItems,
      icon: AlertTriangle,
      description: "Need attention",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Action Items Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Completion</span>
                <span>{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{completedActionItems}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{inProgressActionItems}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{pendingActionItems}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Overdue</span>
              </div>
              <Badge variant={overdueItems > 0 ? "destructive" : "secondary"}>
                {overdueItems}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Due Soon (7 days)</span>
              </div>
              <Badge variant={dueSoonItems > 0 ? "default" : "secondary"}>
                {dueSoonItems}
              </Badge>
            </div>

            {overdueItems === 0 && dueSoonItems === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">All caught up!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
