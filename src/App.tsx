import { useState, useEffect } from 'react';
import { Profile } from './types';
import { ProfileSelector } from './components/ProfileSelector';
import { HomeView } from './components/HomeView';
import { DetailView } from './components/DetailView';
import { PlayerView } from './components/PlayerView';
import { LiveTVView } from './components/LiveTVView';
import { AboutView } from './components/AboutView';
import { TermsView } from './components/TermsView';
import { SurpriseMeWizardView } from './components/SurpriseMeWizardView';
import { SeasonalTestView } from './components/SeasonalTestView';
import { SearchView } from './components/SearchView';
import { CastDetailView } from './components/CastDetailView';
import { StartupAnimation } from './components/StartupAnimation';
import { SmartSearchView } from './components/SmartSearchView';
import { SettingsView } from './components/SettingsView';
import { getProfiles } from './lib/storage';
import { DevPlayground } from './components/DevPlayground';

type View =
  | { type: 'profiles' }
  | { type: 'home' }
  | { type: 'livetv' }
  | { type: 'about' }
  | { type: 'terms' }
  | { type: 'surprise' }
  | { type: 'seasonaltest' }
  | { type: 'search' }
  | { type: 'smartsearch' }
  | { type: 'settings' }
  | { type: 'cast'; castId: number }
  | { type: 'detail'; tmdbId: number; mediaType: 'movie' | 'tv' }
  | { type: 'player'; tmdbId: number; mediaType: 'movie' | 'tv' | 'live'; season?: number; episode?: number; embedUrl?: string; channelName?: string }
  | { type: 'devplayground' };

