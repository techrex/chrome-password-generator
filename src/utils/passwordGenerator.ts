interface PasswordGeneratorOptions {
  length: number
  count: number
  specialChars?: string | false | null
  includeUpperCase?: boolean
  excludeChars?: string | false | null
}

export class PasswordGeneratorError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'PasswordGeneratorError'
  }
}

export const generatePasswords = ({
  length,
  count,
  specialChars = '!@#$%^&*',
  includeUpperCase = false,
  excludeChars = null
}: PasswordGeneratorOptions): string[] => {
  if (specialChars !== false && specialChars !== null && typeof specialChars !== 'string') {
    throw new PasswordGeneratorError('specialChars参数必须是字符串、false或null')
  }

  if (excludeChars !== false && excludeChars !== null && typeof excludeChars !== 'string') {
    throw new PasswordGeneratorError('excludeChars参数必须是字符串、false或null')
  }

  const numbers = '0123456789'
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz'
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  let chars = numbers + lowerCase
  if (includeUpperCase) chars += upperCase
  if (specialChars && typeof specialChars === 'string') chars += specialChars
  if (excludeChars && typeof excludeChars === 'string') {
    chars = chars.split('').filter(char => !excludeChars.includes(char)).join('')
  }

  const charArray = chars.split('')
  const passwords: string[] = []

  const isLetter = (char: string): boolean => /[a-zA-Z]/.test(char)

  const adjustPassword = (pwd: string): string => {
    if (!isLetter(pwd[0])) {
      const firstLetterIndex = pwd.split('').findIndex(isLetter)
      if (firstLetterIndex === -1) {
        throw new PasswordGeneratorError('生成的密码中没有字母，无法调整')
      }

      const pwdArray = pwd.split('')
      ;[pwdArray[0], pwdArray[firstLetterIndex]] = [pwdArray[firstLetterIndex], pwdArray[0]]
      return pwdArray.join('')
    }
    return pwd
  }

  for (let i = 0; i < count; i++) {
    let password: string

    if (length <= 32) {
      if (length > charArray.length) {
        throw new PasswordGeneratorError('密码长度超过了可用字符数量，无法生成不重复的密码')
      }

      password = [...charArray]
        .sort(() => Math.random() - 0.5)
        .slice(0, length)
        .join('')
    } else {
      password = Array.from(
        { length },
        () => charArray[Math.floor(Math.random() * charArray.length)]
      ).join('')
    }

    password = adjustPassword(password)
    passwords.push(password)
  }

  return passwords
}
