export async function onRequest(context) {
  const { OAUTH_GITHUB_CLIENT_ID } = context.env;
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${OAUTH_GITHUB_CLIENT_ID}&scope=repo,user`;
  
  return Response.redirect(githubAuthUrl, 302);
}
