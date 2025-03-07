
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { actionItemService } from "@/services/actionItemService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function ActionItemForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: createActionItem, isError, error } = useMutation({
    mutationFn: actionItemService.createActionItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actionItems'] });
      toast({
        title: "Action Item Added",
        description: "The action item has been created successfully.",
      });
      setTitle("");
      setDescription("");
      setAssignedTo("");
      setDueDate(undefined);
    },
    onError: (error) => {
      console.error("Error adding action item:", error);
      toast({
        title: "Failed to Add Action Item",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const handleAddActionItem = () => {
    if (!title || !assignedTo || !dueDate) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createActionItem({
      title,
      description: description || undefined,
      assigned_to: assignedTo, // Store as a string (name)
      due_date: dueDate.toISOString(),
      status: "pending",
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        placeholder="Assigned to"
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !dueDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dueDate ? format(dueDate, "PPP") : <span>Pick a deadline</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dueDate}
            onSelect={setDueDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Button onClick={handleAddActionItem} className="md:col-span-4">
        <Plus className="mr-2 h-4 w-4" />
        Add Action Item
      </Button>
    </div>
  );
}
