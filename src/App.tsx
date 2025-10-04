import { useState } from "react";
import { AppProvider, useApp } from "./contexts/AppContext";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./components/HomePage";
import { ExplorePage } from "./components/ExplorePage";
import { CreatePromptPage } from "./components/CreatePromptPage";
import { PromptDetailPage } from "./components/PromptDetailPage";
import { UserProfilePage } from "./components/UserProfilePage";
import { SettingsPage } from "./components/SettingsPage";
import AboutPage from "./components/AboutPage";
import { TermsPage } from "./components/TermsPage";
import { PrivacyPage } from "./components/PrivacyPage";
import { AuthModal } from "./components/AuthModal";
import { Footer } from "./components/Footer";
import { IndustryPacksPage } from "./components/IndustryPacksPage";
import { PackViewPage } from "./components/PackViewPage";
import { CreatePackPage } from "./components/CreatePackPage";
import { PortfolioViewPage } from "./components/PortfolioViewPage";
import { SubscriptionPage } from "./components/SubscriptionPage";
import { BillingPage } from "./components/BillingPage";
import { InviteSystemPage } from "./components/ui/InviteSystemPage";
import { AffiliateProgramPage } from "./components/ui/AffiliateProgramPage";
import { AffiliateDashboard } from "./components/AffiliateDashboard";
import { Prompt } from "./lib/types";

type Page =
  | { type: 'home' }
  | { type: 'explore'; searchQuery?: string }
  | { type: 'create'; editingPrompt?: Prompt }
  | { type: 'prompt'; promptId: string }
  | { type: 'profile'; userId: string; tab?: string }
  | { type: 'portfolio-view'; portfolioId: string }
  | { type: 'settings' }
  | { type: 'subscription' }
  | { type: 'billing' }
  | { type: 'industry-packs' }
  | { type: 'pack-view'; packId: string }
  | { type: 'pack-create' }
  | { type: 'about' }
  | { type: 'terms' }
  | { type: 'privacy' }
  | { type: 'invite' }
  | { type: 'affiliate' }
  | { type: 'affiliate-dashboard' };

