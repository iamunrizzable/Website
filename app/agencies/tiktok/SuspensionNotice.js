import AgencyShutOffNotice from '@/app/AgencyShutOffNotice';

// Shown by TikTokSuspensionGate when the TikTok Agency kill switch (now on
// /admin/security/kill/switches) is on, and always-on at /tiktok/notice as
// a preview. Copy replaced per explicit instruction — was a longer
// "suspended all access" notice linking to a press-style letter; now the
// same shut-off-access copy shared with the C2 kill switch.
export default function SuspensionNotice() {
  return <AgencyShutOffNotice agencyName="TikTok" />;
}
