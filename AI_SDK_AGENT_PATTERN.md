# AI SDK v6 Agent Pattern

Terse, agnostic documentation for building tool-loop agents with Vercel AI SDK.

## Core Imports

```javascript
import {
  ToolLoopAgent,
  createAgentUIStreamResponse,
  stepCountIs,
  tool,
} from 'ai';
import { z } from 'zod';
```

---

## 1. Base Agent Class

```javascript
export class BaseAgent {
  static endpoint = '/api/agent';

  static builder() {
    return new AgentBuilder(this);
  }

  static async create(context) {
    const agent = new this();
    return agent.initialize(context);
  }

  async initialize(context) {
    const { authToken, ...rest } = context;

    const tools = this.getTools();
    const model = this.getModel();
    const instructions = this.getSystemPrompt();

    // Optional: dynamic tool selection per step
    let prepareStep;
    if (this.useDynamicToolSelection()) {
      const toolKeys = Object.keys(tools);
      prepareStep = ({ messages, steps, stepNumber }) => {
        const activeTools = this.selectTools(messages, steps);
        return { activeTools: activeTools.filter((t) => toolKeys.includes(t)) };
      };
    }

    return new ToolLoopAgent({
      model,
      instructions,
      tools,
      stopWhen: stepCountIs(this.getMaxSteps()),
      prepareStep,
      experimental_context: { authToken, ...rest }, // Passed to tool execute()
    });
  }

  // Override these in subclasses
  getTools() {
    throw new Error('Implement getTools()');
  }
  getMaxSteps() {
    return 20;
  }
  getModel() {
    return yourDefaultModel;
  }
  getSystemPrompt() {
    return 'You are a helpful assistant.';
  }
  useDynamicToolSelection() {
    return false;
  }
  selectTools(messages, steps) {
    return Object.keys(this.getTools());
  }
}
```

---

## 2. Builder Pattern (Fluent API)

```javascript
class AgentBuilder {
  #AgentClass;
  #authToken;
  #context = {};
  #model;
  #sendReasoning = false;
  #headers = {};

  constructor(AgentClass) {
    this.#AgentClass = AgentClass;
  }

  withAuth(token) {
    this.#authToken = token;
    return this;
  }

  withContext(ctx) {
    this.#context = { ...this.#context, ...ctx };
    return this;
  }

  withModel(model) {
    this.#model = model;
    return this;
  }

  withReasoning(enabled = true) {
    this.#sendReasoning = enabled;
    return this;
  }

  withHeaders(headers) {
    this.#headers = { ...this.#headers, ...headers };
    return this;
  }

  async build() {
    if (!this.#authToken) throw new Error('authToken required');
    return this.#AgentClass.create({
      authToken: this.#authToken,
      model: this.#model,
      ...this.#context,
    });
  }

  async stream(messages) {
    const agent = await this.build();
    return createAgentUIStreamResponse({
      agent,
      uiMessages: messages,
      sendReasoning: this.#sendReasoning,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
        ...this.#headers,
      },
    });
  }
}
```

---

## 3. Tool Definition Pattern

Tools are async generators that yield status updates:

```javascript
const myTool = tool({
  description: 'Does something useful',

  inputSchema: z.object({
    input: z.string().describe('The input'),
    options: z
      .object({
        flag: z.boolean().optional(),
      })
      .optional(),
  }),

  async *execute(input, context) {
    const { experimental_context } = context;
    const { authToken } = experimental_context;

    // Yield progress (preliminary results)
    yield { status: 'started', message: 'Beginning...' };
    yield { status: 'running', progress: 50 };

    try {
      const result = await doWork(input, authToken);

      // Final yield = tool result for agent
      yield {
        status: 'completed',
        success: true,
        data: result,
      };
    } catch (error) {
      yield {
        status: 'failed',
        error: error.message,
      };
    }
  },
});
```

### Tool Status Helper

