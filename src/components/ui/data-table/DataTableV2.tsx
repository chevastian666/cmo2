import React, { useState, useMemo } from 'react'
import {_ColumnDef, ColumnFiltersState, SortingState, VisibilityState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from '@tanstack/react-table'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table'
import { Button} from '@/components/ui/button'
import { Input} from '@/components/ui/input'
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu'
import {_Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select'
import { ChevronDown, Search, ChevronLeft, ChevronRight} from 'lucide-react'
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  showColumnVisibility?: boolean
  showPagination?: boolean
  pageSize?: number
}

export function DataTableV2<TData, TValue>({
  columns, data, searchKey, searchPlaceholder = 'Buscar...', showColumnVisibility = true, showPagination = true, pageSize = 10, }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(__)
  const [rowSelection, setRowSelection] = useState(__)
  const [globalFilter, setGlobalFilter] = useState('')
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'fuzzy',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  })
  return (<div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {/* Global Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={s_earchPlaceholder}
              value={globalFilter ?? ''}
              onChange={(_event) => setGlobalFilter(event.target.value)}
              className="pl-9 bg-gray-800 border-gray-700"
            />
          </div>

          {/* Column Filters */}
          {searchKey && (
            <Input
              placeholder={`Filtrar por ${s_earchKey}...`}
              value={(table.getColumn(s_earchKey)?.getFilterValue() as string) ?? ''}
              onChange={(_event) =>
                table.getColumn(s_earchKey)?.setFilterValue(event.target.value)
              }
              className="max-w-sm bg-gray-800 border-gray-700"
            />
          )}
        </div>

        {/* Column Visibility */}
        {showColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columnas <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((_column) => column.getCanHide())
                .map((_column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(_value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border border-gray-700">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((_headerGroup) => (<TableRow key={headerGroup.id} className="border-gray-700">
                {headerGroup.headers.map((_header) => {
                  return (
                    <TableHead key={header.id} className="text-gray-300">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((_row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-gray-700 hover:bg-gray-800/50"
                >
                  {row.getVisibleCells().map((_cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-400"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-gray-400">
            {table.getFilteredSelectedRowModel().rows.length} de{' '}
            {table.getFilteredRowModel().rows.length} fila(_s) seleccionada(_s).
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-300">Filas por página</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(_value) => {
                  table.setPageSize(Number(_value))
                }}
              >
                <SelectTrigger className="h-8 w-[70px] bg-gray-800 border-gray-700">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((_pageSize) => (
                    <SelectItem key={_pageSize} value={`${_pageSize}`}>
                      {_pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium text-gray-300">
              Página {table.getState().pagination.pageIndex + 1} de{' '}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}