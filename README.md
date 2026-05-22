Technical Summary: Full-Stack Workflow Automation Platform
Stack: Next.js (TypeScript), n8n (Core Engine), Inngest (Event Orchestration), PostgreSQL (Supabase/Prisma).

The Engineering Challenge
The objective was to build a scalable automation platform capable of handling complex, asynchronous background workflows without blocking the main event loop or losing data during high-concurrency periods.

Key Technical Implementations (Year 2 Entry Evidence):
Event-Driven Architecture: Utilized Inngest to implement a durable execution layer. This allowed for long-running workflows with complex retry logic and state persistence, demonstrating a deep understanding of distributed systems and asynchronous programming.

Concurrency & Queue Management: Instead of basic REST polling, I implemented an event-bus pattern. This proves my readiness to bypass the "Systems Architecture" and "Web Development" Year 1 modules, as I have already mastered handling race conditions and task scheduling.

Schema Design & Type Safety: By using TypeScript with Prisma, I maintained a strictly typed data layer across the frontend and backend, ensuring data integrity across complex JSON payloads typical of automation tools.

API Orchestration: Integrated the n8n self-hosted engine via its REST API, managing authentication headers and rate-limiting to maintain system stability.

graph TD
    A[Next.js Frontend] -->|Trigger Event| B[Inngest Event Bus]
    B -->|Persist State| C[(PostgreSQL)]
    B -->|Execute Logic| D[n8n Engine]
    D -->|Callback| B
