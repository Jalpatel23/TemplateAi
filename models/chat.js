import mongoose from "mongoose";

// Role constants
export const ROLE_USER = "user";
export const ROLE_MODEL = "model";

const chatSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    history: [{
        role: {
            type: String,
            enum: [ROLE_USER, ROLE_MODEL],
            required: true,
        },
        parts: [
            {
                text: {
                    type: String,
                    required: true,
                },
            },
        ],
    }],
}, { timestamps: true });

// Add compound indexes for better query performance
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.models.chat || mongoose.model("chat", chatSchema);