import User from '../Models/User'
import { Router } from 'express'
import {
	createNewUser,
	getUserById,
	handleLogout,
	login,
	refreshToken,
	handleUpload,
	handleGetUrl,
} from '../Controller/userController'
import verifyJWT from '../Middleware/verifyJwt'

const router = Router()

router.post('/', createNewUser)
router.get('/', verifyJWT, getUserById)
router.post('/auth', login)
router.get('/refresh', refreshToken)
router.get('/getUser', verifyJWT, getUserById)
router.get('/logout', handleLogout)
router.post('/geturl', verifyJWT, handleGetUrl)
router.post('/upload', verifyJWT, handleUpload)

export default router
