const links = [
  {
    title: 'Email',
    href: 'mailto:contact@tjbmanagementinc.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="link-icon">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 7l-10 7L2 7" />
      </svg>
    ),
  },
  {
    title: 'Twitter / X',
    href: 'https://x.com/tjbmanagement',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="link-icon">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    title: 'Snapchat',
    href: 'https://snapchat.com/add/tjbmanagement',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="link-icon">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.12-.042.195-.065.273-.065.206 0 .39.061.52.18.152.13.222.33.187.553-.053.344-.401.555-.679.695-.097.049-.194.092-.289.135l-.04.018c-.513.235-.795.477-.862.718-.03.135-.009.269.063.401v.004c.02.032.04.063.058.095.375.646.91 1.24 1.59 1.766.32.249.662.453 1.02.607.26.112.545.295.545.601 0 .43-.524.748-.966.87-.175.048-.348.097-.405.128-.15.08-.243.24-.353.435-.136.24-.306.539-.74.681a1.39 1.39 0 01-.396.06c-.213 0-.416-.042-.58-.074l-.105-.02c-.235-.046-.479-.094-.756-.094-.238 0-.469.026-.67.063-.322.058-.616.186-.876.3l-.032.015c-.479.222-1.017.472-1.916.472-.026 0-.053 0-.08-.002-.027.002-.053.002-.08.002-.9 0-1.436-.249-1.915-.471l-.032-.015c-.26-.114-.554-.242-.876-.3-.202-.037-.433-.063-.67-.063-.278 0-.522.048-.757.094l-.104.02c-.165.032-.368.074-.58.074a1.39 1.39 0 01-.397-.06c-.434-.142-.604-.441-.74-.681-.11-.196-.203-.355-.353-.436-.057-.03-.23-.08-.405-.127-.442-.123-.966-.44-.966-.871 0-.306.284-.489.545-.601.357-.154.7-.358 1.02-.607.68-.526 1.215-1.12 1.59-1.766.018-.032.037-.063.058-.095v-.004c.072-.132.093-.266.063-.401-.068-.24-.349-.483-.862-.718l-.04-.018a7.6 7.6 0 01-.29-.135c-.277-.14-.625-.35-.678-.695a.467.467 0 01.187-.553c.13-.12.314-.18.52-.18.078 0 .153.023.273.065.263.094.622.23.922.214.199 0 .326-.045.401-.09a9.5 9.5 0 01-.03-.51l-.003-.06c-.104-1.628-.23-3.654.3-4.847C7.86 1.069 11.216.793 12.206.793z" />
      </svg>
    ),
  },
  {
    title: 'Instagram',
    href: 'https://instagram.com/tjbmanagement',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="link-icon">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: 'TikTok',
    href: 'https://tiktok.com/@tjbmanagement',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="link-icon">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.52a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.72a8.24 8.24 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.15z" />
      </svg>
    ),
  },
  {
    title: 'Phone',
    href: 'tel:+1234567890',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="link-icon">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <main className="container">
      <div className="avatar">TJB</div>

      <div className="header">
        <h1>TJB Management Inc.</h1>
        <p>Management &amp; consulting. Connect with us below.</p>
      </div>

      <div className="links">
        {links.map((link) => (
          <a
            key={link.title}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="link-card"
          >
            {link.icon}
            {link.title}
          </a>
        ))}
      </div>

      <div className="disclaimer">
        <span className="label">AI-Managed</span>
        <p>
          This site is managed by Hallie, an AI assistant. Responses are
          automated unless escalated to Tyler.
        </p>
      </div>

      <div className="footer">© {new Date().getFullYear()} TJB Management Inc.</div>
    </main>
  );
}
