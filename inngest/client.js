import { Inngest } from "inngest";

// Create a client to send and receive events with proper configuration
export const inngest = new Inngest({
    id: "ai-lms",
    // Add event key if available
    eventKey: process.env.INNGEST_EVENT_KEY,
    // Configure for development/production
    isDev: process.env.NODE_ENV === 'development',
    // Add logger configuration
    logger: {
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
    }
});