import log from '../utils/logger'

const redis = require('async-redis')

const REDIS_PORT = process.env.REDIS_PORT
const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PASSWORD = process.env.REDIS_PASSWORD

export const redisClient = redis.createClient({
	url: 'rediss://' + REDIS_HOST + ':' + REDIS_PORT,
	password: REDIS_PASSWORD,
})

redisClient.on('connect', () => log.info('Redis connected'))

export const getKey = async (key: string) => {
	return await redisClient.get(key)
}

export const deleteKey = async (key: string) => {
	return await redisClient.del(key)
}

export const setKey = async (key: string, value: any, expire: number = 0, setIfNotExist: boolean = false) => {
	let params = [key, value]
	if (expire > 0) params.push('EX', expire)
	if (setIfNotExist) params.push('NX')

	// console.log("command : SET ", params);
	let response = await redisClient.sendCommand('SET', params)

	if (response) {
		log.info(key + ' set to => ' + value)
		return true
	} else return false
}

export const sendCommand = async (command: string, params: any[]) => {
	let result = await redisClient.sendCommand(command, params)
	return result
}
