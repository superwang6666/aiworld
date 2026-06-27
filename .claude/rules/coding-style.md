# Coding Style

## Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate:

```javascript
// WRONG: Mutation
function updateUser(user, name) {
  user.name = name  // MUTATION!
  return user
}

// CORRECT: Immutability
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

## File Organization

MANY SMALL FILES > FEW LARGE FILES:
- High cohesion, low coupling
- 200-400 lines typical, 800 max
- Extract utilities from large components
- Organize by feature/domain, not by type

## Error Handling

ALWAYS handle errors comprehensively:

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('Detailed user-friendly message')
}
```

## Input Validation

ALWAYS validate user input:

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## Forbidden → Use Instead

| 禁止 | 替代 |
|------|------|
| `data as string`（类型不确定时强断言） | 类型守卫 `typeof data === 'string'` |
| `function f(x: any)` | `unknown` + 类型收窄 |
| `alert('...')` | `setError()` 或 Toast 组件 |
| 注释掉的旧代码 | 直接删除，用 Git 历史找回 |
| 组件内硬编码中英文 | `t('key')`（next-intl） |
| `new OpenAI(...)` | `getOpenAIClient()`（lib/utils/openai-client.ts） |

## Code Quality Checklist

Before marking work complete:
- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling
- [ ] No console.log statements
- [ ] No hardcoded values
- [ ] No mutation (immutable patterns used)
