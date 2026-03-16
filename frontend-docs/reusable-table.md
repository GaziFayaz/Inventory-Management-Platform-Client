# Reusable DataTable Implementation

This document outlines the architecture and usage of the generic `DataTable` component built for the Inventory Management Platform Client.

## 1. Overview

To comply with the project requirement of **"Don't add buttons in table rows. Use multi-selection (checkboxes) and a unified action toolbar"**, we implemented a headless-UI based generic table using `@tanstack/react-table` combined with `shadcn/ui` components.

The table is designed to be completely agnostic of the data it displays and the actions performed on that data. It strictly handles:
- Rendering the grid (rows and columns)
- Managing row selection state
- Pagination

## 2. Core Concept: The "Render Prop" Pattern

To keep the `DataTable` reusable across different pages (e.g., Users, Inventories, Items) while supporting distinctly different toolbars above the table, we utilize the **Render Prop** pattern via the `renderToolbar` property.

### The Signature
```tsx
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  // The Render Prop
  renderToolbar?: (table: ReactTableInstance<TData>) => React.ReactNode;
}
```

### How it works:
"Inversion of Control": The child component (`DataTable`) passes its internal state (`table` instance) back up to the parent. The parent then evaluates this state (like figuring out which rows are selected) and returns the JSX (buttons, inputs) it wants to render above the table.

## 3. Usage Example

Here is how to consume the generic `DataTable` component.

### Step 1: Define Columns
```tsx
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

const columns: ColumnDef<MyDataType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
  }
];
```

### Step 2: Render the Table and Toolbar
Provide the data and utilize the `renderToolbar` prop to extract selected data and build your action buttons.

```tsx
import { DataTable } from "@/components/ui/data-table";

export default function MyPage() {
  const data = useFetchMyData();

  return (
    <DataTable
      columns={columns}
      data={data}
      renderToolbar={(table) => {
        // 1. Extract selected rows from the table instance
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        const selectedItems = selectedRows.map((r) => r.original);
        const hasSelection = selectedItems.length > 0;

        // 2. Return contextual action buttons
        return (
          <div className="flex gap-2 mb-2">
            <Button
              disabled={!hasSelection}
              onClick={() => {
                const ids = selectedItems.map(item => item.id);
                performBulkAction(ids);
                table.resetRowSelection(); // Important: Clear selection after action
              }}
            >
              Perform Action
            </Button>
          </div>
        );
      }}
    />
  );
}
```

## 4. Best Practices

1. **Avoid Row-Level Action Buttons:** Never add "Edit" or "Delete" buttons directly inside the cell definitions. Rely on the multi-select checkbox column and the toolbar.
2. **Clear Selection on Success:** Always call `table.resetRowSelection()` inside your successful action handlers to clear checkboxes after a mutation executes.
3. **Smart Disabled States:** Use the selected rows data to intuitively disable buttons. For instance, if a user clicks the "Block" button, ensure `disabled` is set to `true` if all selected users are already blocked.
4. **Optimistic Payload Filtering:** If mixed rows are selected, filter the target IDs before making API requests (e.g., only send IDs of unblocked users to the block endpoint).
