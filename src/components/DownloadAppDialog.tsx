import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Download, Smartphone, CheckCircle, Github } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DownloadAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DownloadAppDialog({ open, onOpenChange }: DownloadAppDialogProps) {
  const { effectiveTheme } = useTheme();
  const textClass = effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl ${effectiveTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <DialogHeader>
          <DialogTitle className={`text-3xl font-bold ${textClass} flex items-center gap-3`}>
            <Smartphone className="w-8 h-8 text-blue-500" />
            Download SimplStream App
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-6`}>
            <h3 className={`text-xl font-bold mb-4 ${textClass}`}>
              📱 Currently Available on Android
            </h3>
            <p className={`${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Experience SimplStream on the go with our native Android application. Enjoy all the features you love in a mobile-optimized experience.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className={`text-lg font-bold ${textClass} mb-3`}>✨ Why Download the App?</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className={effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <strong>Optimized Performance</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className={effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <strong>Easy Access</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className={effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <strong>Mobile-optimized UI</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className={effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <strong>Instant Updates</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className={effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <strong>Faster Performance</strong>
                </p>
              </div>
            </div>
          </div>

          <div className={`${effectiveTheme === 'dark' ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
            <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
              <strong>Note:</strong> The app is distributed via GitHub. You'll need to enable "Install from Unknown Sources" in your Android settings to install the APK file.
            </p>
          </div>

          <a
            href="https://github.com/JustANormalChurro/SimplStream"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-bold text-lg transition-all bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white hover:scale-105 shadow-lg"
          >
            <Github className="w-6 h-6" />
            <Download className="w-6 h-6" />
            Download from GitHub
          </a>

          <p className={`text-xs text-center ${effectiveTheme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
            By downloading, you agree to our Terms and Conditions
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
