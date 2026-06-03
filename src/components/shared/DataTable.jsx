import Button from "@/components/ui/Button";
import { SelectDropdown } from "@/components/ui/Dropdown";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import { InlineSpinner } from "@/components/ui/Spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

/**
 * DataTable — feature-rich table with search, sort, pagination.
 *
 * @example
 * <DataTable
 *   columns={[
 *     { key: 'orderNumber', label: 'Order #', sortable: true },
 *     { key: 'customerName', label: 'Customer' },
 *     { key: 'totalPrice', label: 'Total', render: (v) => formatPeso(v) },
 *     { key: 'actions', label: '', render: (_, row) => <ActionsMenu row={row} /> },
 *   ]}
 *   data={orders}
 *   searchable
 *   searchPlaceholder="Search orders..."
 *   loading={isLoading}
 *   emptyTitle="No orders found"
 * />
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  searchable = false,
  searchPlaceholder = "Search...",
  externalSearch, // controlled search value
  onSearch, // controlled search handler
  pageSizeOptions = [10, 25, 50],
  defaultPageSize = 10,
  emptyTitle = "No results found",
  emptyDescription,
  emptyIcon,
  emptyAction,
  onRowClick,
  rowKey = "id",
  className,
  headerExtra, // extra JSX rendered next to search bar
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Controlled vs internal search
  const searchValue = externalSearch ?? search;
  const handleSearch = (v) => {
    onSearch ? onSearch(v) : setSearch(v);
    setPage(1);
  };

  // ── Filtering ────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!searchValue || externalSearch !== undefined) return data;
    const q = searchValue.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        if (!col.searchable && !col.key) return false;
        const val = row[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      }),
    );
  }, [data, searchValue, columns, externalSearch]);

  // ── Sorting ──────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp =
        typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortAsc ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortAsc]);

  // ── Pagination ───────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
    setPage(1);
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* ── Toolbar ──────────────────────────────────── */}
      {(searchable || headerExtra) && (
        <div className="flex items-center gap-3 flex-wrap">
          {searchable && (
            <div className="flex-1 min-w-50 max-w-sm">
              <Input
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                iconLeft={<Search className="size-4" />}
                size="sm"
              />
            </div>
          )}
          {headerExtra && (
            <div className="flex items-center gap-2 ml-auto">{headerExtra}</div>
          )}
        </div>
      )}

      {/* ── Table ────────────────────────────────────── */}
      {loading ? (
        <div className="rounded-xl border border-brand-700 bg-brand-900">
          <InlineSpinner message="Loading data..." />
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-brand-700 bg-brand-900">
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
            size="sm"
          />
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableHeader
                  key={col.key ?? col.label}
                  sortable={col.sortable}
                  sorted={sortKey === col.key}
                  asc={sortAsc}
                  onSort={() => col.sortable && handleSort(col.key)}
                  className={col.headerClassName}
                >
                  {col.label}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.map((row, ri) => (
              <TableRow
                key={row[rowKey] ?? ri}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key ?? col.label}
                    muted={col.muted}
                    className={col.cellClassName}
                  >
                    {col.render
                      ? col.render(row[col.key], row, ri)
                      : (row[col.key] ?? "—")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* ── Pagination ───────────────────────────────── */}
      {!loading && sorted.length > 0 && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Result count + page size */}
          <div className="flex items-center gap-3">
            <p className="text-xs text-brand-400 font-sans whitespace-nowrap">
              {sorted.length} result{sorted.length !== 1 ? "s" : ""}
            </p>
            <SelectDropdown
              value={String(pageSize)}
              onChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
              options={pageSizeOptions.map((n) => ({
                value: String(n),
                label: `${n} / page`,
              }))}
              size="sm"
              className="w-28"
            />
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              iconLeft={<ChevronLeft className="size-4" />}
            >
              <span className="hidden sm:inline">Prev</span>
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Show pages around current
                let p;
                if (totalPages <= 5) p = i + 1;
                else if (page <= 3) p = i + 1;
                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                else p = page - 2 + i;

                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "size-8 rounded-lg text-xs font-medium font-sans",
                      "transition-colors duration-100",
                      page === p
                        ? "bg-accent-500/20 text-accent-400 border border-accent-500/30"
                        : "text-brand-400 hover:bg-brand-800 hover:text-brand-200",
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              iconRight={<ChevronRight className="size-4" />}
            >
              <span className="hidden sm:inline">Next</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
