import { ArrowLeft, User, Heart, Tv, Star, Clock, Shield, Globe, Sparkles, XCircle, DollarSign } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AboutViewProps {
  onBack: () => void;
}

export function AboutView({ onBack }: AboutViewProps) {
  const { effectiveTheme } = useTheme();

  const bgClass = effectiveTheme === 'dark' ? 'bg-black' : 'bg-gray-50';
  const textClass = effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900';
  const cardClass = effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white border border-gray-200';

  return (
    <div className={`min-h-screen ${bgClass} ${textClass}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 ${effectiveTheme === 'dark' ? 'bg-gradient-to-b from-black via-black/95 to-transparent' : 'bg-gradient-to-b from-white via-white/95 to-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 ${textClass} hover:text-blue-400 transition-colors`}
          >
            <ArrowLeft size={24} />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className={`text-5xl font-bold mb-4 ${textClass}`}>
              About <span className="text-blue-500">Simpl</span>Stream
            </h1>
            <p className={`text-xl ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              It's not just streaming - It's SimplStream.
            </p>
            <p className={`mt-2 text-sm ${effectiveTheme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
              Owner: Andy "Apple"
            </p>
          </div>

          <div className={`${cardClass} rounded-lg p-8 mb-8 shadow-lg`}>
            <p className={`text-lg leading-relaxed ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Welcome to SimplStream—It's not just streaming - It's SimplStream. Built for today's viewers, SimplStream brings you all your favorite movies, TV shows, and live channels with a modern, intuitive experience. ✨
            </p>
          </div>

          <h2 className={`text-3xl font-bold mb-6 ${textClass}`}>Key Features 🚀</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className={`${cardClass} rounded-lg p-6 shadow-lg`}>
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${textClass}`}>Profile & Account Creation</h3>
                  <p className={effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Personalize your watching journey by creating your own profile. Save preferences, set up avatars, adjust your settings, and access your favorite content on any device—just like Netflix. 👤
                  </p>
                </div>
              </div>
            </div>

            <div className={`${cardClass} rounded-lg p-6 shadow-lg`}>
              <div className="flex items-start gap-4">
                <div className="bg-green-500 p-3 rounded-lg">
                  <Heart size={24} className="text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${textClass}`}>Completely Free, Minimal Ads</h3>
                  <p className={effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Enjoy unlimited streaming without monthly costs. The platform is 100% free to users, with only minimal ads directly controlled to avoid interruptions and enhance viewing comfort. 💰
                  </p>
                </div>
              </div>
            </div>

            <div className={`${cardClass} rounded-lg p-6 shadow-lg`}>
              <div className="flex items-start gap-4">
                <div className="bg-purple-500 p-3 rounded-lg">
                  <Star size={24} className="text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${textClass}`}>Amazing User Interface</h3>
                  <p className={effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Discover a sleek, easy-to-use design built for clarity and smooth navigation. Access everything in seconds—from categories and recommendations to trending content—via a beautiful, modern interface. 🎨
                  </p>
                </div>
              </div>
            </div>

            <div className={`${cardClass} rounded-lg p-6 shadow-lg`}>
              <div className="flex items-start gap-4">
                <div className="bg-red-500 p-3 rounded-lg">
                  <Tv size={24} className="text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${textClass}`}>Live TV Channels</h3>
                  <p className={effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Access real-time broadcasts, news, and events from supported providers. Never miss out on your favorite shows, sports, or breaking updates. 📺
                  </p>
                </div>
              </div>
            </div>

            <div className={`${cardClass} rounded-lg p-6 shadow-lg`}>
              <div className="flex items-start gap-4">
                <div className="bg-yellow-500 p-3 rounded-lg">
                  <Clock size={24} className="text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${textClass}`}>Watchlist & Watch History</h3>
                  <p className={effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Add movies, series, and episodes to your custom watchlist to revisit later. Instantly resume content anywhere with a fully tracked watch history. ⏱️
                  </p>
                </div>
              </div>
            </div>

            <div className={`${cardClass} rounded-lg p-6 shadow-lg`}>
              <div className="flex items-start gap-4">
                <div className="bg-indigo-500 p-3 rounded-lg">
                  <Globe size={24} className="text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${textClass}`}>Multiple Server Integration</h3>
                  <p className={effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Stream from top sources like VidSRC, Vidlink Pro, 111Movies, Videasy, and VidFast for a vast selection and reliable uptime. 🌐
                  </p>
                </div>
              </div>
            </div>

            <div className={`${cardClass} rounded-lg p-6 shadow-lg`}>
              <div className="flex items-start gap-4">
                <div className="bg-pink-500 p-3 rounded-lg">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${textClass}`}>No Account Required</h3>
                  <p className={effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    For those who prefer to stream anonymously, enjoy the majority of SimplStream's library and live options without signing up. 🔒
                  </p>
                </div>
              </div>
            </div>

            <div className={`${cardClass} rounded-lg p-6 shadow-lg`}>
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 p-3 rounded-lg">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${textClass}`}>Surprise Me Feature</h3>
                  <p className={effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Can't decide what to watch? Let our intelligent recommendation system surprise you with personalized content based on your viewing history and preferences. Discover hidden gems tailored just for you! 🎲
                  </p>
                </div>
              </div>
            </div>

            <div className={`${cardClass} rounded-lg p-6 shadow-lg`}>
              <div className="flex items-start gap-4">
                <div className="bg-rose-500 p-3 rounded-lg">
                  <XCircle size={24} className="text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${textClass}`}>Ad-Free Option</h3>
                  <p className={effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Want an uninterrupted experience? Simply toggle "Remove Ads" in your profile settings to enjoy SimplStream completely ad-free. No subscriptions required—just pure, seamless streaming! 🚫
                  </p>
                </div>
              </div>
            </div>

            <div className={`${cardClass} rounded-lg p-6 shadow-lg`}>
              <div className="flex items-start gap-4">
                <div className="bg-cyan-500 p-3 rounded-lg">
                  <Tv size={24} className="text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${textClass}`}>4K TV Optimized</h3>
                  <p className={effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Experience SimplStream on the big screen! Our interface is fully optimized for 4K televisions (3840x2160), providing stunning visuals and easy navigation from your couch. Perfect for the ultimate home theater experience! 📺
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Us Card */}
          <div className={`${cardClass} rounded-lg p-8 text-center shadow-lg mb-8`}>
            <div className="flex justify-center mb-4">
              <div className="bg-green-500 p-4 rounded-full">
                <Heart size={32} className="text-white" />
              </div>
            </div>
            <h2 className={`text-3xl font-bold mb-4 ${textClass}`}>Support SimplStream 💚</h2>
            <p className={`text-lg mb-6 ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Love SimplStream? Help us keep it free and ad-minimal! Your donation helps cover server costs and keeps the project alive.
            </p>
            <a
              href="https://cash.app/$simplstudios"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold text-lg rounded-full transition-all shadow-lg shadow-green-500/25 hover:scale-105"
            >
              <DollarSign size={24} />
              Donate via Cash App
            </a>
            <p className={`mt-4 text-sm ${effectiveTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Every little bit helps! Thank you for your support. 🙏
            </p>
          </div>

          <div className={`${cardClass} rounded-lg p-8 text-center shadow-lg`}>
            <h2 className={`text-3xl font-bold mb-4 ${textClass}`}>Need Help? 📧</h2>
            <p className={`text-lg mb-4 ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Our support team is ready to assist you. Contact us anytime at:
            </p>
            <a
              href="mailto:simplstudios@protonmail.com"
              className="text-blue-500 hover:text-blue-600 text-xl font-semibold"
            >
              simplstudios@protonmail.com
            </a>
          </div>

          <div className="text-center mt-12">
            <p className={`text-2xl font-bold ${textClass}`}>
              Explore SimplStream—where entertainment is truly simple and free. 🌟
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
