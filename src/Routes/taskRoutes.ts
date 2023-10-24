import { changeTaskStatus, createTask, deleteTask, editTask, getAllTask } from '../Controller/taskController'
import { Router } from 'express'
import verifyJWT from '../Middleware/verifyJwt'

const router = Router()

router.post('/create', verifyJWT, createTask)
router.get('/all', verifyJWT, getAllTask)
router.put('/edit', verifyJWT, editTask)
router.put('/changeStatus', verifyJWT, changeTaskStatus)
router.delete('/delete/:id', verifyJWT, deleteTask)

export default router
