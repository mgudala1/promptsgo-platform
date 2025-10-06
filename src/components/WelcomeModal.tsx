import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Progress } from './ui/progress'
import { CheckCircle, Sparkles, TrendingUp, GitBranch, Search, Users, Crown, X } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
}

const onboardingSteps = [
  {
    id: 'explore',
    title: 'Explore Prompts',
    description: 'Browse our curated collection of professional prompts',
    icon: Search,
    action: 'Browse Prompts'
  },
  {
    id: 'create',
    title: 'Create Your First Prompt',
    description: 'Share your expertise with the community',
    icon: Sparkles,
    action: 'Create Prompt'
  },
  {
    id: 'vote',
    title: 'Vote on Success Rates',
    description: 'Help improve prompts by sharing what works',
    icon: TrendingUp,
    action: 'Learn More'
  },
  {
    id: 'fork',
    title: 'Fork & Customize',
    description: 'Adapt prompts for your specific needs',
    icon: GitBranch,
    action: 'Try Forking'
  }
]

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const { state } = useApp()
  const { user } = state
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      loadUserProgress()
    }
  }, [isOpen, user])

  const loadUserProgress = async () => {
    if (!user) return

    try {
      // Check user's prompt creation activity
      const { data: userPrompts } = await supabase
        .from('prompts')
        .select('id')
        .eq('user_id', user.id)

      // Check user's voting activity
      const { data: userVotes } = await supabase
        .from('success_votes')
        .select('id')
        .eq('user_id', user.id)

      // Check user's forking activity
      const { data: userForks } = await supabase
        .from('prompt_forks')
        .select('id')
        .eq('forked_by', user.id)

      const progress = new Set<string>()

      if (userPrompts && userPrompts.length > 0) {
        progress.add('create')
      }

      if (userVotes && userVotes.length > 0) {
        progress.add('vote')
      }

      if (userForks && userForks.length > 0) {
        progress.add('fork')
      }

      // Always mark explore as completed for new users
      progress.add('explore')

      setCompletedSteps(progress)
    } catch (error) {
      console.error('Error loading user progress:', error)
    }
  }

  const handleStepAction = (stepId: string) => {
    switch (stepId) {
      case 'explore':
        window.location.href = '/explore'
        break
      case 'create':
        window.location.href = '/create'
        break
      case 'vote':
        // Show a tooltip or modal explaining voting
        break
      case 'fork':
        // Show a tooltip or modal explaining forking
        break
    }
  }

  const handleComplete = async () => {
    if (dontShowAgain && user) {
      try {
        await supabase
          .from('profiles')
          .update({ has_completed_onboarding: true })
          .eq('id', user.id)
      } catch (error) {
        console.error('Error updating onboarding status:', error)
      }
    }
    onClose()
  }

  const progressPercentage = (completedSteps.size / onboardingSteps.length) * 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="text-primary" size={24} />
            Welcome to PromptsGo Pro! 🎉
          </DialogTitle>
          <DialogDescription className="text-base">
            Your journey to professional prompt engineering starts here. Let's get you set up with the best tools and features.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Onboarding Progress</span>
            <span>{completedSteps.size} of {onboardingSteps.length} completed</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Onboarding Steps */}
        <div className="space-y-3">
          {onboardingSteps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = completedSteps.has(step.id)

            return (
              <Card key={step.id} className={`transition-all ${isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-primary/10'}`}>
                      {isCompleted ? (
                        <CheckCircle className="text-green-600" size={20} />
                      ) : (
                        <Icon className="text-primary" size={20} />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className={`font-medium ${isCompleted ? 'text-green-800' : 'text-foreground'}`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>

                    <Button
                      variant={isCompleted ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleStepAction(step.id)}
                      className={isCompleted ? "border-green-300 text-green-700 hover:bg-green-100" : ""}
                    >
                      {isCompleted ? "Completed" : step.action}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Pro Features Teaser */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Crown className="text-purple-600" size={20} />
              <div className="flex-1">
                <h4 className="font-medium text-purple-900">Unlock Pro Features</h4>
                <p className="text-sm text-purple-700">
                  Get unlimited saves, advanced analytics, and priority support
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Don't show again checkbox */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="dont-show-again"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="dont-show-again" className="text-sm text-muted-foreground">
            Don't show this welcome again
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Skip for Now
          </Button>
          <Button onClick={handleComplete}>
            {progressPercentage === 100 ? 'Get Started!' : 'Continue Later'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}