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
import { ActionItem, actionItemService } from "@/services/actionItemService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function ActionItemForm() {
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [deadline, setDeadline] = useState<Date>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: createActionItem } = useMutation({
    mutationFn: actionItemService.createActionItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actionItems'] });
      toast({
        title: "Action Item Added",
        description: "The action item has been created successfully.",
      });
      setDescription("");
      setOwner("");
      setDeadline(undefined);
    },
  });

  const handleAddActionItem = () => {
    if (!description || !owner || !deadline) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createActionItem({
      description,
      owner,
      deadline,
      status: "pending",
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        placeholder="Owner"
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !deadline && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {deadline ? format(deadline, "PPP") : <span>Pick a deadline</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={deadline}
            onSelect={setDeadline}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Button onClick={handleAddActionItem}>
        <Plus className="mr-2 h-4 w-4" />
        Add Action Item
      </Button>
    </div>
  );
}