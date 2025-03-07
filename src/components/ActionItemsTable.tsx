
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ActionItem, actionItemService } from "@/services/actionItemService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ActionItemsTableProps {
  items: ActionItem[];
  filterStatus: string;
}

export function ActionItemsTable({ items, filterStatus }: ActionItemsTableProps) {
  const queryClient = useQueryClient();

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ActionItem['status'] }) =>
      actionItemService.updateActionItemStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actionItems'] });
    },
  });

  const { mutate: deleteItem } = useMutation({
    mutationFn: actionItemService.deleteActionItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actionItems'] });
    },
  });

  const filteredItems = items.filter((item) =>
    filterStatus === "all" ? true : item.status === filterStatus
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No action items found
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.assigned_to}</TableCell>
                <TableCell>
                  {item.due_date ? format(new Date(item.due_date), "PPP") : "-"}
                </TableCell>
                <TableCell>
                  <Select
                    value={item.status}
                    onValueChange={(value: ActionItem['status']) =>
                      updateStatus({ id: item.id, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
