import { useState } from 'react';
import { ArrowLeft, User, Lock, Unlock, Trash2, Search, Moon, Sun, Monitor, Play, Volume2, VolumeX, Eye, EyeOff, UserCog, Shield, Film, Settings, Bell, Palette } from 'lucide-react';
import { Profile } from '../types';
import { useTheme } from '../context/ThemeContext';
import { saveProfile, getSearchHistoryEnabled, setSearchHistoryEnabled, clearSearchHistory, removeProfileData, getCustomAvatar } from '../lib/storage';

interface SettingsViewProps {
  profile: Profile;
  onBack: () => void;
  onProfileUpdate: () => void;
  onLogout: () => void;
}

// Settings storage helpers
function getHeroAutoplayEnabled(): boolean {
  return localStorage.getItem('simplstream_hero_autoplay') !== 'false';
}

function setHeroAutoplayEnabled(enabled: boolean): void {
  localStorage.setItem('simplstream_hero_autoplay', enabled ? 'true' : 'false');
}

function getHeroMuted(): boolean {
  return localStorage.getItem('simplstream_hero_muted') !== 'false';
}

function setHeroMuted(muted: boolean): void {
  localStorage.setItem('simplstream_hero_muted', muted ? 'true' : 'false');
}

export { getHeroAutoplayEnabled, setHeroAutoplayEnabled, getHeroMuted, setHeroMuted };

