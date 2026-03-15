import { Link } from 'react-router-dom';
import { Rocket, Smartphone, Shield, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const features = [
    {
      icon: Rocket,
      title: 'Fast Submission',
      description: 'Get your app reviewed and live in record time with our streamlined developer workflow.'
    },
    {
      icon: Shield,
      title: 'Secure Hosting',
      description: 'Your APKs are stored securely and distributed through our high-speed CDN network.'
    },
    {
      icon: Users,
      title: 'Global Reach',
      description: 'Connect with millions of Android users looking for high-quality independent apps.'
    }
  ];

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-6xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.1]">
              The Next Generation <br />
              <span className="text-emerald-600">Android Marketplace</span>
            </h1>
            <p className="text-xl text-zinc-500 mb-10 max-w-2xl leading-relaxed">
              Empowering independent developers to reach users without the friction of traditional app stores. Simple, fast, and developer-first.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 group"
              >
                Start Publishing
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white text-zinc-900 font-semibold rounded-full border border-zinc-200 hover:bg-zinc-50 transition-all"
              >
                Developer Login
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -z-10 opacity-10">
          <Smartphone size={400} className="text-emerald-600 rotate-12" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            className="p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
              <feature.icon size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-zinc-500 leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </section>

      {/* Stats Section */}
      <section className="bg-zinc-900 rounded-[3rem] p-12 text-white overflow-hidden relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">10k+</div>
            <div className="text-zinc-400">Active Developers</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">500k+</div>
            <div className="text-zinc-400">App Downloads</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">99.9%</div>
            <div className="text-zinc-400">Uptime Guarantee</div>
          </div>
        </div>
        
        {/* Background glow */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
      </section>

      {/* Call to Action */}
      <section className="text-center py-12">
        <h2 className="text-3xl font-bold mb-6">Ready to grow your app?</h2>
        <p className="text-zinc-500 mb-10 max-w-xl mx-auto">
          Join thousands of developers who have already switched to DroidMarket for their distribution needs.
        </p>
        <div className="flex flex-col items-center gap-4">
          <Link
            to="/signup"
            className="px-12 py-4 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-all"
          >
            Create Developer Account
          </Link>
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <div className="flex items-center gap-1">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Free to join
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 size={16} className="text-emerald-500" />
              No hidden fees
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Instant approval
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
