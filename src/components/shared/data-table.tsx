"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
};

export type DataTableFilter<T> = {
  id: string;
  label: string;
  options: { label: string; value: string }[];
  predicate: (row: T, value: string) => boolean;
};

type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  searchPlaceholder?: string;
  searchFn?: (row: T, query: string) => boolean;
  filters?: DataTableFilter<T>[];
  initialFilters?: Record<string, string>;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  pageSize?: number;
};

export function DataTable<T>({
  data,
  columns,
  getRowId,
  searchPlaceholder = "Buscar...",
  searchFn,
  filters,
  initialFilters,
  onRowClick,
  emptyMessage = "Nenhum resultado encontrado.",
  pageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(initialFilters ?? {});
  const [sort, setSort] = useState<{ columnId: string; direction: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let rows = data;

    if (search.trim() && searchFn) {
      const query = search.trim().toLowerCase();
      rows = rows.filter((row) => searchFn(row, query));
    }

    if (filters) {
      for (const filter of filters) {
        const value = activeFilters[filter.id];
        if (value && value !== "all") {
          rows = rows.filter((row) => filter.predicate(row, value));
        }
      }
    }

    return rows;
  }, [data, search, searchFn, filters, activeFilters]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;

    const column = columns.find((col) => col.id === sort.columnId);
    if (!column?.sortValue) return filtered;

    const direction = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const valueA = column.sortValue!(a);
      const valueB = column.sortValue!(b);
      if (valueA < valueB) return -1 * direction;
      if (valueA > valueB) return 1 * direction;
      return 0;
    });
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const paginated = sorted.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  function toggleSort(columnId: string) {
    setPage(0);
    setSort((current) => {
      if (current?.columnId !== columnId) return { columnId, direction: "asc" };
      if (current.direction === "asc") return { columnId, direction: "desc" };
      return null;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {searchFn && (
          <InputGroup className="max-w-xs">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder={searchPlaceholder}
              value={search}
              onChange={(event) => {
                setPage(0);
                setSearch(event.target.value);
              }}
            />
          </InputGroup>
        )}
        {filters?.map((filter) => (
          <Select
            key={filter.id}
            value={activeFilters[filter.id] ?? "all"}
            onValueChange={(value) => {
              setPage(0);
              setActiveFilters((current) => ({ ...current, [filter.id]: value as string }));
            }}
          >
            <SelectTrigger size="sm">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{filter.label}: Todos</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id} className={column.className}>
                  {column.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.id)}
                      className="inline-flex items-center gap-1 font-medium"
                    >
                      {column.header}
                      <ArrowUpDown className="text-muted-foreground size-3.5" />
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.className}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Página {currentPage + 1} de {pageCount} · {sorted.length} resultados
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
