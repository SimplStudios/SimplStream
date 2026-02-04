import { Profile, WatchHistory, WatchlistItem } from '../types';

const STORAGE_KEYS = {
  PROFILES: 'simplstream_profiles',
  WATCH_HISTORY: 'simplstream_watch_history',
  WATCHLIST: 'simplstream_watchlist',
  THEME: 'simplstream_theme',
  PREFERRED_SERVER: 'simplstream_preferred_server',
  SEARCH_HISTORY: 'simplstream_search_history',
  CUSTOM_AVATARS: 'simplstream_custom_avatars',
};

export type Theme = 'light' | 'dark' | 'system';

// Profile Management
export function getProfiles(): Profile[] {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
  return data ? JSON.parse(data) : [];
}

export function saveProfile(profile: Profile): void {
  const profiles = getProfiles();
  const index = profiles.findIndex(p => p.id === profile.id);

  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }

  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
}

export function deleteProfile(profileId: string): void {
  const profiles = getProfiles().filter(p => p.id !== profileId);
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

  // Also delete related data
  const history = getWatchHistory().filter(h => h.profile_id !== profileId);
  localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(history));

  const watchlist = getWatchlist().filter(w => w.profile_id !== profileId);
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
}

export function deleteAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

// Watch History Management
export function getWatchHistory(profileId?: string): WatchHistory[] {
  const data = localStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);
  const history = data ? JSON.parse(data) : [];
  return profileId ? history.filter((h: WatchHistory) => h.profile_id === profileId) : history;
}

export function saveWatchHistory(history: WatchHistory): void {
  const allHistory = getWatchHistory();
  const index = allHistory.findIndex(h => h.id === history.id);

  if (index >= 0) {
    allHistory[index] = history;
  } else {
    allHistory.push(history);
  }

  localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(allHistory));
}

export function saveHistory(history: WatchHistory): void {
  saveWatchHistory(history);
}

// Watchlist Management
export function getWatchlist(profileId?: string): WatchlistItem[] {
  const data = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
  const watchlist = data ? JSON.parse(data) : [];
  return profileId ? watchlist.filter((w: WatchlistItem) => w.profile_id === profileId) : watchlist;
}

export function addToWatchlist(item: WatchlistItem): void {
  const watchlist = getWatchlist();
  const exists = watchlist.find(w => w.profile_id === item.profile_id && w.tmdb_id === item.tmdb_id);

  if (!exists) {
    watchlist.push(item);
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
  }
}

export function removeFromWatchlist(profileId: string, tmdbId: number): void {
  const watchlist = getWatchlist().filter(w => !(w.profile_id === profileId && w.tmdb_id === tmdbId));
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
}

export function isInWatchlist(profileId: string, tmdbId: number): boolean {
  const watchlist = getWatchlist(profileId);
  return watchlist.some(w => w.tmdb_id === tmdbId);
}

// Theme Management
export function getTheme(): Theme {
  const theme = localStorage.getItem(STORAGE_KEYS.THEME);
  return (theme as Theme) || 'system';
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

export function getEffectiveTheme(): 'light' | 'dark' {
  const theme = getTheme();

  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return theme;
}

// Preferred Server
export function getPreferredServer(): string | null {
  return localStorage.getItem(STORAGE_KEYS.PREFERRED_SERVER);
}
export function setPreferredServer(serverKey: string): void {
  localStorage.setItem(STORAGE_KEYS.PREFERRED_SERVER, serverKey);
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Rating Management
export function getRatings(profileId?: string): any[] {
  const data = localStorage.getItem('simplstream_ratings');
  const ratings = data ? JSON.parse(data) : [];
  return profileId ? ratings.filter((r: any) => r.profile_id === profileId) : ratings;
}

export function saveRating(rating: any): void {
  const ratings = getRatings();
  const index = ratings.findIndex(r => r.profile_id === rating.profile_id && r.tmdb_id === rating.tmdb_id && r.media_type === rating.media_type);

  if (index >= 0) {
    ratings[index] = rating;
  } else {
    ratings.push(rating);
  }

  localStorage.setItem('simplstream_ratings', JSON.stringify(ratings));
}

export function getRating(profileId: string, tmdbId: number, mediaType: string): any | null {
  const ratings = getRatings(profileId);
  return ratings.find(r => r.tmdb_id === tmdbId && r.media_type === mediaType) || null;
}

// Saved Recommendations Management
export function getSavedRecommendations(profileId: string): any[] {
  const data = localStorage.getItem('simplstream_saved_recommendations');
  const saved = data ? JSON.parse(data) : [];
  return saved.filter((s: any) => s.profile_id === profileId);
}

export function saveRecommendations(profileId: string, recommendations: any[], filters: any): void {
  const saved = JSON.parse(localStorage.getItem('simplstream_saved_recommendations') || '[]');
  const newSave = {
    id: generateId(),
    profile_id: profileId,
    recommendations,
    filters,
    saved_at: new Date().toISOString()
  };
  saved.push(newSave);
  localStorage.setItem('simplstream_saved_recommendations', JSON.stringify(saved));
}

export function deleteSavedRecommendations(savedId: string): void {
  const saved = JSON.parse(localStorage.getItem('simplstream_saved_recommendations') || '[]');
  const filtered = saved.filter((s: any) => s.id !== savedId);
  localStorage.setItem('simplstream_saved_recommendations', JSON.stringify(filtered));
}

// Remove selected data from profile
export function removeProfileData(profileId: string, options: { watchlist?: boolean; watchHistory?: boolean; security?: boolean }): void {
  if (options.watchlist) {
    const watchlist = getWatchlist().filter(w => w.profile_id !== profileId);
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
  }
  
  if (options.watchHistory) {
    const history = getWatchHistory().filter(h => h.profile_id !== profileId);
    localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(history));
    
    const ratings = getRatings().filter(r => r.profile_id !== profileId);
    localStorage.setItem('simplstream_ratings', JSON.stringify(ratings));
  }
  
  if (options.security) {
    const profiles = getProfiles();
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      profile.pin = null;
      profile.security_word = null;
      saveProfile(profile);
    }
  }
}

