const { getBalance, createUser, updateBalance, userExists, formatBet } = require("../utils.js")
const { RichEmbed } = require("discord.js")
const shuffle = require("shuffle-array")

var cooldown = new Set()

module.exports = {
    name: "rockpaperscissors",
    description: "play rock paper scissors",
    category: "money",
    run: async (message, args) => {

        if (cooldown.has(message.member.id)) {
            message.delete().catch();
            return message.channel.send("❌\nstill on cooldown").then(m => m.delete(1000));
        }

        if (!userExists(message.member)) {
            createUser(message.member)
        }

        if (args.length == 0 || args.length == 1) {
            return message.channel.send("❌\n$rps <**r**ock/**p**aper/**s**cissors> <bet>")
        }

        let choice = args[0]

        if (choice != "rock" && choice != "paper" && choice != "scissors" && choice != "r" && choice != "p" && choice != "s") {
            return message.channel.send("❌\n$rps <**r**ock/**p**aper/**s**cissors> <bet>")
        }

        if (choice == "r") choice = "rock"
        if (choice == "p") choice = "paper"
        if (choice == "s") choice = "scissors"

        if (args[1] == "all") {
            args[1] = getBalance(message.member)
        }

        if (args[1] == "half") {
            args[1] = getBalance(message.member) / 2
        }

        if (isNaN(args[1]) || parseInt(args[1]) <= 0) {
            if (!isNaN(formatBet(args[1]) || !parseInt(formatBet[args[1]]))) {
                args[1] = formatBet(args[1])
            } else {
                return message.channel.send("❌\n$rps <**r**ock/**p**aper/**s**cissors> <bet>")
            }
        }

        const bet = (parseInt(args[1]))

        if (bet > getBalance(message.member)) {
            return message.channel.send("❌\nyou cannot afford this bet")
        }

        cooldown.add(message.member.id)

        setTimeout(() => {
            cooldown.delete(message.member.id)
        }, 5000)

        updateBalance(message.member, getBalance(message.member) - bet)

        const values = ["rock", "paper", "scissors"]

        const index = values.indexOf(choice);

        if (index > -1) {
            values.splice(index, 1);
        }
        
        const winning = shuffle(values)[Math.floor(Math.random() * values.length)]

        let win = false
        let winnings = 0

        if (choice == "rock" && winning == "scissors") {
            win = true

            winnings = bet * 2.5
            updateBalance(message.member, getBalance(message.member) + winnings)
        } else if (choice == "paper" && winning == "rock") {
            win = true

            winnings = bet * 2.5
            updateBalance(message.member, getBalance(message.member) + winnings)
        } else if (choice == "scissors" && winning == "paper") {
            win = true

            winnings = bet * 2.5
            updateBalance(message.member, getBalance(message.member) + winnings)
        }

        let color;

        if (message.member.displayHexColor == "#000000") {
            color = "#FC4040";
        } else {
            color = message.member.displayHexColor;
        }

        const embed = new RichEmbed()
            .setColor(color)
            .setTitle("rock paper scissors")
            .setDescription("*rock..paper..scissors..* **shoot!!**\n\n**choice** " + choice + "\n**bet** $" + bet.toLocaleString())
            .setFooter(message.member.user.tag + " | bot.tekoh.wtf", message.member.user.avatarURL)
            .setTimestamp();
    
        message.channel.send(embed).then(m => {

            embed.setDescription("**threw** " + winning + "\n\n**choice** " + choice + "\n**bet** $" + bet.toLocaleString())

            if (win) {
                embed.addField("**winner!!**", "**you win** $" + winnings.toLocaleString())
                embed.setColor("#31E862")
            } else {
                embed.addField("**loser!!**", "**you lost** $" + bet.toLocaleString())
                embed.setColor("#FF0000")
            }

            setTimeout(() => {
                m.edit(embed)
            }, 1500)
        }).catch(() => {
            return message.channel.send("❌ \ni may be lacking permission: 'EMBED_LINKS'");
        });
    }
}