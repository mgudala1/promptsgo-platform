import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Heart, Share, BookmarkPlus, GitFork } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { categories } from "../lib/data";
import { PromptImage } from "../lib/types";

interface PromptCardProps {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    username: string;
    subscriptionPlan?: 'free' | 'pro';
  };
  category: string;
  tags: string[];
  images?: PromptImage[];
  stats?: {
    hearts: number;
    saves: number;
    forks: number;
  };
  isSaved?: boolean;
  isHearted?: boolean;
  createdAt: string;
  parentAuthor?: {
    name: string;
    username: string;
    subscriptionPlan?: 'free' | 'pro';
  };
  onClick?: () => void;
  onHeart?: () => void;
  onSave?: () => void;
  onShare?: () => void;
}

// Get initials from name
function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Get relative time
function getRelativeTime(date: string): string {
  const now = new Date();
  const created = new Date(date);
  const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
}

export function PromptCard({
  id: _id,
  title,
  description,
  author,
  category,
  tags: _tags,
  images,
  stats,
  isSaved = false,
  isHearted = false,
  createdAt,
  parentAuthor,
  onClick,
  onHeart,
  onSave,
  onShare
}: PromptCardProps) {
  const categoryData = categories.find(cat =>
    cat.id === category?.toLowerCase() ||
    cat.label?.toLowerCase() === category?.toLowerCase() ||
    cat.name?.toLowerCase() === category?.toLowerCase()
  );
  const primaryImage = images?.find(img => img.isPrimary) || images?.[0];
  
  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col overflow-hidden"
      onClick={onClick}
    >
      {/* Primary Image */}
      {primaryImage && (
        <div className="aspect-video w-full overflow-hidden">
          <ImageWithFallback
            src={primaryImage.url}
            alt={primaryImage.altText}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      <CardContent className="p-4 flex-1 flex flex-col space-y-3">
        {/* Title */}
        <h3 className="line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Author - Text only username */}
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
            {getInitials(author.name)}
          </div>
          <span className="text-muted-foreground">
            {author.username}
          </span>
          {author.subscriptionPlan === 'pro' && (
            <Badge variant="secondary" className="text-xs py-0 px-1">PRO</Badge>
          )}
          <span className="text-xs text-muted-foreground">
            • {getRelativeTime(createdAt)}
          </span>
        </div>

        {/* Forked from indicator */}
        {parentAuthor && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1">
            <GitFork className="h-3 w-3" />
            <span>Forked from</span>
            <span className="font-medium">{parentAuthor.username}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-muted-foreground text-sm line-clamp-3 flex-1">
          {description}
        </p>

        {/* Category Badge */}
        <div className="flex items-center gap-2">
          {categoryData ? (
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                borderColor: categoryData.color + '40',
                color: categoryData.color,
                backgroundColor: categoryData.color + '10'
              }}
            >
              {categoryData.label}
            </Badge>
          ) : category ? (
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          ) : null}
        </div>

        {/* Stats and Actions */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <GitFork className="h-3 w-3" />
              {stats?.forks || 0}
            </div>
            <div className="flex items-center gap-1">
              <BookmarkPlus className="h-3 w-3" />
              {stats?.saves || 0}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1 px-2"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onHeart?.();
              }}
            >
              <Heart
                className={`h-3 w-3 ${isHearted ? 'fill-red-500 text-red-500' : ''}`}
              />
              {stats?.hearts || 0}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1 px-2"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onSave?.();
              }}
            >
              <BookmarkPlus
                className={`h-3 w-3 ${isSaved ? 'fill-primary text-primary' : ''}`}
              />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onShare?.();
              }}
            >
              <Share className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}