"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
}

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -10 },
}

/**
 * Reusable Data Table Component
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data items to display
 * @param {Array} props.columns - Column configuration array
 * @param {boolean} props.isLoading - Loading state
 * @param {React.ReactNode} props.emptyState - Custom empty state component
 * @param {string} props.searchPlaceholder - Placeholder for search input
 * @param {boolean} props.searchable - Enable search functionality
 * @param {string} props.searchKey - Key to search on (or array of keys)
 * @param {boolean} props.sortable - Enable sorting functionality
 * @param {boolean} props.paginated - Enable pagination
 * @param {number} props.pageSize - Items per page (default: 10)
 * @param {boolean} props.showViewToggle - Show grid/table view toggle
 * @param {Function} props.renderCard - Custom card renderer for mobile/grid view
 * @param {string} props.className - Additional className for container
 * @param {boolean} props.isRTL - Right-to-left support
 * @param {Function} props.onRowClick - Row click handler
 * @param {string} props.rowKeyField - Field to use as unique key (default: 'id')
 * @param {Function} props.t - Translation function
 */
export function DataTable({
  data = [],
  columns = [],
  isLoading = false,
  emptyState,
  searchPlaceholder,
  searchable = true,
  searchKeys = ["id"],
  sortable = true,
  paginated = true,
  pageSize = 10,
  showViewToggle = false,
  renderCard,
  className,
  isRTL = false,
  onRowClick,
  rowKeyField = "id",
  t,
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState("table") // 'table' or 'grid'

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data

    const query = searchQuery.toLowerCase()
    return data.filter((item) => {
      const keys = Array.isArray(searchKeys) ? searchKeys : [searchKeys]
      return keys.some((key) => {
        const value = getNestedValue(item, key)
        return String(value || "").toLowerCase().includes(query)
      })
    })
  }, [data, searchQuery, searchKeys])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredData

    return [...filteredData].sort((a, b) => {
      const column = columns.find((col) => col.key === sortConfig.key)
      const aValue = column?.sortValue
        ? column.sortValue(a)
        : getNestedValue(a, sortConfig.key)
      const bValue = column?.sortValue
        ? column.sortValue(b)
        : getNestedValue(b, sortConfig.key)

      if (aValue === bValue) return 0
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      const comparison = aValue < bValue ? -1 : 1
      return sortConfig.direction === "asc" ? comparison : -comparison
    })
  }, [filteredData, sortConfig, columns])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize, paginated])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  // Handle sort
  const handleSort = (key) => {
    if (!sortable) return
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: "asc" }
      if (prev.direction === "asc") return { key, direction: "desc" }
      return { key: null, direction: null }
    })
  }

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="h-3.5 w-3.5" />
    if (sortConfig.direction === "asc") return <ArrowUp className="h-3.5 w-3.5" />
    return <ArrowDown className="h-3.5 w-3.5" />
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Search skeleton */}
        {searchable && <Skeleton className="h-10 w-full max-w-sm" />}
        
        {/* Table skeleton */}
        <Card className="overflow-hidden border-border/50">
          <div className="p-4 space-y-5">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      </div>
    )
  }

  // Empty state
  if (data.length === 0 || filteredData.length === 0) {
    if (emptyState) return emptyState
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <TableIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center">
            {searchQuery 
              ? (t?.("noResults") || "No results found") 
              : (t?.("noData") || "No data available")}
          </p>
        </CardContent>
      </Card>
    )
  }

  const shouldShowMobileCards = renderCard !== undefined

  return (
    <div className={cn("space-y-4", className)} dir={isRTL ? "rtl" : "ltr"}>
      {/* Toolbar */}
      <div className={cn(
        "flex flex-col sm:flex-row gap-3 items-start sm:items-center",
        searchable ? "justify-between" : "justify-between"
      )}>
        {/* Search */}
        {searchable && (
          <div className="relative flex-1 max-w-sm">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
              isRTL ? "right-3" : "left-3"
            )} />
            <Input
              placeholder={searchPlaceholder || t?.("searchPlaceholder") || "Search..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className={cn(
                "bg-background border-border/50 focus:border-primary/50",
                isRTL ? "pr-10 text-right" : "pl-10"
              )}
            />
          </div>
        )}

        {/* Results count - left side */}
        <span className="text-sm text-muted-foreground order-1 sm:order-none">
          {sortedData.length} {sortedData.length === 1 
            ? (t?.("result") || "result") 
            : (t?.("results") || "results")}
        </span>

        {/* View toggle - right side */}
        <div className={cn(
          "flex items-center gap-3 order-2 sm:order-none",
          !searchable && "ml-auto"
        )}>
          {showViewToggle && shouldShowMobileCards && (
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-none px-3"
                onClick={() => setViewMode("table")}
              >
                <TableIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-none px-3"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Table View - show when viewMode is "table" */}
      {viewMode === "table" && (
        <div className="overflow-hidden rounded-xl border border-border/50">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/50">
                  {(isRTL ? [...columns].reverse() : columns).map((column) => (
                    <TableHead
                      key={column.key}
                      className={cn(
                        "font-semibold text-foreground",
                        column.headerClassName,
                        column.sortable !== false && sortable && "cursor-pointer select-none hover:bg-muted",
                        // Alignment based on column config
                        column.align === "center" ? "text-center" : 
                        column.align === "right" ? "text-right" : 
                        isRTL ? "text-right" : "text-start"
                      )}
                      style={{ width: column.width }}
                      onClick={() => column.sortable !== false && sortable && handleSort(column.key)}
                    >
                      <div className={cn(
                        "flex items-center gap-2",
                        column.align === "center" ? "justify-center" : 
                        column.align === "right" ? "justify-end" : 
                        isRTL ? "justify-end flex-row-reverse" : "justify-start"
                      )}>
                        {column.header}
                        {column.sortable !== false && sortable && getSortIcon(column.key)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  <motion.tbody
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="contents"
                  >
                    {paginatedData.map((item, index) => (
                      <motion.tr
                        key={item[rowKeyField] || index}
                        variants={rowVariants}
                        layout
                        className={cn(
                          "group transition-colors border-b border-border/50 last:border-b-0",
                          index % 2 === 0 ? "bg-background" : "bg-primary/10",
                          "hover:bg-muted/15",
                          onRowClick && "cursor-pointer"
                        )}
                        onClick={() => onRowClick?.(item)}
                      >
                        {(isRTL ? [...columns].reverse() : columns).map((column) => (
                          <TableCell
                            key={column.key}
                            className={cn(
                              "py-4",
                              column.cellClassName,
                              // Alignment based on column config
                              column.align === "center" ? "text-center" : 
                              column.align === "right" ? "text-right" : 
                              isRTL ? "text-right" : "text-start"
                            )}
                          >
                            {column.align === "center" ? (
                              <div className="flex items-center justify-center">
                                {column.render
                                  ? column.render(item, index)
                                  : getNestedValue(item, column.key)}
                              </div>
                            ) : (
                              column.render
                                ? column.render(item, index)
                                : getNestedValue(item, column.key)
                            )}
                          </TableCell>
                        ))}
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Cards / Grid View - show when viewMode is "grid" and renderCard is provided */}
      {viewMode === "grid" && shouldShowMobileCards && (
        <AnimatePresence mode="popLayout">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {paginatedData.map((item, index) => (
              <motion.div
                key={item[rowKeyField] || index}
                variants={rowVariants}
                layout
                className={cn(onRowClick && "cursor-pointer")}
              >
                {renderCard(item, index)}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className={cn(
          "flex items-center justify-between pt-2",
          isRTL && "flex-row-reverse"
        )}>
          <p className="text-sm text-muted-foreground">
            {t?.("showing") || "Showing"} {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, sortedData.length)} {t?.("of") || "of"} {sortedData.length}
          </p>
          <div className={cn(
            "flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-border/50"
            >
              {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-border/50"
            >
              {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to get nested values
function getNestedValue(obj, path) {
  if (!path) return undefined
  const keys = path.split(".")
  return keys.reduce((acc, key) => acc?.[key], obj)
}

export default DataTable
