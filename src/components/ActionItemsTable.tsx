
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
import { ConfirmDialog } from "./ConfirmDialog";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SearchFilters } from "./SearchAndFilter";
import { parseISO, isAfter, isBefore } from "date-fns";

interface ActionItemsTableProps {
  items: ActionItem[];
  filters: SearchFilters;
}

export function ActionItemsTable({ items, filters }: ActionItemsTableProps) {
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    item: ActionItem | null;
  }>({ open: false, item: null });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ActionItem['status'] }) =>
      actionItemService.updateActionItemStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actionItems'] });
      toast.success('Action item status updated');
    },
    onError: () => {
      toast.error('Failed to update action item status');
    },
  });

  const { mutate: deleteItem } = useMutation({
    mutationFn: actionItemService.deleteActionItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actionItems'] });
      toast.success('Action item deleted');
    },
    onError: () => {
      toast.error('Failed to delete action item');
    },
  });

  const handleDeleteClick = (item: ActionItem) => {
    setDeleteConfirm({ open: true, item });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.item) {
      deleteItem(deleteConfirm.item.id);
    }
  };

  const filteredItems = items.filter((item) => {
    // Text search
    const matchesQuery = !filters.query ||
      item.title.toLowerCase().includes(filters.query.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(filters.query.toLowerCase())) ||
      (item.assigned_to && item.assigned_to.toLowerCase().includes(filters.query.toLowerCase()));

    // Status filter
    const matchesStatus = filters.status === "all" || item.status === filters.status;

    // Date range filter (for due dates)
    let matchesDateRange = true;
    if (item.due_date && (filters.dateFrom || filters.dateTo)) {
      const dueDate = parseISO(item.due_date);
      const matchesDateFrom = !filters.dateFrom || isAfter(dueDate, filters.dateFrom) ||
        dueDate.toDateString() === filters.dateFrom.toDateString();
      const matchesDateTo = !filters.dateTo || isBefore(dueDate, filters.dateTo) ||
        dueDate.toDateString() === filters.dateTo.toDateString();
      matchesDateRange = matchesDateFrom && matchesDateTo;
    }

    return matchesQuery && matchesStatus && matchesDateRange;
  });

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
                    onClick={() => handleDeleteClick(item)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, item: null })}
        title="Delete Action Item"
        description={`Are you sure you want to delete "${deleteConfirm.item?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </div>
  );
}
