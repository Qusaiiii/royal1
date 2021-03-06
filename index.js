const Discord = require('discord.js')
const HypixelAPI = require('hypixel-api')
const moment = require('moment')
const prefix = '!';

const createRichEmbed = (title, description, color, image, footer, thumb) => {
	let genEmbed = new Discord.RichEmbed({
		title,
		description
	})

	genEmbed.setColor(color)

	if (image) genEmbed.setImage(image)

	if (footer) genEmbed.setFooter(footer)

	if (thumb) genEmbed.setThumbnail(thumb)

	return genEmbed
}

const client = new Discord.Client()
const HypixelClient = new HypixelAPI('7c62dbec-f638-4799-bbac-2a31c1c4fe17')

client.on('ready', () => {

	console.log('The bot has been initialized!')

	let installedGuilds = client.guilds.array().sort((a, b) => a.members.array().length > b.members.array().length ? 1 : -1)

	console.log('This bot is available on ' + installedGuilds.length + ' guilds:')

	let totalMembers = 0

	for (let i = 0; i < installedGuilds.length; i++) {
		totalMembers += installedGuilds[i].memberCount
		console.log(installedGuilds[i].name + ': ' + installedGuilds[i].memberCount + ' members')
	}

	console.log('Total members: ' + totalMembers)
})

client.on('message', async (message) => {
	if (message.author.id === client.user.id) return

	if (!message.guild || !message.member) {
		if (message.channel.recipient) {
			message.channel.send('To talk to me, get my attention in servers using the `!hycord` command!')
		}
		return
	}

	const messageContent = message.content

	if (messageContent.indexOf('!') !== 0) return

	if (!message.guild.me.hasPermission('ADMINISTRATOR')) {
		console.log('Still need administrator permission in ' + message.guild.name)
		await message.channel.send(createRichEmbed('Error', 'I need the **Administrator** permission to function!', '#E74C3C'))
	}

	const commandComponents = messageContent.split('!')[1].split(' ')
	const baseCommand = commandComponents[0].toLowerCase()
	const commandArgs = (commandComponents.length > 1 ? commandComponents.slice(1) : [])

	switch (baseCommand) {
		case 'hycord':
			let helpRich = new Discord.RichEmbed()

			helpRich.setTitle('Hycord Bot Information')

			helpRich.setDescription('Hycord')

			helpRich.setColor('#FFE11A')

			helpRich.addField('!player <name>', 'Displays statistics for a player.')

			helpRich.addField('!guild <name>', 'Displays statistics for a Hypixel guild.')

			helpRich.setFooter('Hycord Bot')

			message.channel.send(helpRich)
			break
		case 'eval':
			if (message.author.id === '623866539925307406') {
				await message.channel.send('`' + eval(message.content.substring(6)) + '`')
			}
			break
		case 'player':
			if (commandArgs.length > 0) {
				let hypixelPlayer

				message.channel.startTyping()

				try {
					hypixelPlayer = (await HypixelClient.getPlayer('name', commandArgs[0])).player
				}
				catch (err) {
					console.log(err)
					message.channel.stopTyping()
					message.channel.send('Hmm, that player doesn\'t seem to exist!')
					return
				}

				let playerRich = new Discord.RichEmbed()

				playerRich.setThumbnail('https://crafatar.com/avatars/' + (hypixelPlayer.uuid || '') + '?size=100')
				playerRich.setTitle('Hypixel Player: ' + hypixelPlayer.displayname)
				playerRich.setURL('https://hypixel.net/player/' + hypixelPlayer.displayname + '/')
				playerRich.setFooter('Hycord Bot | Created by ethanent', 'https://i.imgur.com/hFbNBr5.jpg')
				playerRich.setColor('#30DB09')

				playerRich.addField('Rank', (hypixelPlayer.rank || hypixelPlayer.packageRank || hypixelPlayer.newPackageRank || 'None').toString().replace(/_/g, ' '), true)
				playerRich.addField('Hypixel Level', hypixelPlayer.networkLevel || 'Not available', true)
				playerRich.addField('Karma', hypixelPlayer.karma || 'Not available', true)
				playerRich.addField('Client Version', hypixelPlayer.mcVersionRp || 'Not available', true)
				playerRich.addField('First Login', hypixelPlayer.firstLogin ? moment(hypixelPlayer.firstLogin).calendar() : 'Not available', true)
				playerRich.addField('Last Login', hypixelPlayer.lastLogin ? moment(hypixelPlayer.lastLogin).calendar() : 'Not available', true)

				let playerGuild

				let playerGuildID = (await HypixelClient.findGuild('member', hypixelPlayer.uuid)).guild

				if (playerGuildID) {
					playerGuild = (await HypixelClient.getGuild(playerGuildID)).guild
				}

				playerRich.addField('Guild', (playerGuild ? '[' + playerGuild.name + ' [' + playerGuild.tag + ']' + '](https://hypixel.net/guilds/' + playerGuild._id + '/)' : 'None'))

				message.channel.stopTyping()

				message.channel.send(playerRich)
			}
			else {
				message.channel.send('Usage: `!player <name>`')
			}
			break
		case 'guild':
			if (commandArgs.length > 0) {
				message.channel.startTyping()
				let targetGuild = await HypixelClient.findGuild('name', message.content.split('!' + baseCommand + ' ')[1])
				message.channel.stopTyping()
				if (targetGuild.guild === null) {
					message.channel.send('Hmm, that guild doesn\'t seem to exist!')
					return
				}

				let guildData = (await HypixelClient.getGuild(targetGuild.guild)).guild

				let guildRich = new Discord.RichEmbed()

				guildRich.setThumbnail('https://hypixel.net/data/guild_banners/100x200/' + guildData._id + '.png')
				guildRich.setTitle('Hypixel Guild: ' + guildData.name + ' [' + guildData.tag + ']')
				guildRich.setFooter('Hycord Bot | Created by ethanent', 'https://i.imgur.com/hFbNBr5.jpg')
				guildRich.setColor('#2DC7A1')
				guildRich.setURL('https://hypixel.net/guilds/' + guildData._id + '/')

				guildRich.addField('Member Count', guildData.members.length, true)
				guildRich.addField('Created', moment(guildData.created).calendar(), true)
				guildRich.addField('Coins', guildData.coins, true)

				message.channel.send(guildRich)
			}
			else {
				message.channel.send('Usage: `!guild <name>`')
			}
			break
	}
})





