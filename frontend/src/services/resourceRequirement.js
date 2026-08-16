const normalizeParentheses = (value) => String(value || '').replace(/[（]/g, '(').replace(/[）]/g, ')')

const addError = (errors, message) => {
  if (!errors.includes(message)) errors.push(message)
}

const isTokenBoundary = (text, end) => {
  const next = text[end]
  return end >= text.length || /\s|[()]/.test(next)
}

export const createResourceRequirementCandidates = ({ resources = [], resourceGroups = [], resourcePools = [] } = {}) => {
  const candidates = [
    ...resources.map((item) => ({
      value: String(item?.resourceName || item?.name || '').trim(),
      type: 'resource'
    })),
    ...resourceGroups.map((item) => ({
      value: String(item?.resourceGroupName || item?.name || '').trim(),
      type: 'resource-group'
    })),
    ...resourcePools.map((item) => ({
      value: String(item?.poolName || item?.name || '').trim(),
      type: 'resource-pool'
    }))
  ]

  const seen = new Set()
  return candidates
    .filter((item) => item.value && !seen.has(item.value) && seen.add(item.value))
    .sort((left, right) => right.value.length - left.value.length)
}

export const normalizeResourceRequirement = (value) => normalizeParentheses(value).trim()

export const tokenizeResourceExpression = (value, candidates = []) => {
  const text = normalizeParentheses(value)
  const tokens = []
  const errors = []
  const orderedCandidates = [...candidates].sort((left, right) => right.value.length - left.value.length)
  let index = 0

  while (index < text.length) {
    if (/\s/.test(text[index])) {
      index += 1
      continue
    }

    if (text[index] === '(' || text[index] === ')') {
      tokens.push({
        type: text[index] === '(' ? 'lparen' : 'rparen',
        value: text[index]
      })
      index += 1
      continue
    }

    const candidate = orderedCandidates.find((item) =>
      text.startsWith(item.value, index) && isTokenBoundary(text, index + item.value.length)
    )
    if (candidate) {
      tokens.push({ type: 'resource', value: candidate.value, resourceType: candidate.type })
      index += candidate.value.length
      continue
    }

    const operatorMatch = text.slice(index).match(/^(and|or)(?=\s|[()]|$)/i)
    if (operatorMatch) {
      tokens.push({ type: 'operator', value: operatorMatch[1].toLowerCase() })
      index += operatorMatch[1].length
      continue
    }

    const unknownMatch = text.slice(index).match(/^[^\s()]+/)
    const unknown = unknownMatch?.[0] || text[index]
    tokens.push({ type: 'unknown', value: unknown })
    addError(errors, `存在未知资源或资源组：${unknown}`)
    index += unknown.length
  }

  return { tokens, errors }
}

export const validateResourceExpression = (value, candidates = []) => {
  const normalizedExpression = normalizeResourceRequirement(value)
  if (!normalizedExpression) {
    return {
      valid: false,
      normalizedExpression,
      tokens: [],
      errors: ['请输入资源需求表达式']
    }
  }

  const { tokens, errors } = tokenizeResourceExpression(normalizedExpression, candidates)
  let cursor = 0

  const current = () => tokens[cursor]
  const consume = () => tokens[cursor++]

  const parsePrimary = () => {
    const token = current()
    if (!token) {
      addError(errors, '表达式末尾缺少资源或资源组')
      return false
    }
    if (token.type === 'resource') {
      consume()
      return true
    }
    if (token.type === 'lparen') {
      consume()
      if (current()?.type === 'rparen') {
        addError(errors, '括号内必须包含资源表达式')
        consume()
        return false
      }
      const parsed = parseOr()
      if (current()?.type !== 'rparen') {
        addError(errors, '括号不匹配：缺少右括号')
        return false
      }
      consume()
      return parsed
    }
    if (token.type === 'rparen') {
      addError(errors, '括号不匹配：存在多余右括号')
    } else if (token.type === 'operator') {
      addError(errors, `运算符 ${token.value} 前缺少资源或资源组`)
    }
    consume()
    return false
  }

  const parseAnd = () => {
    let parsed = parsePrimary()
    while (current()?.type === 'operator' && current().value === 'and') {
      consume()
      const right = parsePrimary()
      parsed = parsed && right
    }
    return parsed
  }

  function parseOr() {
    let parsed = parseAnd()
    while (current()?.type === 'operator' && current().value === 'or') {
      consume()
      const right = parseAnd()
      parsed = parsed && right
    }
    return parsed
  }

  const parsed = parseOr()
  if (current()) {
    if (current().type === 'resource') {
      addError(errors, '资源或资源组之间需要使用 and 或 or 连接')
    } else if (current().type === 'rparen') {
      addError(errors, '括号不匹配：存在多余右括号')
    } else if (current().type === 'unknown') {
      addError(errors, `存在未知资源或资源组：${current().value}`)
    }
  }

  return {
    valid: parsed && cursor === tokens.length && errors.length === 0 && tokens.every((token) => token.type !== 'unknown'),
    normalizedExpression,
    tokens,
    errors
  }
}
