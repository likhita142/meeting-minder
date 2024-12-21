import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { actionItemService } from "@/services/actionItemService";
import { ActionItemForm } from "./ActionItemForm";
import { ActionItemsTable } from "./ActionItemsTable";

export function ActionItems() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const { data: actionItems = [] } = useQuery({
    queryKey: ['actionItems'],
    queryFn: actionItemService.getActionItems,
  });

  return (
    <div className="space-y-6">
      <ActionItemForm />

      <div className="flex justify-end">
        <Select
          value={filterStatus}
          onValueChange={setFilterStatus}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ActionItemsTable items={actionItems} filterStatus={filterStatus} />
    </div>
  );
}