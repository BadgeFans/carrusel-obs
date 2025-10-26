export async function onRequest(context) {
  const AUTH_USER = 'admin';
  const AUTH_PASS = 'MiClaveSegura123';

  const auth = context.request.headers.get('authorization') || '';
  
  if (auth.startsWith('Basic ')) {
    const [user, pass] = atob(auth.slice(6)).split(':');
    if (user === AUTH_USER && pass === AUTH_PASS) {
      return context.next();
    }
  }

  return new Response('Acceso restringido', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin"' }
  });
}
