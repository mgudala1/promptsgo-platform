import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { AlertTriangle, Crown, Heart, BookmarkPlus, GitFork, Zap } from 'lucide-react'
import { ProfessionalButton } from './ui/ProfessionalButton'

interface FeatureLimitModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
  feature: 'saves' | 'hearts' | 'forks' | 'templates' | 'exports'
  currentLimit: number
  currentUsage: number
}

const featureConfig = {
  saves: {
    icon: BookmarkPlus,
    title: 'Save Limit Reached',
    description: 'You\'ve reached your free plan limit of saved prompts.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  hearts: {
    icon: Heart,
    title: 'Heart Limit Reached',
    description: 'You\'ve reached your free plan limit of hearts given.',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  forks: {
    icon: GitFork,
    title: 'Fork Limit Reached',
    description: 'You\'ve reached your free plan limit of forked prompts.',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  templates: {
    icon: Zap,
    title: 'Template Limit Reached',
    description: 'You\'ve reached your free plan limit of template variables.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  exports: {
    icon: BookmarkPlus,
    title: 'Export Limit Reached',
    description: 'You\'ve reached your free plan limit of exports.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
}

export const FeatureLimitModal: React.FC<FeatureLimitModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  feature,
  currentLimit,
  currentUsage
}) => {
  const config = featureConfig[feature]
  const Icon = config.icon
  const usagePercentage = (currentUsage / currentLimit) * 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={config.color} size={24} />
          </div>
          <DialogTitle className="text-center text-xl">
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        {/* Usage Display */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Current Usage</span>
                <span className="font-medium">
                  {currentUsage} / {currentLimit}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Free Plan</span>
                <span>{usagePercentage.toFixed(0)}% used</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pro Benefits */}
        <div className="space-y-3">
          <h4 className="font-medium text-center">Upgrade to Pro for:</h4>

          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Unlimited {feature}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Advanced analytics & insights</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Priority support</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Pro badge & recognition</span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className={`p-3 rounded-lg ${config.bgColor} border border-opacity-20`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className={`${config.color} mt-0.5`} size={16} />
            <div className="text-sm">
              <p className="font-medium">Action Required</p>
              <p className="text-muted-foreground">
                Upgrade now to continue using this feature without limits.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <ProfessionalButton gradient onClick={onUpgrade}>
            <Crown size={16} className="mr-2" />
            Upgrade to Pro
          </ProfessionalButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}