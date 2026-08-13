# Chat App — System Design Project

A chat application built as a system design exercise. The goal is a smooth, real-time chat experience — including group chats — designed to scale, with every architectural decision made for a concrete reason rather than to look impressive.

## Why this project exists

Most "chat app" tutorials skip straight to code. This project instead simulates what happens in a real startup: start with a naive design, find the problems in it, and iteratively fix them for concrete reasons — redundancy, data ownership, avoiding single points of failure — while being honest about what's actually built versus what's a documented plan for scale.

## Architecture

![architecture diagram](architecture.png)

**Request flow, end to end:**

1. **Client** connects through a single **load balancer**, which is the only entry point into the system.
2. The load balancer routes REST/HTTP traffic to the **api server** and persistent WebSocket connections to the **realtime service**. Both run as multiple stateless instances, so any instance can handle any request and no single instance is a point of failure.
3. The **api server** handles all core operations — signup, auth, fetching conversations and message history — and owns two databases:
   - **Postgres** — structured, relational data: users, auth, conversation and group metadata.
   - **MongoDB** — chat messages. Chosen for high write throughput and a flexible schema (attachments, reactions, edits) rather than to look more advanced.
4. **Sending a message:**
   - The client sends the message to the **api server**, which **persists it to MongoDB first** — this is the durability guarantee; a message is never at risk of being lost before it's saved.
   - The api server then **publishes an event to the message queue** so the message can be delivered in real time.
   - The **realtime service consumes** that event, checks the **cache (Redis)** for the recipient's (or, for group chats, each member's) online status, and pushes the message over the open WebSocket connection to whoever is currently online.
   - If a recipient is offline, delivery simply doesn't happen at send time — they'll get the message from history (via the api server) the next time they load the conversation.
5. **Presence:** the realtime service reads and writes online/offline status to the cache on connect/disconnect, and makes a narrow, direct write to Postgres to update a user's `last_seen` timestamp. This is the *only* database write the realtime service makes.

## Why the realtime service doesn't save messages

Persistence is the api server's responsibility everywhere else in the system. Giving the realtime service write access to message storage as well would blur that ownership and duplicate logic — validation, error handling, retries — across two services. Keeping the save on the api server also means a message is durably stored *before* the system even attempts real-time delivery, which matters once group chats are in play: a message needs to reach several recipients, some of whom may be offline, and "already saved" has to be true regardless of how many of them successfully receive it in real time.

## Group chats: what this design has to account for

Group chat isn't just "send the same message twice." It changes a few assumptions:

- **Fan-out on delivery.** A single message event may need to reach several online recipients, not one. The realtime service needs to look up presence for every member of the group, not a single user.
- **Membership as its own data.** Group metadata (who's in the group, roles, when they joined) lives in Postgres alongside conversations, separate from the messages themselves in MongoDB.
- **Read state per member.** Read receipts or unread counts become per-user-per-group state, not a single flag on the message — this will need its own data model.

## What's built vs. what's a documented plan

Being explicit about this distinction is intentional — it's the difference between "looks impressive" and "I can explain the tradeoffs."

| Component | Status |
|---|---|
| Load balancer → api server / realtime service | Built |
| Api server (multiple stateless instances) | Built |
| Realtime service (WebSocket, chat + presence) | Built |
| Postgres primary | Built |
| MongoDB primary | Built |
| Message queue (publish/consume) | Built |
| Cache (Redis) for presence | Built |
| Group chat support | In progress |
| **Postgres replica** | **Planned, not deployed** |
| **MongoDB replica** | **Planned, not deployed** |

The replicas are documented rather than deployed for now: real primary/replica failover (with something like Patroni to detect failure and promote a standby) is meaningful infrastructure work that's a separate milestone from getting the core app correct. The plan is to add them once the base system is stable, and to be able to explain exactly how failover would work when I do.

## Tech stack

- **Client:** _TBD_
- **Api server:** Node.js, REST
- **Realtime service:** Node.js, WebSocket
- **Databases:** PostgreSQL, MongoDB
- **Cache:** Redis
- **Message queue:** _TBD (e.g. RabbitMQ / Redis Streams / Kafka)_

## Roadmap / progress log

- [x] v1 — Naive design: client talking directly to two backend services, no load balancer, unlabeled databases
- [x] v2 — Added load balancer as single entry point; split REST vs realtime traffic
- [x] v3 — Added dual database (Postgres + MongoDB) with clear ownership per data type
- [x] v4 — Documented (not yet deployed) replica strategy for both databases
- [x] v5 — Corrected message flow: api server persists and publishes; realtime service consumes and delivers based on cached presence, rather than saving messages itself
- [ ] v6 — Design and implement group chat data model (membership, fan-out delivery, per-member read state)
- [ ] v7 — Implement Postgres replica + failover
- [ ] v8 — Implement MongoDB replica
- [ ] v9 — Load test to validate whether multiple api server instances are actually needed at current scale
- [ ] v10 — Add auth/rate limiting at the load balancer or gateway layer

## Getting started

_Setup instructions to be added as the implementation progresses._

## Design principles this project follows

1. **Every component should have exactly one clear owner for each responsibility.** If it's unclear which service is supposed to do something, that's a design smell, not a diagram detail.
2. **Persist before you attempt real-time delivery.** A message being saved should never depend on whether real-time delivery succeeds.
3. **Stateless things get redundant instances; stateful things get replication.** These are different tools for different problems and shouldn't be conflated.
4. **Document the scaling plan even when you don't deploy it.** Being able to say "here's what I'd add and why" is as valuable as having it running.