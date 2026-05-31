export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { key } = req.body

  if (!key) {
    return res.status(400).json({ valid: false, error: 'No key provided' })
  }

  try {
    // Activate the key against LemonSqueezy
    const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/activate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        license_key: key,
        instance_name: 'SearchSaves Browser Extension'
      })
    })

    const data = await response.json()

    if (data.activated) {
      return res.status(200).json({ valid: true })
    }

    // Key exists but already activated on another instance
    if (data.error === 'This license key has reached the activation limit.') {
      return res.status(200).json({
        valid: false,
        error: 'This key has already been activated. Check lemonsqueezy.com/my-orders for your key.'
      })
    }

    return res.status(200).json({
      valid: false,
      error: data.error || 'Invalid licence key'
    })

  } catch (error) {
    console.error('Validation error:', error)
    return res.status(500).json({
      valid: false,
      error: 'Could not validate key — please try again'
    })
  }
}
