import { describe, expect, it } from 'vitest'

import {
  createResourceRequirementCandidates,
  validateResourceExpression
} from '@/services/resourceRequirement'

const candidates = createResourceRequirementCandidates({
  resources: [{ resourceName: '资源 A' }, { resourceName: '资源 B' }],
  resourceGroups: [{ resourceGroupName: '测控资源组' }]
})

describe('resource requirement expressions', () => {
  it('accepts resources, resource groups, operators and parentheses', () => {
    const result = validateResourceExpression('资源 A and (资源 B or 测控资源组)', candidates)

    expect(result.valid).toBe(true)
    expect(result.tokens.filter(({ type }) => type === 'resource')).toHaveLength(3)
  })

  it('rejects empty expressions and incomplete operators', () => {
    expect(validateResourceExpression('', candidates).errors).toContain('请输入资源需求表达式')
    expect(validateResourceExpression('资源 A and', candidates).valid).toBe(false)
  })

  it('rejects unknown resources and unbalanced parentheses', () => {
    const unknown = validateResourceExpression('资源 A and 未配置资源', candidates)
    const unbalanced = validateResourceExpression('(资源 A or 资源 B', candidates)

    expect(unknown.valid).toBe(false)
    expect(unknown.errors.join('')).toContain('未配置资源')
    expect(unbalanced.errors.join('')).toContain('缺少右括号')
  })
})

