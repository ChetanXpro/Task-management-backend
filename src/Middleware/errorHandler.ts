import log from '../utils/logger'

const errorHandler = (err: { stack: any; message: any }, req: any, res: any, next: any) => {
	log.error('ErrorHandler: ', err.stack)

	const status = res.statusCode ? res.statusCode : 500

	res.status(status)

	res.json({ message: err.message })
}

export default errorHandler
