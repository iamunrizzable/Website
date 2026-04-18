const RULES = {
  spam: {
    score: 25,
    patterns: [
      /(.)\1{5,}/i,
      /follow\s*(me|back|for\s*follow)/i,
      /f4f|l4l|s4s/i,
      /check\s*(out|my)\s*(bio|profile|link)/i,
      /(free|win|winner|prize|giveaway).{0,20}(click|dm|link|bio)/i,
    ],
  },
  scam: {
    score: 40,
    patterns: [
      /https?:\/\//i,
      /bit\.ly|tinyurl|t\.co/i,
      /crypto|bitcoin|ethereum|nft|invest/i,
      /dm\s*(me|for|to)\s*(make|earn|get)\s*\$?\d/i,
      /\$\d+\s*(per|a)\s*(day|week|hour)/i,
      /onlyfans|of\s*link/i,
      /telegram\s*@/i,
      /whatsapp\s*\+?\d/i,
    ],
  },
  harassment: {
    score: 65,
    patterns: [
      /kill\s*(yourself|urself|u)\b|kys\b/i,
      /hope\s*you\s*(die|get\s*cancer)/i,
      /(worthless|pathetic|disgusting|trash)\s*(human|person|creator|streamer)/i,
      /you('re|\s*are)\s*(so\s*)?(ugly|fat|stupid|dumb)/i,
    ],
  },
  hate_speech: {
    score: 90,
    patterns: [
      /\bn[i1!]+g+[e3a]+r/i,
      /f[a@]g+[o0]t/i,
    ],
  },
  promo: {
    score: 15,
    patterns: [
      /check\s*out\s*my/i,
      /follow\s*my\s*(page|account|profile)/i,
      /subscribe\s*to\s*my/i,
      /new\s*(video|post|content)\s*(out|up|live)/i,
    ],
  },
};

export function scoreContent(text) {
  if (!text || typeof text !== 'string') {
    return { score: 0, flags: [], action: 'allow' };
  }

  let score = 0;
  const flags = [];

  for (const [category, { score: pts, patterns }] of Object.entries(RULES)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        flags.push(category);
        score += pts;
        break;
      }
    }
  }

  // Excessive ALL CAPS
  if (text.length > 10 && (text.match(/[A-Z]/g) ?? []).length / text.length > 0.7) {
    flags.push('caps');
    score += 10;
  }

  score = Math.min(score, 100);

  let action = 'allow';
  if (score >= 80) action = 'hide';
  else if (score >= 50) action = 'flag';
  else if (score >= 25) action = 'review';

  return { score, flags, action };
}

export function shouldAlert(score) {
  return score >= 60;
}
