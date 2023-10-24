// import jest from 'jest'
import { describe, expect, test, it } from '@jest/globals'
import supertest from 'supertest'
import { app } from '..'

describe('task', () => {
	describe('post task route', () => {
		describe('when proper data not provided to create task', () => {
			it('should return 400', async () => {
				const taskName = 'test task'
				const description = 'test task description'

				await supertest(app)
					.post('/task/create/')
					.send({
						taskName,
						description,
					})

					.expect(401)
			})
		})
	})
})
