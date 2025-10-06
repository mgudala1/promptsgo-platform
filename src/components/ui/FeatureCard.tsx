import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-[#FAFAFA] p-8 rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mb-6">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}