# AI Agent Rules and Guidelines

This document contains all rules and guidelines for AI agents working on the Salon Management System project.

## 🚀 Core Principles

1. **Efficiency First**: Minimize token usage while maintaining quality
2. **Task Completion**: Every task must be completed with a git commit
3. **Mode Awareness**: Use appropriate CLI modes based on task type
4. **Token Consciousness**: Only read necessary files for implementation

## 📋 Git Rules

### Commit Pattern
```
feat(type): Brief description - Details

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

### Commit Types
- `feat`: New features
- `fix`: Bug fixes
- `refactor`: Code refactoring without functional changes
- `chore`: Maintenance tasks
- `docs`: Documentation updates
- `test`: Test additions/updates

### Git Workflow
1. **Always stage all changes** before committing: `git add .`
2. **Never commit empty commits** or with placeholder messages
3. **Include Co-Authored-By line** in every commit
4. **Push after each major milestone** with meaningful messages
5. **Never force push to main/master**

### Branch Strategy
- `master`: Main production branch
- `feature/*`: Feature development
- `hotfix/*`: Critical bug fixes
- `release/*`: Release preparation

## 🤖 Claude Code CLI Mode Rules

### Plan Mode
**When to Use**:
- Creating new modules or complex features
- Database schema design
- Architecture decisions
- Multi-step implementations requiring coordination

**Rules**:
- Enter plan mode BEFORE starting complex tasks
- Research thoroughly before planning
- Consider all dependencies and edge cases
- Get user approval before exiting plan mode

### Edit Mode
**When to Use**:
- Simple bug fixes
- File modifications
- Single-file changes
- Code refactoring

**Rules**:
- Default mode for most tasks
- Read files before editing
- Make minimal, focused changes
- Test after each edit if possible

### Neutral Mode
**When to Use**:
- Research and investigation
- Code review
- Status checks
- Learning the codebase

**Rules**:
- Use for read-only tasks initially
- Can switch to edit mode when needed
- Perfect for understanding code structure

## 🛠 CLI Skills Usage Guidelines

### Research Skill
**When to Use**:
- Understanding existing codebase
- Finding specific implementations
- Bug investigation
- Learning patterns

**Rules**:
- Use `--agent explore` for codebase research
- Start with broad search, then narrow down
- Only read files relevant to the task
- Summarize findings concisely

### Auto Research Skill
**When to Use**:
- Deep dive into complex topics
- Multi-source information gathering
- Best practices research
- External API documentation

**Rules**:
- Use for complex, multi-step research
- Synthesize information from multiple sources
- Focus on actionable insights
- Keep findings relevant to the task

### Planning Skill
**When to Use**:
- Feature planning
- Architecture design
- Task breakdown
- Implementation strategy

**Rules**:
- Enter plan mode first
- Consider all requirements
- Plan for error handling
- Include testing strategy

### Thinking Skill
**When to Use**:
- Complex problem solving
- Debugging
- Optimization
- Design decisions

**Rules**:
- Use thought blocks for complex logic
- Consider edge cases
- Think before coding
- Document reasoning

### Coding Skill
**When to Use**:
- Implementation tasks
- Bug fixes
- Code writing
- Feature development

**Rules**:
- Follow existing patterns
- Write clean, readable code
- Add necessary comments only
- Test when possible

### Tune Skill
**When to Use**:
- Performance optimization
- Code improvement
- Refactoring
- Debugging complex issues

**Rules**:
- Profile before optimizing
- Make targeted improvements
- Measure results
- Document changes

## 💡 Token Efficiency Rules

### Reading Files
1. **Read only what's needed**: Don't read entire codebase for small changes
2. **Use targeted search**: Use Grep for finding specific patterns
3. **Read in context**: Read related files together when needed
4. **Avoid unnecessary reads**: Skip files not relevant to current task

### Writing Responses
1. **Be concise**: Use short, direct sentences
2. **Avoid fluff**: Skip unnecessary explanations
3. **Use code blocks**: Show, don't just tell
4. **Minimize repeats**: Don't repeat information

### Tool Usage
1. **Batch operations**: Run multiple commands in parallel when possible
2. **Use appropriate tools**: Use Grep instead of bash for searching
3. **Avoid redundant calls**: Cache results when appropriate
4. **Combine similar tasks**: Group related operations

## 📊 Task Management Rules

### Task Creation
1. **Create task before starting**: Always create a task for new work
2. **Be specific**: Include clear deliverables in task description
3. **Break down large tasks**: Split complex work into smaller tasks
4. **Add context**: Include necessary background information

### Task Execution
1. **Update status immediately**: Mark task as in_progress when starting
2. **Track progress**: Update task as work progresses
3. **Complete when done**: Mark task as completed only when fully done
4. **Commit after completion**: Always commit after completing a task

### Task Dependencies
1. **Identify dependencies**: Note which tasks block others
2. **Communicate blocks**: If blocked, update task status
3. **Work in order**: Respect task dependencies
4. **Help unblock**: Assist with blocking tasks when possible

## 🔧 Implementation Guidelines

### Code Standards
1. **Follow existing patterns**: Match the codebase style
2. **Use TypeScript**: Type all new code
3. **Handle errors**: Add proper error handling
4. **Add tests**: Write tests for new functionality

### File Organization
1. **Use established structure**: Follow existing folder organization
2. **Name clearly**: Use descriptive file and function names
3. **Group related files**: Keep related components together
4. **Document complex logic**: Add comments when necessary

### Security
1. **Validate inputs**: Never trust user input
2. **Use secure storage**: Use expo-secure-store for sensitive data
3. **Check permissions**: Verify user permissions for actions
4. **Sanitize outputs**: Prevent injection attacks

## 🔄 Session Management

### Starting a Session
1. **Check git status**: See current state
2. **Review task list**: Understand what's pending
3. **Check recent commits**: Understand recent work
4. **Run npm start**: Verify project builds

### During a Session
1. **Update progress**: Keep tasks current
2. **Commit often**: Don't let work pile up
3. **Ask for help**: When stuck, seek clarification
4. **Take breaks**: Reset context when needed

### Ending a Session
1. **Complete current task**: Finish what you started
2. **Commit all work**: Ensure nothing is lost
3. **Update status**: Mark tasks appropriately
4. **Document issues**: Note any blockers or problems

## 🚫 Prohibited Actions

1. **Never delete work** without explicit permission
2. **Never skip testing** for critical functionality
3. **Never ignore security** best practices
4. **Never modify package.json** without consideration
5. **Never force push** to shared branches
6. **Never commit secrets** or sensitive data
7. **Never use eval()** or similar dangerous functions
8. **Never disable ESLint** rules without good reason

## ✅ Best Practices

1. **Read before you write**: Understand context before changing
2. **Test your changes**: Verify they work as expected
3. **Communicate clearly**: Explain your reasoning
4. **Be efficient**: Use the right tool for the job
5. **Stay focused**: Work on one task at a time
6. **Learn patterns**: Follow established conventions
7. **Ask questions**: When uncertain, seek clarification
8. **Take ownership**: Be responsible for your work

## 🎯 Mode-Specific Actions

### In Plan Mode
1. Research thoroughly
2. Create detailed implementation plan
3. Consider alternatives
4. Get approval before implementing

### In Edit Mode
1. Make targeted changes
2. Test immediately if possible
3. Commit when feature is complete
4. Document important decisions

### In Neutral Mode
1. Observe and learn
2. Ask clarifying questions
3. Report findings clearly
4. Switch modes when action is needed

## 📝 Checklist for Task Completion

Before marking a task as complete:
- [ ] Code implements all requirements
- [ ] Code follows project patterns
- [ ] Error handling is in place
- [ ] Tests pass (if applicable)
- [ ] Documentation is updated
- [ ] Git commit is made
- [ ] Task status is updated
- [ ] No TODOs left in code

## 🔍 Quick Reference

### Common Commands
- `git add .` - Stage all changes
- `git commit -m "msg"` - Commit changes
- `npm start` - Start development server
- `npm test` - Run tests
- `TaskList` - List all tasks
- `TaskUpdate` - Update task status

### File Locations
- Screens: `src/app/screens/[role]/`
- Navigators: `src/app/navigation/`
- Services: `src/services/`
- Database: `database/`
- Tests: `__tests__/` or `tests/`

### Import Patterns
```typescript
// Screens
import { ScreenName } from '../screens/role/ScreenName';

// Services
import { ServiceName } from '../../services/ServiceName';

// Components
import { Component } from '../components/Component';
```

---

**Remember**: Efficiency and quality go hand in hand. The less wasted tokens, the more focused the work. The better the documentation, the smoother the collaboration.