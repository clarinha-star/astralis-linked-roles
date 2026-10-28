import {
  ChannelType,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  escapeMarkdown,
} from 'discord.js';

// Ative no Render com ENABLE_WELCOME=true; opcionalmente defina WELCOME_CHANNEL_ID.
const welcomeChannelId = process.env.WELCOME_CHANNEL_ID?.trim();
const welcomeEnabled = Boolean(welcomeChannelId) || process.env.ENABLE_WELCOME?.toLowerCase() === 'true';
const intents = [GatewayIntentBits.Guilds];
if (welcomeEnabled) intents.push(GatewayIntentBits.GuildMembers);

const client = new Client({ intents });
const purple = 0x8a62b3;

const commands = [
  new SlashCommandBuilder().setName('ola').setDescription('Receba uma saudação da Astralis.'),
  new SlashCommandBuilder().setName('ajuda').setDescription('Descubra os comandos da Astralis.'),
  new SlashCommandBuilder().setName('astralis').setDescription('Conheça a guardiã celestial do Eclipse.'),
  new SlashCommandBuilder().setName('eclipse').setDescription('Descubra o universo do servidor Eclipse.'),
  new SlashCommandBuilder().setName('ping').setDescription('Confira se a Astralis está respondendo.'),
  new SlashCommandBuilder()
    .setName('previa-boasvindas')
    .setDescription('Veja como será a mensagem de boas-vindas (equipe do servidor).')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
].map((command) => command.toJSON());

function presentationEmbed(guild) {
  const embed = new EmbedBuilder()
    .setColor(purple)
    .setTitle('☾ ✧ Astralis — Guardiã celestial do Eclipse')
    .setDescription(
      '🌙 **Nascida entre as estrelas e envolta pelo mistério da noite**, sou Astralis, a presença que acompanha os viajantes deste universo.\n\n' +
      'Não carrego uma coroa nem domino as constelações: minha missão é mais simples e especial. Estou aqui para **acolher novos membros, orientar quem chega e ajudar a tornar o Eclipse um lugar agradável para todos**.'
    )
    .addFields(
      {
        name: '✦ O que posso fazer?',
        value: 'Receber novos membros, apresentar o servidor, responder aos meus comandos e orientar a conexão necessária para o cargo **Verificado**.',
      },
      {
        name: '🪐 Como falar comigo?',
        value: 'Experimente **/ola**, **/ajuda** ou **/eclipse**. Para o cargo vinculado, abra **Cargos vinculados** no menu do servidor.',
      },
      {
        name: '☽ Uma pequena promessa',
        value: 'Mesmo na imensidão da noite, cada estrela tem seu próprio brilho. Que a sua encontre espaço aqui.',
      }
    )
    .setFooter({ text: 'Astralis • Entre estrelas, histórias e novos começos' });
  if (guild?.iconURL()) embed.setThumbnail(guild.iconURL());
  return embed;
}

function eclipseEmbed(guild) {
  const embed = new EmbedBuilder()
    .setColor(purple)
    .setTitle('🌑 ✦ Eclipse — Onde diferentes estrelas se encontram')
    .setDescription(
      'Entre a luz e a escuridão existe um universo feito de encontros: **o Eclipse**.\n\n' +
      'Nosso servidor é um espaço de convivência para quem gosta de trocar ideias, fazer amizades e compartilhar aquilo que ama. Aqui, uma conversa simples pode virar uma lembrança especial — e cada pessoa acrescenta algo único à nossa constelação.'
    )
    .addFields(
      {
        name: '🎮 Jogos & diversão',
        value: 'Encontre companhia para jogar, participe das conversas e compartilhe momentos divertidos.',
        inline: true,
      },
      {
        name: '🎧 Música & bate-papo',
        value: 'Descubra gostos em comum, indique suas músicas favoritas e converse sobre o que quiser.',
        inline: true,
      },
      {
        name: '🎨 Artes & poesia',
        value: 'Um cantinho para desenhos, criações, textos e toda a criatividade que merece ser compartilhada.',
      },
      {
        name: '☾ Primeiros passos',
        value: 'Conheça as regras, explore os canais e, se desejar o cargo **✦・Verificado**, acesse **Cargos vinculados** no menu do servidor.',
      }
    )
    .setFooter({ text: 'Eclipse • Um universo de conversas, criatividade e companhia' });
  if (guild?.iconURL()) embed.setThumbnail(guild.iconURL());
  return embed;
}

