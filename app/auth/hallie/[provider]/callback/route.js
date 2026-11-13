import { finishLogin, LOGIN_PROVIDERS, redirectBack } from '@/lib/hallie-login';
import { getStateType } from '@/lib/oauth-state';

async function complete(request, provider, fields) {
  if (!LOGIN_PROVIDERS[provider]) return new Response('Not found', { status: 404 });
  if (fields.error) return redirectBack(request, { error: String(fields.error) });
  if (getStateType(fields.state) !== `hallie-${provider}`) {
    return new Response('State mismatch', { status: 400 });
  }
  let appleUser = null;
  if (fields.user) {
    try { appleUser = JSON.parse(String(fields.user)); } catch { appleUser = null; }
  }
  return finishLogin(request, provider, fields.code, fields.state, appleUser);
}

export async function GET(request, { params }) {
  const { provider } = await params;
  const url = new URL(request.url);
  return complete(request, provider, {
    code: url.searchParams.get('code'),
    state: url.searchParams.get('state'),
    error: url.searchParams.get('error_description') || url.searchParams.get('error'),
  });
}

export async function POST(request, { params }) {
  const { provider } = await params;
  const form = await request.formData();
  return complete(request, provider, {
    code: form.get('code'),
    state: form.get('state'),
    user: form.get('user'),
    error: form.get('error'),
  });
}
