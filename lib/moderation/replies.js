const TEMPLATES = {
  hate_speech: [
    "That kind of language isn't welcome here and has been removed. Continued violations will result in a permanent block. 🚫",
  ],
  harassment: [
    "Hey! We love our community and everyone in it. Comments that personally attack others aren't allowed in this space — please keep it respectful. 💜",
    "Thanks for being here. We do ask that everyone keep things kind and positive — personal attacks will be removed. 🙏",
  ],
  scam: [
    "Hey! We don't allow outside links, promotions, or solicitations in the comments. Please keep it relevant to the content — appreciate you! 😊",
    "Just a reminder — sharing external links or services in comments isn't allowed here. Thanks for understanding! 🤍",
  ],
  spam: [
    "Thanks for engaging! Just a reminder to keep comments genuine and relevant to the content. ✨",
    "Hey! Repeated or off-topic comments may get filtered. We love real engagement — keep it authentic! 🎵",
  ],
  promo: [
    "Hey! We ask that you not promote your own content in our comment section. Feel free to engage with what's here though! 🙌",
  ],
  default: [
    "Thanks for your comment — our team reviews everything to keep this space positive. 💜",
    "Appreciate you being here! We take our community seriously and review all flagged content. 🤍",
  ],
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function suggestReply(flags = []) {
  if (flags.includes('hate_speech')) return pick(TEMPLATES.hate_speech);
  if (flags.includes('harassment')) return pick(TEMPLATES.harassment);
  if (flags.includes('scam')) return pick(TEMPLATES.scam);
  if (flags.includes('spam')) return pick(TEMPLATES.spam);
  if (flags.includes('promo')) return pick(TEMPLATES.promo);
  return pick(TEMPLATES.default);
}
