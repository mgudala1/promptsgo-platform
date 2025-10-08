import { Crown, Shield } from "lucide-react";
import { Badge } from "./badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { UserRole } from "../../lib/types";
import { cn } from "./utils";

interface SubscriptionBadgeProps {
  role: UserRole;
  subscriptionStatus?: 'active' | 'cancelled' | 'past_due';
  className?: string;
}

export function SubscriptionBadge({ role, className }: SubscriptionBadgeProps) {
  if (role === 'general') {
    return null;
  }

  const isPro = role === 'pro';

  const icon = isPro ? Crown : Shield;
  const tooltipText = isPro ? "Active subscription" : "Administrator access";
  const IconComponent = icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={isPro ? "default" : "secondary"}
          className={cn(
            "text-xs py-0 px-1 flex items-center gap-1",
            isPro && "bg-gradient-to-r from-primary to-primary/80",
            className
          )}
        >
          <IconComponent className="h-3 w-3" />
          {isPro ? "Pro" : "Admin"}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
}