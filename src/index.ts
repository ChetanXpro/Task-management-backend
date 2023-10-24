import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
import express, { json } from 'express'
import connectDB from './config/db'
import errorHandler from './Middleware/errorHandler'
import cors from 'cors'

import corsOption from './config/corsOptioins'

export const app = express()

const PORT = process.env.PORT || 3003

app.use(errorHandler)
app.use(json())
app.use(cookieParser())
app.use(cors({ ...corsOption, credentials: true }))

import Documents from './Routes/taskRoutes'
import User from './Routes/userRoutes'
import log from './utils/logger'

app.use('/task', Documents)
app.use('/user', User)

setInterval(() => {
	const cpuUsage = process.cpuUsage()
	const memoryUsage = process.memoryUsage()

	console.log('======System Info======' + new Date().toLocaleString())

	console.log(`Heap Total: ${Math.round(memoryUsage.heapTotal / (1024 * 1024))} MB`)
	console.log(`Heap Used: ${Math.round(memoryUsage.heapUsed / (1024 * 1024))} MB`)
	console.log(`RSS: ${Math.round(memoryUsage.rss / (1024 * 1024))} MB`)
	console.log(`External: ${Math.round(memoryUsage.external / (1024 * 1024))} MB`)
}, 5000) // Log every 5 seconds

connectDB()
app.listen(PORT, () => {
	log.info(`Server running on port ${PORT}`)
})
