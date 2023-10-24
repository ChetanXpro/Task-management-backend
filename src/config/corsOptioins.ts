const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000']

const corsOption = {
	origin: (origin: any, callback: any) => {
		if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
			callback(null, true)
		} else {
			callback(new Error('Not alowed by CORS'))
		}
	},
	credentials: true,
	optionsSuccessStatus: 200,
}

export default corsOption
