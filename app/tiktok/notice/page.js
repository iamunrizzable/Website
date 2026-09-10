import SuspensionNotice from '@/app/agencies/tiktok/SuspensionNotice';

// Always-on preview of the TikTok suspension notice, independent of the
// /admin/security kill switch — lets the notice be reviewed/tweaked
// without actually suspending access to the live /agencies/tiktok pages.
export const metadata = {
  title: 'TikTok Suspension Notice Preview',
};

export default function TikTokNoticePreviewPage() {
  return <SuspensionNotice />;
}
