import React, { useState } from 'react'
import { ProfessionalCard } from './ui/ProfessionalCard'
import { ProfessionalBadge } from './ui/ProfessionalBadge'
import { ProfessionalButton } from './ui/ProfessionalButton'
import { SuccessVoting } from './SuccessVoting'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Heart, Bookmark, Eye, ExternalLink, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from './ui/utils'
import { extractTemplateVariables } from '../lib/templateVariables'

interface PromptCardProps {
  id: string;
  title: string;
  description: string;
  content?: string;
  author: {
    name: string;
    username: string;
    avatar_url?: string;
    subscriptionPlan?: 'free' | 'pro';
  };
  category: string;
  tags: string[];
  images?: any[];
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
    avatar_url?: string;
    subscriptionPlan?: 'free' | 'pro';
  };
  onClick?: () => void;
  onHeart?: () => void;
  onSave?: () => void;
  onShare?: () => Promise<void>;
  className?: string;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  id,
  title,
  description,
  content,
  author,
  category,
  tags,
  images: _images,
  stats,
  isSaved = false,
  isHearted = false,
  createdAt,
  parentAuthor: _parentAuthor,
  onClick,
  onHeart,
  onSave,
  onShare,
  className
}) => {
  const [hearted, setHearted] = useState(isHearted)
  const [saved, setSaved] = useState(isSaved)
  const [isHovered, setIsHovered] = useState(false)

  const hasVariables = content ? extractTemplateVariables(content).length > 0 : false

  return (
    <ProfessionalCard
      floating
      className={cn(
        "group relative overflow-hidden animate-slide-in-up",
        "hover:shadow-professional hover:border-primary-200",
        "transition-all duration-300 ease-out",
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with Author */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          <Avatar className={cn(
            "h-10 w-10 transition-transform duration-200",
            isHovered && "scale-110"
          )}>
            <AvatarImage src={author.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 font-semibold">
              {author.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-body font-semibold text-text-primary group-hover:text-primary-600 transition-colors">
              {author.username}
              {author.subscriptionPlan === 'pro' && (
                <span className="ml-2 inline-flex items-center">
                  <ProfessionalBadge premium className="text-xs px-1.5 py-0.5">
                    Pro
                  </ProfessionalBadge>
                </span>
              )}
            </p>
            <p className="text-body-small text-text-muted">
              {(() => {
                try {
                  return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
                } catch {
                  return 'Recently';
                }
              })()}
            </p>
          </div>
        </div>

        {/* Success Rate Badge */}
        <div className={cn(
          "transition-all duration-300",
          isHovered ? "opacity-100 scale-105" : "opacity-70 scale-100"
        )}>
          <SuccessVoting
            promptId={id}
            variant="badge-only"
            className="animate-fade-in"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        {/* Category & Template Indicators */}
        <div className="flex items-center gap-2 mb-4">
          <ProfessionalBadge
            gradient
            className={cn(
              "text-xs font-semibold transition-all duration-200",
              isHovered && "scale-105"
            )}
          >
            {category}
          </ProfessionalBadge>

          {hasVariables && (
            <ProfessionalBadge
              premium
              className={cn(
                "text-xs transition-all duration-200",
                isHovered && "scale-105"
              )}
            >
              <Zap size={10} className="mr-1" />
              Template
            </ProfessionalBadge>
          )}
        </div>

        {/* Title */}
        <h3 className={cn(
          "text-heading-2 text-text-primary mb-3 line-clamp-2",
          "group-hover:text-primary-600 transition-all duration-200",
          isHovered && "translate-x-1"
        )}>
          {title}
        </h3>

        {/* Description */}
        <p className="text-body text-text-secondary mb-4 line-clamp-3 leading-relaxed">
          {description}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-body-small text-text-muted font-medium">Tags:</span>
            {tags.slice(0, 3).map((tag: string, index: number) => (
              <ProfessionalBadge
                key={tag}
                variant="outline"
                className={cn(
                  "text-xs px-2 py-1 transition-all duration-200",
                  isHovered && "hover:bg-primary-50 hover:border-primary-200"
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: isHovered ? 'slideInUp 0.3s ease-out forwards' : 'none'
                }}
              >
                {tag}
              </ProfessionalBadge>
            ))}
            {tags.length > 3 && (
              <span className="text-body-small text-text-muted font-medium">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={cn(
        "px-6 py-4 border-t border-border transition-all duration-300",
        isHovered ? "bg-gradient-to-r from-primary-50/50 to-purple-50/50" : "bg-gray-50/80"
      )}>
        <div className="flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center gap-6 text-body-small text-text-muted">
            <div className="flex items-center gap-1.5 group/stat">
              <Eye size={14} className="group-hover/stat:text-primary-500 transition-colors" />
              <span className="font-medium">{stats?.forks || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 group/stat">
              <Heart size={14} className={cn(
                "transition-all duration-200",
                hearted ? "text-red-500 fill-current scale-110" : "group-hover/stat:text-red-400"
              )} />
              <span className="font-medium">{stats?.hearts || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 group/stat">
              <Bookmark size={14} className={cn(
                "transition-all duration-200",
                saved ? "text-blue-500 fill-current scale-110" : "group-hover/stat:text-blue-400"
              )} />
              <span className="font-medium">{stats?.saves || 0}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <ProfessionalButton
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setHearted(!hearted)
                onHeart?.()
              }}
              className={cn(
                "transition-all duration-200 hover:scale-110",
                hearted && "text-red-500 bg-red-50 hover:bg-red-100"
              )}
            >
              <Heart size={16} className={cn(
                "transition-all duration-200",
                hearted ? "fill-current scale-110" : ""
              )} />
            </ProfessionalButton>

            <ProfessionalButton
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setSaved(!saved)
                onSave?.()
              }}
              className={cn(
                "transition-all duration-200 hover:scale-110",
                saved && "text-blue-500 bg-blue-50 hover:bg-blue-100"
              )}
            >
              <Bookmark size={16} className={cn(
                "transition-all duration-200",
                saved ? "fill-current scale-110" : ""
              )} />
            </ProfessionalButton>

            <ProfessionalButton
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onShare?.()
              }}
              className="transition-all duration-200 hover:scale-110 hover:text-primary-600 hover:bg-primary-50"
            >
              <ExternalLink size={16} />
            </ProfessionalButton>
          </div>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br from-primary-50/0 via-purple-50/0 to-blue-50/0 opacity-0 transition-all duration-500 rounded-lg",
        isHovered && "from-primary-50/20 via-purple-50/10 to-blue-50/20 opacity-100"
      )} />

      {/* Subtle Border Glow */}
      <div className={cn(
        "absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300",
        "ring-1 ring-primary-200/0",
        isHovered && "ring-primary-200/50 opacity-100"
      )} />
    </ProfessionalCard>
  )
}

// Helper function for category colors
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    writing: 'bg-blue-100 text-blue-700',
    coding: 'bg-green-100 text-green-700',
    marketing: 'bg-purple-100 text-purple-700',
    business: 'bg-orange-100 text-orange-700',
    creative: 'bg-pink-100 text-pink-700',
    technical: 'bg-gray-100 text-gray-700',
    education: 'bg-indigo-100 text-indigo-700',
  }
  return colors[category?.toLowerCase()] || 'bg-gray-100 text-gray-700'
}