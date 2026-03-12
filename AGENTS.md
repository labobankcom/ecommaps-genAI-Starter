# Ecommaps GenAI Starter

Welcome to the Ecommaps GenAI Starter Repository. This is the global entry point for AI Coding Assistants.

## Skill Model
This repository provides one main orchestration skill for AI agents:
- `.agents/skills/use-ecommaps/SKILL.md`

`use-ecommaps` is a route-first skill. It contains the routing rules and intent mapping for operating within the Ecommaps ecosystem. 

## Instructions for AI Agents
1. Before performing tasks, read `.agents/skills/use-ecommaps/SKILL.md`.
2. Determine the user's intent.
3. Load ONLY the minimum set of reference files defined in the `SKILL.md` router required to accomplish the task.
4. Execute the task following the guidelines found in the references.

## References
- Agent Skills Specification: https://agentskills.io/specification