function AppContent() {
  const { state, dispatch } = useApp();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>({ type: 'home' });

  // Simple test to see if React is working
  console.log('AppContent rendering, state:', state);

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthenticated = (userData: any) => {
    // Convert to proper User type
    const user = {
      ...userData,
      id: userData.id || `user-${Date.now()}`,
      email: userData.email || `${userData.username}@example.com`,
      bio: userData.bio || '',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      badges: [],
      skills: []
    };
    
    dispatch({ type: 'SET_USER', payload: user });
    setIsAuthModalOpen(false);
  };

  const handleGetStarted = () => {
    if (state.user) {
      setCurrentPage({ type: 'create' });
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleExplore = (searchQuery?: string) => {
    setCurrentPage({ type: 'explore', searchQuery });
  };

  const handlePromptClick = (promptId: string) => {
    setCurrentPage({ type: 'prompt', promptId });
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setCurrentPage({ type: 'create', editingPrompt: prompt });
  };

  const handleForkPrompt = (originalPrompt: Prompt) => {
    if (!state.user) return;

    // Create a forked version
    const forkedPrompt: Prompt = {
      ...originalPrompt,
      id: `prompt-${Date.now()}`,
      userId: state.user.id,
      title: `Fork of ${originalPrompt.title}`,
      slug: `fork-of-${originalPrompt.slug}-${Date.now()}`,
      parentId: originalPrompt.id,
      version: '1.0.0',
      viewCount: 0,
      hearts: 0,
      saveCount: 0,
      forkCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: state.user,
      isHearted: false,
      isSaved: false,
      isForked: false
    };

    dispatch({ 
      type: 'FORK_PROMPT', 
      payload: { 
        originalId: originalPrompt.id, 
        newPrompt: forkedPrompt 
      } 
    });

    setCurrentPage({ type: 'create', editingPrompt: forkedPrompt });
  };

  const handleProfileClick = (userId: string, tab?: string) => {
    setCurrentPage({ type: 'profile', userId, tab });
  };

  const handleSavedClick = () => {
    if (state.user) {
      setCurrentPage({ type: 'profile', userId: state.user.id, tab: 'saved' });
    }
  };

  const handleSettingsClick = () => {
    if (state.user) {
      setCurrentPage({ type: 'settings' });
    }
  };

  const handleBack = () => {
    setCurrentPage({ type: 'home' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        user={state.user} 
        onAuthClick={handleAuthClick}
        onProfileClick={() => state.user && handleProfileClick(state.user.id)}
        onCreateClick={() => setCurrentPage({ type: 'create' })}
        onExploreClick={handleExplore}
        onHomeClick={() => setCurrentPage({ type: 'home' })}
        onSavedClick={handleSavedClick}
        onSettingsClick={handleSettingsClick}
        onIndustryPacksClick={() => setCurrentPage({ type: 'industry-packs' })}
      />
      
      <main>
        {currentPage.type === 'home' && (
          <HomePage
            onGetStarted={handleGetStarted}
            onExplore={handleExplore}
            onPromptClick={handlePromptClick}
          />
        )}
        
        {currentPage.type === 'explore' && (
          <ExplorePage
            onBack={handleBack}
            onPromptClick={handlePromptClick}
            initialSearchQuery={currentPage.searchQuery}
          />
        )}
        
        {currentPage.type === 'create' && (
          <CreatePromptPage 
            onBack={handleBack}
            editingPrompt={currentPage.editingPrompt}
            onPublish={(isNewPrompt) => {
              if (isNewPrompt && state.user) {
                // Navigate to user's profile "Created" tab
                setCurrentPage({ type: 'profile', userId: state.user.id, tab: 'created' });
              } else {
                handleBack();
              }
            }}
          />
        )}

        {currentPage.type === 'prompt' && (
          <PromptDetailPage
            promptId={currentPage.promptId}
            onBack={handleBack}
            onEdit={handleEditPrompt}
            onFork={handleForkPrompt}
          />
        )}

        {currentPage.type === 'profile' && (
          <UserProfilePage
            userId={currentPage.userId}
            initialTab={currentPage.tab}
            onBack={handleBack}
            onPromptClick={handlePromptClick}
            onNavigateToSettings={() => state.user && handleSettingsClick()}
            onNavigateToIndustryPacks={() => setCurrentPage({ type: 'industry-packs' })}
            onNavigateToPackView={(packId) => setCurrentPage({ type: 'pack-view', packId })}
            onNavigateToPortfolioView={(portfolioId) => setCurrentPage({ type: 'portfolio-view', portfolioId })}
          />
        )}

        {currentPage.type === 'settings' && (
          <SettingsPage
            onBack={handleBack}
            onNavigateToSubscription={() => setCurrentPage({ type: 'subscription' })}
          />
        )}

        {currentPage.type === 'subscription' && (
          <SubscriptionPage
            onBack={handleBack}
            onNavigateToBilling={() => setCurrentPage({ type: 'billing' })}
          />
        )}

        {currentPage.type === 'billing' && (
          <BillingPage
            onBack={handleBack}
          />
        )}

        {currentPage.type === 'industry-packs' && (
          <IndustryPacksPage
            onBack={handleBack}
            onPackClick={(packId) => setCurrentPage({ type: 'pack-view', packId })}
            onCreatePackClick={() => setCurrentPage({ type: 'pack-create' })}
          />
        )}

        {currentPage.type === 'pack-view' && (
          <PackViewPage
            packId={currentPage.packId}
            onBack={() => setCurrentPage({ type: 'industry-packs' })}
            onPromptClick={handlePromptClick}
          />
        )}

        {/* Portfolio pages removed - now handled in UserProfilePage */}

        {currentPage.type === 'pack-create' && (
          <CreatePackPage
            onBack={() => setCurrentPage({ type: 'industry-packs' })}
            onPackCreated={(packId) => setCurrentPage({ type: 'pack-view', packId })}
          />
        )}

        {currentPage.type === 'portfolio-view' && (
          <PortfolioViewPage
            portfolioId={currentPage.portfolioId}
            onBack={() => setCurrentPage({ type: 'home' })}
            onPromptClick={handlePromptClick}
          />
        )}

        {currentPage.type === 'about' && (
          <AboutPage
            onBack={handleBack}
          />
        )}

        {currentPage.type === 'terms' && (
          <TermsPage
            onBack={handleBack}
          />
        )}

        {currentPage.type === 'privacy' && (
          <PrivacyPage
            onBack={handleBack}
          />
        )}

        {currentPage.type === 'invite' && (
          <InviteSystemPage onBack={handleBack} />
        )}

        {currentPage.type === 'affiliate' && (
          <AffiliateProgramPage
            onBack={handleBack}
            onNavigateToDashboard={() => setCurrentPage({ type: 'affiliate-dashboard' })}
          />
        )}

        {currentPage.type === 'affiliate-dashboard' && (
          <AffiliateDashboard />
        )}
      </main>

      <Footer
        onGetStarted={handleGetStarted}
        onNavigateToAbout={() => setCurrentPage({ type: 'about' })}
        onNavigateToTerms={() => setCurrentPage({ type: 'terms' })}
        onNavigateToPrivacy={() => setCurrentPage({ type: 'privacy' })}
        onNavigateToInvites={() => setCurrentPage({ type: 'invite' })}
        onNavigateToAffiliate={() => setCurrentPage({ type: 'affiliate' })}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}