```javascript
const ToolStatus = {
  STARTED: 'started',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

const toolYield = (status, label, data = {}) => ({
  __status: status,
  __label: label,
  __timestamp: Date.now(),
  ...data,
});
```

---

## 4. Concrete Agent Example

```javascript
import { myTool, queryTool, decideTool } from './tools';

export class MyAgent extends BaseAgent {
  static endpoint = '/api/my-agent';

  getTools() {
    return {
      myTool,
      queryTool,
      decideTool,
    };
  }

  getMaxSteps() {
    return 50;
  }

  getSystemPrompt() {
    return `You are a specialized assistant. Use tools to accomplish tasks.`;
  }

  useDynamicToolSelection() {
    return true;
  }

  selectTools(messages, steps) {
    // Simple: always include core tools
    const core = ['queryTool', 'decideTool'];
    // Add others based on context...
    return core;
  }
}
```

---

## 5. API Route Handler

```javascript
// Next.js App Router: app/api/agent/route.js
export const maxDuration = 300; // 5 min timeout

export async function POST(req) {
  const authToken = req.headers.get('authorization')?.replace('Bearer ', '');
  const { messages, ...context } = await req.json();

  return MyAgent.builder()
    .withAuth(authToken)
    .withContext(context)
    .stream(messages);
}
```

---

## 6. Client-Side Integration

```javascript
import { useChat, DefaultChatTransport } from 'ai/react';

export function useMyAgent(options = {}) {
  const transport = new DefaultChatTransport({
    api: '/api/my-agent',
    headers: () => ({
      Authorization: `Bearer ${options.authToken}`,
    }),
    body: () => ({
      customField: options.customField,
    }),
  });

  return useChat({
    transport,
    id: options.chatId,
    onToolCall: options.onToolCall,
    onFinish: options.onFinish,
    onError: options.onError,
  });
}
```

---

## 7. Key Patterns Summary

| Pattern                | Implementation                                                        |
| ---------------------- | --------------------------------------------------------------------- |
| **Loop termination**   | `stopWhen: stepCountIs(maxSteps)`                                     |
| **Dynamic tools**      | `prepareStep: ({ messages, steps, stepNumber }) => ({ activeTools })` |
| **Context injection**  | `experimental_context` passed to tool `execute()`                     |
| **Streaming response** | `createAgentUIStreamResponse({ agent, uiMessages, headers })`         |
| **Tool progress**      | Async generator `yield` for preliminary results                       |
| **Final result**       | Last `yield` value becomes tool output                                |
| **SSE headers**        | `text/event-stream`, `no-cache`, `keep-alive`                         |

---

## 8. prepareStep Callback

Called before each agent step. Return `{ activeTools }` array to filter available tools:

```javascript
prepareStep = ({ messages, steps, stepNumber }) => {
  // messages: conversation history
  // steps: previous tool calls & results
  // stepNumber: current iteration (1-indexed)

  const activeTools = selectToolsForContext(messages, steps);
  return { activeTools };
};
```

---

## 9. Message Format (v6)

```javascript
// v6 parts-based message format
const message = {
  role: 'user', // or 'assistant', 'system'
  parts: [
    { type: 'text', text: 'Hello', state: 'done' },
    { type: 'tool-myTool', toolName: 'myTool', input: {...}, output: {...} },
  ],
};
```

---

## 10. Minimal Example

```javascript
import {
  ToolLoopAgent,
  createAgentUIStreamResponse,
  stepCountIs,
  tool,
} from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';

const greetTool = tool({
  description: 'Greets a user',
  inputSchema: z.object({ name: z.string() }),
  async *execute({ name }) {
    yield { status: 'done', message: `Hello, ${name}!` };
  },
});

export async function POST(req) {
  const { messages } = await req.json();

  const agent = new ToolLoopAgent({
    model: openai('gpt-4o'),
    instructions: 'You are helpful. Use greet tool when asked.',
    tools: { greetTool },
    stopWhen: stepCountIs(10),
  });

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
```