client.on('message', message => {
  if (!message.content.startsWith(prefix)) return;
  var args = message.content.split(' ').slice(1);
  var argresult = args.join(' ');
  if (message.author.id !== "623866539925307406") return;

  
  if (message.content.startsWith(prefix + 'setwatch')) {
  client.user.setActivity(argresult, {type: 'WATCHING'})
     console.log('test' + argresult);
    message.channel.sendMessage(`Watch Now: **${argresult}`)
} 

 
  if (message.content.startsWith(prefix + 'setlis')) {
  client.user.setActivity(argresult, {type: 'LISTENING'})
     console.log('test' + argresult);
    message.channel.sendMessage(`LISTENING Now: **${argresult}`)
} 


if (message.content.startsWith(prefix + 'setname')) {
  client.user.setUsername(argresult).then
      message.channel.sendMessage(`Username Changed To **${argresult}**`)
  return message.reply("You Can change the username 2 times per hour");
} 

if (message.content.startsWith(prefix + 'setavatar')) {
  client.user.setAvatar(argresult);
   message.channel.sendMessage(`Avatar Changed Successfully To **${argresult}**`);
}

if (message.content.startsWith(prefix + 'setstream')) {
  client.user.setGame(argresult, "https://www.twitch.tv/peery13");
     console.log('test' + argresult);
    message.channel.sendMessage(`Streaming: **${argresult}`)
} 
if (message.content.startsWith(prefix + 'setplay')) {
  client.user.setGame(argresult);
     console.log('test' + argresult);
    message.channel.sendMessage(`Playing: **${argresult}`)
} 



});

client.login(process.env.BOT_TOKEN)
