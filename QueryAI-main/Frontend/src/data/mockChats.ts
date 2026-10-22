import type { Chat } from '@/types';

export const mockChats: Chat[] = [
  {
    id: 'c1',
    title: 'Explain RAG',
    group: 'Today',
    createdAt: Date.now() - 1000 * 60 * 30,
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'What is Retrieval Augmented Generation?',
        createdAt: Date.now() - 1000 * 60 * 30,
      },
      {
        id: 'm2',
        role: 'assistant',
        content:
          "Retrieval Augmented Generation (RAG) combines information retrieval with language generation. Instead of relying solely on a model's parametric memory, RAG fetches relevant documents from an external knowledge base at inference time and conditions the generator on those documents.\n\nThe typical pipeline has three stages:\n\n1. **Indexing** — documents are chunked, embedded, and stored in a vector database.\n2. **Retrieval** — the user query is embedded and the top-k most similar chunks are fetched.\n3. **Generation** — the retrieved chunks are injected into the prompt context and the LLM produces an answer.\n\nThis grounding reduces hallucinations, keeps knowledge updatable without retraining, and provides source attribution.",
        createdAt: Date.now() - 1000 * 60 * 28,
      },
    ],
  },
  {
    id: 'c2',
    title: 'Python interview questions',
    group: 'Today',
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    messages: [
      {
        id: 'm3',
        role: 'user',
        content: 'Give me 5 common Python interview questions with answers.',
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
      },
      {
        id: 'm4',
        role: 'assistant',
        content:
          "Here are five common Python interview questions:\n\n**1. What is the difference between a list and a tuple?**\nLists are mutable, tuples are immutable. Tuples are slightly faster and used as dictionary keys.\n\n**2. Explain the GIL.**\nThe Global Interpreter Lock ensures only one thread executes Python bytecode at a time, limiting true CPU parallelism in CPython threads.\n\n**3. What are decorators?**\nDecorators are functions that wrap other functions to modify behavior without changing source code, using the `@decorator` syntax.\n\n**4. Difference between `==` and `is`?**\n`==` compares value equality; `is` compares object identity (same memory location).\n\n**5. What is a generator?**\nA generator yields values lazily using `yield`, producing one item at a time and saving memory for large sequences.",
        createdAt: Date.now() - 1000 * 60 * 60 * 1.9,
      },
    ],
  },
  {
    id: 'c3',
    title: 'Operating Systems notes',
    group: 'Today',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    messages: [
      {
        id: 'm5',
        role: 'user',
        content: 'Summarize process scheduling algorithms.',
        createdAt: Date.now() - 1000 * 60 * 60 * 5,
      },
      {
        id: 'm6',
        role: 'assistant',
        content:
          'Process scheduling algorithms determine which process runs on the CPU:\n\n- **FCFS** — First Come First Served, non-preemptive, simple but causes convoy effect.\n- **SJF** — Shortest Job First, optimal average wait time but needs burst time prediction.\n- **Round Robin** — each process gets a fixed time quantum, fair and responsive.\n- **Priority Scheduling** — highest priority runs first, can starve low-priority processes (aging mitigates).\n- **Multilevel Feedback Queue** — dynamic priority adjustment based on behavior, most flexible.',
        createdAt: Date.now() - 1000 * 60 * 60 * 4.9,
      },
    ],
  },
  {
    id: 'c4',
    title: 'Image classification',
    group: 'Today',
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    messages: [],
  },
  {
    id: 'c5',
    title: 'LangChain concepts',
    group: 'Yesterday',
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
    messages: [
      {
        id: 'm7',
        role: 'user',
        content: 'What are the core LangChain abstractions?',
        createdAt: Date.now() - 1000 * 60 * 60 * 26,
      },
      {
        id: 'm8',
        role: 'assistant',
        content:
          'LangChain core abstractions:\n\n- **LLM / ChatModel** — wrapper around the language model API.\n- **PromptTemplate** — reusable, parameterized prompt construction.\n- **OutputParser** — extracts structured data from model output.\n- **Chain** — composable sequence linking prompts, models, and parsers.\n- **Retriever** — interface for fetching documents from a vector store.\n- **Agent** — uses tools and reasoning (ReAct) to decide actions dynamically.\n- **Memory** — persists conversation history across calls.',
        createdAt: Date.now() - 1000 * 60 * 60 * 25.9,
      },
    ],
  },
  {
    id: 'c6',
    title: 'SQL practice',
    group: 'Yesterday',
    createdAt: Date.now() - 1000 * 60 * 60 * 30,
    messages: [],
  },
  {
    id: 'c7',
    title: 'Machine learning basics',
    group: 'Yesterday',
    createdAt: Date.now() - 1000 * 60 * 60 * 40,
    messages: [],
  },
  {
    id: 'c8',
    title: 'Docker for ML deployments',
    group: 'Previous 7 Days',
    createdAt: Date.now() - 1000 * 60 * 60 * 60 * 3,
    messages: [],
  },
  {
    id: 'c9',
    title: 'FastAPI vs Flask',
    group: 'Previous 7 Days',
    createdAt: Date.now() - 1000 * 60 * 60 * 60 * 4,
    messages: [],
  },
  {
    id: 'c10',
    title: 'Vector databases comparison',
    group: 'Previous 7 Days',
    createdAt: Date.now() - 1000 * 60 * 60 * 60 * 5,
    messages: [],
  },
];

export const mockUser = {
  name: 'Vineetha',
  email: 'vineetha@gmail.com',
  avatarUrl:
    'https://lh3.googleusercontent.com/a/default-user=s96-c',
};
