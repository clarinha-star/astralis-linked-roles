import config from './config.js';

/**
 * Register the metadata to be stored by Discord. This should be a one time action.
 * Note: uses a Bot token for authentication, not a user token.
 */
const url = `https://discord.com/api/v10/applications/${config.DISCORD_CLIENT_ID}/role-connections/metadata`;
// supported types: number_lt=1, number_gt=2, number_eq=3 number_neq=4, datetime_lt=5, datetime_gt=6, boolean_eq=7, boolean_neq=8
const body = [
  {
    key: 'cookieseaten',
    name: 'Biscoitos comidos',
    description: 'Quantidade de biscoitos comidos',
    type: 2,
  },
  {
    key: 'allergictonuts',
    name: 'Alergia a nozes',
    description: 'Indica alergia a nozes',
    type: 7,
  },
  {
    key: 'bakingsince',
    name: 'Assando desde',
    description: 'Data do primeiro biscoito assado',
    type: 6,
  },
];

const response = await fetch(url, {
  method: 'PUT',
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bot ${config.DISCORD_TOKEN}`,
  },
});
if (response.ok) {
  const data = await response.json();
  console.log(data);
} else {
  //throw new Error(`Error pushing discord metadata schema: [${response.status}] ${response.statusText}`);
  const data = await response.text();
  console.log(data);
}
