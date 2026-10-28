import {
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
} from 'discord.js';

const welcomeChannelId = process.env.WELCOME_CHANNEL_ID?.trim();
const welcomeEnabled = Boolean(welcomeChannelId);
const intents = [GatewayIntentBits.Guilds];
if (welcomeEnabled) intents.push(GatewayIntentBits.GuildMembers);

const client = new Client({ intents });
const commands = [
  new SlashCommandBuilder().setName('ola').setDescription('Receba uma saudação da Astralis.'),
  new SlashCommandBuilder().setName('ajuda').setDescription('Veja o que a Astralis pode fazer.'),
  new SlashCommandBuilder().setName('astralis').setDescription('Conheça a guardiã do Eclipse.'),
  new SlashCommandBuilder().setName('eclipse').setDescription('Conheça o universo do servidor Eclipse.'),
  new SlashCommandBuilder().setName('ping').setDescription('Confira se a Astralis está respondendo.'),
].map((command) => command.toJSON());

async function registerCommands(guild) {
  try {
    const registered = await guild.commands.fetch();
    for (const command of commands) {
      const existing = registered.find((item) => item.name === command.name && item.type === 1);
      if (existing) await existing.edit(command);
      else await guild.commands.create(command);
    }
    console.log('Astralis: comandos disponíveis no servidor ' + guild.name + '.');
  } catch (error) {
    console.error('Astralis: não foi possível registrar os comandos:', error?.message || error);
  }
}

client.once(Events.ClientReady, async (readyClient) => {
  console.log('Astralis conectada ao Discord como ' + readyClient.user.tag + '.');
  for (const guild of readyClient.guilds.cache.values()) {
    await registerCommands(guild);
  }
});

client.on(Events.GuildCreate, registerCommands);

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const responses = {
    ola: '🌙 Olá, ' + interaction.user.toString() + '! Que as estrelas iluminem sua passagem pelo Eclipse. ✨',
    ajuda: '✦ **Comandos da Astralis**\n**/ola** — Uma saudação celestial.\n**/astralis** — Quem sou eu.\n**/eclipse** — Sobre o servidor.\n**/ping** — Verificar se estou respondendo.\n\n🌑 Para o cargo **Verificado**, use os **Cargos vinculados** no menu do servidor.',
    astralis: '☾ **Astralis — Guardiã celestial do Eclipse**\nNascida entre as estrelas e envolta pelo mistério da noite, minha missão é orientar e trazer harmonia ao nosso universo. ✨',
    eclipse: '🌌 **Eclipse**\nUm cantinho entre a luz e a escuridão, onde amizades, conversas, jogos e arte se encontram. Bem-vindo ao nosso universo! 🌙',
    ping: '✨ Astralis está aqui e respondendo!',
  };
  const content = responses[interaction.commandName];
  if (!content) return;

  try {
    await interaction.reply({
      content,
      allowedMentions: { users: interaction.commandName === 'ola' ? [interaction.user.id] : [] },
    });
  } catch (error) {
    console.error('Astralis: erro ao responder ao comando:', error?.message || error);
  }
});

client.on(Events.GuildMemberAdd, async (member) => {
  if (!welcomeEnabled) return;
  try {
    const channel = await member.guild.channels.fetch(welcomeChannelId);
    if (!channel?.isTextBased() || typeof channel.send !== 'function') {
      console.warn('Astralis: canal de boas-vindas não encontrado ou não é de texto.');
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(0x6a4c93)
      .setTitle('☾ ⋆⁺₊✧ Boas-vindas ao Eclipse ✧₊⁺⋆')
      .setDescription('🌙 Olá, ' + member.toString() + '!\nQue sua chegada seja o começo de uma linda história entre as estrelas.\n\n✦ Confira as regras e aproveite o nosso universo!')
      .setFooter({ text: 'Astralis • Guardiã do Eclipse' });
    await channel.send({
      embeds: [embed],
      allowedMentions: { users: [member.id] },
    });
  } catch (error) {
    console.error('Astralis: não foi possível enviar boas-vindas:', error?.message || error);
  }
});

export async function startDiscordBot() {
  if (!process.env.DISCORD_TOKEN) {
    console.warn('Astralis: token não configurado. Comandos e boas-vindas indisponíveis.');
    return;
  }
  if (!welcomeEnabled) {
    console.log('Astralis: adicione WELCOME_CHANNEL_ID para ativar as boas-vindas automáticas.');
  }
  try {
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error('Astralis: não foi possível conectar à conta do bot:', error?.message || error);
  }
}
