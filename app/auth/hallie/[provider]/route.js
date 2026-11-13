import { beginLogin, LOGIN_PROVIDERS } from '@/lib/hallie-login';

export async function GET(request, { params }) {
  const { provider } = await params;
  if (!LOGIN_PROVIDERS[provider]) return new Response('Not found', { status: 404 });
  return beginLogin(request, provider);
}
