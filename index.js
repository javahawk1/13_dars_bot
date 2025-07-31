const { Telegraf, Markup } = require("telegraf")
const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://djakhadeveloper:Tv1UX58Ka1tOTPJO@cluster0.bqcilfl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("connected to db"))
    .catch((err) => console.log(err))

const userSchema = new mongoose.Schema({
    id: Number,
    first_name: String,
    username: String,
    language_code: String
})

const User = mongoose.model("User", userSchema)

const bot = new Telegraf("8402639093:AAGxpnza-PaeU5vHyATADgkmTLBMytnyYzE")

const chanell = "@javohirhawkchannel"

bot.use(async (ctx, next) => {
    try {
        let member = await ctx.telegram.getChatMember(chanell, ctx.from.id)
        if (member.status == "left" || member.status == "kicked") {
            ctx.reply("Kanallarga qoshiling", Markup.inlineKeyboard([Markup.button.url("join our channel", `https://t.me/${chanell.slice(1)}`)]))
        } else {
            next()
        }
    } catch (err) {
        ctx.reply("bot userni tekshirayotganda xatolik boldi")
    }
})

bot.start(async (ctx) => {
    try {
        let data = await User.findOne({ id: ctx.update.message.from.id })
        if (!data) {
            await User.create(ctx.update.message.from)
            ctx.reply("Salom, hush kelibsiz\nbot imkoniyatlarini korish uchun /help bosing")
        } else {
            ctx.reply("Yana korganimizdan hursandmiz\nbot imkoniyatlarini korish uchun /help bosing")
        }
    } catch (err) {
        ctx.reply("botni start qilishda xatolik")
    }
})

bot.help(async (ctx) => {
    ctx.reply("/product - productlarni korish\n/create - product qoshish\n/update - productni update qilish\n/delete - productni ochirish")
})

bot.on("inline_query", async (ctx) => {
    try {
        const query = ctx.inlineQuery.query.trim().toLowerCase()
        const data = await fetch("https://one3-dars-api.onrender.com/")
        const json = await data.json()
        const filtered = json.filter((products) => products.name.toLowerCase().includes(query))
        let result = filtered.map((f) => {
            return {
                type: "article",
                id: f._id,
                title: f.name,
                description: f.description,
                input_message_content: {
                    message_text: `${f.name}\n${f.description}`,
                },
            }
        })
        ctx.answerInlineQuery(result)
    } catch (err) {
        console.log(err)
    }
})

bot.command("product", async (ctx) => {
    try {
        let data = await fetch("https://one3-dars-api.onrender.com/")
        let json = await data.json()

        json.forEach((prd) => {
            ctx.reply(`${prd.name} - ${prd.price}$\n${prd.description}\nID: ${prd._id}`)
        })
    } catch (err) {
        ctx.reply("productlarni olishda xatolik")
    }
})

bot.command("create", async (ctx) => {
    try {
        let arr = ctx.message.text.split("\n").slice(1)
        let name = arr[0]
        let description = arr[1]
        let price = arr[2]

        if (name && description && price) {
            try {
                await fetch("https://one3-dars-api.onrender.com/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name,
                        description: description,
                        price: price
                    })
                })

                ctx.reply("Product muvafaqiyatli qoshildi\nproductlarni korish uchun /product kommadasini bosing")
            } catch (err) {
                ctx.reply("create qilishda xatolik")
            }
        } else {
            ctx.reply("Iltimos togri korinishda kiriting:\n/create\nproduct nomi\ndescriptioni\nprice")
        }
    } catch (err) {
        ctx.reply("xatolik")
    }
})

bot.command("update", async (ctx) => {
    try {
        let arr = ctx.message.text.split("\n").slice(1)
        let id = arr[0]
        let name = arr[1]
        let description = arr[2]
        let price = arr[3]

        if (name && description && price) {
            try {
                await fetch(`https://one3-dars-api.onrender.com/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name,
                        description: description,
                        price: price
                    })
                })

                ctx.reply("Product muvafaqiyatli update qilindi\nproductlarni korish uchun /product kommadasini bosing")
            } catch (err) {
                ctx.reply("update qilishda xatolik")
            }
        } else {
            ctx.reply("Iltimos togri korinishda kiriting:\n/update\nproduct id\nproduct nomi\ndescriptioni\nprice")
        }
    } catch (err) {
        ctx.reply("xatolik")
    }
})

bot.command("delete", async (ctx) => {
    let arr = ctx.message.text.split("\n").slice(1)
    let id = arr[0]

    if (id) {
        try {
            await fetch(`https://one3-dars-api.onrender.com/${id}`, {
                method: "DELETE",
            })

            ctx.reply("product muvaffaqiyatli ochirildi\nproductlarni korish uchun /product kommadasini bosing")
        } catch(err) {
            ctx.reply("productni ochirishda xatolik")
        }
    } else {
        ctx.reply("iltimos togri korinishda kiriting:\n/delete\nproduct id")
    }
})
bot.launch()