function welcomeEmbed(member) {
  const memberName = escapeMarkdown(member.displayName || member.user.globalName || member.user.username).slice(0, 80);
  const memberMention = member.user.toString();
  const memberAvatar = member.user.displayAvatarURL({ size: 256 });
  const guild = member.guild;
  const embed = new EmbedBuilder()
    .setColor(purple)
    .setTitle('☾ ⋆⁺₊✧ Uma nova estrela chegou ao Eclipse! ✧₊⁺⋆')
    .setDescription(
      '🌙 **Seja muito bem-vindo(a), ' + memberMention + '!**\n' +
      '✦ **' + memberName + '**, sua estrela acaba de chegar ao nosso universo.\n\n' +
      'Entre tantas constelações, uma nova história acaba de começar: **a sua**.\n\n' +
      'Eu sou **Astralis**, a guardiã celestial deste pequeno universo. Que você encontre boas conversas, novas amizades e um lugar para compartilhar aquilo que faz seus olhos brilharem. ✨'
    )
    .addFields(
      {
        name: '✦ Comece sua jornada',
        value: 'Conheça as **regras** e explore os canais do servidor para descobrir seus cantinhos favoritos.',
      },
      {
        name: '🎮 🎧 🎨 Há espaço para você',
        value: 'Jogos, música, bate-papos, desenhos e poesias: participe do que gostar, no seu ritmo.',
      },
      {
        name: '🌑 Quer o cargo Verificado?',
        value: 'Abra o menu do **Eclipse → Cargos vinculados → ✦・Verificado** e conecte sua conta à Astralis.',
      }
    )
    .setFooter({ text: 'Astralis • Mesmo na noite, cada estrela tem seu brilho' });
  embed.setThumbnail(memberAvatar);
  return embed;
}

// Procura o canal #seja-bem-vindo quando nenhum ID foi configurado.
// Um ID explícito evita ambiguidades quando existem canais parecidos.
async function resolveWelcomeChannel(guild) {
  if (welcomeChannelId) return guild.channels.fetch(welcomeChannelId);
  const channels = await guild.channels.fetch();
  const cleanName = (value) => String(value).normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  const matches = [...channels.values()].filter((channel) => {
    if (!channel || channel.type !== ChannelType.GuildText) return false;
    const name = cleanName(channel.name);
    return name.includes('sejabemvindo') || name.includes('boasvindas');
  });
  if (matches.length !== 1) {
    console.warn('Astralis: não foi possível identificar um único canal de boas-vindas. Canais encontrados:', matches.length);
    return null;
  }
  return matches[0];
}

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

  try {
    switch (interaction.commandName) {
      case 'ola':
        await interaction.reply({
          content: '🌙 Olá, ' + interaction.user.toString() + '! Que as estrelas iluminem sua passagem pelo Eclipse. ✨',
          allowedMentions: { users: [interaction.user.id] },
        });
        break;
      case 'ajuda':
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(purple)
              .setTitle('✦ Guia celestial da Astralis')
              .setDescription(
                '**/ola** — Receba uma saudação.\n' +
                '**/astralis** — Conheça minha história e minhas funções.\n' +
                '**/eclipse** — Descubra as atividades do servidor.\n' +
                '**/ping** — Verifique se estou respondendo.\n\n' +
                '🌑 **Verificação:** no menu do servidor, escolha **Cargos vinculados → ✦・Verificado**.'
              )
              .setFooter({ text: 'Equipe do Eclipse: /previa-boasvindas mostra o cartão de recepção' }),
          ],
        });
        break;
      case 'astralis':
        await interaction.reply({ embeds: [presentationEmbed(interaction.guild)] });
        break;
      case 'eclipse':
        await interaction.reply({ embeds: [eclipseEmbed(interaction.guild)] });
        break;
      case 'ping':
        await interaction.reply({ content: '✨ Astralis está aqui e respondendo!' });
        break;
      case 'previa-boasvindas':
        if (!interaction.inGuild() || !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
          await interaction.reply({
            content: 'Este comando é reservado à equipe que gerencia o servidor.',
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        await interaction.reply({
          embeds: [welcomeEmbed({ user: interaction.user, displayName: interaction.member?.displayName, guild: interaction.guild })],
          flags: MessageFlags.Ephemeral,
          allowedMentions: { parse: [] },
        });
        break;
      default:
        break;
    }
  } catch (error) {
    console.error('Astralis: erro ao responder ao comando:', error?.message || error);
  }
});

client.on(Events.GuildMemberAdd, async (member) => {
  if (!welcomeEnabled) return;
  try {
    const channel = await resolveWelcomeChannel(member.guild);
    if (!channel?.isTextBased() || typeof channel.send !== 'function') {
      console.warn('Astralis: canal de boas-vindas não encontrado ou não é de texto.');
      return;
    }
    await channel.send({
      embeds: [welcomeEmbed(member)],
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
    console.log('Astralis: para ativar as boas-vindas, habilite Server Members Intent no Discord e configure ENABLE_WELCOME=true no Render.');
  }
  try {
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error('Astralis: não foi possível conectar à conta do bot:', error?.message || error);
  }
}
