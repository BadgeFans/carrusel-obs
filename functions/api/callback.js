export async function onRequest(context) {
  const { OAUTH_GITHUB_CLIENT_ID, OAUTH_GITHUB_CLIENT_SECRET } = context.env;
  const { searchParams } = new URL(context.request.url);
  const code = searchParams.get('code');

  if (!code) {
    return new Response('No code provided', { status: 400 });
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: OAUTH_GITHUB_CLIENT_ID,
        client_secret: OAUTH_GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const data = await tokenResponse.json();

    if (data.error) {
      return new Response(`GitHub Error: ${data.error_description}`, { status: 400 });
    }

    const content = {
      token: data.access_token,
      provider: 'github'
    };

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authentication Complete</title>
      <script>
        (function() {
          function receiveMessage(e) {
            console.log('Received message:', e);
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify(content)}',
              e.origin
            );
            window.removeEventListener('message', receiveMessage, false);
          }
          
          window.addEventListener('message', receiveMessage, false);
          
          window.opener.postMessage(
            'authorization:github:success:${JSON.stringify(content)}',
            window.location.origin
          );
          
          setTimeout(function() {
            window.close();
          }, 1000);
        })();
      </script>
    </head>
    <body>
      <p>Authentication successful. This window will close automatically.</p>
    </body>
    </html>
    `;

    return new Response(html, {
      headers: { 
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*'
      },
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
