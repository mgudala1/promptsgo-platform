import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Star, Heart } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ResultCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: string;
  imageUrl: string;
  isFavorite?: boolean;
}

export function ResultCard({
  title,
  description,
  price,
  originalPrice,
  rating,
  reviewCount,
  category,
  imageUrl,
  isFavorite = false,
}: ResultCardProps) {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="relative">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
            -{discount}%
          </Badge>
        )}
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-2 right-2 h-8 w-8 p-0"
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
          
          <h3 className="line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <p className="text-muted-foreground text-sm line-clamp-2">
            {description}
          </p>
          
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {rating} ({reviewCount})
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-lg">${price}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}