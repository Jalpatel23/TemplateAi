import mongoose from "mongoose";

const userChatsSchema = new mongoose.Schema({
    userId: {
		type: String,
		required: true,
        index: true
    },
    chats: [{
		_id: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		createdAt: {
			type: Date,
			default: () => new Date()
		},
		updatedAt: {
			type: Date,
			default: () => new Date()
		}
    }],
}, { timestamps: true });

// Add indexes for better query performance
userChatsSchema.index({ userId: 1, 'chats.updatedAt': -1 });
userChatsSchema.index({ 'chats._id': 1 });

export default mongoose.models.userchats ||
  mongoose.model("userchats", userChatsSchema);