import { useMemo } from 'react'
import {
  decodeRegistrationToken,
  decodeTeacherToken,
  decodeToken,
} from '@/utils/authToken'

const parseNumber = (value: unknown): number | null => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

const getTokenCandidates = () => [
  decodeTeacherToken(),
  decodeRegistrationToken(),
  decodeToken(),
].filter(Boolean)

export const getSocialFeedUserId = (): number | null => {
  try {
    const tokens = getTokenCandidates()

    for (const token of tokens) {
      const userId = parseNumber((token as any)?.user_sys_id)
      if (userId) return userId

      const fallbackId = parseNumber((token as any)?.user_id)
      if (fallbackId) return fallbackId
    }

    return null
  } catch {
    return null
  }
}

export const getSocialFeedRoleName = (): string => {
  try {
    const tokens = getTokenCandidates()
    const role = tokens
      .map((token) => String((token as any)?.role_name ?? '').toLowerCase())
      .find((name) => name.length > 0)

    return role ?? ''
  } catch {
    return ''
  }
}

export const getInstitutionId = (): number | null => {
  try {
    const tokens = getTokenCandidates()

    for (const token of tokens) {
      const instId = parseNumber((token as any)?.inst_id)
      if (instId) return instId

      const nestedInstId = parseNumber((token as any)?.institution?.inst_id)
      if (nestedInstId) return nestedInstId
    }

    return null
  } catch {
    return null
  }
}

export const useAuthIdentity = () => {
  const userId = useMemo(() => getSocialFeedUserId(), [])
  const roleName = useMemo(() => getSocialFeedRoleName(), [])
  const institutionId = useMemo(() => getInstitutionId(), [])

  return { userId, roleName, institutionId }
}
