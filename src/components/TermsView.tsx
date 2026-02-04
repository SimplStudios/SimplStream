import { useState } from 'react';
import { ArrowLeft, Scale, Shield, FileText, AlertTriangle, Globe, Mail, Lock, UserCheck, Gavel, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TermsViewProps {
  onBack: () => void;
  onShowSeasonalTest?: () => void;
  onShowDevPlayground?: () => void;
}

export function TermsView({ onBack, onShowSeasonalTest, onShowDevPlayground }: TermsViewProps) {
  const { effectiveTheme } = useTheme();
  const [clickCount, setClickCount] = useState(0);
  const [privacyClicks, setPrivacyClicks] = useState(0);

  function handleWarningClick() {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount === 5 && onShowSeasonalTest) {
      onShowSeasonalTest();
      setClickCount(0);
    }
  }

  function handlePrivacyClick() {
    const newCount = privacyClicks + 1;
    setPrivacyClicks(newCount);
    if (newCount === 5 && onShowDevPlayground) {
      onShowDevPlayground();
      setPrivacyClicks(0);
    }
  }

  const bgClass = effectiveTheme === 'dark' ? 'bg-black' : 'bg-gray-50';
  const textClass = effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900';
  const cardClass = effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white border border-gray-200';
  const mutedClass = effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`min-h-screen ${bgClass} ${textClass}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 ${effectiveTheme === 'dark' ? 'glass-header' : 'glass-header-light'}`}>
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
            <div className="flex items-center justify-center gap-3 mb-4">
              <Scale size={40} className="text-blue-500" />
              <h1 className={`text-4xl sm:text-5xl font-bold ${textClass}`}>Terms of Service & Privacy Policy</h1>
            </div>
            <p className={`text-lg ${mutedClass}`}>
              Last Updated: February 2026 | Version 5.0
            </p>
            <p className={`text-sm ${mutedClass} mt-2`}>
              A product of SimplStudios
            </p>
          </div>

          {/* IMPORTANT NOTICE */}
          <div className={`${cardClass} rounded-lg p-8 mb-6 shadow-lg border-l-4 border-yellow-500`}>
            <div className="flex items-start gap-4">
              <AlertTriangle size={28} className="text-yellow-500 flex-shrink-0" />
              <div>
                <h2 className={`text-2xl font-bold mb-3 ${textClass}`}>Important Notice</h2>
                <p className={`${mutedClass} leading-relaxed font-medium`}>
                  BY USING SIMPLSTREAM, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THIS SERVICE. SimplStream is intended for personal, non-commercial use only. Users are solely responsible for ensuring their use complies with all applicable laws in their jurisdiction.
                </p>
              </div>
            </div>
          </div>

          {/* 1. SERVICE DESCRIPTION */}
          <div className={`${cardClass} rounded-lg p-8 mb-6 shadow-lg`}>
            <div className="flex items-start gap-4">
              <FileText size={28} className="text-blue-500 flex-shrink-0" />
              <div>
                <h2 className={`text-2xl font-bold mb-3 ${textClass}`}>1. Service Description & Nature of Platform</h2>
                <p className={`${mutedClass} leading-relaxed mb-4`}>
                  SimplStream is a <strong>search engine and content discovery interface</strong> that indexes and provides links to video content hosted on third-party servers. Similar to how Google indexes websites, SimplStream indexes publicly available video embed links.
                </p>
                <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4 mb-4`}>
                  <p className={`${textClass} font-semibold mb-2`}>SimplStream explicitly:</p>
                  <ul className={`list-disc ml-6 ${mutedClass} space-y-1`}>
                    <li>Does NOT host, store, upload, or distribute any video files</li>
                    <li>Does NOT have servers that contain copyrighted media</li>
                    <li>Does NOT control, moderate, or verify third-party content</li>
                    <li>Does NOT have the ability to remove content from third-party servers</li>
                    <li>Acts solely as a discovery tool pointing to external resources</li>
                  </ul>
                </div>
                <p className={`${mutedClass} leading-relaxed`}>
                  All video streams are served directly from independent third-party embedding services (including but not limited to VidSRC, VidLink, 111Movies, Videasy, and VidFast). SimplStream has no affiliation, partnership, or control over these services.
                </p>
              </div>
            </div>
          </div>

          {/* 2. INTELLECTUAL PROPERTY */}
          <div className={`${cardClass} rounded-lg p-8 mb-6 shadow-lg`}>
            <div className="flex items-start gap-4">
              <Shield size={28} className="text-green-500 flex-shrink-0" />
              <div>
                <h2 className={`text-2xl font-bold mb-3 ${textClass}`}>2. Intellectual Property Rights</h2>
                <p className={`${mutedClass} leading-relaxed mb-4`}>
                  The SimplStream platform, including its design, user interface, source code, logos, branding, and all original content, is the exclusive intellectual property of <strong>SimplStudios</strong> and its creator, Andy "Apple".
                </p>
                <p className={`${mutedClass} leading-relaxed mb-4`}>
                  <strong>Protected elements include:</strong> Visual design, UI/UX architecture, application code, brand identity, feature implementations, algorithms, and all derivative works.
                </p>
                <p className={`${mutedClass} leading-relaxed`}>
                  <strong>Regarding third-party content:</strong> SimplStream does not claim ownership over any media content displayed through the service. All movies, TV shows, and related metadata are the property of their respective copyright holders. Media information is sourced from The Movie Database (TMDB) API under their terms of service.
                </p>
              </div>
            </div>
          </div>

          {/* 3. USER RESPONSIBILITIES */}
          <div className={`${cardClass} rounded-lg p-8 mb-6 shadow-lg`}>
            <div className="flex items-start gap-4">
              <UserCheck size={28} className="text-cyan-500 flex-shrink-0" />
              <div>
                <h2 className={`text-2xl font-bold mb-3 ${textClass}`}>3. User Responsibilities & Acknowledgments</h2>
                <p className={`${mutedClass} leading-relaxed mb-4`}>
                  By using SimplStream, you acknowledge and agree that:
                </p>
                <ul className={`list-disc ml-6 ${mutedClass} space-y-2 mb-4`}>
                  <li><strong>Legal Compliance:</strong> You are solely responsible for ensuring your use of the service complies with all applicable laws in your jurisdiction, including copyright laws</li>
                  <li><strong>Age Requirement:</strong> You are at least 13 years of age, or have parental/guardian consent to use this service</li>
                  <li><strong>Personal Use:</strong> You will use SimplStream for personal, non-commercial purposes only</li>
                  <li><strong>No Downloading:</strong> You will not attempt to download, record, or redistribute any content accessed through the service</li>
                  <li><strong>No Circumvention:</strong> You will not attempt to bypass, disable, or interfere with any security features</li>
                  <li><strong>No Reverse Engineering:</strong> You will not decompile, reverse engineer, or attempt to extract source code</li>
                  <li><strong>No Commercial Use:</strong> You will not use the service for any commercial purpose without explicit written permission</li>
                </ul>
                <p className={`${mutedClass} leading-relaxed font-medium`}>
                  Users access third-party content at their own risk and discretion. SimplStream is not responsible for the content, accuracy, legality, or appropriateness of any material accessed through external links.
                </p>
              </div>
            </div>
          </div>

          {/* 4. DMCA & COPYRIGHT */}
          <div className={`${cardClass} rounded-lg p-8 mb-6 shadow-lg`}>
            <div className="flex items-start gap-4">
              <button onClick={handleWarningClick} className="flex-shrink-0">
                <Gavel size={28} className="text-yellow-500 cursor-pointer hover:text-yellow-400 transition-colors" />
              </button>
              <div>
                <h2 className={`text-2xl font-bold mb-3 ${textClass}`}>4. DMCA Compliance & Copyright Policy</h2>
                <p className={`${mutedClass} leading-relaxed mb-4`}>
                  SimplStream respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA) and similar international copyright laws.
                </p>
                
                <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4 mb-4`}>
                  <p className={`${textClass} font-semibold mb-2`}>Important Clarification:</p>
                  <p className={`${mutedClass}`}>
                    Since SimplStream does not host any content, we cannot directly remove copyrighted material. However, we will promptly remove or disable access to any links that point to allegedly infringing content upon receipt of a valid DMCA takedown notice.
                  </p>
                </div>

                <p className={`${mutedClass} leading-relaxed mb-3`}>
                  <strong>To file a DMCA notice, include:</strong>
                </p>
                <ul className={`list-disc ml-6 ${mutedClass} space-y-1 mb-4`}>
                  <li>Identification of the copyrighted work claimed to be infringed</li>
                  <li>Specific URL(s) on SimplStream where the alleged infringement occurs</li>
                  <li>Your contact information (name, address, phone, email)</li>
                  <li>A statement of good faith belief that the use is unauthorized</li>
                  <li>A statement under penalty of perjury that the information is accurate</li>
                  <li>Physical or electronic signature of the copyright owner or authorized agent</li>
                </ul>
                <p className={`${mutedClass} leading-relaxed`}>
                  <strong>For content hosted on third-party servers,</strong> please contact the hosting provider directly, as they have the ability to remove the actual content.
                </p>
              </div>
            </div>
          </div>

          {/* 5. PRIVACY POLICY */}
          <div className={`${cardClass} rounded-lg p-8 mb-6 shadow-lg`}>
            <div className="flex items-start gap-4">
              <Lock size={28} className="text-purple-500 flex-shrink-0 cursor-pointer" onClick={handlePrivacyClick} />
              <div>
                <h2 className={`text-2xl font-bold mb-3 ${textClass}`}>5. Privacy Policy & Data Handling</h2>
                <p className={`${mutedClass} leading-relaxed mb-4`}>
                  SimplStream is designed with privacy as a core principle. We collect <strong>zero personal data</strong> on our servers.
                </p>

                <div className={`${effectiveTheme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'} rounded-lg p-4 mb-4 border border-green-500/30`}>
                  <p className={`${textClass} font-semibold mb-2`}>✓ What We DON'T Collect:</p>
                  <ul className={`list-disc ml-6 ${mutedClass} space-y-1`}>
                    <li>Personal identification information</li>
                    <li>IP addresses or location data</li>
                    <li>Browsing history or watch patterns</li>
                    <li>Cookies for tracking purposes</li>
                    <li>Any data transmitted to external servers we control</li>
                  </ul>
                </div>

                <p className={`${mutedClass} leading-relaxed mb-3`}>
                  <strong>Local Storage Only:</strong> All user data (profiles, watchlists, preferences, watch history) is stored exclusively in your browser's localStorage on your local device. This data:
                </p>
                <ul className={`list-disc ml-6 ${mutedClass} space-y-1 mb-4`}>
                  <li>Never leaves your device</li>
                  <li>Is not accessible to SimplStream or SimplStudios</li>
                  <li>Can be deleted by clearing your browser data</li>
                  <li>Is encrypted with XOR cipher when exported</li>
                </ul>

                <p className={`${mutedClass} leading-relaxed`}>
                  <strong>Third-Party Services:</strong> When you access content through embedded players, those third-party services may have their own privacy policies and may collect data according to their terms. SimplStream is not responsible for third-party data practices.
                </p>
              </div>
            </div>
          </div>

          {/* 6. THIRD-PARTY SERVICES */}
          <div className={`${cardClass} rounded-lg p-8 mb-6 shadow-lg`}>
            <div className="flex items-start gap-4">
              <ExternalLink size={28} className="text-indigo-500 flex-shrink-0" />
              <div>
                <h2 className={`text-2xl font-bold mb-3 ${textClass}`}>6. Third-Party Services & External Links</h2>
                <p className={`${mutedClass} leading-relaxed mb-4`}>
                  SimplStream integrates with and links to various third-party services:
                </p>
                <ul className={`list-disc ml-6 ${mutedClass} space-y-2 mb-4`}>
                  <li><strong>TMDB API:</strong> Movie and TV metadata, images, and information (per TMDB terms of service)</li>
                  <li><strong>Video Embedding Services:</strong> VidSRC, VidLink, 111Movies, Videasy, VidFast, and others</li>
                  <li><strong>YouTube:</strong> For trailer playback</li>
                </ul>
                <p className={`${mutedClass} leading-relaxed mb-3`}>
                  SimplStream:
                </p>
                <ul className={`list-disc ml-6 ${mutedClass} space-y-1`}>
                  <li>Is not affiliated with, endorsed by, or partnered with any of these services</li>
                  <li>Does not control their content, availability, or policies</li>
                  <li>Is not responsible for their terms of service or privacy practices</li>
                  <li>Cannot guarantee their availability, quality, or legality</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 7. DISCLAIMERS */}
          <div className={`${cardClass} rounded-lg p-8 mb-6 shadow-lg`}>
            <div className="flex items-start gap-4">
              <AlertTriangle size={28} className="text-red-500 flex-shrink-0" />
              <div>
                <h2 className={`text-2xl font-bold mb-3 ${textClass}`}>7. Disclaimers & Limitation of Liability</h2>
                
                <div className={`${effectiveTheme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'} rounded-lg p-4 mb-4 border border-red-500/30`}>
                  <p className={`${textClass} font-bold mb-2`}>DISCLAIMER OF WARRANTIES</p>
                  <p className={`${mutedClass} text-sm`}>
                    SIMPLSTREAM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
                  </p>
                </div>

                <p className={`${mutedClass} leading-relaxed mb-4`}>
                  SimplStream and SimplStudios make no representations or warranties regarding:
                </p>
                <ul className={`list-disc ml-6 ${mutedClass} space-y-1 mb-4`}>
                  <li>The accuracy, completeness, or reliability of any content</li>
                  <li>The availability or uptime of the service or third-party content</li>
                  <li>The legality of content in any particular jurisdiction</li>
                  <li>The security of third-party embedding services</li>
                  <li>The quality or safety of external links</li>
                </ul>

                <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
                  <p className={`${textClass} font-bold mb-2`}>LIMITATION OF LIABILITY</p>
                  <p className={`${mutedClass} text-sm`}>
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SIMPLSTREAM, SIMPLSTUDIOS, AND ITS CREATOR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 8. INDEMNIFICATION */}
          <div className={`${cardClass} rounded-lg p-8 mb-6 shadow-lg`}>
            <div className="flex items-start gap-4">
              <Shield size={28} className="text-orange-500 flex-shrink-0" />
              <div>
                <h2 className={`text-2xl font-bold mb-3 ${textClass}`}>8. Indemnification</h2>
                <p className={`${mutedClass} leading-relaxed`}>
                  You agree to indemnify, defend, and hold harmless SimplStream, SimplStudios, its creator Andy "Apple", and any affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including attorney's fees) arising from: (a) your use of the service; (b) your violation of these terms; (c) your violation of any third-party right, including any copyright, property, or privacy right; or (d) any claim that your use of the service caused damage to a third party.
                </p>
              </div>
            </div>
          </div>

          {/* 9. GOVERNING LAW */}
          <div className={`${cardClass} rounded-lg p-8 mb-6 shadow-lg`}>
            <div className="flex items-start gap-4">
              <Globe size={28} className="text-blue-500 flex-shrink-0" />
              <div>
                <h2 className={`text-2xl font-bold mb-3 ${textClass}`}>9. Governing Law & Dispute Resolution</h2>
                <p className={`${mutedClass} leading-relaxed mb-4`}>
                  These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these terms or your use of SimplStream shall be resolved through good-faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration.
                </p>
                <p className={`${mutedClass} leading-relaxed`}>
                  You agree to waive any right to participate in a class action lawsuit or class-wide arbitration against SimplStream or SimplStudios.
                </p>
              </div>
            </div>
          </div>

          {/* 10. MODIFICATIONS */}
          <div className={`${cardClass} rounded-lg p-8 mb-6 shadow-lg`}>
            <div className="flex items-start gap-4">
              <FileText size={28} className="text-pink-500 flex-shrink-0" />
              <div>
                <h2 className={`text-2xl font-bold mb-3 ${textClass}`}>10. Modifications to Terms</h2>
                <p className={`${mutedClass} leading-relaxed`}>
                  SimplStudios reserves the right to modify these Terms at any time. Changes will be effective immediately upon posting to the service. Your continued use of SimplStream after any modifications constitutes acceptance of the updated terms. We encourage you to review these terms periodically.
                </p>
              </div>
            </div>
          </div>

          {/* 11. SEVERABILITY */}
          <div className={`${cardClass} rounded-lg p-8 mb-6 shadow-lg`}>
            <div className="flex items-start gap-4">
              <Scale size={28} className="text-teal-500 flex-shrink-0" />
              <div>
                <h2 className={`text-2xl font-bold mb-3 ${textClass}`}>11. Severability & Entire Agreement</h2>
                <p className={`${mutedClass} leading-relaxed mb-4`}>
                  If any provision of these Terms is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.
                </p>
                <p className={`${mutedClass} leading-relaxed`}>
                  These Terms constitute the entire agreement between you and SimplStream regarding your use of the service and supersede all prior agreements and understandings.
                </p>
              </div>
            </div>
          </div>

          {/* CONTACT */}
          <div className={`${cardClass} rounded-lg p-8 text-center shadow-lg`}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Mail size={28} className="text-blue-500" />
              <h2 className={`text-2xl font-bold ${textClass}`}>Contact Information</h2>
            </div>
            <p className={`${mutedClass} mb-4`}>
              For legal inquiries, DMCA notices, questions, or concerns, contact SimplStudios at:
            </p>
            <a
              href="mailto:simplstudios@protonmail.com"
              className="text-blue-500 hover:text-blue-400 text-xl font-semibold transition-colors"
            >
              simplstudios@protonmail.com
            </a>
            <p className={`${mutedClass} text-sm mt-4`}>
              Please allow 5-7 business days for response to non-urgent inquiries.
            </p>
          </div>

          {/* Footer */}
          <footer className={`mt-16 pt-8 border-t ${effectiveTheme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="text-center space-y-4">
              <div>
                <h3 className={`text-3xl font-bold mb-2`}>
                  <span className="text-blue-500">Simpl</span>
                  <span className={textClass}>Stream</span>
                </h3>
                <p className={`text-sm ${mutedClass}`}>
                  It's not just streaming - It's SimplStream.
                </p>
              </div>
              <p className={`text-sm ${mutedClass}`}>
                © {new Date().getFullYear()} SimplStream. All rights reserved.
              </p>
              <p className={`text-xs ${effectiveTheme === 'dark' ? 'text-gray-600' : 'text-gray-500'}`}>
                A product of SimplStudios | Created by Andy "Apple"
              </p>
              <p className={`text-xs ${effectiveTheme === 'dark' ? 'text-gray-700' : 'text-gray-400'} max-w-2xl mx-auto`}>
                This product uses the TMDB API but is not endorsed or certified by TMDB. All movie and TV show data is provided by The Movie Database.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
