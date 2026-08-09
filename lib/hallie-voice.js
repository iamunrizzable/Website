// Tyler's voice for the Hallie writer tool (/hallie/writer).
//
// VOICE_EXAMPLES holds real messages/emails Tyler has actually sent, used as
// few-shot style samples so drafts read like he typed them. Add one string
// per message, verbatim — do NOT clean up capitalization, punctuation,
// slang, or emoji; the whole point is that the model copies those habits.
//
// Empty until Tyler provides samples: the writer still works but falls back
// to a generic friendly-professional tone and the page shows a notice.
export const VOICE_EXAMPLES = [
  // e.g. "yo what's good bro, lmk when you tryna go live",
];

// Optional freeform notes about his style that examples alone can't carry
// (e.g. "never uses periods in DMs", "signs emails just 'Tyler'").
export const VOICE_NOTES = '';
