import React from 'react'
import { ProfessionalButton } from './ProfessionalButton'
import { ProfessionalBadge } from './ProfessionalBadge'
import { Sparkles } from 'lucide-react'

export const ProfessionalHero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

      <div className="relative px-6 py-24 mx-auto max-w-7xl lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <ProfessionalBadge
            premium
            className="inline-flex items-center gap-2 mb-6 animate-slide-in-down"
          >
            <Sparkles size={12} />
            New: Client-Ready Portfolio System
          </ProfessionalBadge>

          {/* Main Headline */}
          <h1 className="text-display-xl mb-6 animate-slide-in-up">
            Build Your{' '}
            <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Prompt Engineering
            </span>{' '}
            Career
          </h1>

          {/* Subtitle */}
          <p className="text-body-lg text-on-surface-variant mb-8 max-w-2xl mx-auto animate-slide-in-up [animation-delay:100ms]">
            The professional workspace where prompt engineers track success rates,
            showcase expertise with portfolios, and collaborate with clients.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-in-up [animation-delay:200ms]">
            <ProfessionalButton gradient size="lg" className="text-lg px-8 py-4">
              Start Building Your Portfolio
            </ProfessionalButton>
            <ProfessionalButton variant="outline" size="lg" className="text-lg px-8 py-4">
              Explore Prompts
            </ProfessionalButton>
          </div>

          {/* Social Proof */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto animate-slide-in-up [animation-delay:300ms]">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 mb-1">89%</div>
              <div className="text-body-sm text-on-surface-variant">Avg Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600 mb-1">1.2K+</div>
              <div className="text-body-sm text-on-surface-variant">Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">72+</div>
              <div className="text-body-sm text-on-surface-variant">Industry Prompts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-200 rounded-full opacity-20 animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-float [animation-delay:1s]" />
    </section>
  )
}