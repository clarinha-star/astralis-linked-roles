import express from 'express';
import cookieParser from 'cookie-parser';

import config from './config.js';
import * as discord from './discord.js';

// Serviço OAuth2 para cargos vinculados da Astralis (Eclipse).
const app = express();
app.disable('x-powered-by');
app.use(cookieParser(config.COOKIE_SECRET));

app.get('/', (req, res) => {
  res.send('🌙 Astralis — Serviço de verificação do Eclipse disponível.');
});

app.get('/linked-role', (req, res) => {
  const { url, state } = discord.getOAuthUrl();
  res.cookie('clientState', state, {
    maxAge: 5 * 60 * 1000,
    signed: true,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
  res.redirect(url);
});

app.get('/discord-oauth-callback', async (req, res) => {
  try {
    const code = req.query.code;
    const discordState = req.query.state;
    const clientState = req.signedCookies?.clientState;

    if (!code || !discordState || !clientState || discordState !== clientState) {
      return res.status(403).send('Não foi possível validar a conexão. Volte ao Discord e tente novamente.');
    }

    const tokens = await discord.getOAuthTokens(code);
    const meData = await discord.getUserData(tokens);
    if (!meData?.user?.id) throw new Error('A conta do Discord não foi encontrada.');

    // Marca somente que a pessoa autorizou a conexão.
    // Não comprova identidade real nem substitui verificação humana.
    const tokenInfo = {
      access_token: tokens.access_token,
      expires_at: Date.now() + tokens.expires_in * 1000,
    };
    await discord.pushMetadata(meData.user.id, tokenInfo, { conta_vinculada: 1 });

    res.clearCookie('clientState', { httpOnly: true, secure: true, sameSite: 'lax' });
    res.send('🌙 Sua conta foi conectada à Astralis! Volte ao Discord para receber o cargo vinculado.');
  } catch (error) {
    console.error('Falha na conexão da Astralis:', error?.message || error);
    res.status(500).send('Não foi possível concluir a conexão. Tente novamente mais tarde.');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Astralis: serviço de verificação iniciado na porta ${port}.`);
});
