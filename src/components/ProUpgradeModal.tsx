import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Check, Crown, Zap, Users, BarChart3, Shield, Star, X } from 'lucide-react'
import { ProfessionalButton } from './ui/ProfessionalButton'

interface ProUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  trigger?: 'feature_limit' | 'advanced_feature' | 'success_rate' | 'bulk_actions'
}

const proFeatures = [
  {
    icon: Zap,
    title: 'Unlimited Saves',
    description: 'Save as many prompts as you want to your personal library'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Detailed insights into your prompt performance and usage'
  },
  {
    icon: Users,
    title: 'Priority Support',
    description: 'Get help from our prompt engineering experts'
  },
  {
    icon: Shield,
    title: 'Private Prompts',
    description: 'Keep your proprietary prompts secure and private'
  },
  {
    icon: Star,
    title: 'Pro Badge',
    description: 'Show your professional status with a verified badge'
  },
  {
    icon: Check,
    title: 'Early Access',
    description: 'Be the first to try new features and templates'
  }
]

const pricingPlans = [
  {
    name: 'Monthly',
    price: '$12.99',
    period: 'per month',
    popular: false,
    features: ['All Pro features', 'Cancel anytime', 'Email support']
  },
  {
    name: 'Yearly',
    price: '$99',
    period: 'per year',
    popular: true,
    savings: 'Save $57',
    features: ['All Pro features', 'Priority support', 'Advanced analytics', 'Private prompts']
  }
]

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  trigger = 'advanced_feature'
}) => {
  const [selectedPlan, setSelectedPlan] = useState('Yearly')

  const getTriggerMessage = () => {
    switch (trigger) {
      case 'feature_limit':
        return {
          title: 'Unlock Unlimited Potential',
          description: 'You\'ve reached the free plan limit. Upgrade to Pro for unlimited access to all features.'
        }
      case 'advanced_feature':
        return {
          title: 'Advanced Feature Unlocked',
          description: 'This premium feature requires a Pro subscription. Join thousands of professional prompt engineers.'
        }
      case 'success_rate':
        return {
          title: 'Professional Success Tracking',
          description: 'Advanced success rate analytics and voting features are available with Pro.'
        }
      case 'bulk_actions':
        return {
          title: 'Bulk Operations',
          description: 'Manage multiple prompts at once with our bulk operations feature.'
        }
      default:
        return {
          title: 'Upgrade to Pro',
          description: 'Take your prompt engineering to the next level with professional features.'
        }
    }
  }

  const triggerMessage = getTriggerMessage()

  const handleUpgrade = (plan: string) => {
    // In a real app, this would integrate with Stripe
    console.log(`Upgrading to ${plan} plan`)
    // For now, just close the modal
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="text-yellow-500" size={24} />
            {triggerMessage.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {triggerMessage.description}
          </DialogDescription>
        </DialogHeader>

        {/* Pro Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {proFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Icon className="text-primary mt-0.5" size={18} />
                <div>
                  <h4 className="font-medium text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pricing Plans */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Choose Your Plan</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative cursor-pointer transition-all ${
                  selectedPlan === plan.name
                    ? 'ring-2 ring-primary shadow-lg'
                    : 'hover:shadow-md'
                } ${plan.popular ? 'border-primary' : ''}`}
                onClick={() => setSelectedPlan(plan.name)}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}

                <CardContent className="p-6 text-center">
                  <h4 className="text-xl font-bold">{plan.name}</h4>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>

                  {plan.savings && (
                    <Badge variant="secondary" className="mt-2">
                      {plan.savings}
                    </Badge>
                  )}

                  <ul className="mt-4 space-y-2 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check size={14} className="text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>1,200+ professionals</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-500" />
              <span>4.9/5 rating</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Join the community of professional prompt engineers
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <ProfessionalButton
            gradient
            onClick={() => handleUpgrade(selectedPlan)}
            className="px-8"
          >
            Upgrade to {selectedPlan}
          </ProfessionalButton>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-center text-muted-foreground">
          30-day money-back guarantee • Cancel anytime • Secure payment
        </p>
      </DialogContent>
    </Dialog>
  )
}