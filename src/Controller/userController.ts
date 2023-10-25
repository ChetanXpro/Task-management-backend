import User from '../Models/User'
import { Request, Response } from 'express'

import asyncHandler from 'express-async-handler'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { generatePreSignedPutUrl } from '../config/s3'
import { generateRandomString } from '../utils/helper'
import { deleteKey, getKey, redisClient, setKey } from '../service/cacheService'
import { redisConstants } from '../libs/consts'
import log from '../utils/logger'

// @ Create new user
export const createNewUser = asyncHandler(async (req: any, res: any) => {
	const { email, password } = req.body

	if (!password || !email) {
		return res.status(400).json({ message: 'Al fields are require' })
	}

	const duplicates = await User.find({ email }).lean().exec()

	if (duplicates.length) {
		return res.status(409).json({
			message: 'Email already exist',
		})
	}

	const hashedPwd = await bcrypt.hash(password, 10)

	const userObject = { email, password: hashedPwd }

	const user = await User.create(userObject)

	if (!user) res.status(400).json({ messssage: `Invalid user data recevied` })

	res.status(201).json({ message: 'User created successfully' })
})

export const getUserById = asyncHandler(async (req: any, res: any) => {
	const userId = req.id

	if (!userId) {
		return res.sendStatus(500).json({ success: false, message: 'something went wrong' })
	}

	const cacheUser = await getKey(redisConstants.USER_REDIS_KEY + userId)

	if (cacheUser) {
		const parseData = JSON.parse(cacheUser)
		log.info('User found in cache')
		const userInfo = {
			email: parseData.email,
			profilePicture: parseData.profilePicture,
		}
		return res.status(200).json(userInfo)
	}

	const foundUser = await User.findById(userId)

	if (!foundUser) return res.status(400).json({ success: false, message: 'No user found with this id' })

	const userInfo = {
		email: foundUser.email,
		profilePicture: foundUser.profilePicture,
	}

	await setKey(redisConstants.USER_REDIS_KEY + userId, JSON.stringify(userInfo), 3600)
	res.status(200).json(userInfo)
})

export const login = asyncHandler(async (req: any, res: any) => {
	const cookies = req.cookies

	const { email, password } = req.body
	if (!email || !password) {
		res.status(400).json({ message: 'All field are required' })
	}

	const foundUser = await User.findOne({ email }).exec()

	if (!foundUser) {
		return res.status(401).json({ message: 'Unauthorized' })
	}

	const match = await bcrypt.compare(password, foundUser.password!)

	if (!match) return res.status(401).json({ message: 'Unauthorized' })
	const secret = process.env.ACCESS_TOKEN_SECRET || ''
	const accessToken = jwt.sign(
		{
			sub: foundUser.id,
		},
		secret,
		{ expiresIn: '1h' }
	)

	const refreshToken = jwt.sign({ sub: foundUser.id }, process.env.REFRESH_TOKEN_SECRET!, {
		expiresIn: '24h',
	})

	foundUser.refreshToken = refreshToken
	await foundUser.save()

	if (cookies?.jwt) {
		res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true })
	}

	res.cookie('jwt', refreshToken, {
		// path: '/',
		maxAge: 24 * 60 * 60 * 1000,
		httpOnly: true,
		sameSite: 'None',
		secure: true,
	})

	res.json({ email: foundUser.email, accessToken })
})

export const refreshToken = asyncHandler(async (req: any, res: any) => {
	const cookies = req.cookies
	log.info('cookies', cookies)

	if (!cookies?.jwt) return res.sendStatus(401)
	const refreshToken = cookies.jwt

	const foundUser = await User.findOne({ refreshToken }).exec()

	if (!foundUser) return res.sendStatus(403)

	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!, (err: any, decoded: any) => {
		if (err || foundUser.id !== decoded.sub) return res.sendStatus(403)

		const secret = process.env.ACCESS_TOKEN_SECRET || ''
		const accessToken = jwt.sign(
			{
				sub: foundUser.id,
			},
			secret,
			{ expiresIn: '1h' }
		)
		res.json({ accessToken })
	})
})

export const handleLogout = asyncHandler(async (req: any, res: any) => {
	const cookies = req.cookies
	log.info('cookie', cookies)

	if (!cookies?.jwt) return res.sendStatus(204) //No content
	const refreshToken = cookies.jwt

	const foundUser = await User.findOne({ refreshToken })

	if (!foundUser) {
		res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true })
		return res.sendStatus(204)
	}

	foundUser.refreshToken = ''

	await foundUser.save()

	res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true })
	res.sendStatus(204)
})

export const handleGetUrl = asyncHandler(async (req: any, res: any) => {
	const { fileType, fileName, fileSize } = req.body

	if (!fileType || !fileName) res.status(400).json({ success: false, message: 'Please provide all details' })

	const s3ObjectKey = generateRandomString(10) + '-' + fileName
	const url = await generatePreSignedPutUrl({
		fileType,
		s3ObjectKey,
	})

	log.info('url', url)

	res.status(200).json({ success: true, url: url, s3ObjectKey })
})

export const handleUpload = asyncHandler(async (req: any, res: any) => {
	const { url } = req.body
	const userId = req.id

	if (!url) res.status(400).json({ success: false, message: 'Please provide all details' })

	const updated = await User.findByIdAndUpdate(userId, { profilePicture: url }, { new: true })

	if (!updated) res.status(400).json({ success: false, message: 'Image upload failed' })

	await deleteKey(redisConstants.USER_REDIS_KEY + userId)

	await res.status(200).json({ success: true, message: 'Uploaded' })
})
