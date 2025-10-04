import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { X } from "lucide-react";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterSidebar({ isOpen, onClose }: FilterSidebarProps) {
  // Use static data to avoid any computation overhead
  const categories = [
    { id: "electronics", label: "Electronics" },
    { id: "clothing", label: "Clothing" },
    { id: "books", label: "Books" },
    { id: "home", label: "Home & Garden" },
    { id: "sports", label: "Sports" },
    { id: "beauty", label: "Beauty" },
  ];

  const brands = [
    { id: "apple", label: "Apple" },
    { id: "samsung", label: "Samsung" },
    { id: "nike", label: "Nike" },
    { id: "adidas", label: "Adidas" },
    { id: "sony", label: "Sony" },
  ];

  // Remove fake active filters to avoid rendering overhead
  const activeFilters: string[] = [];

  return (
    <div className={`${isOpen ? "block" : "hidden"} lg:block`}>
      <Card className="sticky top-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg">Filters</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Filters</span>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {activeFilters.map((filter) => (
                  <Badge key={filter} variant="secondary" className="text-xs">
                    {filter}
                    <X className="h-3 w-3 ml-1 cursor-pointer" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Categories */}
          <div className="space-y-3">
            <h4>Category</h4>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox id={category.id} />
                  <label
                    htmlFor={category.id}
                    className="text-sm flex-1 cursor-pointer"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price Range */}
          <div className="space-y-3">
            <h4>Price Range</h4>
            <div className="space-y-2">
              <Slider
                defaultValue={[50, 200]}
                max={500}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span>$500+</span>
              </div>
              <div className="text-sm text-center">$50 - $200</div>
            </div>
          </div>

          <Separator />

          {/* Rating */}
          <div className="space-y-3">
            <h4>Rating</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox id={`rating-${rating}`} />
                  <label
                    htmlFor={`rating-${rating}`}
                    className="text-sm flex-1 cursor-pointer"
                  >
                    {rating} stars & up
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Brands */}
          <div className="space-y-3">
            <h4>Brand</h4>
            <div className="space-y-2">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox id={brand.id} />
                  <label
                    htmlFor={brand.id}
                    className="text-sm flex-1 cursor-pointer"
                  >
                    {brand.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}