import { isTorExitNode, checkVpnReputation } from './ipLists.js';
import { getAsnInfo } from './asn.js';
import {
  classifyVm, scoreBotSignals, scorePrivacySignals, isVelocityAnomalous, computeSuspectScore,
} from '../deviceSignals.js';

// Combines the reputation lookups + pure classifiers into one enrichment
// object, attached to a near-miss record or a new ban (never to an allowed
// visit — see lib/tokens.js). `velocity` is passed in already-computed by
// the caller rather than looked up here, keeping this module's dependency
// direction one-way (lib/tokens.js -> this file, never the reverse).
//
// Never throws — a failure here must not affect the block/near-miss
// verdict it's attached to after the fact, or the request handling it's
// enriching. Any failure just means an admin sees less detail on that one
// record, not a broken response.
export async function buildEnrichment({ ip, location, components, botSignals, privacySignals, velocity }) {
  try {
    const [tor, vpnRep, asn] = await Promise.all([
      isTorExitNode(ip),
      checkVpnReputation(ip),
      getAsnInfo(ip),
    ]);

    const vm = classifyVm(components?.webgl);
    const bot = scoreBotSignals(botSignals);
    const incognito = scorePrivacySignals(privacySignals);
    const vpnOrDatacenter = vpnRep.vpn || vpnRep.datacenter;

    const suspectScore = computeSuspectScore({
      tor,
      vpnOrDatacenter,
      vm: vm.detected,
      bot: bot.suspected,
      incognito: incognito.suspected,
      velocityAnomaly: isVelocityAnomalous(velocity),
    });

    return {
      computedAt: new Date().toISOString(),
      location: location ?? null,
      asn,
      smartSignals: { tor, vpnOrDatacenter, vm, bot, incognito },
      velocity: velocity ?? null,
      suspectScore,
    };
  } catch {
    return { computedAt: new Date().toISOString(), error: 'enrichment-failed' };
  }
}
