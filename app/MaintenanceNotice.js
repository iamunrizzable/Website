'use client';

import './MaintenanceNotice.css';

// Site-wide maintenance notice — amber, not the red used for the agency
// kill switches, since this isn't a moderation/access-revoked action, just
// a temporary planned outage (matches the amber used for DeviceGate.js's
// "unable to verify" soft-block, same distinction: red = something was
// actively shut off, amber = temporary/expected). No email CTA — not
// asked for on this one, unlike the two agency notices.
export default function MaintenanceNotice() {
  return (
    <div className="mn-screen">
      <div className="mn-screen-bg" />
      <div className="mn-card">
        <h1 className="mn-h1">We have taken our systems offline for maintenance.</h1>
        <p className="mn-p">Thank you for your patience, we look forward to bringing our systems back online as soon as our system upgrades and maintenance are complete.</p>
        <a href="/system/status" className="mn-cta-btn">System Status →</a>
      </div>
    </div>
  );
}
