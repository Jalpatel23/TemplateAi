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

export default mongoose.models.chat || mongoose.model("chat", chatSchema);