import { NextResponse } from 'next/server';
import {
  listOptimizerRules,
  createOptimizerRule,
  updateOptimizerRuleStatus,
  listOptimizerRuleResults,
} from '@/lib/tiktok/business-api';

import { isValidAdminKey as requireAdmin } from '@/lib/auth';

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const ruleId = searchParams.get('rule_id');
  try {
    if (ruleId) return NextResponse.json(await listOptimizerRuleResults({ ruleId }));
    return NextResponse.json(await listOptimizerRules());
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  try {
    if (body.action === 'update_status') {
      return NextResponse.json(await updateOptimizerRuleStatus({ ruleId: body.rule_id, status: body.status }));
    }
    if (body.action === 'create') {
      return NextResponse.json(await createOptimizerRule({
        ruleName: body.rule_name,
        ruleType: body.rule_type,
        conditions: body.conditions,
        action: body.action_config,
      }));
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
