# Services

This directory contains reusable service modules for business logic and external integrations.

## Structure

Services should be:

- **Single Responsibility**: Each service handles one specific concern
- **Reusable**: Can be imported and used across different parts of the application
- **Well-documented**: Include JSDoc comments explaining purpose and parameters
- **Error-handled**: Include proper error handling and fallbacks
- **Type-safe**: Use TypeScript with proper types

## Current Services

### `chat-title-generator.ts`

Generates AI-powered titles for chat conversations based on the first user message.

**Usage:**

```typescript
import { generateChatTitle } from "@/lib/services/chat-title-generator";

const title = await generateChatTitle("How do I implement authentication?");
// Returns: "Authentication Implementation Guide"
```

**Features:**

- Uses OpenAI GPT-4o-mini for title generation
- Falls back to truncated message if API fails
- Maximum 50 characters
- Handles empty messages gracefully

## Adding New Services

When creating a new service:

1. Create a new file in this directory: `lib/services/your-service.ts`
2. Export a well-typed function or class
3. Add JSDoc documentation
4. Include error handling
5. Update this README with the new service

## Best Practices

- Keep services pure and focused on their specific task
- Avoid side effects when possible
- Use environment variables for configuration
- Return meaningful error messages
- Log errors appropriately
- Consider rate limiting for external API calls
