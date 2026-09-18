import AgencyShutOffNotice from '@/app/AgencyShutOffNotice';

// Shown by C2SuspensionGate when the C2 Agency kill switch
// (/admin/security/kill/switches) is on.
export default function C2SuspensionNotice() {
  return <AgencyShutOffNotice agencyName="C2" />;
}
