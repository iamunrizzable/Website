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
      // "@'handle' 💯 help me" / "@handle helped me" / "reach out to @handle" —
      // the tag-a-fake-recovery-account testimonial-bait template, spammed
      // across unrelated videos' comments. The tagged handle plus this kind
      // of short testimonial/referral phrasing nearby is the tell.
      /@\s*["']?[\w.]{3,30}["']?[^\w]{0,12}(help(ed)?\s*me|reach(ed)?\s*out|recommend|life\s*saver|thank(s|\s*you)|legit|real\s*deal|god\s*bless)\b/i,
      /(reach(ed)?\s*out\s*to|message|contact)\s*@\s*["']?[\w.]{3,30}/i,
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
  negativity: {
    score: 35,
    patterns: [
      // Living situation mockery
      /you\s+(?:still\s+)?(?:live|stay(?:ing)?)\s+with\s+(?:your?|ur)\s+(?:mom|mommy|mother|dad|daddy|father|grandma|grandpa|grandmother|grandfather|parents?)\b/i,
      /still\s+(?:living|staying)\s+(?:at\s+home|with\s+(?:mom|mommy|dad|daddy|mother|father|grandma|grandpa|parents?))\b/i,
      /\bbasement\s*dweller\b/i,
      // Financial mockery
      /\bbrokie+\b/i,
      /you'?r?e?\s*(?:so\s*)?broke\b/i,
      /\bcan'?t\s*afford\b/i,
      /\bdeadbeat\b/i,
      // General insults
      /\b(dumbass|moron|clown|loser|idiot)\b/i,
      /you\s*(?:suck|stink)\b/i,
      /you'?r?e?\s*(?:so\s*)?(?:trash|garbage|a\s*joke|embarrassing|pathetic|worthless|irrelevant)\b/i,
      // Dismissive / rude
      /no\s*(?:body|one)\s*(?:asked|cares|wants\s*(?:to\s*see\s*)?this)\b/i,
      /get\s*off\s*(?:tiktok|the\s*(?:app|internet)|social\s*media)\b/i,
      /delete\s*(?:your\s*)?(?:account|page|profile|this)\b/i,
      /\bstop\s*posting\b/i,
      /\bL\s*[+&]\s*ratio\b/i,
      /worst\s*\w+\s*ever\b/i,
      /never\s*(?:gonna|going\s*to)\s*make\s*it\b/i,
      /no\s*(?:body|one)\s*(?:watches|follows|cares\s*about)\s*(?:you|ur|u)\b/i,
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
      /\bs+h+[i!]+t+(ty|ting|ter|show|s)?\b/i,
      /\ba+s+s+(h+o+l+e+s?)?\b/i,
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
      // "im 14" / "i'm 16" without needing "years old"
      /i'?m\s+(only\s*)?(1[0-7]|[4-9])\b(?!\s*\d)/i,
      /\b(1[0-7]|[4-9])\s*year[s\-]?\s*old\b/i,
      /^age[:\s]+(1[0-7]|[4-9])\b/i,
      /just\s+turned\s+(1[0-7]|[4-9])\b/i,
      /\bin\s*(middle\s*school|elementary|junior\s*high|high\s*school|hs)\b/i,
      /\b(7th|8th|9th|6th|5th|4th|3rd|10th|11th|12th)\s*grade\b/i,
      /\bfreshman\b|\bsophomore\b/i,
      /\bminor\b/i,
      /\bunderage\b/i,
    ],
  },
};

export function scoreContent(text, customRules = []) {
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

  // Operator-defined custom keyword rules — any match forces a hide
  const lower = text.toLowerCase();
  for (const rule of customRules ?? []) {
    const matched = (rule?.keywords ?? []).some(
      (kw) => kw && lower.includes(String(kw).toLowerCase())
    );
    if (matched) {
      flags.push(`custom:${rule.name ?? 'rule'}`);
      score = Math.max(score, 25);
    }
  }

  score = Math.min(score, 100);

  let action = 'allow';
  if (score >= 25) action = 'hide';

  return { score, flags, action };
}

export function shouldAlert(score) {
  return score >= 60;
}