// Pinned Channels Management
export function getPinnedChannels(profileId: string): string[] {
  const data = localStorage.getItem('simplstream_pinned_channels');
  const pinned = data ? JSON.parse(data) : {};
  return pinned[profileId] || [];
}

export function togglePinnedChannel(profileId: string, channelName: string): void {
  const data = localStorage.getItem('simplstream_pinned_channels');
  const pinned = data ? JSON.parse(data) : {};
  const userPinned = pinned[profileId] || [];
  
  const index = userPinned.indexOf(channelName);
  if (index >= 0) {
    userPinned.splice(index, 1);
  } else {
    userPinned.push(channelName);
  }
  
  pinned[profileId] = userPinned;
  localStorage.setItem('simplstream_pinned_channels', JSON.stringify(pinned));
}

// Simple encryption function (XOR cipher with key rotation)
function encryptData(data: string): string {
  const key = 'xK9mP2nQ7wR4tY8uI3oL6aS1dF5gH0jZ9cV8bN7mM2xK4wQ3pL6rT9yU2iO5aS8dF1gH4jK7zC0vB3nN6mX9qW2eR5tY8uI1oP4lK7aS0dF3gH6jZ9cV2bN5mM8xK1wQ4pL7rT0yU3iO6aS9dF2gH5jK8zC1vB4nN7mX0qW3eR6tY9uI2oP5lK8aS1dF4gH7jZ0';
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    encrypted += String.fromCharCode(charCode);
  }
  return btoa(encrypted); // Base64 encode
}

function decryptData(encrypted: string): string {
  const key = 'xK9mP2nQ7wR4tY8uI3oL6aS1dF5gH0jZ9cV8bN7mM2xK4wQ3pL6rT9yU2iO5aS8dF1gH4jK7zC0vB3nN6mX9qW2eR5tY8uI1oP4lK7aS0dF3gH6jZ9cV2bN5mM8xK1wQ4pL7rT0yU3iO6aS9dF2gH5jK8zC1vB4nN7mX0qW3eR6tY9uI2oP5lK8aS1dF4gH7jZ0';
  const decoded = atob(encrypted); // Base64 decode
  let decrypted = '';
  for (let i = 0; i < decoded.length; i++) {
    const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    decrypted += String.fromCharCode(charCode);
  }
  return decrypted;
}

// Import/Export profile data
export function exportProfileData(profileId: string): string {
  const profile = getProfiles().find(p => p.id === profileId);
  const watchHistory = getWatchHistory(profileId);
  const watchlist = getWatchlist(profileId);
  const ratings = getRatings(profileId);

  const data = {
    profile,
    watchHistory,
    watchlist,
    ratings,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };

  const jsonData = JSON.stringify(data, null, 2);
  return encryptData(jsonData);
}

