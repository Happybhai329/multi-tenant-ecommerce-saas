const SENSITIVE_KEYS = new Set([
  'authorization',
  'cookie',
  'password',
  'token',
  'clientsecret',
  'paymentintentclientsecret',
  'stripesignature',
])

const redactValue = (key, value) => {
  if (SENSITIVE_KEYS.has(String(key).toLowerCase())) return '[redacted]'

  if (Array.isArray(value)) {
    return value.map((item) => redactMetadata(item))
  }

  if (value && typeof value === 'object') {
    return redactMetadata(value)
  }

  return value
}

const redactMetadata = (metadata = {}) => {
  if (!metadata || typeof metadata !== 'object') return metadata

  return Object.entries(metadata).reduce((safe, [key, value]) => {
    safe[key] = redactValue(key, value)
    return safe
  }, {})
}

const serialize = (metadata) => {
  if (!metadata || Object.keys(metadata).length === 0) return ''

  try {
    return ` ${JSON.stringify(redactMetadata(metadata))}`
  } catch {
    return ' {"metadata":"[unserializable]"}'
  }
}

const write = (level, message, metadata) => {
  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}${serialize(metadata)}`

  if (level === 'error') {
    console.error(line)
    return
  }

  if (level === 'warn') {
    console.warn(line)
    return
  }

  console.log(line)
}

const logger = {
  http: (message, metadata) => write('http', message, metadata),
  info: (message, metadata) => write('info', message, metadata),
  warn: (message, metadata) => write('warn', message, metadata),
  error: (message, metadata) => write('error', message, metadata),
  event: (name, metadata) => write('info', `event=${name}`, metadata),
}

export default logger
