import TikTokSuspensionGate from './TikTokSuspensionGate';

export const metadata = {
  title: 'One Creator Network | TikTok LIVE Creator Network',
  description: 'One Creator Network is a creator-first TikTok LIVE agency. Free to join — mentorship, growth strategy, campaigns, tournaments, and community.',
};
export default function Layout({ children }) {
  return <TikTokSuspensionGate>{children}</TikTokSuspensionGate>;
}
