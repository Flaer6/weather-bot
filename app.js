const { Telegraf } = require('telegraf')
require('dotenv').config()
const axios = require('axios')

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start(ctx =>
	ctx.reply(
		`Привет ${ctx.message.from.first_name}! Я бот погоды. Я могу рассказать вам текущую погоду в любом городе. Просто отправьте мне команду /weather, чтобы начать.`
	)
)

let waitingForCity = false

bot.command('weather', ctx => {
	waitingForCity = true
	ctx.reply('Введите название города 🏙')
})

bot.on('text', ctx => {
	if (waitingForCity) {
		const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${ctx.message.text},ru&appid=${process.env.API_KEY}&units=metric`
		axios
			.get(apiUrl)
			.then(response => {
				const weatherData = response.data
				console.log(weatherData.main.temp)
				if (weatherData.main && weatherData.main.temp !== undefined) {
					ctx.reply(
						`Температура в городе ${ctx.message.text}: \t${Math.round(
							weatherData.main.temp
						)}°C`
					)
				} else {
					ctx.reply(
						'Извините, не удалось получить данные о погоде для данного города.'
					)
				}
				waitingForCity = false // Сброс ожидания города
			})
			.catch(error => {
				console.error('Ошибка при получении данных о погоде:', error)
				ctx.reply('Произошла ошибка при получении данных о погоде')
				waitingForCity = false // Сброс ожидания города
			})
	}
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
