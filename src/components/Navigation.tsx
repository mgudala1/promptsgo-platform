import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { SubscriptionBadge } from "./ui/SubscriptionBadge";
import { ThemeToggle } from "./ui/ThemeToggle";
import { useApp } from "../contexts/AppContext";
import { auth } from "../lib/api";
import { isAdmin } from "../lib/admin";
import { Search, Plus, Menu, User, Settings, LogOut, Home, Compass, BookmarkPlus, Package, Shield, Upload, Users, BarChart, Eye, DollarSign, Gift, Activity } from "lucide-react";

interface NavigationProps {
     user?: {
       name: string;
       username: string;
       reputation: number;
       role?: 'general' | 'pro' | 'admin';
       subscriptionStatus?: 'active' | 'cancelled' | 'past_due';
     } | null;
   onAuthClick: () => void;
   onProfileClick?: () => void;
   onCreateClick?: () => void;
   onExploreClick?: (searchQuery?: string) => void;
   onHomeClick?: () => void;
   onSavedClick?: () => void;
   onSettingsClick?: () => void;
   onPromptPacksClick?: () => void;
   onAdminClick?: (feature: string) => void;
 }

export function Navigation({
   user,
   onAuthClick,
   onProfileClick,
   onCreateClick,
   onExploreClick,
   onHomeClick,
   onSavedClick,
   onSettingsClick,
   onPromptPacksClick,
   onAdminClick
 }: NavigationProps) {
   const { state, dispatch } = useApp();
   const currentUser = state.user;
  const [searchQuery, setSearchQuery] = useState(
    typeof state.searchFilters.query === 'string' ? state.searchFilters.query : ""
  );

  // Sync local search query with global search filters
  useEffect(() => {
    const query = typeof state.searchFilters.query === 'string' ? state.searchFilters.query : "";
    setSearchQuery(query);
  }, [state.searchFilters.query]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-xl">PromptsGo</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Button
                variant="ghost"
                className="flex items-center gap-2 nav-button group"
                onClick={onHomeClick}
              >
                <Home className="h-4 w-4 group-hover:text-accent" />
                Home
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-2 nav-button group"
                onClick={onExploreClick}
              >
                <Compass className="h-4 w-4 group-hover:text-accent" />
                Explore
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-2 nav-button group"
                onClick={onPromptPacksClick}
              >
                <Package className="h-4 w-4 group-hover:text-accent" />
                Prompt Packs
              </Button>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts, creators, tags..."
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  // Update global search filters immediately
                  dispatch({ type: 'SET_SEARCH_FILTERS', payload: { query: value } });
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    // Navigate to explore page when Enter is pressed
                    onExploreClick?.(searchQuery.trim());
                  }
                }}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      onExploreClick?.(searchQuery.trim());
                    }
                  }}
                >
                  <Search className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {user ? (
              <>
                {/* Admin Menu (Only visible to admins) */}
                {isAdmin(currentUser) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="hidden sm:inline">Admin</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin Tools
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onAdminClick?.('dashboard')}>
                        <BarChart className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAdminClick?.('bulk-import')}>
                        <Upload className="mr-2 h-4 w-4" />
                        Bulk Import Prompts
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAdminClick?.('ui-playground')}>
                        <Eye className="mr-2 h-4 w-4" />
                        UI Playground
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAdminClick?.('content-moderation')}>
                        <Shield className="mr-2 h-4 w-4" />
                        Content Moderation
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAdminClick?.('user-management')}>
                        <Users className="mr-2 h-4 w-4" />
                        Manage Users
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAdminClick?.('analytics-reports')}>
                        <BarChart className="mr-2 h-4 w-4" />
                        Analytics & Reports
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAdminClick?.('subscription-management')}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Subscription Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAdminClick?.('invite-affiliate-management')}>
                        <Gift className="mr-2 h-4 w-4" />
                        Invite & Affiliate Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAdminClick?.('platform-settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Platform Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAdminClick?.('system-logs-health')}>
                        <Activity className="mr-2 h-4 w-4" />
                        System Logs & Health
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Create Button */}
                <Button
                  className="flex items-center gap-2"
                  onClick={onCreateClick}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Create</span>
                </Button>


                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 p-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                        {getInitials(user.name)}
                      </div>
                      <div className="hidden md:block text-left">
                        <div className="text-sm font-medium flex items-center gap-2">
                            {user.name}
                            <SubscriptionBadge
                              role={user.role || 'general'}
                              subscriptionStatus={user.subscriptionStatus}
                            />
                          </div>
                        <div className="text-xs text-muted-foreground">
                          {user.reputation} rep
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="p-2">
                      <div className="font-medium flex items-center gap-2">
                        {user.name}
                        <SubscriptionBadge
                          role={user.role || 'general'}
                          subscriptionStatus={user.subscriptionStatus}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">@{user.username}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {user.reputation} reputation points
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onProfileClick}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onSavedClick}>
                      <BookmarkPlus className="mr-2 h-4 w-4" />
                      Saved Prompts
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onSettingsClick}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={async () => {
                      try {
                        console.log('[Navigation] Signing out user...');
                        // First clear user state
                        dispatch({ type: 'SET_USER', payload: null });
                        
                        // Then sign out from Supabase (this will trigger SIGNED_OUT event)
                        await auth.signOut();
                        
                        console.log('[Navigation] Sign out complete');
                      } catch (error) {
                        console.error('[Navigation] Sign out error:', error);
                      }
                    }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={onAuthClick}>
                  Sign In
                </Button>
                <Button onClick={onAuthClick}>
                  Get Started
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
              </div>
              <Button
                variant="ghost"
                className="justify-start nav-button group"
                onClick={onHomeClick}
              >
                <Home className="mr-2 h-4 w-4 group-hover:text-accent" />
                Home
              </Button>
              <Button
                variant="ghost"
                className="justify-start nav-button group"
                onClick={onExploreClick}
              >
                <Compass className="mr-2 h-4 w-4 group-hover:text-accent" />
                Explore
              </Button>
              <Button
                variant="ghost"
                className="justify-start nav-button group"
                onClick={onPromptPacksClick}
              >
                <Package className="mr-2 h-4 w-4 group-hover:text-accent" />
                Prompt Packs
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}