function App() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [currentView, setCurrentView] = useState<View>({ type: 'profiles' });
  const [previousView, setPreviousView] = useState<View | null>(null);
  const [showStartup, setShowStartup] = useState(() => {
    const hasSeenStartup = sessionStorage.getItem('simplstream_startup_seen');
    return !hasSeenStartup;
  });

  useEffect(() => {
    if (!showStartup) {
      sessionStorage.setItem('simplstream_startup_seen', 'true');
    }
  }, [showStartup]);

  function handleSelectProfile(profile: Profile) {
    setCurrentProfile(profile);
    setCurrentView({ type: 'home' });
  }

  function handleProfileUpdate() {
    if (currentProfile) {
      const profiles = getProfiles();
      const updated = profiles.find(p => p.id === currentProfile.id);
      if (updated) {
        setCurrentProfile(updated);
      }
    }
  }

  function handleLogout() {
    setCurrentProfile(null);
    setCurrentView({ type: 'profiles' });
    setPreviousView(null);
  }

  function handleShowDetail(tmdbId: number, mediaType: 'movie' | 'tv') {
    setPreviousView(currentView);
    setCurrentView({ type: 'detail', tmdbId, mediaType });
  }

  function handleShowLiveTV() {
    setPreviousView(currentView);
    setCurrentView({ type: 'livetv' });
  }

  function handlePlay(tmdbId: number, mediaType: 'movie' | 'tv' | 'live', season?: number, episode?: number, embedUrl?: string, channelName?: string) {
    setPreviousView(currentView);
    setCurrentView({ type: 'player', tmdbId, mediaType, season, episode, embedUrl, channelName });
  }

  function handleShowAbout() {
    setPreviousView(currentView);
    setCurrentView({ type: 'about' });
  }

  function handleShowTerms() {
    setPreviousView(currentView);
    setCurrentView({ type: 'terms' });
  }

  function handleShowSurprise() {
    setPreviousView(currentView);
    setCurrentView({ type: 'surprise' });
  }

  function handleShowSeasonalTest() {
    setPreviousView(currentView);
    setCurrentView({ type: 'seasonaltest' });
  }

  function handleShowDevPlayground() {
    setPreviousView(currentView);
    setCurrentView({ type: 'devplayground' });
  }

  function handleShowSearch() {
    setPreviousView(currentView);
    setCurrentView({ type: 'search' });
  }

  function handleShowSmartSearch() {
    setPreviousView(currentView);
    setCurrentView({ type: 'smartsearch' });
  }

  function handleShowSettings() {
    setPreviousView(currentView);
    setCurrentView({ type: 'settings' });
  }

  function handleShowCast(castId: number) {
    setPreviousView(currentView);
    setCurrentView({ type: 'cast', castId });
  }

  function handleGoHome() {
    setCurrentView({ type: 'home' });
    setPreviousView(null);
  }

  function handleBack() {
    if (previousView) {
      setCurrentView(previousView);
      setPreviousView(null);
    } else if (currentView.type !== 'home') {
      setCurrentView({ type: 'home' });
    }
  }

  if (showStartup) {
    return <StartupAnimation onComplete={() => setShowStartup(false)} />;
  }

  if (currentView.type === 'profiles') {
    return <ProfileSelector onSelectProfile={handleSelectProfile} />;
  }

  if (!currentProfile) {
    return <ProfileSelector onSelectProfile={handleSelectProfile} />;
  }

  if (currentView.type === 'home') {
    (window as any).navigateToSmartSearch = handleShowSmartSearch;
    return (
      <HomeView
        profile={currentProfile}
        onLogout={handleLogout}
        onShowDetail={handleShowDetail}
        onShowLiveTV={handleShowLiveTV}
        onProfileUpdate={handleProfileUpdate}
        onShowAbout={handleShowAbout}
        onShowTerms={handleShowTerms}
        onShowSurprise={handleShowSurprise}
        onShowSearch={handleShowSearch}
        onShowSettings={handleShowSettings}
        onGoHome={handleGoHome}
      />
    );
  }

  if (currentView.type === 'settings') {
    return (
      <SettingsView
        profile={currentProfile}
        onBack={handleBack}
        onProfileUpdate={handleProfileUpdate}
        onLogout={handleLogout}
      />
    );
  }

  if (currentView.type === 'search') {
    (window as any).navigateToSmartSearch = handleShowSmartSearch;
    return (
      <SearchView
        profile={currentProfile}
        onBack={handleBack}
        onShowDetail={handleShowDetail}
      />
    );
  }

  if (currentView.type === 'smartsearch') {
    return (
      <SmartSearchView
        profile={currentProfile}
        onBack={handleBack}
        onGoHome={handleGoHome}
        onShowDetail={handleShowDetail}
        cloakModeEnabled={false}
      />
    );
  }

  if (currentView.type === 'cast') {
    return (
      <CastDetailView
        castId={currentView.castId}
        onBack={handleBack}
        onShowDetail={handleShowDetail}
      />
    );
  }

  if (currentView.type === 'surprise') {
    return (
      <SurpriseMeWizardView
        profile={currentProfile}
        onBack={handleBack}
        onShowDetail={handleShowDetail}
      />
    );
  }

  if (currentView.type === 'seasonaltest') {
    return (
      <SeasonalTestView
        onBack={handleBack}
        onShowDetail={handleShowDetail}
      />
    );
  }

  if (currentView.type === 'about') {
    return <AboutView onBack={handleBack} />;
  }

  if (currentView.type === 'terms') {
    return <TermsView onBack={handleBack} onShowSeasonalTest={handleShowSeasonalTest} onShowDevPlayground={handleShowDevPlayground} />;
  }

  if (currentView.type === 'livetv') {
    return (
      <LiveTVView
        profile={currentProfile}
        onBack={handleBack}
        onPlay={handlePlay}
        onGoHome={handleGoHome}
      />
    );
  }

  if (currentView.type === 'detail') {
    return (
      <DetailView
        profile={currentProfile}
        tmdbId={currentView.tmdbId}
        mediaType={currentView.mediaType}
        onBack={handleBack}
        onPlay={handlePlay}
        onShowCast={handleShowCast}
        onGoHome={handleGoHome}
        onShowDetail={handleShowDetail}
      />
    );
  }

  if (currentView.type === 'devplayground') {
    return <DevPlayground onBack={handleBack} />;
  }

  if (currentView.type === 'player') {
    return (
      <PlayerView
        profile={currentProfile}
        tmdbId={currentView.tmdbId}
        mediaType={currentView.mediaType}
        season={currentView.season}
        episode={currentView.episode}
        embedUrl={currentView.embedUrl}
        channelName={currentView.channelName}
        onBack={handleBack}
        onPlay={handlePlay}
        onGoHome={handleGoHome}
      />
    );
  }

  return null;
}

export default App;
