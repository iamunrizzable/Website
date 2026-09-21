'use client';

import './AgencyShutOffNotice.css';

// Shared "access shut off" notice for both agency kill switches —
// app/agencies/tiktok/SuspensionNotice.js and
// app/agencies/c2/C2SuspensionNotice.js both render this with only the
// agency name differing. Exact copy and the pink solid-button (not the
// gradient-text mailto link used elsewhere on DeviceGate.js's block
// screens) are per explicit instruction.
export default function AgencyShutOffNotice({ agencyName }) {
  return (
    <div className="aso-screen">
      <div className="aso-screen-bg" />
      <div className="aso-card">
        <h1 className="aso-h1">
          We have shut off access to our {agencyName} Agency, for questions or comments
        </h1>
        <a href="mailto:Tyler@tjbmanagementinc.com" className="aso-btn">
          EMAIL TYLER
        </a>
      </div>
    </div>
  );
}
