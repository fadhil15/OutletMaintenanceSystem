const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbztW1H2ol7cad7LU1l2-t_RFs5nb_EYB7toZYYA4mc7VGHj1l1h1FDMNks7vkMNVN8/exec'

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-apps-script-url')
}

function resolveTargetUrl(req) {
  const headerUrl = req.headers['x-apps-script-url']
  const queryUrl = req.query?.url
  return String(headerUrl || queryUrl || process.env.APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL)
}

function appendQuery(url, query) {
  const target = new URL(url)
  Object.entries(query || {}).forEach(([key, value]) => {
    if (key === 'url') return
    if (Array.isArray(value)) {
      value.forEach(item => target.searchParams.append(key, item))
    } else if (value !== undefined && value !== null) {
      target.searchParams.set(key, value)
    }
  })
  return target.toString()
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body)
  if (typeof req.body === 'string') return req.body

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}

export default async function handler(req, res) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  try {
    const targetUrl = appendQuery(resolveTargetUrl(req), req.query)
    const upstreamOptions = {
      method: req.method,
      redirect: 'follow',
      headers: {
        Accept: 'application/json,text/plain,*/*'
      }
    }

    if (req.method === 'POST') {
      upstreamOptions.headers['Content-Type'] = 'text/plain;charset=utf-8'
      upstreamOptions.body = await readBody(req)
    }

    const upstream = await fetch(targetUrl, upstreamOptions)
    const contentType = upstream.headers.get('content-type') || 'text/plain;charset=utf-8'
    const text = await upstream.text()

    res.status(upstream.status)
    res.setHeader('Content-Type', contentType)
    res.send(text)
  } catch (error) {
    res.status(502).json({
      ok: false,
      status: 'error',
      message: 'Apps Script proxy request failed',
      error: error.message
    })
  }
}
