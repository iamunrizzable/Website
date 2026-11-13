import { NextResponse } from 'next/server';
import {
  listOptimizerRules,
  getOptimizerRule,
  createOptimizerRule,
  createOptimizerRules,
  updateOptimizerRules,
  bindOptimizerRules,
  getOptimizerResult,
  updateOptimizerRuleStatus,
  listOptimizerRuleResults,
} from '@/lib/tiktok/business-api';

import { isValidAdminKey as requireAdmin } from '@/lib/auth';

export async function GET(request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const ruleId = searchParams.get('rule_id');
  try {
    if (ruleId && searchParams.get('view') === 'rule') return NextResponse.json(await getOptimizerRule({ ruleId }));
    if (ruleId) return NextResponse.json(await listOptimizerRuleResults({ ruleId }));
    if (searchParams.get('view') === 'result') {
      let resultDetail;
      try { resultDetail = JSON.parse(searchParams.get('result_detail') ?? ''); } catch { resultDetail = null; }
      if (!Array.isArray(resultDetail) || !resultDetail.length) {
        return NextResponse.json({ error: 'result_detail must be a non-empty array' }, { status: 400 });
      }
      return NextResponse.json(await getOptimizerResult({ resultDetail: resultDetail.slice(0, 20) }));
    }
    return NextResponse.json(await listOptimizerRules());
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  try {
    if (body.action === 'update_status') {
      return NextResponse.json(await updateOptimizerRuleStatus({ ruleId: body.rule_id, status: body.status }));
    }
    if (body.action === 'create_rules') {
      if (!Array.isArray(body.rules) || !body.rules.length) return NextResponse.json({ error: 'rules is required' }, { status: 400 });
      return NextResponse.json(await createOptimizerRules({ rules: body.rules.slice(0, 5) }));
    }
    if (body.action === 'update') {
      if (!Array.isArray(body.rules) || !body.rules.length) return NextResponse.json({ error: 'rules is required' }, { status: 400 });
      return NextResponse.json(await updateOptimizerRules({ rules: body.rules.slice(0, 5) }));
    }
    if (body.action === 'batch_bind') {
      if (!Array.isArray(body.bind_info) || !body.bind_info.length) return NextResponse.json({ error: 'bind_info is required' }, { status: 400 });
      return NextResponse.json(await bindOptimizerRules({ bindInfo: body.bind_info.slice(0, 20) }));
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
