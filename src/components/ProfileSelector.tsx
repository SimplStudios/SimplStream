import { useState, useEffect } from 'react';
import { Plus, Upload, Download, Trash2, X, Lock, AlertCircle, Info, Move } from 'lucide-react';
import { Profile } from '../types';
import { getProfiles, saveProfile, deleteProfile, deleteAllData, generateId, importProfileData, exportProfileData, removeProfileData, getCustomAvatar, saveCustomAvatar, deleteCustomAvatar } from '../lib/storage';
import { useTheme } from '../context/ThemeContext';
import { toast } from '@/hooks/use-toast';

interface ProfileSelectorProps {
  onSelectProfile: (profile: Profile) => void;
}

interface AttemptLock {
  count: number;
  lockedUntil: number | null;
  type: 'pin' | 'security';
}

export function ProfileSelector({ onSelectProfile }: ProfileSelectorProps) {
  const [profiles, setProfiles] = useState<Profile[]>(() => getProfiles());
  const [showCreate, setShowCreate] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState<Profile | null>(null);
  const [pinEntryAction, setPinEntryAction] = useState<'select' | 'export' | 'delete'>('select');
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileColor, setNewProfileColor] = useState('#3B82F6');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [avatarPosition, setAvatarPosition] = useState({ x: 50, y: 50 });
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [showAvatarInfo, setShowAvatarInfo] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [pinEntry, setPinEntry] = useState('');
  const [showImportExport, setShowImportExport] = useState(false);
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [securityWordEntry, setSecurityWordEntry] = useState('');
  const [showPinReveal, setShowPinReveal] = useState(false);
  const [revealedPin, setRevealedPin] = useState('');
  const [attemptLock, setAttemptLock] = useState<AttemptLock>({ count: 0, lockedUntil: null, type: 'pin' });
  const [showIncorrectPin, setShowIncorrectPin] = useState(false);
  const { effectiveTheme } = useTheme();

  useEffect(() => {
    if (attemptLock.lockedUntil) {
      const timer = setInterval(() => {
        if (Date.now() >= attemptLock.lockedUntil!) {
          setAttemptLock({ count: 0, lockedUntil: null, type: attemptLock.type });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [attemptLock]);

  function handleCreateProfile() {
    if (!newProfileName.trim()) return;

    const profileToSave = editingProfile || {
      id: generateId(),
      name: newProfileName.trim(),
      avatar_color: newProfileColor,
      pin: null,
      security_word: null,
      ads_removed: false,
      created_at: new Date().toISOString()
    };

    if (editingProfile) {
      profileToSave.name = newProfileName.trim();
      profileToSave.avatar_color = newProfileColor;
    }

    saveProfile(profileToSave);

    if (customAvatarUrl) {
      saveCustomAvatar(profileToSave.id, customAvatarUrl, avatarPosition, avatarZoom);
    } else if (editingProfile) {
      deleteCustomAvatar(profileToSave.id);
    }

    setProfiles(getProfiles());
    setShowCreate(false);
    setEditingProfile(null);
    setNewProfileName('');
    setNewProfileColor('#3B82F6');
    setCustomAvatarUrl('');
    setAvatarPosition({ x: 50, y: 50 });
    setAvatarZoom(1);
  }

  function handleSelectProfile(profile: Profile) {
    if (profile.pin) {
      setShowPinEntry(profile);
      setPinEntryAction('select');
      setAttemptLock({ count: 0, lockedUntil: null, type: 'pin' });
      setShowIncorrectPin(false);
    } else {
      onSelectProfile(profile);
    }
  }

  function handlePinSubmit() {
    if (attemptLock.lockedUntil && Date.now() < attemptLock.lockedUntil) {
      const remainingSeconds = Math.ceil((attemptLock.lockedUntil - Date.now()) / 1000);
      toast({
        title: "Account Locked",
        description: `Please wait ${remainingSeconds} seconds before trying again.`,
        variant: "destructive"
      });
      return;
    }

    if (!showPinEntry || pinEntry !== showPinEntry.pin) {
      const newCount = attemptLock.count + 1;
      
      // Show incorrect feedback
      setShowIncorrectPin(true);
      setTimeout(() => setShowIncorrectPin(false), 2000);
      
      // Trigger shake animation
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        dialog.classList.add('shake-animation');
        setTimeout(() => dialog.classList.remove('shake-animation'), 500);
      }
      
      if (newCount >= 3) {
        const lockDuration = attemptLock.count === 0 ? 60000 : 30000; // First lock: 60s, subsequent: 30s
        setAttemptLock({
          count: newCount,
          lockedUntil: Date.now() + lockDuration,
          type: 'pin'
        });
        toast({
          title: "Too Many Attempts",
          description: `Account locked for ${lockDuration / 1000} seconds. Enter security word to continue.`,
          variant: "destructive"
        });
        
        // Show forgot pin if security word exists
        if (showPinEntry.security_word) {
          setShowForgotPin(true);
          setShowPinEntry(null);
        }
      } else {
        setAttemptLock({ ...attemptLock, count: newCount });
        toast({
          title: "Incorrect PIN",
          description: `${3 - newCount} attempts remaining`,
          variant: "destructive"
        });
      }
      
      setPinEntry('');
      return;
    }

    // Success
    setAttemptLock({ count: 0, lockedUntil: null, type: 'pin' });
    
    if (pinEntryAction === 'select') {
      onSelectProfile(showPinEntry);
    } else if (pinEntryAction === 'export') {
      exportProfile(showPinEntry.id);
      setShowPinEntry(null);
      setPinEntry('');
    } else if (pinEntryAction === 'delete') {
      deleteProfile(showPinEntry.id);
      setProfiles(getProfiles());
      setShowPinEntry(null);
      setPinEntry('');
    }
  }

  function handleSecurityWordSubmit() {
    if (attemptLock.type === 'security' && attemptLock.lockedUntil && Date.now() < attemptLock.lockedUntil) {
      const remainingSeconds = Math.ceil((attemptLock.lockedUntil - Date.now()) / 1000);
      toast({
        title: "Account Locked",
        description: `Please wait ${remainingSeconds} seconds before trying again.`,
        variant: "destructive"
      });
      return;
    }

    const profile = profiles.find(p => p.security_word === securityWordEntry.trim());
    
    if (profile && profile.pin) {
      // Success - show PIN popup
      setRevealedPin(profile.pin);
      setShowPinReveal(true);
      setShowForgotPin(false);
      setSecurityWordEntry('');
      setAttemptLock({ count: 0, lockedUntil: null, type: 'pin' });
    } else {
      const newCount = attemptLock.type === 'security' ? attemptLock.count + 1 : 1;
      
      if (newCount >= 3) {
        const lockDuration = 60000; // 60 seconds
        setAttemptLock({
          count: newCount,
          lockedUntil: Date.now() + lockDuration,
          type: 'security'
        });
        toast({
          title: "Too Many Attempts",
          description: `Account locked for ${lockDuration / 1000} seconds.`,
          variant: "destructive"
        });
      } else {
        setAttemptLock({ count: newCount, lockedUntil: null, type: 'security' });
        toast({
          title: "Incorrect Security Word",
          description: `${3 - newCount} attempts remaining`,
          variant: "destructive"
        });
      }
    }
  }

  function handleDeleteProfile(profile: Profile) {
    if (profile.pin) {
      setShowPinEntry(profile);
      setPinEntryAction('delete');
    } else {
      if (confirm('Are you sure you want to delete this profile? This cannot be undone.')) {
        deleteProfile(profile.id);
        setProfiles(getProfiles());
      }
    }
  }

  function handleExport(profile: Profile) {
    if (profile.pin) {
      setShowPinEntry(profile);
      setPinEntryAction('export');
    } else {
      alert('Set a profile PIN first to export data securely. Go to Edit Profile > Add Passcode.');
    }
  }

  function exportProfile(profileId: string) {
    const data = exportProfileData(profileId);
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simplstream-profile-${Date.now()}.ssp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ssp,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (importProfileData(content)) {
            setProfiles(getProfiles());
            alert('Profile imported successfully!');
          } else {
            alert('Failed to import profile. Invalid or corrupted file.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  function handleDeleteAll() {
    if (confirm('Delete ALL profiles and data? This cannot be undone!')) {
      if (confirm('Are you absolutely sure? This will delete everything!')) {
        deleteAllData();
        setProfiles([]);
      }
    }
  }

  const bgClass = effectiveTheme === 'dark' ? 'bg-black' : 'bg-gray-50';
  const textClass = effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900';

  const getLockMessage = () => {
    if (!attemptLock.lockedUntil || Date.now() >= attemptLock.lockedUntil) return null;
    const remainingSeconds = Math.ceil((attemptLock.lockedUntil - Date.now()) / 1000);
    return `Locked for ${remainingSeconds}s`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 4k:p-8 relative overflow-hidden bg-black">
      {/* Moving Aurora Background */}
      <div className="aurora-bg fixed inset-0 z-0 pointer-events-none" />
      
      <div className="relative z-10 text-center mb-8 sm:mb-12 4k:mb-24">
        <h1 className="logo-text text-4xl sm:text-6xl 4k:text-9xl mb-3 sm:mb-4 4k:mb-8 animate-fade-in text-white">
          <span className="text-blue-500">Simpl</span>Stream
        </h1>
        <p className="text-base sm:text-lg 4k:text-4xl text-gray-400 animate-fade-in font-medium tracking-wide">
          Who's watching?
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6 4k:gap-16 mb-6 sm:mb-8 4k:mb-16 px-2">
        {profiles.map((profile) => (
          <div key={profile.id} className="relative group">
            <button
              onClick={() => handleSelectProfile(profile)}
              className="flex flex-col items-center gap-2 sm:gap-3 4k:gap-6 p-3 sm:p-5 4k:p-12 rounded-xl 4k:rounded-3xl transition-all duration-300 hover-lift hover:bg-white/5 w-full"
            >
              <div className="relative avatar-ring">
                <div
                  className="w-16 h-16 sm:w-28 sm:h-28 4k:w-64 4k:h-64 rounded-full flex items-center justify-center text-white text-xl sm:text-3xl 4k:text-8xl font-bold shadow-2xl transition-transform duration-300 group-hover:scale-105 overflow-hidden ring-2 ring-white/10"
                  style={{ backgroundColor: profile.avatar_color }}
                >
                  {(() => {
                    const customAvatar = getCustomAvatar(profile.id);
                    if (customAvatar) {
                      return (
                        <img
                          src={customAvatar.url}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                          style={{
                            transform: `scale(${customAvatar.zoom})`,
                            objectPosition: `${customAvatar.position.x}% ${customAvatar.position.y}%`
                          }}
                        />
                      );
                    }
                    return profile.name[0].toUpperCase();
                  })()}
                </div>
                {profile.pin && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 4k:-top-4 4k:-right-4 bg-blue-500 rounded-full p-1 sm:p-1.5 4k:p-4 shadow-lg shadow-blue-500/30">
                    <Lock size={10} className="sm:w-3 sm:h-3 4k:w-8 4k:h-8 text-white" />
                  </div>
                )}
              </div>
              <span className="text-sm sm:text-lg 4k:text-4xl font-semibold text-white truncate max-w-full">{profile.name}</span>
            </button>
            <div className="absolute top-0 right-0 flex gap-1 4k:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExport(profile);
                }}
                className="p-2 4k:p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs 4k:text-xl"
              >
                <Download size={16} className="4k:w-8 4k:h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProfile(profile);
                }}
                className="p-2 4k:p-4 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs 4k:text-xl"
              >
                <Trash2 size={16} className="4k:w-8 4k:h-8" />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => setShowCreate(true)}
          className="flex flex-col items-center gap-2 sm:gap-3 4k:gap-6 p-3 sm:p-5 4k:p-12 rounded-xl 4k:rounded-3xl transition-all duration-300 hover-lift hover:bg-white/5 group w-full"
        >
          <div className="w-16 h-16 sm:w-28 sm:h-28 4k:w-64 4k:h-64 rounded-full flex items-center justify-center bg-gray-800/80 transition-all duration-300 group-hover:bg-blue-600/20 group-hover:ring-2 group-hover:ring-blue-500/50 shadow-xl ring-2 ring-white/5">
            <Plus size={24} className="sm:w-10 sm:h-10 4k:w-24 4k:h-24 text-gray-400 group-hover:text-blue-400 transition-all duration-300 group-hover:rotate-90" />
          </div>
          <span className="text-sm sm:text-lg 4k:text-4xl font-semibold text-gray-400 group-hover:text-white transition-colors">Add Profile</span>
        </button>
      </div>

      <div className="relative z-10 flex flex-wrap justify-center gap-4 4k:gap-8">
        <button
          onClick={() => setShowImportExport(!showImportExport)}
          className="px-6 py-3 4k:px-12 4k:py-6 bg-gray-800 hover:bg-gray-700 text-white rounded-lg 4k:rounded-2xl font-medium transition-colors text-sm sm:text-base 4k:text-3xl"
        >
          Import/Export
        </button>
      </div>

      {showImportExport && (
        <div className="relative z-50 mt-4 4k:mt-8 flex gap-4 4k:gap-8">
          <button
            onClick={handleImport}
            className="px-6 py-3 4k:px-12 4k:py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 4k:rounded-2xl font-medium transition-colors flex items-center gap-2 4k:gap-4 text-sm sm:text-base 4k:text-3xl"
          >
            <Upload size={20} className="4k:w-10 4k:h-10" />
            Import Profile
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className={`relative z-10 mt-12 4k:mt-24 text-center text-gray-400 text-sm 4k:text-2xl`}>
        <p>© {new Date().getFullYear()} SimplStream by SimplStudios. Created by Andy "Apple". All rights reserved.</p>
      </footer>

      {/* Create Profile Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 4k:p-8">
          <div className={`${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-2xl 4k:rounded-[3rem] p-8 4k:p-16 max-w-md 4k:max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6 4k:mb-12">
              <h2 className={`text-2xl 4k:text-6xl font-bold ${textClass}`}>
                {editingProfile ? 'Edit Profile' : 'Create Profile'}
              </h2>
              <button 
                onClick={() => {
                  setShowCreate(false);
                  setEditingProfile(null);
                  setNewProfileName('');
                  setNewProfileColor('#3B82F6');
                  setCustomAvatarUrl('');
                  setAvatarPosition({ x: 50, y: 50 });
                  setAvatarZoom(1);
                }} 
                className={effectiveTheme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
              >
                <X size={24} className="4k:w-12 4k:h-12" />
              </button>
            </div>
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Enter name"
              className={`w-full px-4 py-3 4k:px-8 4k:py-6 4k:text-3xl rounded-lg 4k:rounded-2xl ${effectiveTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border ${textClass} placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4 4k:mb-8`}
            />
            <div className="mb-4 4k:mb-8">
              <label className={`block text-sm 4k:text-3xl font-medium mb-2 4k:mb-4 ${textClass}`}>Choose Color</label>
              <div className="grid grid-cols-8 gap-2 4k:gap-4">
                {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewProfileColor(color)}
                    className={`w-10 h-10 4k:w-20 4k:h-20 rounded-lg 4k:rounded-2xl transition-all ${newProfileColor === color ? 'ring-4 4k:ring-8 ring-blue-500 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            {/* Custom Avatar Upload */}
            <div className="mb-4 4k:mb-8">
              <div className="flex items-center gap-2 mb-2 4k:mb-4">
                <label className={`block text-sm 4k:text-3xl font-medium ${textClass}`}>Custom Avatar (Optional)</label>
                <button
                  onClick={() => setShowAvatarInfo(!showAvatarInfo)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <Info size={16} className="4k:w-8 4k:h-8" />
                </button>
              </div>
              
              {showAvatarInfo && (
                <div className={`mb-3 p-3 4k:p-6 rounded-lg text-xs 4k:text-2xl ${effectiveTheme === 'dark' ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'} border`}>
                  <p className={effectiveTheme === 'dark' ? 'text-blue-300' : 'text-blue-800'}>
                    1. Upload your image to <a href="https://uploadimgur.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">uploadimgur.com</a><br />
                    2. Copy the direct image link (ends in .jpg, .png, etc.)<br />
                    3. Paste it below and adjust position & zoom
                  </p>
                </div>
              )}
              
              <input
                type="text"
                value={customAvatarUrl}
                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                placeholder="https://i.imgur.com/example.jpg"
                className={`w-full px-4 py-3 4k:px-8 4k:py-6 4k:text-3xl rounded-lg 4k:rounded-2xl ${effectiveTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border ${textClass} placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-3 4k:mb-6`}
              />
              
              {customAvatarUrl && (
                <div className="space-y-3 4k:space-y-6">
                  <div className="flex items-center justify-center mb-3">
                    <div 
                      className="w-32 h-32 4k:w-64 4k:h-64 rounded-full overflow-hidden border-4 4k:border-8 border-blue-500"
                      style={{ backgroundColor: newProfileColor }}
                    >
                      <img
                        src={customAvatarUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        style={{
                          transform: `scale(${avatarZoom})`,
                          objectPosition: `${avatarPosition.x}% ${avatarPosition.y}%`
                        }}
                        onError={() => setCustomAvatarUrl('')}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-xs 4k:text-2xl font-medium mb-1 4k:mb-2 ${textClass} flex items-center gap-2`}>
                      <Move size={14} className="4k:w-6 4k:h-6" />
                      Horizontal Position: {avatarPosition.x}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={avatarPosition.x}
                      onChange={(e) => setAvatarPosition({ ...avatarPosition, x: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-xs 4k:text-2xl font-medium mb-1 4k:mb-2 ${textClass} flex items-center gap-2`}>
                      <Move size={14} className="4k:w-6 4k:h-6" />
                      Vertical Position: {avatarPosition.y}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={avatarPosition.y}
                      onChange={(e) => setAvatarPosition({ ...avatarPosition, y: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-xs 4k:text-2xl font-medium mb-1 4k:mb-2 ${textClass}`}>
                      Zoom: {avatarZoom.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={avatarZoom}
                      onChange={(e) => setAvatarZoom(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleCreateProfile}
              className="w-full px-6 py-3 4k:px-12 4k:py-6 4k:text-3xl bg-blue-600 hover:bg-blue-700 text-white rounded-lg 4k:rounded-2xl font-medium transition-colors"
            >
              {editingProfile ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* PIN Entry Modal */}
      {showPinEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 4k:p-8">
          <div className={`${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-2xl 4k:rounded-[3rem] p-8 4k:p-16 max-w-md 4k:max-w-4xl w-full`}>
            <div className="flex justify-between items-center mb-6 4k:mb-12">
              <h2 className={`text-2xl 4k:text-6xl font-bold ${textClass}`}>
                {pinEntryAction === 'select' ? 'Enter PIN' : pinEntryAction === 'export' ? 'Enter PIN to Export' : 'Enter PIN to Delete'}
              </h2>
              <button onClick={() => {
                setShowPinEntry(null);
                setPinEntry('');
                setAttemptLock({ count: 0, lockedUntil: null, type: 'pin' });
              }} className={effectiveTheme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
                <X size={24} className="4k:w-12 4k:h-12" />
              </button>
            </div>
            
            {getLockMessage() && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-500 text-sm font-semibold">{getLockMessage()}</p>
              </div>
            )}
            
            {showIncorrectPin && !getLockMessage() && (
              <div className="mb-2 text-center">
                <p className="text-red-500 font-bold text-lg animate-pulse">Incorrect PIN</p>
              </div>
            )}
            
            <input
              type="password"
              maxLength={4}
              value={pinEntry}
              onChange={(e) => setPinEntry(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 4-digit PIN"
              disabled={!!(attemptLock.lockedUntil && Date.now() < attemptLock.lockedUntil)}
              className={`w-full px-4 py-3 4k:px-8 4k:py-6 rounded-lg 4k:rounded-2xl ${effectiveTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border ${textClass} text-center text-2xl 4k:text-6xl tracking-widest placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-2 4k:mb-4 disabled:opacity-50`}
            />
            {pinEntryAction === 'select' && showPinEntry?.security_word && (
              <button
                onClick={() => {
                  setShowForgotPin(true);
                  setShowPinEntry(null);
                  setPinEntry('');
                }}
                className={`text-sm 4k:text-2xl underline mb-4 4k:mb-8 ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'}`}
              >
                Forgot PIN?
              </button>
            )}
            <button
              onClick={handlePinSubmit}
              disabled={!!(attemptLock.lockedUntil && Date.now() < attemptLock.lockedUntil)}
              className="w-full px-6 py-3 4k:px-12 4k:py-6 4k:text-3xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg 4k:rounded-2xl font-medium transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Forgot PIN Modal */}
      {showForgotPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 4k:p-8">
          <div className={`${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-2xl 4k:rounded-[3rem] p-8 4k:p-16 max-w-md 4k:max-w-4xl w-full`}>
            <div className="flex justify-between items-center mb-6 4k:mb-12">
              <h2 className={`text-2xl 4k:text-6xl font-bold ${textClass}`}>Forgot PIN?</h2>
              <button onClick={() => {
                setShowForgotPin(false);
                setSecurityWordEntry('');
                setAttemptLock({ count: 0, lockedUntil: null, type: 'pin' });
              }} className={effectiveTheme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
                <X size={24} className="4k:w-12 4k:h-12" />
              </button>
            </div>
            
            {getLockMessage() && attemptLock.type === 'security' && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-500 text-sm font-semibold">{getLockMessage()}</p>
              </div>
            )}
            
            <p className={`text-sm 4k:text-3xl mb-4 4k:mb-8 ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              If you forgot your PIN, you can recover it using your security word. Warning: This will reveal your PIN. Make sure no one is watching!
            </p>
            <input
              type="text"
              value={securityWordEntry}
              onChange={(e) => setSecurityWordEntry(e.target.value)}
              placeholder="Enter security word"
              disabled={!!(attemptLock.type === 'security' && attemptLock.lockedUntil && Date.now() < attemptLock.lockedUntil)}
              className={`w-full px-4 py-3 4k:px-8 4k:py-6 rounded-lg 4k:rounded-2xl ${effectiveTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border ${textClass} placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4 4k:mb-8 disabled:opacity-50`}
            />
            <button
              onClick={handleSecurityWordSubmit}
              disabled={!!(attemptLock.type === 'security' && attemptLock.lockedUntil && Date.now() < attemptLock.lockedUntil)}
              className="w-full px-6 py-3 4k:px-12 4k:py-6 4k:text-3xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg 4k:rounded-2xl font-medium transition-colors"
            >
              Recover PIN
            </button>
          </div>
        </div>
      )}

      {/* PIN Reveal Popup */}
      {showPinReveal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-900 border-2 border-green-500 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Lock className="w-6 h-6 text-green-500" />
                PIN Recovered
              </h2>
              <button 
                onClick={() => {
                  setShowPinReveal(false);
                  setRevealedPin('');
                }} 
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-6">
              <p className="text-gray-300 text-sm mb-3">Your PIN is:</p>
              <p className="text-5xl font-bold text-green-500 text-center tracking-widest">{revealedPin}</p>
            </div>
            <p className="text-gray-400 text-xs text-center">
              Make sure to memorize this PIN before closing this window.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}