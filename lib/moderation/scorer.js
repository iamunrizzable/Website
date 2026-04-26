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
  profanity: {
    score: 35,
    patterns: [
      /\bf+[u*]+c+k+(ing?|er|ed|s)?\b/i,
      /\bs+h+[i!]+t+(ty|ting|ter|s)?\b/i,
      /\ba+s+s+h+o+l+e+s?\b/i,
      /\bb+[i!]+t+c+h+(es|ing|y)?\b/i,
      /\bc+u+n+t+s?\b/i,
      /\bd+[i!]+c+k+(s|head)?\b/i,
      /\bp+u+s+s+y\b/i,
      /\bwh?o+r+e+s?\b/i,
      /\bslut+s?\b/i,
      /\bba?st+ard+s?\b/i,
    ],
  },
  potential_minor: {
    score: 70,
    patterns: [
      /i'?m\s*(only\s*)?(1[0-7]|[4-9])\s*(years?\s*old|y\/o|yo)\b/i,
      /i\s*am\s*(only\s*)?(1[0-7]|[4-9])\s*(years?\s*old|y\/o|yo)\b/i,
      /\b(1[0-7]|[4-9])\s*year[s\-]?\s*old\b/i,
      /^age[:\s]+(1[0-7]|[4-9])\b/i,
      /\bin\s*(middle\s*school|elementary|junior\s*high)\b/i,
      /\b(7th|8th|9th|6th|5th|4th|3rd)\s*grade\b/i,
      /\bminor\b/i,
      /\bunderage\b/i,
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

  // Blocking disabled — max action is 'flag' until retraining is complete
  let action = 'allow';
  if (score >= 50) action = 'flag';
  else if (score >= 25) action = 'review';

  return { score, flags, action };
}

export function shouldAlert(score) {
  return score >= 60;
}
