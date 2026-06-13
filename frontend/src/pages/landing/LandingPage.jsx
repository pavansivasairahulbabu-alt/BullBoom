import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTelegram, FaLinkedin, FaInstagram, FaTwitter, FaChartLine, FaBookOpen, FaShieldAlt, FaArrowRight, FaCheckCircle, FaChevronDown, FaChevronUp, FaBars, FaTimes, FaClipboardList } from 'react-icons/fa';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white font-sans selection:bg-[#32CD32]/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B1220]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src="/BullBoom.jpeg" alt="BullBoom" className="w-10 h-10 rounded-xl object-cover" />
              <span className="text-xl font-bold bg-gradient-to-r from-[#32CD32] to-[#39FF14] bg-clip-text text-transparent">
                Bull Boom
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[#B8C0D4] hover:text-white transition-colors">Features</a>
              {/* <a href="#pricing" className="text-[#B8C0D4] hover:text-white transition-colors">Pricing</a> */}
              <a href="#testimonials" className="text-[#B8C0D4] hover:text-white transition-colors">Testimonials</a>
              <a href="#faq" className="text-[#B8C0D4] hover:text-white transition-colors">FAQ</a>
              <Link to="/login" className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_30px_rgba(127,255,0,0.4)] transition-all">
                Login
              </Link>
            </div>
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-white text-xl p-2"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0B1220] border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-[#B8C0D4] hover:text-white transition-colors py-2">Features</a>
              {/* <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-[#B8C0D4] hover:text-white transition-colors py-2">Pricing</a> */}
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-[#B8C0D4] hover:text-white transition-colors py-2">Testimonials</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-[#B8C0D4] hover:text-white transition-colors py-2">FAQ</a>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_30px_rgba(127,255,0,0.4)] transition-all">
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#32CD32]/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#7FFF00]/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight">
                Trade Smarter.<br/>
                <span className="bg-gradient-to-r from-[#32CD32] to-[#39FF14] bg-clip-text text-transparent">
                  Grow Faster.
                </span><br/>
                Dominate Markets.
              </h1>
              <p className="text-[#B8C0D4] text-lg sm:text-xl max-w-2xl">
                Smart watchlists, option learning, market insights, and risk management — all in one platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup" className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-bold text-lg hover:shadow-[0_0_40px_rgba(127,255,0,0.5)] hover:scale-105 transition-all flex items-center gap-2">
                  Start Free <FaArrowRight />
                </Link>
              </div>
              {/* <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-2 text-[#B8C0D4]">
                  <FaCheckCircle className="text-[#32CD32]" />
                  AI Trade Analysis
                </div>
                <div className="flex items-center gap-2 text-[#B8C0D4]">
                  <FaCheckCircle className="text-[#32CD32]" />
                  Real-Time Watchlists
                </div>
                <div className="flex items-center gap-2 text-[#B8C0D4]">
                  <FaCheckCircle className="text-[#32CD32]" />
                  Options Learning
                </div>
                <div className="flex items-center gap-2 text-[#B8C0D4]">
                  <FaCheckCircle className="text-[#32CD32]" />
                  Risk Management
                </div>
              </div> */}
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#32CD32]/20 to-[#39FF14]/20 rounded-3xl blur-3xl"></div>
              <div className="relative  p-8 rounded-3xl border border-white/10 glass">
                <div className="flex items-center justify-center">
                  <img src="/BullBoom.jpeg" alt="BullBoom" className="w-full h-auto rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY BULL BOOM */}
      {/* <section id="features" className="py-20 bg-[#0B1220]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Why Traders Choose Bull Boom</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <FaClipboardList />, title: "Trade Tracking & Journaling", desc: "Track every trade and build discipline." },
              { icon: <FaChartLine />, title: "Smart Watchlists", desc: "Track stocks, indices, futures, and options." },
              { icon: <FaBookOpen />, title: "Learn Options Trading", desc: "Master F&O through bite-sized lessons." },
              { icon: <FaShieldAlt />, title: "Risk Management", desc: "Build discipline and protect capital." }
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-[#0B1220] to-[#050816] p-6 rounded-2xl border border-white/5 hover:border-[#32CD32]/50 hover:shadow-[0_0_40px_rgba(127,255,0,0.2)] hover:-translate-y-2 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#32CD32]/20 to-[#39FF14]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <div className="text-2xl text-[#32CD32]">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-[#B8C0D4]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* KEY BENEFITS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Why Choose Bull Boom?</h2>
          <p className="text-[#B8C0D4] text-lg text-center mb-12 max-w-2xl mx-auto">Everything you need to become a consistent, disciplined trader</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "📚",
                title: "Structured Learning",
                desc: "Step-by-step courses designed for every skill level, from beginner to advanced trader"
              },
              {
                icon: "📝",
                title: "Trade Journaling",
                desc: "Track every trade, analyze mistakes, and improve your decision-making process"
              },
              {
                icon: "📊",
                title: "Smart Watchlist",
                desc: "Monitor your favorite stocks and options with real-time market data"
              },
              {
                icon: "🎯",
                title: "Risk Management",
                desc: "Learn to protect your capital and manage risk like a professional trader"
              },
              {
                icon: "🏆",
                title: "Progress Tracking",
                desc: "Earn achievements and certificates as you complete courses and modules"
              },
              {
                icon: "👥",
                title: "Community Focus",
                desc: "Connect with other traders, share insights, and grow together"
              }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-[#0B1220] to-[#050816] p-6 rounded-2xl border border-white/5 hover:border-[#32CD32]/30 hover:shadow-[0_0_40px_rgba(50,205,50,0.1)] transition-all"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-[#B8C0D4]">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LEARNING HUB */}
      <section className="py-20 bg-[#0B1220]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Become a Better Trader Every Day</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Options Basics", progress: 85 },
              { title: "Charts & Candles", progress: 60 },
              { title: "Option Greeks", progress: 40 },
              { title: "Open Interest", progress: 90 },
              { title: "Trading Strategies", progress: 30 },
              { title: "Risk Management", progress: 75 }
            ].map((mod, i) => (
              <div key={i} className="bg-gradient-to-br from-[#0B1220] to-[#050816] p-6 rounded-2xl border border-white/5 hover:border-[#39FF14]/50 hover:shadow-[0_0_30px_rgba(57,255,20,0.15)] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold">{mod.title}</h3>
                  <span className="text-[#32CD32] text-sm font-semibold">{mod.progress}%</span>
                </div>
                <div className="h-2 bg-[#050816] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#32CD32] to-[#39FF14]"
                    style={{ width: `${mod.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* PRICING */}
      {/* <section id="pricing" className="py-20 bg-[#0B1220]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Subscription Plans</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "FREE",
                price: "₹0",
                features: ["Market Watchlist", "Learning Modules", "Community Access"]
              },
              {
                name: "PREMIUM",
                price: "₹999/mo",
                features: ["Full AI Analysis", "Trade Tracking", "Advanced Insights"],
                popular: true
              },
              {
                name: "PLATINUM",
                price: "₹1999/mo",
                features: ["Instant Alerts", "Premium Signals", "Complete Trading Toolkit"],
                popular: true
              }
            ].map((plan, i) => (
              <div
                key={i}
                className={`p-8 rounded-3xl border transition-all ${
                  plan.popular
                    ? "bg-gradient-to-br from-[#0B1220] to-[#050816] border-[#FFD700] shadow-[0_0_60px_rgba(255,215,0,0.2)] scale-105"
                    : "bg-gradient-to-br from-[#0B1220] to-[#050816] border-white/5"
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-black mb-6">{plan.price}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-[#B8C0D4]">
                      <FaCheckCircle className="text-[#32CD32]" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-bold transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-[#FFD700] to-[#32CD32] text-[#050816] hover:shadow-[0_0_40px_rgba(255,215,0,0.5)]"
                    : "border border-[#32CD32] text-[#32CD32] hover:bg-[#32CD32]/10"
                }`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">What Traders Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Raj Patel", role: "Options Trader", text: "Improved my trade discipline significantly." },
              { name: "Priya Sharma", role: "Day Trader", text: "The learning modules are fantastic!" },
              { name: "Amit Kumar", role: "Swing Trader", text: "Best learning platform for F&O." }
            ].map((t, i) => (
              <div key={i} className="bg-gradient-to-br from-[#0B1220] to-[#050816] p-6 rounded-2xl border border-white/5">
                <p className="text-[#B8C0D4] mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#32CD32] to-[#39FF14] flex items-center justify-center text-[#050816] font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold">{t.name}</div>
                    <div className="text-[#B8C0D4] text-sm">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-[#0B1220]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "What is Bull Boom?", a: "Bull Boom is a trading education and practice platform that helps you track trades, manage risk, and learn options trading." },
              { q: "How does Trade Tracking work?", a: "Our trade journal helps you record every trade, analyze performance, and identify areas for improvement." },
              { q: "Can beginners use Bull Boom?", a: "Absolutely! We have bite-sized learning modules designed specifically for beginners." },
              { q: "What markets are supported?", a: "We support stocks, indices, futures, and options across major exchanges." }
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-[#050816] rounded-2xl border border-white/5 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold">{faq.q}</span>
                  {openFaq === i ? <FaChevronUp className="text-[#32CD32]" /> : <FaChevronDown className="text-[#B8C0D4]" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-[#B8C0D4]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FFD700]/20 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl sm:text-5xl font-black mb-6">Ready to Bull Into Profits?</h2>
          <p className="text-[#B8C0D4] text-xl mb-10">
            Join thousands of traders improving their skills and discipline.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup" className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-bold text-lg hover:shadow-[0_0_40px_rgba(127,255,0,0.5)] hover:scale-105 transition-all">
              Start Free
            </Link>
            {/* <Link to="/signup" className="px-8 py-4 rounded-xl border-2 border-[#FFD700] text-[#FFD700] font-bold text-lg hover:bg-[#FFD700]/10 transition-all">
              Get Premium
            </Link> */}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0B1220] border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/BullBoom.jpeg" alt="Bull Boom" className="w-10 h-10 rounded-xl object-cover" />
                <span className="text-xl font-bold">Bull Boom</span>
              </div>
              <p className="text-[#B8C0D4] text-sm">Trade smarter with complete education and tracking tools.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-[#B8C0D4] text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Social</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#32CD32]/20 hover:text-[#32CD32] transition-all">
                  <FaTelegram />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#32CD32]/20 hover:text-[#32CD32] transition-all">
                  <FaLinkedin />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#32CD32]/20 hover:text-[#32CD32] transition-all">
                  <FaInstagram />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#32CD32]/20 hover:text-[#32CD32] transition-all">
                  <FaTwitter />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-[#B8C0D4] text-sm">
            © 2026 Bull Boom. All rights reserved.
          </div>
        </div>
      </footer>


    </div>
  );
}
