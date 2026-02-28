'use client';

import Image from 'next/image';

export default function Home() {
  const contacts = [
    { name: 'Email', href: 'mailto:tyler@tjbmanagementinc.com', icon: '✉️' },
    { name: 'X (Twitter)', href: 'https://twitter.com/iamunrizzable', icon: '𝕏' },
    { name: 'Snapchat', href: 'https://snapchat.com/add/iamunrizzable', icon: '👻' },
    { name: 'Instagram', href: 'https://instagram.com/iamunrizzable', icon: '📷' },
    { name: 'TikTok', href: 'https://tiktok.com/@iamunrizzable', icon: '🎵' },
    { name: 'Phone', href: 'tel:+14089876543', icon: '☎️' },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-15 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-cyan-600 via-blue-600 to-purple-600 opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-2xl">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="relative w-full h-auto mb-8">
            <Image
              src="/logo.png"
              alt="Tyler J. Beasley"
              width={600}
              height={200}
              priority
              className="w-full h-auto drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Contact Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {contacts.map((contact) => (
            <a
              key={contact.name}
              href={contact.href}
              target={contact.name !== 'Email' && contact.name !== 'Phone' ? '_blank' : undefined}
              rel={contact.name !== 'Email' && contact.name !== 'Phone' ? 'noopener noreferrer' : undefined}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-gray-700 p-6 transition-all duration-300 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/20 to-pink-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-4">
                <span className="text-3xl">{contact.icon}</span>
                <span className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
                  {contact.name}
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Disclaimer Section */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-xs text-gray-500 space-y-2">
          <p className="text-gray-600">
            🤖 This site is managed by <span className="text-purple-400">Hallie</span>, an AI assistant
          </p>
          <p className="text-gray-700">
            Responses are automated unless escalated to Tyler
          </p>
        </div>
      </div>
    </main>
  );
}