export function importProfileData(encryptedData: string): boolean {
  try {
    const decrypted = decryptData(encryptedData);
    const data = JSON.parse(decrypted);

    if (!data.profile || !data.version) {
      throw new Error('Invalid data format');
    }

    // Generate new profile ID to avoid conflicts
    const newProfileId = generateId();

    // Save profile with new ID
    const newProfile = { ...data.profile, id: newProfileId };
    saveProfile(newProfile);

    // Import watch history with new profile ID
    if (data.watchHistory && Array.isArray(data.watchHistory)) {
      data.watchHistory.forEach((history: WatchHistory) => {
        saveWatchHistory({ ...history, id: generateId(), profile_id: newProfileId });
      });
    }

    // Import watchlist with new profile ID
    if (data.watchlist && Array.isArray(data.watchlist)) {
      data.watchlist.forEach((item: WatchlistItem) => {
        addToWatchlist({ ...item, id: generateId(), profile_id: newProfileId });
      });
    }

    // Import ratings with new profile ID
    if (data.ratings && Array.isArray(data.ratings)) {
      data.ratings.forEach((rating: any) => {
        saveRating({ ...rating, id: generateId(), profile_id: newProfileId });
      });
    }

    return true;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
}

// Search History Management
export function getSearchHistory(profileId: string): string[] {
  const data = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
  const allHistory = data ? JSON.parse(data) : {};
  return allHistory[profileId] || [];
}

export function addSearchHistory(profileId: string, query: string): void {
  const data = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
  const allHistory = data ? JSON.parse(data) : {};
  const profileHistory = allHistory[profileId] || [];
  
  // Remove duplicate if exists and add to front
  const filtered = profileHistory.filter((q: string) => q.toLowerCase() !== query.toLowerCase());
  filtered.unshift(query);
  
  // Keep only last 20 searches
  allHistory[profileId] = filtered.slice(0, 20);
  localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(allHistory));
}

export function clearSearchHistory(profileId: string): void {
  const data = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
  const allHistory = data ? JSON.parse(data) : {};
  delete allHistory[profileId];
  localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(allHistory));
}

export function getSearchHistoryEnabled(profileId: string): boolean {
  const profiles = getProfiles();
  const profile = profiles.find(p => p.id === profileId);
  return (profile as any).search_history_enabled !== false; // Default to true
}

export function setSearchHistoryEnabled(profileId: string, enabled: boolean): void {
  const profiles = getProfiles();
  const profile = profiles.find(p => p.id === profileId);
  if (profile) {
    (profile as any).search_history_enabled = enabled;
    saveProfile(profile);
  }
}

// Cloak Mode removed - feature discontinued

export function saveProfiles(profiles: Profile[]): void {
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
}

// Security: Profile limit and access tokens
const ACCESS_TOKENS = ['R3k9Mm4zYjB3N1g=', 'OEg2UjA=', 'RERMSDY3']; // Encrypted: 3F12B, 8H6R0, DDLX7

export function isProfileLimitReached(): boolean {
  const profiles = getProfiles();
  return profiles.length >= 10;
}

export function getAccessLockStatus(): boolean {
  return localStorage.getItem('simplstream_access_locked') === 'true';
}

export function setAccessLockStatus(locked: boolean): void {
  if (locked) {
    localStorage.setItem('simplstream_access_locked', 'true');
  } else {
    localStorage.removeItem('simplstream_access_locked');
  }
}

export function verifyAccessToken(token: string): boolean {
  // Decrypt and compare
  const validTokens = ['3F12B', '8H6R0', 'DDLX7'];
  return validTokens.includes(token.toUpperCase());
}

// Failed PIN/Security Word Attempts
export function getFailedAttempts(profileId: string): number {
  const data = localStorage.getItem('simplstream_failed_attempts');
  const attempts = data ? JSON.parse(data) : {};
  return attempts[profileId] || 0;
}

export function incrementFailedAttempts(profileId: string): number {
  const data = localStorage.getItem('simplstream_failed_attempts');
  const attempts = data ? JSON.parse(data) : {};
  attempts[profileId] = (attempts[profileId] || 0) + 1;
  localStorage.setItem('simplstream_failed_attempts', JSON.stringify(attempts));
  
  if (attempts[profileId] >= 5) {
    setAccessLockStatus(true);
  }
  
  return attempts[profileId];
}

export function resetFailedAttempts(profileId: string): void {
  const data = localStorage.getItem('simplstream_failed_attempts');
  const attempts = data ? JSON.parse(data) : {};
  delete attempts[profileId];
  localStorage.setItem('simplstream_failed_attempts', JSON.stringify(attempts));
}

// Custom Avatar Management
export function getCustomAvatar(profileId: string): { url: string; position: { x: number; y: number }; zoom: number } | null {
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_AVATARS);
  const avatars = data ? JSON.parse(data) : {};
  return avatars[profileId] || null;
}

export function saveCustomAvatar(profileId: string, url: string, position: { x: number; y: number }, zoom: number): void {
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_AVATARS);
  const avatars = data ? JSON.parse(data) : {};
  avatars[profileId] = { url, position, zoom };
  localStorage.setItem(STORAGE_KEYS.CUSTOM_AVATARS, JSON.stringify(avatars));
}

export function deleteCustomAvatar(profileId: string): void {
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_AVATARS);
  const avatars = data ? JSON.parse(data) : {};
  delete avatars[profileId];
  localStorage.setItem(STORAGE_KEYS.CUSTOM_AVATARS, JSON.stringify(avatars));
}
