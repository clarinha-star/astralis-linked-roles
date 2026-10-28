import config from './config.js';

// Registra o requisito que pode ser usado no cargo vinculado "Verificado".
const url = `https://discord.com/api/v10/applications/${config.DISCORD_CLIENT_ID}/role-connections/metadata`;
const body = [
  {
    key: 'conta_vinculada',
    name: 'Conta conectada',
    description: 'Autorizou a conexão do Discord com a Astralis',
    type: 7, // boolean_eq
  },
];

if (!config.DISCORD_TOKEN || !config.DISCORD_CLIENT_ID) {
  throw new Error('Configure DISCORD_TOKEN e DISCORD_CLIENT_ID no Render.');
}

const response = await fetch(url, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bot ${config.DISCORD_TOKEN}`,
  },
  body: JSON.stringify(body),
});

if (!response.ok) {
  throw new Error(`Não foi possível registrar os critérios da Astralis (HTTP ${response.status}).`);
}
console.log('Astralis: requisito Conta conectada registrado no Discord.');
