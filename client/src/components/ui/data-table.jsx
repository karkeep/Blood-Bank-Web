import React, { useState } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowUpDown, Loader2 } from 'lucide-react';

export const DataTable = ({
  columns,
  data = [],
  loading = false,
  pageSize = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Pagination logic
  const pageCount = Math.ceil(data.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);

  // Sorting logic
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;
    
    return [...data].sort((a, b) => {
      const aValue = sortColumn.accessorFn ? sortColumn.accessorFn(a) : a[sortColumn.accessorKey];
      const bValue = sortColumn.accessorFn ? sortColumn.accessorFn(b) : b[sortColumn.accessorKey];
      
      if (aValue === bValue) return 0;
      
      const direction = sortDirection === 'asc' ? 1 : -1;
      return aValue < bValue ? -1 * direction : 1 * direction;
    });
  }, [data, sortColumn, sortDirection]);

  // Get the visible data for the current page
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Handle sorting
  const handleSort = (column) => {
    if (!column.enableSorting) return;
    
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, idx) => (
                <TableHead key={idx}>
                  <div
                    className={column.enableSorting ? 'cursor-pointer select-none flex items-center gap-1' : ''}
                    onClick={() => handleSort(column)}
                  >
                    {column.header}
                    {column.enableSorting && (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length ? (
              paginatedData.map((row, rowIdx) => (
                <TableRow key={rowIdx}>
                  {columns.map((column, cellIdx) => (
                    <TableCell key={cellIdx}>
                      {column.cell 
                        ? column.cell({ row })
                        : column.accessorFn 
                          ? column.accessorFn(row) 
                          : row[column.accessorKey]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing{' '}
          <span className="font-medium">
            {startIndex + 1}
          </span>{' '}
          to{' '}
          <span className="font-medium">
            {endIndex}
          </span>{' '}
          of <span className="font-medium">{data.length}</span> results
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(pageCount - 1, prev + 1))}
            disabled={currentPage >= pageCount - 1}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
