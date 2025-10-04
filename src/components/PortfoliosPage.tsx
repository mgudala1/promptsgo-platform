import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Plus, Eye, Lock, ExternalLink, Settings, Trash2, Copy } from 'lucide-react';
import { Portfolio } from '../lib/types';

interface PortfoliosPageProps {
  onBack: () => void;
  onCreatePortfolio: () => void;
  onViewPortfolio: (portfolioId: string) => void;
}

export function PortfoliosPage({ onBack, onCreatePortfolio, onViewPortfolio }: PortfoliosPageProps) {
  const { state, dispatch } = useApp();
  const [copiedPortfolio, setCopiedPortfolio] = useState<string | null>(null);

  // Get user's portfolios
  const userPortfolios = state.portfolios.filter(p => p.userId === state.user?.id);

  const handleCopyLink = (portfolio: Portfolio) => {
    const url = `https://${portfolio.subdomain}.promptsgo.com`;
    navigator.clipboard.writeText(url);
    setCopiedPortfolio(portfolio.id);
    setTimeout(() => setCopiedPortfolio(null), 2000);
  };

  const handleDeletePortfolio = (portfolioId: string) => {
    if (confirm('Are you sure you want to delete this portfolio? This action cannot be undone.')) {
      dispatch({ type: 'DELETE_PORTFOLIO', payload: portfolioId });
    }
  };

  const handleTogglePublish = (portfolio: Portfolio) => {
    dispatch({
      type: 'UPDATE_PORTFOLIO',
      payload: {
        id: portfolio.id,
        updates: { isPublished: !portfolio.isPublished }
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="mb-2">My Portfolios</h1>
              <p className="text-muted-foreground">
                Create professional prompt portfolios to share with clients
              </p>
            </div>
          </div>
          <Button onClick={onCreatePortfolio}>
            <Plus className="w-4 h-4 mr-2" />
            Create Portfolio
          </Button>
        </div>

        {/* Plan Limits */}
        {state.user && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">
                  <span className="font-medium">Current plan: {state.user.subscriptionPlan === 'pro' ? 'Pro' : 'Free'}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {state.user.subscriptionPlan === 'pro' 
                    ? 'Unlimited portfolios with custom domains'
                    : `${userPortfolios.length}/3 portfolios used`
                  }
                </p>
              </div>
              {state.user.subscriptionPlan === 'free' && userPortfolios.length >= 3 && (
                <Button variant="outline" size="sm">
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Portfolios Grid */}
        {userPortfolios.length > 0 ? (
          <div className="grid gap-6">
            {userPortfolios.map(portfolio => (
              <Card key={portfolio.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        {portfolio.name}
                        {portfolio.isPasswordProtected && (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            Protected
                          </Badge>
                        )}
                        {!portfolio.isPublished && (
                          <Badge variant="secondary" className="text-xs">
                            Draft
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {portfolio.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Portfolio URL */}
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <code className="text-sm flex-1">
                        {state.user?.subscriptionPlan === 'pro' 
                          ? `${portfolio.subdomain}.promptsgo.com`
                          : `promptsgo.com/portfolio/${portfolio.subdomain}`
                        }
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(portfolio)}
                      >
                        {copiedPortfolio === portfolio.id ? (
                          <span className="text-xs text-green-600">Copied!</span>
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {portfolio.viewCount} views
                      </div>
                      <div>
                        {portfolio.promptIds.length} prompts
                      </div>
                      <div>
                        {portfolio.clientAccessCount} client accesses
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewPortfolio(portfolio.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      
                      {portfolio.isPublished && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLink(portfolio)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublish(portfolio)}
                      >
                        {portfolio.isPublished ? 'Unpublish' : 'Publish'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePortfolio(portfolio.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2">No portfolios yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first portfolio to showcase your prompts to clients
            </p>
            <Button onClick={onCreatePortfolio}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Portfolio
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}