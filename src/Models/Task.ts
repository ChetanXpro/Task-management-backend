import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
	{
		taskName: {
			type: String,
			required: [true, 'Task name is required'],
		},
		description: String,
		status: {
			type: String,

			enum: ['pending', 'inprogress', 'completed'],
			default: 'pending',
		},
		priority: {
			type: String,

			enum: ['critical', 'high', 'medium', 'low', ''],
			defaultq: '',
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{
		timestamps: true,
	}
)

// module.exports = mongoose.model('Task', taskSchema)
export default mongoose.model('Task', taskSchema)
