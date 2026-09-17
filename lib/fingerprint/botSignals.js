// Raw, weak bot/automation heuristics — booleans only, no verdict. See
// lib/deviceSignals.js's scoreBotSignals() for interpretation and the
// honesty caveat: every one of these is individually trivial for a
// motivated bot operator to defeat (e.g. navigator.webdriver is erased by
// a single Chrome launch flag). Kept as raw signals here, scored there.
export async function collectBotSignals() {
  try {
    const webdriver = navigator.webdriver === true;

    const uaLooksChrome = /Chrome\//.test(navigator.userAgent) && !/Edg\/|OPR\//.test(navigator.userAgent);
    const missingChromeObject = uaLooksChrome && typeof window.chrome === 'undefined';

    const emptyPlugins = navigator.plugins?.length === 0;
    const emptyLanguages = !navigator.languages || navigator.languages.length === 0;

    let notificationPermissionMismatch = false;
    try {
      if ('permissions' in navigator && 'Notification' in window) {
        const status = await navigator.permissions.query({ name: 'notifications' });
        if (Notification.permission === 'denied' && status.state === 'prompt') {
          notificationPermissionMismatch = true;
        }
      }
    } catch {
      // This probe just doesn't contribute a signal on browsers where the
      // Permissions API or this particular query isn't supported.
    }

    return { webdriver, missingChromeObject, emptyPlugins, emptyLanguages, notificationPermissionMismatch };
  } catch {
    return null;
  }
}
