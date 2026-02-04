import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Shield, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { verifyAccessToken, setAccessLockStatus } from '../lib/storage';

interface AccessLockDialogProps {
  open: boolean;
  onUnlock: () => void;
}

export function AccessLockDialog({ open, onUnlock }: AccessLockDialogProps) {
  const { effectiveTheme } = useTheme();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const textClass = effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (verifyAccessToken(token)) {
      setSuccess(true);
      setError('');
      setTimeout(() => {
        setAccessLockStatus(false);
        onUnlock();
      }, 1500);
    } else {
      setError('Invalid token. Please try again.');
      setToken('');
    }
  }

  if (success) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className={`max-w-md ${effectiveTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${textClass}`}>Verification Successful!</h2>
            <p className={`${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              You are not a robot. Access granted.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className={`max-w-md ${effectiveTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold ${textClass} flex items-center gap-3`}>
            <AlertTriangle className="w-8 h-8 text-red-500" />
            Access Locked
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className={`${effectiveTheme === 'dark' ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
            <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-red-300' : 'text-red-800'} font-medium`}>
              We have locked access to all existing profiles because we suspect you are a bot.
            </p>
          </div>

          <p className={`${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            You must enter a secret token to keep making more profiles. To get a token, please email{' '}
            <a href="mailto:simplstudios@protonmail.com" className="text-blue-500 hover:text-blue-600 font-semibold">
              simplstudios@protonmail.com
            </a>
          </p>

          <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            For now, you will lose all access to all profiles until a valid token is entered.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                Secret Token
              </label>
              <Input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                placeholder="Enter token (e.g., 3F12B)"
                className={`${error ? 'border-red-500' : ''}`}
                maxLength={5}
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Verify Token
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