export function SettingsView({ profile, onBack, onProfileUpdate, onLogout }: SettingsViewProps) {
  const { effectiveTheme, theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<'general' | 'profile' | 'playback' | 'privacy' | 'data'>('general');
  
  // Profile settings
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [newName, setNewName] = useState(profile.name);
  const [newColor, setNewColor] = useState(profile.avatar_color);
  
  // Passcode settings
  const [showPasscodeModal, setShowPasscodeModal] = useState<'add' | 'change' | 'remove' | null>(null);
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [securityWord, setSecurityWord] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  
  // Privacy settings
  const [searchHistoryEnabled, setSearchHistoryEnabledState] = useState(getSearchHistoryEnabled(profile.id));
  
  // Playback settings
  const [heroAutoplay, setHeroAutoplay] = useState(getHeroAutoplayEnabled());
  const [heroMuted, setHeroMutedState] = useState(getHeroMuted());
  
  // Data removal
  const [showRemoveData, setShowRemoveData] = useState(false);
  const [removeWatchlist, setRemoveWatchlist] = useState(false);
  const [removeHistory, setRemoveHistory] = useState(false);
  const [removeSecurity, setRemoveSecurity] = useState(false);

  const bgClass = effectiveTheme === 'dark' ? 'bg-black' : 'bg-gray-50';
  const textClass = effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900';
  const cardClass = effectiveTheme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200';
  const secondaryTextClass = effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  function handleSaveProfile() {
    const updatedProfile = { ...profile, name: newName, avatar_color: newColor };
    saveProfile(updatedProfile);
    setShowProfileSettings(false);
    onProfileUpdate();
  }

  function handlePasscodeAction() {
    if (showPasscodeModal === 'add') {
      if (newPasscode.length !== 4 || newPasscode !== confirmPasscode) {
        alert('Passcodes must be 4 digits and match');
        return;
      }
      if (!securityWord.trim()) {
        alert('Security word is required');
        return;
      }
      const updatedProfile = { ...profile, pin: newPasscode, security_word: securityWord };
      saveProfile(updatedProfile);
      onProfileUpdate();
    } else if (showPasscodeModal === 'change') {
      if (newPasscode.length !== 4 || newPasscode !== confirmPasscode) {
        alert('Passcodes must be 4 digits and match');
        return;
      }
      const updatedProfile = { ...profile, pin: newPasscode };
      saveProfile(updatedProfile);
      onProfileUpdate();
    } else if (showPasscodeModal === 'remove') {
      const updatedProfile = { ...profile, pin: null, security_word: null };
      saveProfile(updatedProfile);
      onProfileUpdate();
    }
    setShowPasscodeModal(null);
    setNewPasscode('');
    setConfirmPasscode('');
    setSecurityWord('');
  }

  function handleToggleSearchHistory() {
    const newEnabled = !searchHistoryEnabled;
    setSearchHistoryEnabled(profile.id, newEnabled);
    setSearchHistoryEnabledState(newEnabled);
    if (!newEnabled) {
      clearSearchHistory(profile.id);
    }
    onProfileUpdate();
  }

  function handleHeroAutoplayToggle() {
    const newValue = !heroAutoplay;
    setHeroAutoplay(newValue);
    setHeroAutoplayEnabled(newValue);
  }

  function handleHeroMutedToggle() {
    const newValue = !heroMuted;
    setHeroMutedState(newValue);
    setHeroMuted(newValue);
  }

  function handleRemoveData() {
    if (!removeWatchlist && !removeHistory && !removeSecurity) {
      return;
    }
    
    removeProfileData(profile.id, { 
      watchlist: removeWatchlist, 
      watchHistory: removeHistory, 
      security: removeSecurity 
    });
    
    if (removeHistory) {
      clearSearchHistory(profile.id);
    }
    
    setShowRemoveData(false);
    setRemoveWatchlist(false);
    setRemoveHistory(false);
    setRemoveSecurity(false);
    onProfileUpdate();
  }

  const sections = [
    { id: 'general', icon: Settings, label: 'General' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'playback', icon: Play, label: 'Playback' },
    { id: 'privacy', icon: Shield, label: 'Privacy' },
    { id: 'data', icon: Trash2, label: 'Data' },
  ] as const;

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} pb-8`}>
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${effectiveTheme === 'dark' ? 'glass-header' : 'glass-header-light'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button onClick={onBack} className={`flex items-center gap-2 ${textClass} hover:text-blue-400 transition-colors`}>
            <ArrowLeft size={22} />
            <span className="font-medium hidden sm:inline">Back</span>
          </button>
          <h1 className="logo-text text-lg sm:text-xl"><span className="text-blue-500">Simpl</span>Stream</h1>
          <div className="w-16 sm:w-20"></div>
        </div>
      </div>

      <div className="pt-16 sm:pt-20 px-4 sm:px-6 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Settings Title */}
          <h1 className={`text-2xl sm:text-3xl font-bold mb-6 ${textClass}`}>Settings</h1>
          
          {/* Profile Card */}
          <div className={`${effectiveTheme === 'dark' ? 'settings-card' : 'settings-card-light'} p-4 sm:p-6 mb-6`}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg overflow-hidden ring-2 ring-blue-500/30"
                style={{ backgroundColor: profile.avatar_color }}
              >
                {(() => {
                  const avatar = getCustomAvatar(profile.id);
                  if (avatar?.url) {
                    return (
                      <img
                        src={avatar.url}
                        alt={`${profile.name} avatar`}
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: `${avatar.position.x}% ${avatar.position.y}%`,
                          transform: `scale(${Math.max(1, avatar.zoom)})`,
                        }}
                      />
                    );
                  }
                  return profile.name[0].toUpperCase();
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className={`text-lg sm:text-xl font-bold ${textClass} truncate`}>{profile.name}</h2>
                <p className={`text-sm ${secondaryTextClass}`}>
                  {profile.pin ? '🔒 Protected with PIN' : '🔓 No PIN protection'}
                </p>
              </div>
              <button 
                onClick={onLogout}
                className="px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Settings Navigation - Scrollable on mobile */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold transition-all whitespace-nowrap text-sm ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : effectiveTheme === 'dark'
                    ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                    : 'bg-black/5 text-gray-700 hover:bg-black/10'
                }`}
              >
                <section.icon size={16} />
                {section.label}
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className={`${effectiveTheme === 'dark' ? 'settings-card' : 'settings-card-light'} overflow-hidden`}>
            {activeSection === 'general' && (
              <div className="divide-y divide-gray-800">
                <div className="p-6">
                  <h3 className={`text-lg font-bold mb-4 ${textClass}`}>Appearance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Palette size={20} className={secondaryTextClass} />
                        <div>
                          <p className={textClass}>Theme</p>
                          <p className={`text-sm ${secondaryTextClass}`}>Choose your preferred color scheme</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {(['light', 'dark', 'system'] as const).map((themeOption) => (
                          <button
                            key={themeOption}
                            onClick={() => setTheme(themeOption)}
                            className={`p-2 rounded-lg transition-all ${
                              theme === themeOption
                                ? 'bg-blue-600 text-white'
                                : effectiveTheme === 'dark'
                                ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                            title={themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                          >
                            {themeOption === 'light' && <Sun size={18} />}
                            {themeOption === 'dark' && <Moon size={18} />}
                            {themeOption === 'system' && <Monitor size={18} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="divide-y divide-gray-800">
                <div className="p-6">
                  <h3 className={`text-lg font-bold mb-4 ${textClass}`}>Profile Settings</h3>
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowProfileSettings(true)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg ${
                        effectiveTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      <div className="flex items-center gap-3">
                        <UserCog size={20} className={secondaryTextClass} />
                        <div className="text-left">
                          <p className={textClass}>Edit Profile</p>
                          <p className={`text-sm ${secondaryTextClass}`}>Change name and avatar color</p>
                        </div>
                      </div>
                      <ArrowLeft size={18} className={`${secondaryTextClass} rotate-180`} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className={`text-lg font-bold mb-4 ${textClass}`}>Security</h3>
                  <div className="space-y-4">
                    {!profile.pin ? (
                      <button
                        onClick={() => setShowPasscodeModal('add')}
                        className={`w-full flex items-center justify-between p-4 rounded-lg ${
                          effectiveTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                        } transition-colors`}
                      >
                        <div className="flex items-center gap-3">
                          <Lock size={20} className="text-green-500" />
                          <div className="text-left">
                            <p className={textClass}>Add Passcode</p>
                            <p className={`text-sm ${secondaryTextClass}`}>Protect your profile with a 4-digit PIN</p>
                          </div>
                        </div>
                        <ArrowLeft size={18} className={`${secondaryTextClass} rotate-180`} />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setShowPasscodeModal('change')}
                          className={`w-full flex items-center justify-between p-4 rounded-lg ${
                            effectiveTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                          } transition-colors`}
                        >
                          <div className="flex items-center gap-3">
                            <Lock size={20} className="text-blue-500" />
                            <div className="text-left">
                              <p className={textClass}>Change Passcode</p>
                              <p className={`text-sm ${secondaryTextClass}`}>Update your 4-digit PIN</p>
                            </div>
                          </div>
                          <ArrowLeft size={18} className={`${secondaryTextClass} rotate-180`} />
                        </button>
                        <button
                          onClick={() => setShowPasscodeModal('remove')}
                          className={`w-full flex items-center justify-between p-4 rounded-lg ${
                            effectiveTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                          } transition-colors`}
                        >
                          <div className="flex items-center gap-3">
                            <Unlock size={20} className="text-red-500" />
                            <div className="text-left">
                              <p className={textClass}>Remove Passcode</p>
                              <p className={`text-sm ${secondaryTextClass}`}>Remove PIN protection from profile</p>
                            </div>
                          </div>
                          <ArrowLeft size={18} className={`${secondaryTextClass} rotate-180`} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'playback' && (
              <div className="divide-y divide-gray-800">
                <div className="p-6">
                  <h3 className={`text-lg font-bold mb-4 ${textClass}`}>Hero Trailer</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <Play size={20} className={secondaryTextClass} />
                        <div>
                          <p className={textClass}>Auto-play Trailers</p>
                          <p className={`text-sm ${secondaryTextClass}`}>Automatically play trailers in hero section</p>
                        </div>
                      </div>
                      <button
                        onClick={handleHeroAutoplayToggle}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          heroAutoplay ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          heroAutoplay ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        {heroMuted ? <VolumeX size={20} className={secondaryTextClass} /> : <Volume2 size={20} className={secondaryTextClass} />}
                        <div>
                          <p className={textClass}>Mute Trailers</p>
                          <p className={`text-sm ${secondaryTextClass}`}>Play trailers without sound</p>
                        </div>
                      </div>
                      <button
                        onClick={handleHeroMutedToggle}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          heroMuted ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          heroMuted ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>
                    <p className={`text-xs ${secondaryTextClass} mt-2`}>
                      💡 Tip: Double-click the hero banner to toggle between trailer and poster
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="divide-y divide-gray-800">
                <div className="p-6">
                  <h3 className={`text-lg font-bold mb-4 ${textClass}`}>Privacy Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <Search size={20} className={secondaryTextClass} />
                        <div>
                          <p className={textClass}>Search History</p>
                          <p className={`text-sm ${secondaryTextClass}`}>Save your search queries for quick access</p>
                        </div>
                      </div>
                      <button
                        onClick={handleToggleSearchHistory}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          searchHistoryEnabled ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          searchHistoryEnabled ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="divide-y divide-gray-800">
                <div className="p-6">
                  <h3 className={`text-lg font-bold mb-4 ${textClass}`}>Data Management</h3>
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowRemoveData(true)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg ${
                        effectiveTheme === 'dark' ? 'bg-red-900/20 hover:bg-red-900/30' : 'bg-red-50 hover:bg-red-100'
                      } transition-colors border border-red-500/30`}
                    >
                      <div className="flex items-center gap-3">
                        <Trash2 size={20} className="text-red-500" />
                        <div className="text-left">
                          <p className="text-red-500 font-medium">Remove Profile Data</p>
                          <p className={`text-sm ${secondaryTextClass}`}>Delete watchlist, history, or security settings</p>
                        </div>
                      </div>
                      <ArrowLeft size={18} className="text-red-500 rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className={`${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-8 max-w-md w-full`}>
            <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>Edit Profile</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter name"
              className={`w-full px-4 py-3 rounded-lg ${effectiveTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border ${textClass} placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4`}
            />
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${textClass}`}>Choose Color</label>
              <div className="grid grid-cols-8 gap-2">
                {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={`w-10 h-10 rounded-lg transition-all ${newColor === color ? 'ring-4 ring-blue-500 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowProfileSettings(false)} className={`flex-1 px-6 py-3 ${effectiveTheme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg font-medium transition-colors`}>
                Cancel
              </button>
              <button onClick={handleSaveProfile} className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Passcode Modal */}
      {showPasscodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className={`${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-8 max-w-md w-full`}>
            <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>
              {showPasscodeModal === 'add' ? 'Add Passcode' : showPasscodeModal === 'change' ? 'Change Passcode' : 'Remove Passcode'}
            </h2>
            {showPasscodeModal !== 'remove' && (
              <>
                <div className="relative mb-4">
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    maxLength={4}
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 4-digit passcode"
                    className={`w-full px-4 py-3 pr-12 text-center text-2xl tracking-widest rounded-lg ${effectiveTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border ${textClass} placeholder-gray-400 focus:outline-none focus:border-blue-500`}
                  />
                  <button
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasscode ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <input
                  type={showPasscode ? 'text' : 'password'}
                  maxLength={4}
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Confirm passcode"
                  className={`w-full px-4 py-3 text-center text-2xl tracking-widest rounded-lg ${effectiveTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border ${textClass} placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4`}
                />
                {showPasscodeModal === 'add' && (
                  <input
                    type="text"
                    value={securityWord}
                    onChange={(e) => setSecurityWord(e.target.value)}
                    placeholder="Security word (backup code)"
                    className={`w-full px-4 py-3 rounded-lg ${effectiveTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border ${textClass} placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4`}
                  />
                )}
              </>
            )}
            {showPasscodeModal === 'remove' && (
              <p className={`mb-6 ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Are you sure you want to remove your passcode? Your profile will no longer be protected.
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowPasscodeModal(null)} className={`flex-1 px-6 py-3 ${effectiveTheme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg font-medium transition-colors`}>
                Cancel
              </button>
              <button onClick={handlePasscodeAction} className={`flex-1 px-6 py-3 ${showPasscodeModal === 'remove' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg font-medium transition-colors`}>
                {showPasscodeModal === 'remove' ? 'Remove' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Data Modal */}
      {showRemoveData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className={`${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-8 max-w-md w-full`}>
            <h2 className={`text-2xl font-bold mb-4 ${textClass}`}>Remove Profile Data</h2>
            <p className={`mb-6 ${secondaryTextClass}`}>
              Select which data you want to permanently delete:
            </p>
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/50">
                <input
                  type="checkbox"
                  checked={removeWatchlist}
                  onChange={(e) => setRemoveWatchlist(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className={textClass}>Watchlist</span>
                  <p className={`text-sm ${secondaryTextClass}`}>Remove all saved items</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/50">
                <input
                  type="checkbox"
                  checked={removeHistory}
                  onChange={(e) => setRemoveHistory(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className={textClass}>Watch & Search History</span>
                  <p className={`text-sm ${secondaryTextClass}`}>Clear all viewing and search data</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/50">
                <input
                  type="checkbox"
                  checked={removeSecurity}
                  onChange={(e) => setRemoveSecurity(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className={textClass}>Security Settings</span>
                  <p className={`text-sm ${secondaryTextClass}`}>Remove PIN & security word</p>
                </div>
              </label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRemoveData(false)} className={`flex-1 px-6 py-3 ${effectiveTheme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg font-medium transition-colors`}>
                Cancel
              </button>
              <button
                onClick={handleRemoveData}
                disabled={!removeWatchlist && !removeHistory && !removeSecurity}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
