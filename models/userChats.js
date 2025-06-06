import mongoose from "mongoose";

const userChatsSchema = new mongoose.Schema({
    userId: {
		type: String,
		required: true,
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
});

export default mongoose.models.userchats ||
  mongoose.model("userchats", userChatsSchema);