import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Calendar } from './ui/calendar'
import { Checkbox } from './ui/checkbox'
import { Slider } from './ui/slider'
import { CalendarIcon, Filter, RotateCcw, Search } from 'lucide-react'
import { format } from 'date-fns'
import { getSearchFilterOptions, type SearchFilters } from '../lib/api'

interface AdvancedSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void
  onSearch: () => void
  isLoading?: boolean
  className?: string
}

export const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  onFiltersChange,
  onSearch,
  isLoading = false,
  className = ''
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    models: [],
    minSuccessRate: undefined,
    dateRange: { from: undefined, to: undefined },
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  const [filterOptions, setFilterOptions] = useState<{
    categories: string[]
    models: string[]
  }>({ categories: [], models: [] })

  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    loadFilterOptions()
  }, [])

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const loadFilterOptions = async () => {
    const options = await getSearchFilterOptions()
    setFilterOptions(options)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      models: [],
      minSuccessRate: undefined,
      dateRange: { from: undefined, to: undefined },
      sortBy: 'created_at',
      sortOrder: 'desc'
    })
  }

  const handleModelToggle = (model: string, checked: boolean) => {
    const currentModels = filters.models || []
    if (checked) {
      handleFilterChange('models', [...currentModels, model])
    } else {
      handleFilterChange('models', currentModels.filter(m => m !== model))
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.query) count++
    if (filters.category && filters.category !== 'all') count++
    if (filters.models && filters.models.length > 0) count++
    if (filters.minSuccessRate !== undefined) count++
    if (filters.dateRange?.from || filters.dateRange?.to) count++
    return count
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search size={20} />
              Search & Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Find the perfect prompts for your needs
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter size={16} />
            {showAdvanced ? 'Simple' : 'Advanced'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search prompts, descriptions, content..."
              value={filters.query || ''}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            />
          </div>
          <Button onClick={onSearch} disabled={isLoading}>
            Search
          </Button>
        </div>

        {/* Category Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value: string) => handleFilterChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filterOptions.categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sortBy">Sort By</Label>
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(value: string) => {
                const [sortBy, sortOrder] = value.split('-')
                handleFilterChange('sortBy', sortBy)
                handleFilterChange('sortOrder', sortOrder)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Newest First</SelectItem>
                <SelectItem value="created_at-asc">Oldest First</SelectItem>
                <SelectItem value="success_rate-desc">Highest Success Rate</SelectItem>
                <SelectItem value="hearts_count-desc">Most Popular</SelectItem>
                <SelectItem value="saves_count-desc">Most Saved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            {/* Model Compatibility */}
            <div>
              <Label>AI Models</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {filterOptions.models.slice(0, 9).map(model => (
                  <div key={model} className="flex items-center space-x-2">
                    <Checkbox
                      id={`model-${model}`}
                      checked={(filters.models || []).includes(model)}
                      onCheckedChange={(checked: boolean) => handleModelToggle(model, checked)}
                    />
                    <Label htmlFor={`model-${model}`} className="text-sm">
                      {model}
                    </Label>
                  </div>
                ))}
              </div>
              {(filters.models || []).length > 0 && (
                <div className="flex gap-1 flex-wrap mt-2">
                  {filters.models?.map(model => (
                    <Badge key={model} variant="secondary" className="text-xs">
                      {model}
                      <button
                        onClick={() => handleModelToggle(model, false)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Success Rate Filter */}
            <div>
              <Label>Minimum Success Rate</Label>
              <div className="flex items-center space-x-4 mt-2">
                <Slider
                  value={[filters.minSuccessRate || 0]}
                  onValueChange={(value: number[]) =>
                    handleFilterChange('minSuccessRate', value[0] > 0 ? value[0] : undefined)
                  }
                  max={100}
                  step={10}
                  className="flex-1"
                />
                <span className="text-sm font-medium min-w-[60px]">
                  {filters.minSuccessRate || 0}%+
                </span>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? (
                        format(new Date(filters.dateRange.from), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange?.from ? new Date(filters.dateRange.from) : undefined}
                      onSelect={(date: Date | undefined) =>
                        handleFilterChange('dateRange', {
                          ...filters.dateRange,
                          from: date ? date.toISOString().split('T')[0] : undefined
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.to ? (
                        format(new Date(filters.dateRange.to), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange?.to ? new Date(filters.dateRange.to) : undefined}
                      onSelect={(date: Date | undefined) =>
                        handleFilterChange('dateRange', {
                          ...filters.dateRange,
                          to: date ? date.toISOString().split('T')[0] : undefined
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Reset Filters */}
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="flex items-center gap-2"
              >
                <RotateCcw size={14} />
                Reset All Filters
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}