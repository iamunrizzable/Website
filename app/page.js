'use client';

export default function Home() {
  const contacts = [
    { 
      name: 'Email', 
      href: 'mailto:tyler@tjbmanagementinc.com', 
      icon: '✉️',
      color: 'from-blue-600 to-blue-400',
      glow: 'shadow-blue-500/50'
    },
    { 
      name: 'X (Twitter)', 
      href: 'https://x.com/iamunrizzable', 
      icon: '𝕏',
      color: 'from-gray-100 to-gray-300',
      glow: 'shadow-gray-400/50'
    },
    { 
      name: 'Snapchat', 
      href: 'https://snapchat.com/add/iamunrizzabl3', 
      icon: '👻',
      color: 'from-yellow-300 to-yellow-100',
      glow: 'shadow-yellow-400/50'
    },
    { 
      name: 'Instagram', 
      href: 'https://instagram.com/iamunrizzable', 
      icon: '📷',
      color: 'from-pink-500 to-rose-400',
      glow: 'shadow-pink-500/50'
    },
    { 
      name: 'TikTok', 
      href: 'https://tiktok.com/@iamunrizzable', 
      icon: '🎵',
      color: 'from-black to-gray-600',
      glow: 'shadow-black/50'
    },
    { 
      name: 'Phone', 
      href: 'tel:+14086696123', 
      icon: '☎️',
      color: 'from-green-500 to-emerald-400',
      glow: 'shadow-green-500/50'
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Logo Section */}
        <div className="mb-16 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-2xl opacity-50 -z-10"></div>
            <img
              src="/logo.png"
              alt="Tyler J. Beasley"
              className="w-80 h-auto max-w-full drop-shadow-2xl relative z-10"
              style={{ filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))' }}
            />
          </div>
        </div>

        {/* Contact Links - Grid Layout */}
        <div className="w-full max-w-4xl mx-auto mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <a
                key={contact.name}
                href={contact.href}
                target={contact.name !== 'Email' && contact.name !== 'Phone' ? '_blank' : undefined}
                rel={contact.name !== 'Email' && contact.name !== 'Phone' ? 'noopener noreferrer' : undefined}
                className={`group relative h-32 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:${contact.glow}`}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${contact.color} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                {/* Border glow */}
                <div className="absolute inset-0 border-2 border-white/20 group-hover:border-white/50 rounded-2xl transition-colors duration-300"></div>

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center gap-2 text-center px-4">
                  <span className="text-5xl transition-transform duration-300 group-hover:scale-125">{contact.icon}</span>
                  <span className="text-lg font-bold text-white drop-shadow-lg">{contact.name}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-4xl mx-auto text-center space-y-3 border-t border-white/10 pt-8">
          <p className="text-sm text-gray-300">
            🤖 This site is managed by <span className="text-purple-400 font-bold">Hallie</span>, an AI assistant.
          </p>
          <p className="text-xs text-gray-500">
            Responses are automated unless escalated to Tyler.
          </p>
          <p className="text-xs text-gray-600">
            © 2026 TJB Management Inc.
          </p>
        </div>
      </div>
    </main>
  );
}
