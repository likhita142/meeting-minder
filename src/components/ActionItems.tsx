import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { actionItemService } from "@/services/actionItemService";
import { ActionItemForm } from "./ActionItemForm";
import { ActionItemsTable } from "./ActionItemsTable";
import { SearchAndFilter, SearchFilters } from "./SearchAndFilter";

export function ActionItems() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    status: "all",
  });

  const { data: actionItems = [] } = useQuery({
    queryKey: ['actionItems'],
    queryFn: actionItemService.getActionItems,
  });

  return (
    <div className="space-y-6">
      <ActionItemForm />

      <SearchAndFilter
        filters={filters}
        onFiltersChange={setFilters}
        showStatusFilter={true}
        placeholder="Search action items..."
      />

      <ActionItemsTable items={actionItems} filters={filters} />
    </div>
  );
}