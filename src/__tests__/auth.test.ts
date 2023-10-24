// import jest from 'jest'
import { describe, expect, test, it } from '@jest/globals'
import supertest from 'supertest'
import { app } from '..'

describe('auth', () => {
	describe('when proper data not provided to create user', () => {
		it('should return 400', async () => {
			const email = 'chetan@gmail.com'
			const password = ''

			await supertest(app)
				.post('/user')
				.send({
					email,
					password,
				})
				.expect(400)
		})
	})
})
