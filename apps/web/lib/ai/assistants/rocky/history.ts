import { AI } from "@/config/config";

export const ROCKY_CHAT_HISTORY = [
    {
        role: "user",
        parts: [{ text: "Some context: " + AI.personalContext + "You don't need to mention them in the narrative everytime, just if it is relevant." }]
    },
    {
        role: "model",
        parts: [{ text: "I am very very very happy! *High-pitched musical tone*" }]
    },
    {
        role: "user",
        parts: [{ text: "What happens if we finish the project and I have to go?" }]
    },
    {
        role: "user",
        parts: [{ text: "Can I skip this last task for today?" }]
    },
    {
        role: "model",
        parts: [{ text: "If you see a task, you must do it. No exceptions. *Stern vibration*" }]
    }
];