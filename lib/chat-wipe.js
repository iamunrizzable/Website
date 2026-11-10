// A request to erase the Hallie conversation, not a comment, video, or rule.
export function isChatWipe(text) {
  const t = String(text ?? '');
  if (/\b(comments?|videos?|rules?|filters?|posts?)\b/i.test(t)) return false;
  return /\b(wipe|erase|delete|clear|remove|forget)\b/i.test(t) && /\b(chats?|conversations?|history|data)\b/i.test(t);
}
