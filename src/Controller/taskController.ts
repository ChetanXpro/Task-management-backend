import Task from '../Models/Task'

import asyncHandler from 'express-async-handler'
import { redisConstants } from '../libs/consts'
import { deleteKey, getKey, setKey } from '../service/cacheService'
import log from '../utils/logger'

// Content creator Service
export const createTask = asyncHandler(async (req: any, res: any) => {
	const { taskName, description, status, priority } = req.body

	if (!taskName || !status) return res.status(400).json({ message: 'Provide all inputs' })
	if ((status && typeof status !== 'string') || (description && typeof description !== 'string')) {
		return res.status(400).json({ message: 'Provide valid inputs' })
	}

	await Task.create({ taskName, description, status, createdBy: req.id, priority: priority || 'low' })

	await deleteKey(redisConstants.USER_TASK_REDIS_KEY + req.id)
	res.status(200).json({ success: true, message: `Task created` })
})

export const getAllTask = asyncHandler(async (req: any, res: any) => {
	const userId = req.id
	if (!userId) return res.status(400).json({ message: 'Please login again' })

	const cacheTasks = await getKey(redisConstants.USER_TASK_REDIS_KEY + userId)

	if (cacheTasks) {
		const parseData = JSON.parse(cacheTasks)
		log.info('Task found in cache')

		return res.status(200).json({ data: parseData })
	}

	const allTask = await Task.find({ createdBy: req.id })

	await setKey(redisConstants.USER_TASK_REDIS_KEY + userId, JSON.stringify(allTask))

	res.status(200).json({ data: allTask })
})

export const editTask = asyncHandler(async (req: any, res: any) => {
	const { id, taskName, description, status, priority } = req.body
	const userId = req.id

	if (!taskName || !status || typeof status !== 'string' || !id)
		return res.status(400).json({ message: 'Provide all inputs' })

	if (priority && typeof priority !== 'string') {
		return res.status(400).json({ message: 'Provide valid inputs' })
	}
	// check if user send priority and if send then update it to db

	const editied = await Task.findOneAndUpdate(
		{ _id: id, createdBy: userId },
		{ taskName, description, status, priority },
		{ new: true }
	)

	if (!editied) return res.status(400).json({ message: 'No Task with this id' })

	await deleteKey(redisConstants.USER_TASK_REDIS_KEY + userId)
	res.status(200).json({ data: editied })
})

export const changeTaskStatus = asyncHandler(async (req: any, res: any) => {
	const { id, status } = req.body
	const userId = req.id

	if (!status || !id) return res.status(400).json({ message: 'Provide all inputs' })

	// check if user send priority and if send then update it to db

	const editied = await Task.findOneAndUpdate({ _id: id, createdBy: userId }, { status }, { new: true })

	if (!editied) return res.status(400).json({ message: 'No Task with this id' })
	await deleteKey(redisConstants.USER_TASK_REDIS_KEY + userId)
	res.status(200).json({ data: editied })
})

export const deleteTask = asyncHandler(async (req: any, res: any) => {
	const id = req.params.id
	const userId = req.id

	if (!id || typeof id !== 'string') return res.status(400).json({ message: 'Provide all inputs' })

	const deleted = await Task.findOneAndDelete({ _id: id, createdBy: userId })

	log.info(deleted)

	if (!deleted) return res.status(400).json({ message: 'No Task with this id' })
	await deleteKey(redisConstants.USER_TASK_REDIS_KEY + userId)
	res.status(200).json({ data: deleted })
})
