import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Download } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MeetingNotesList } from "@/components/MeetingNotesList";
import { CreateMeetingDialog } from "@/components/CreateMeetingDialog";
import { ActionItems } from "@/components/ActionItems";
import { SearchAndFilter, SearchFilters } from "@/components/SearchAndFilter";
import { useMeetings } from "@/services/meetingService";
import { useQuery } from "@tanstack/react-query";
import { actionItemService } from "@/services/actionItemService";
import { exportMeetingsToCSV, exportActionItemsToCSV } from "@/utils/exportUtils";
import { StatsDashboard } from "@/components/StatsDashboard";

const Index = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    status: "all",
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: meetings = [] } = useMeetings();
  const { data: actionItems = [] } = useQuery({
    queryKey: ['actionItems'],
    queryFn: actionItemService.getActionItems,
  });

  const handleExportMeetings = () => {
    if (meetings.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no meetings to export.",
        variant: "destructive",
      });
      return;
    }
    exportMeetingsToCSV(meetings);
    toast({
      title: "Export successful",
      description: "Meetings have been exported to CSV.",
    });
  };

  const handleExportActionItems = () => {
    if (actionItems.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no action items to export.",
        variant: "destructive",
      });
      return;
    }
    exportActionItemsToCSV(actionItems);
    toast({
      title: "Export successful",
      description: "Action items have been exported to CSV.",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Stats Dashboard */}
      <StatsDashboard />

      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">Meeting Notes</CardTitle>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportMeetings}>
                  Export Meetings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportActionItems}>
                  Export Action Items
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Meeting
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <SearchAndFilter
              filters={filters}
              onFiltersChange={setFilters}
              placeholder="Search meeting notes..."
            />
          </div>
          <MeetingNotesList filters={filters} />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionItems />
        </CardContent>
      </Card>

      <CreateMeetingDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
};

export default Index;