import { useState, useEffect } from "react";
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
import { AdminBulkImport } from "./components/AdminBulkImport";
import { UIPlayground } from "./components/UIPlayground";
import { AdminDashboard } from "./components/AdminDashboard";
import { ListsAndFoldersPage } from "./components/ListsAndFoldersPage";
import { VersionHistory } from "./components/VersionHistory";
import { WelcomeModal } from "./components/WelcomeModal";
import { ProUpgradeModal } from "./components/ProUpgradeModal";
import { Toaster } from "./components/ui/sonner";
import { Prompt } from "./lib/types";
import { isAdmin } from "./lib/admin";
import { prompts } from "./lib/api";

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
   | { type: 'version-history'; promptId: string }
   | { type: 'about' }
   | { type: 'terms' }
   | { type: 'privacy' }
   | { type: 'invite' }
   | { type: 'affiliate' }
   | { type: 'affiliate-dashboard' }
   | { type: 'admin-bulk-import' }
   | { type: 'admin-dashboard' }
   | { type: 'lists-and-folders' }
   | { type: 'ui-playground' };

function AppContent() {
  const { state, dispatch } = useApp();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isProUpgradeModalOpen, setIsProUpgradeModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>({ type: 'home' });

  // Show welcome modal for new users
  useEffect(() => {
    if (state.user) {
      // Check if user has completed onboarding
      const hasCompleted = localStorage.getItem(`onboarding_completed_${state.user.id}`);
      if (!hasCompleted) {
        setIsWelcomeModalOpen(true);
      }
    }
  }, [state.user]);

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
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

  const handleEditPrompt = async (prompt: Prompt) => {
    try {
      // Load the full prompt data including images from database
      const { data: fullPromptData, error } = await prompts.getById(prompt.id);

      if (error) {
        console.error('Error loading full prompt data:', error);
        // Fallback to the provided prompt data
        setCurrentPage({ type: 'create', editingPrompt: prompt });
        return;
      }

      if (fullPromptData) {
        // Transform the database data to match our Prompt type
        const fullPrompt: Prompt = {
          id: fullPromptData.id,
          userId: fullPromptData.user_id,
          title: fullPromptData.title,
          slug: fullPromptData.slug,
          description: fullPromptData.description,
          content: fullPromptData.content,
          type: fullPromptData.type,
          modelCompatibility: fullPromptData.model_compatibility,
          tags: fullPromptData.tags,
          visibility: fullPromptData.visibility,
          category: fullPromptData.category,
          language: fullPromptData.language,
          version: fullPromptData.version,
          parentId: fullPromptData.parent_id || undefined,
          viewCount: fullPromptData.view_count,
          hearts: fullPromptData.hearts,
          saveCount: fullPromptData.save_count,
          forkCount: fullPromptData.fork_count,
          commentCount: fullPromptData.comment_count,
          createdAt: fullPromptData.created_at,
          updatedAt: fullPromptData.updated_at,
          attachments: [],
          author: fullPromptData.profiles ? {
            id: fullPromptData.profiles.id,
            username: fullPromptData.profiles.username,
            email: fullPromptData.profiles.email || '',
            name: fullPromptData.profiles.name,
            bio: fullPromptData.profiles.bio || undefined,
            website: fullPromptData.profiles.website || undefined,
            github: fullPromptData.profiles.github || undefined,
            twitter: fullPromptData.profiles.twitter || undefined,
            reputation: 0,
            createdAt: fullPromptData.profiles.created_at || fullPromptData.created_at,
            lastLogin: fullPromptData.profiles.created_at || fullPromptData.created_at,
            badges: [],
            skills: [],
            subscriptionPlan: fullPromptData.profiles.subscription_plan || 'free',
            saveCount: 0,
            invitesRemaining: fullPromptData.profiles.invites_remaining || 0
          } : {
            id: fullPromptData.user_id,
            username: 'user',
            email: '',
            name: 'User',
            reputation: 0,
            createdAt: fullPromptData.created_at,
            lastLogin: fullPromptData.created_at,
            badges: [],
            skills: [],
            subscriptionPlan: 'free',
            saveCount: 0,
            invitesRemaining: 0
          },
          images: fullPromptData.prompt_images?.map((img: any) => ({
            id: img.id,
            url: img.url,
            altText: img.alt_text,
            isPrimary: img.is_primary,
            size: img.size,
            mimeType: img.mime_type,
            width: img.width || undefined,
            height: img.height || undefined,
            caption: img.caption || undefined
          })) || [],
          isHearted: false, // Will be set by the component
          isSaved: false,   // Will be set by the component
          isForked: false,
          template: fullPromptData.template || undefined
        };

        setCurrentPage({ type: 'create', editingPrompt: fullPrompt });
      } else {
        // Fallback to the provided prompt data
        setCurrentPage({ type: 'create', editingPrompt: prompt });
      }
    } catch (err) {
      console.error('Error in handleEditPrompt:', err);
      // Fallback to the provided prompt data
      setCurrentPage({ type: 'create', editingPrompt: prompt });
    }
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

  const handleAdminClick = (feature: string) => {
    if (feature === 'bulk-import') {
      setCurrentPage({ type: 'admin-bulk-import' });
    } else if (feature === 'dashboard') {
      setCurrentPage({ type: 'admin-dashboard' });
    } else if (feature === 'ui-playground') {
      setCurrentPage({ type: 'ui-playground' });
    }
    // Add more admin features here in the future
  };


  // Handle successful onboarding completion
  const handleOnboardingComplete = () => {
    if (state.user) {
      localStorage.setItem(`onboarding_completed_${state.user.id}`, 'true');
    }
    setIsWelcomeModalOpen(false);
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
        onAdminClick={handleAdminClick}
      />
      
      <main>
        {currentPage.type === 'home' && (
          <HomePage
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
            onNavigateToIndustryPacks={() => setCurrentPage({ type: 'industry-packs' })}
            onNavigateToPackView={(packId) => setCurrentPage({ type: 'pack-view', packId })}
            onNavigateToPortfolioView={(portfolioId) => setCurrentPage({ type: 'portfolio-view', portfolioId })}
          />
        )}

        {currentPage.type === 'settings' && (
          <SettingsPage
            onBack={handleBack}
            onNavigateToSubscription={() => setCurrentPage({ type: 'subscription' })}
            onNavigateToBilling={() => setCurrentPage({ type: 'billing' })}
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


        {currentPage.type === 'version-history' && (
          <VersionHistory
            promptId={currentPage.promptId}
            currentUserId={state.user?.id || ''}
            onVersionRestored={() => {
              // Handle version restoration - could refresh the prompt data
            }}
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

        {currentPage.type === 'admin-dashboard' && isAdmin(state.user) && (
          <AdminDashboard />
        )}

        {currentPage.type === 'admin-bulk-import' && isAdmin(state.user) && (
          <AdminBulkImport />
        )}

        {currentPage.type === 'lists-and-folders' && (
          <ListsAndFoldersPage />
        )}

        {currentPage.type === 'ui-playground' && isAdmin(state.user) && (
          <UIPlayground />
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
      />

      {/* Professional Modals */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={handleOnboardingComplete}
      />

      <ProUpgradeModal
        isOpen={isProUpgradeModalOpen}
        onClose={() => setIsProUpgradeModalOpen(false)}
        trigger="advanced_feature"
      />


      <Toaster />
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
