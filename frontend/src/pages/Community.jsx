
import { useState } from 'react';
import {
  FaCog,
  FaUser,
  FaShieldAlt,
  FaBell,
  FaChartLine,
  FaLock,
  FaPlug,
  FaCreditCard,
  FaDatabase,
  FaInfoCircle,
  FaSave,
  FaUndo,
  FaChevronRight,
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const settingsSections = [
  { id: 'security', label: 'Security', icon: <FaShieldAlt /> },
  { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
  { id: 'trading', label: 'Trading Preferences', icon: <FaChartLine /> },
  { id: 'privacy', label: 'Privacy', icon: <FaLock /> },
  { id: 'integrations', label: 'Integrations', icon: <FaPlug /> },
  { id: 'subscription', label: 'Subscription', icon: <FaCreditCard /> },
  { id: 'data', label: 'Data Management', icon: <FaDatabase /> },
  { id: 'about', label: 'About', icon: <FaInfoCircle /> },
];

const connectedBrokers = [
  { name: 'Zerodha', status: 'Connected' },
  { name: 'Upstox', status: 'Disconnected' },
  { name: 'Angel One', status: 'Connected' },
  { name: 'Groww', status: 'Disconnected' },
];

export default function Community() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    language: 'English',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
  });
  const [privacyToggles, setPrivacyToggles] = useState({
    showTradingStats: true,
    showLearningProgress: false,
    dataSharing: true,
    showOnlineStatus: false,
  });
  const [notificationToggles, setNotificationToggles] = useState({
    marketAlerts: true,
    aiAlerts: true,
    learningReminders: false,
    tradeReminders: true,
    portfolioAlerts: true,
    watchlistAlerts: true,
    priceAlerts: true,
    optionsExpiryAlerts: true,
    telegramNotifications: true,
    emailNotifications: false,
    pushNotifications: true,
    smsNotifications: false,
  });

  // const renderGeneralSettings = () => (
  //   <div className="space-y-6">
  //     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //       <div>
  //         <label className="text-sm text-[#B8C0D4] mb-2 block">Language</label>
  //         <select
  //           value={settings.language}
  //           onChange={(e) => setSettings({ ...settings, language: e.target.value })}
  //           className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30"
  //         >
  //           {['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam'].map((lang, idx) => (
  //             <option key={idx} value={lang}>{lang}</option>
  //           ))}
  //         </select>
  //       </div>
  //       <div>
  //         <label className="text-sm text-[#B8C0D4] mb-2 block">Timezone</label>
  //         <select className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30">
  //           <option>Asia/Kolkata (IST)</option>
  //           <option>America/New_York (EST)</option>
  //           <option>Europe/London (GMT)</option>
  //         </select>
  //       </div>
  //       <div>
  //         <label className="text-sm text-[#B8C0D4] mb-2 block">Currency</label>
  //         <select className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30">
  //           <option>INR - Indian Rupee</option>
  //           <option>USD - US Dollar</option>
  //           <option>EUR - Euro</option>
  //         </select>
  //       </div>
  //       <div>
  //         <label className="text-sm text-[#B8C0D4] mb-2 block">Date Format</label>
  //         <select className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30">
  //           <option>DD/MM/YYYY</option>
  //           <option>MM/DD/YYYY</option>
  //           <option>YYYY-MM-DD</option>
  //         </select>
  //       </div>
  //     </div>
  //   </div>
  // );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-[#050816] border border-white/10 rounded-2xl p-6">
        <h4 className="text-lg font-semibold mb-4">Account Security</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Email Verification</div>
              <div className="text-sm text-[#B8C0D4]">Your email is verified</div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#32CD32]/20 text-[#32CD32] text-sm font-semibold">Verified</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Phone Verification</div>
              <div className="text-sm text-[#B8C0D4]">Your phone is verified</div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#32CD32]/20 text-[#32CD32] text-sm font-semibold">Verified</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Two-Factor Authentication</div>
              <div className="text-sm text-[#B8C0D4]">Add an extra layer of security</div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] text-sm font-semibold">Enable 2FA</button>
          </div>
        </div>
      </div>
      <div className="bg-[#050816] border border-white/10 rounded-2xl p-6">
        <h4 className="text-lg font-semibold mb-4">Change Password</h4>
        <div className="space-y-4">
          <input type="password" placeholder="Current Password" className="w-full px-4 py-3 rounded-xl bg-[#0B1220] border border-white/10 text-white outline-none focus:border-[#32CD32]/30" />
          <input type="password" placeholder="New Password" className="w-full px-4 py-3 rounded-xl bg-[#0B1220] border border-white/10 text-white outline-none focus:border-[#32CD32]/30" />
          <input type="password" placeholder="Confirm New Password" className="w-full px-4 py-3 rounded-xl bg-[#0B1220] border border-white/10 text-white outline-none focus:border-[#32CD32]/30" />
          <button className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold">Update Password</button>
        </div>
      </div>
      <div className="bg-[#050816] border border-white/10 rounded-2xl p-6">
        <h4 className="text-lg font-semibold mb-4">Login Management</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Current Device</div>
              <div className="text-sm text-[#B8C0D4]">Chrome · Windows · Mumbai</div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#32CD32]/20 text-[#32CD32] text-xs">Active</span>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 border border-red-400/30 text-red-400 text-sm">Logout All Devices</button>
            <button className="px-4 py-2 rounded-lg bg-[#0B1220] border border-white/10 text-sm">View History</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      {/* Alert Notifications */}
      <div className="bg-[#050816] border border-white/10 rounded-2xl p-6">
        <h4 className="text-lg font-semibold mb-4">Alert Notifications</h4>
        <div className="space-y-3">
          {[
            { label: 'Market Alerts', key: 'marketAlerts' },
            { label: 'AI Alerts', key: 'aiAlerts' },
            { label: 'Learning Reminders', key: 'learningReminders' },
            { label: 'Trade Reminders', key: 'tradeReminders' },
            { label: 'Portfolio Alerts', key: 'portfolioAlerts' },
            { label: 'Watchlist Alerts', key: 'watchlistAlerts' },
            { label: 'Price Alerts', key: 'priceAlerts' },
            { label: 'Options Expiry Alerts', key: 'optionsExpiryAlerts' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-sm">{item.label}</span>
              <button
                onClick={() => setNotificationToggles({ ...notificationToggles, [item.key]: !notificationToggles[item.key] })}
                className={`w-12 h-6 rounded-full transition-all ${notificationToggles[item.key] ? 'bg-gradient-to-r from-[#32CD32] to-[#39FF14]' : 'bg-[#050816] border border-white/20'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform transform ${notificationToggles[item.key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Notification Channels */}
      <div className="bg-[#050816] border border-white/10 rounded-2xl p-6">
        <h4 className="text-lg font-semibold mb-4">Notification Channels</h4>
        <div className="space-y-3">
          {[
            { label: 'Telegram Notifications', key: 'telegramNotifications' },
            { label: 'Email Notifications', key: 'emailNotifications' },
            { label: 'Push Notifications', key: 'pushNotifications' },
            { label: 'SMS Notifications', key: 'smsNotifications' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-sm">{item.label}</span>
              <button
                onClick={() => setNotificationToggles({ ...notificationToggles, [item.key]: !notificationToggles[item.key] })}
                className={`w-12 h-6 rounded-full transition-all ${notificationToggles[item.key] ? 'bg-gradient-to-r from-[#32CD32] to-[#39FF14]' : 'bg-[#050816] border border-white/20'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform transform ${notificationToggles[item.key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTradingPreferences = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-[#B8C0D4] mb-2 block">Default Market</label>
          <select className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30">
            <option>Stocks</option>
            <option>Options</option>
            <option>Futures</option>
            <option>Crypto</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-[#B8C0D4] mb-2 block">Default Chart Interval</label>
          <select className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30">
            <option>1m</option>
            <option>5m</option>
            <option>15m</option>
            <option>1H</option>
            <option>1D</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-[#B8C0D4] mb-2 block">Risk Preference</label>
          <select className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30">
            <option>Low</option>
            <option>Moderate</option>
            <option>High</option>
            <option>Aggressive</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-[#B8C0D4] mb-2 block">Default Position Size %</label>
          <input type="number" defaultValue="2" className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30" />
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-3 border-b border-white/5">
        <span className="text-sm">Profile Visibility</span>
        <select className="px-4 py-2 rounded-lg bg-[#050816] border border-white/10 text-white outline-none text-sm">
          <option>Public</option>
          <option>Private</option>
          <option>Friends Only</option>
        </select>
      </div>
      {[
        { label: 'Show Trading Statistics', key: 'showTradingStats' },
        { label: 'Show Learning Progress', key: 'showLearningProgress' },
        { label: 'Data Sharing', key: 'dataSharing' },
        { label: 'Show Online Status', key: 'showOnlineStatus' },
      ].map((item, idx) => (
        <div key={idx} className="flex items-center justify-between py-3 border-b border-white/5">
          <span className="text-sm">{item.label}</span>
          <button
            onClick={() => setPrivacyToggles({ ...privacyToggles, [item.key]: !privacyToggles[item.key] })}
            className={`w-12 h-6 rounded-full transition-all ${privacyToggles[item.key] ? 'bg-gradient-to-r from-[#32CD32] to-[#39FF14]' : 'bg-[#050816] border border-white/20'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform transform ${privacyToggles[item.key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      ))}
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold">Connected Brokers</h4>
      <div className="space-y-4">
        {connectedBrokers.map((broker, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[#050816] border border-white/10">
            <div>
              <div className="font-semibold">{broker.name}</div>
              <div className={`text-sm ${broker.status === 'Connected' ? 'text-[#32CD32]' : 'text-[#B8C0D4]'}`}>{broker.status}</div>
            </div>
            <div className="flex gap-2">
              {broker.status === 'Connected' ? (
                <>
                  <button className="px-3 py-1.5 rounded-lg bg-[#0B1220] border border-white/10 text-sm">Sync</button>
                  <button className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-400/30 text-sm text-red-400">Disconnect</button>
                </>
              ) : (
                <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] text-sm font-semibold">Connect</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSubscriptionSettings = () => (
    <div className="bg-[#050816] border border-white/10 rounded-2xl p-6">
      <h4 className="text-lg font-semibold mb-4">Current Plan</h4>
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl font-bold text-[#FFD700]">Premium</span>
        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold">Upgrade</button>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-[#B8C0D4]">Renewal Date</span>
          <span>15 July 2024</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#B8C0D4]">Usage</span>
          <span>75%</span>
        </div>
      </div>
    </div>
  );

  const renderDataManagement = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Profile Data', 'Trade History', 'Learning Progress', 'AI Reports'].map((item, idx) => (
          <div key={idx} className="bg-[#050816] border border-white/10 rounded-2xl p-4">
            <div className="font-semibold mb-3">Download {item}</div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-1.5 rounded-lg bg-[#0B1220] border border-white/10 text-sm">CSV</button>
              <button className="flex-1 px-3 py-1.5 rounded-lg bg-[#0B1220] border border-white/10 text-sm">PDF</button>
              <button className="flex-1 px-3 py-1.5 rounded-lg bg-[#0B1220] border border-white/10 text-sm">JSON</button>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-red-500/10 border border-red-400/30 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-red-400 mb-3">Danger Zone</h4>
        <button className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-400/30 text-red-400">Delete Account</button>
      </div>
    </div>
  );

  const renderAboutSettings = () => (
    <div className="space-y-4">
      <div className="bg-[#050816] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#B8C0D4]">Version</span>
          <span className="font-semibold">v2.0.1</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#B8C0D4]">Build</span>
          <span className="font-semibold">20240609</span>
        </div>
      </div>
      <div className="space-y-3">
        {['Terms & Conditions', 'Privacy Policy', 'Contact Us', 'Release Notes'].map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[#050816] border border-white/10">
            <span className="font-semibold">{item}</span>
            <FaChevronRight className="text-[#B8C0D4]" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'security': return renderSecuritySettings();
      case 'notifications': return renderNotificationSettings();
      case 'trading': return renderTradingPreferences();
      case 'privacy': return renderPrivacySettings();
      case 'integrations': return renderIntegrations();
      case 'subscription': return renderSubscriptionSettings();
      case 'data': return renderDataManagement();
      case 'about': return renderAboutSettings();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] p-4 md:p-8 pb-24 md:pb-8">
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#32CD32] rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -25, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3.5 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-3">
              <FaCog className="text-[#39FF14]" />
              Settings
            </h1>
            <p className="text-[#B8C0D4] text-sm md:text-base">
              Manage your account preferences, security, notifications, and platform settings.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0B1220] border border-white/10 text-white hover:border-[#32CD32]/30">
              <FaUndo className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold">
              <FaSave className="w-4 h-4" />
              <span className="hidden sm:inline">Save Changes</span>
            </button>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="hidden lg:block">
            <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sticky top-6">
              <div className="space-y-2">
                {settingsSections.map((section, idx) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === section.id ? 'bg-gradient-to-r from-[#32CD32]/20 to-[#39FF14]/20 border border-[#32CD32]/30 text-[#32CD32]' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <div className="w-5 h-5">{section.icon}</div>
                    <span className="font-semibold">{section.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:hidden mb-4 overflow-x-auto">
            <div className="flex gap-2">
              {settingsSections.map((section, idx) => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm transition-all ${activeTab === section.id ? 'bg-gradient-to-r from-[#32CD32]/20 to-[#39FF14]/20 border border-[#32CD32]/30 text-[#32CD32]' : 'bg-[#050816] border border-white/10'}`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-8">
              <h3 className="text-xl font-bold mb-6">{settingsSections.find(s => s.id === activeTab)?.label}</h3>
              {renderActiveSection()}
            </motion.div>
          </div>
        </div>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0B1220] border-t border-white/10 p-4 z-40">
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
