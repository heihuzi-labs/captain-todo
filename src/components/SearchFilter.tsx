import { useState } from 'react';
import { SearchFilters, Column } from '../types/kanban';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Search, Filter, X } from 'lucide-react';

interface SearchFilterProps {
  filters: SearchFilters;
  columns: Column[];
  onFiltersChange: (filters: SearchFilters) => void;
}

export function SearchFilter({ filters, columns, onFiltersChange }: SearchFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleKeywordChange = (keyword: string) => {
    onFiltersChange({ ...filters, keyword });
  };

  const handleColumnToggle = (columnId: string, checked: boolean) => {
    const newColumnIds = checked
      ? [...filters.columnIds, columnId]
      : filters.columnIds.filter(id => id !== columnId);
    
    onFiltersChange({ ...filters, columnIds: newColumnIds });
  };

  const clearFilters = () => {
    onFiltersChange({ keyword: '', columnIds: [] });
  };

  const hasActiveFilters = filters.keyword || filters.columnIds.length > 0;
  const selectedColumns = columns.filter(col => filters.columnIds.includes(col.id));

  return (
    <div className="flex items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索卡片..."
          value={filters.keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Column Filter */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            筛选
            {filters.columnIds.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {filters.columnIds.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">按列筛选</h4>
              <p className="text-sm text-muted-foreground">
                选择要显示的列
              </p>
            </div>
            
            <div className="space-y-2">
              {columns.map((column) => (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.id}
                    checked={filters.columnIds.includes(column.id)}
                    onCheckedChange={(checked) => 
                      handleColumnToggle(column.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={column.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {column.title}
                  </label>
                </div>
              ))}
            </div>

            {filters.columnIds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFiltersChange({ ...filters, columnIds: [] })}
                className="w-full"
              >
                清除列筛选
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          {/* Selected Columns */}
          {selectedColumns.map((column) => (
            <Badge key={column.id} variant="secondary" className="gap-1">
              {column.title}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 w-4 h-4"
                onClick={() => handleColumnToggle(column.id, false)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}

          {/* Clear All */}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
            清除
          </Button>
        </div>
      )}
    </div>
  );
}