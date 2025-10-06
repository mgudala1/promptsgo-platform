import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Crown, Star, Zap, Lock, CheckCircle, X } from 'lucide-react'
import { conversionTriggers, checkFeatureLimit, trackUserAction, FREE_PLAN_LIMITS } from '../lib/conversionTriggers'
import { useApp } from '../contexts/AppContext'
import { toast } from 'sonner'

interface ConversionTriggersProps {
  trigger?: 'save_limit' | 'heart_limit' | 'fork_limit' | 'template_limit' | 'private_limit' | 'export_limit'
  onUpgrade?: () => void
  onDismiss?: () => void
}

export const ConversionTriggers: React.FC<ConversionTriggersProps> = ({
  trigger,
  onUpgrade,
  onDismiss
}) => {
  const { state } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [currentTrigger, setCurrentTrigger] = useState<string | null>(null)
  const [usage, setUsage] = useState<Record<string, number>>({})

  useEffect(() => {
    if (trigger) {
      checkAndShowUpgrade(trigger)
    }
  }, [trigger])

  const checkAndShowUpgrade = async (action: string) => {
    if (!state.user) return

    const shouldShow = await conversionTriggers.shouldShowUpgrade(state.user.id, action as keyof typeof FREE_PLAN_LIMITS)
    if (shouldShow) {
      setCurrentTrigger(action)
      setShowModal(true)
      await loadUsage()
      trackUserAction(state.user.id, `upgrade_prompt_shown_${action}`)
    }
  }

  const loadUsage = async () => {
    if (!state.user) return

    const usageData: Record<string, number> = {}
    for (const [action] of Object.entries(FREE_PLAN_LIMITS)) {
      try {
        const { blocked } = await checkFeatureLimit(state.user!.id, action as keyof typeof FREE_PLAN_LIMITS)
        // This is a simplified way - in reality you'd want to get the actual count
        usageData[action] = blocked ? FREE_PLAN_LIMITS[action as keyof typeof FREE_PLAN_LIMITS] : 0
      } catch (error) {
        console.error(`Error loading usage for ${action}:`, error)
      }
    }
    setUsage(usageData)
  }

  const handleUpgrade = () => {
    if (state.user) {
      trackUserAction(state.user.id, 'upgrade_clicked', { trigger: currentTrigger })
    }
    onUpgrade?.()
    setShowModal(false)
  }

  const handleDismiss = () => {
    if (state.user) {
      trackUserAction(state.user.id, 'upgrade_dismissed', { trigger: currentTrigger })
    }
    onDismiss?.()
    setShowModal(false)
  }

  const getTriggerContent = (trigger: string) => {
    switch (trigger) {
      case 'save_limit':
        return {
          icon: <Star className="h-8 w-8 text-yellow-500" />,
          title: "You've reached your save limit!",
          description: "Upgrade to Pro to save unlimited prompts to your personal library.",
          features: [
            "Unlimited saves",
            "Advanced collections",
            "Priority support",
            "Export capabilities"
          ]
        }
      case 'heart_limit':
        return {
          icon: <Star className="h-8 w-8 text-red-500" />,
          title: "Love more prompts!",
          description: "You've used all your hearts. Upgrade to show unlimited love for great prompts.",
          features: [
            "Unlimited hearts",
            "Premium prompt access",
            "Advanced filtering",
            "Custom templates"
          ]
        }
      case 'fork_limit':
        return {
          icon: <Zap className="h-8 w-8 text-blue-500" />,
          title: "Ready to create more?",
          description: "You've forked the maximum prompts. Upgrade to remix unlimited content.",
          features: [
            "Unlimited forking",
            "Version history",
            "Advanced editing",
            "Team collaboration"
          ]
        }
      case 'template_limit':
        return {
          icon: <Zap className="h-8 w-8 text-purple-500" />,
          title: "Template master needed?",
          description: "You've created the maximum templates. Upgrade for unlimited customization.",
          features: [
            "Unlimited templates",
            "Advanced variables",
            "Bulk operations",
            "API access"
          ]
        }
      case 'private_limit':
        return {
          icon: <Lock className="h-8 w-8 text-gray-500" />,
          title: "Keep it private?",
          description: "Want to create private prompts? Upgrade for full privacy control.",
          features: [
            "Private prompts",
            "Team sharing",
            "Advanced permissions",
            "Audit logs"
          ]
        }
      default:
        return {
          icon: <Crown className="h-8 w-8 text-yellow-500" />,
          title: "Unlock Premium Features",
          description: "Get unlimited access to all professional features.",
          features: [
            "Everything unlimited",
            "Priority support",
            "Advanced analytics",
            "White-label options"
          ]
        }
    }
  }

  const content = currentTrigger ? getTriggerContent(currentTrigger) : getTriggerContent('default')

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {content.icon}
            <div>
              <DialogTitle className="text-xl">{content.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {content.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Usage */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Your Current Plan</h4>
            <div className="space-y-2">
              {Object.entries(FREE_PLAN_LIMITS).map(([action, limit]) => (
                <div key={action} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{action.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {usage[action] || 0} / {typeof limit === 'string' ? '∞' : limit}
                    </span>
                    {typeof limit === 'number' && (usage[action] || 0) >= limit && (
                      <Badge variant="destructive" className="text-xs">Limit reached</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Features */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Crown className="h-5 w-5 text-yellow-500" />
                Pro Plan Features
              </CardTitle>
              <CardDescription>
                Everything you need to be a prompt engineering pro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {content.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for easy usage in components
export const useConversionTrigger = () => {
  const { state } = useApp()
  const [modalState, setModalState] = useState<{
    show: boolean
    trigger: string | null
  }>({ show: false, trigger: null })

  const checkLimit = async (action: keyof typeof FREE_PLAN_LIMITS) => {
    if (!state.user) return { blocked: false, showUpgrade: false }

    const { blocked, showUpgrade } = await checkFeatureLimit(state.user.id, action)

    if (showUpgrade) {
      setModalState({ show: true, trigger: action })
    }

    return { blocked, showUpgrade }
  }

  const dismissModal = () => {
    setModalState({ show: false, trigger: null })
  }

  return {
    checkLimit,
    dismissModal,
    modal: modalState.show ? (
      <ConversionTriggers
        trigger={modalState.trigger as any}
        onDismiss={dismissModal}
      />
    ) : null
  }
}