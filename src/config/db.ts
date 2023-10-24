import log from '../utils/logger'
import { set, connect } from 'mongoose'

// import { info, error as _error } from "./logger";

// const logger = require("./logger");

const connectDB = async () => {
	try {
		set('strictQuery', false)
		const connection = (await connect(process.env.MONGO_URI || '')).connection

		connection.on('connected', () => {
			log.info('MongoDB connected')
		})

		connection.on('error', err => {
			log.error(err)
		})
	} catch (error) {
		log.error(error)
	}
}

export default connectDB
