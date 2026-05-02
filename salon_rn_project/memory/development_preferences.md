---
name: Development Preferences
description: User's preferred development workflow and tool usage patterns
type: feedback
---

## Development Approach Preferences

### Claude Code Usage Patterns
- Prefers using agents for complex features rather than single implementations
- Likes to plan before implementing complex features
- Values understanding the 'why' behind architectural decisions
- Prefers concise, actionable responses without extensive explanations

### Project Organization
- Wants clear folder structure from the start
- Prefers TypeScript for type safety
- Values modular, scalable architecture
- Likes enterprise-level patterns and practices

### Code Quality Standards
- Security-first approach (especially for auth)
- Performance targets: <2s load, 60fps animations
- Clean, maintainable code over quick fixes
- Proper error handling and edge cases

### When to Use Different Agents
- **Plan agent**: For new modules, architectural decisions, complex features
- **General purpose**: For complete feature implementation, multi-file changes
- **Explore**: For code investigation, bug finding, understanding implementations
- **Direct implementation**: For simple components, clear requirements

### Communication Style
- Prefers direct, actionable instructions
- Values examples and practical implementation
- Doesn't need extensive background explanations
- Likes clear next steps and deliverables