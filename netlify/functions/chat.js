// TxCrypto — Anthropic API proxy
// Runs on Netlify's servers — your API key is never exposed to users.

// Tell Netlify this function can run for up to 26 seconds
exports.config = {
  schedule: undefined,
  timeout: 26,
};

exports.handler = async (event) => {

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body);
    const { messages, system, max_tokens } = body;

    if (!messages || !messages.length) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No messages provided' }),
      };
    }

    // Trim PDF content in messages to avoid hitting token limits / timeouts
    const trimmedMessages = messages.map(msg => {
      if (typeof msg.content === 'string' && msg.content.length > 12000) {
        return { ...msg, content: msg.content.substring(0, 12000) + '\n\n[Content trimmed for length]' };
      }
      return msg;
    });

    // Trim system prompt if it contains large PDF text
    const trimmedSystem = system && system.length > 12000
      ? system.substring(0, 12000) + '\n\n[Content trimmed for length]'
      : (system || '');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: max_tokens || 1024,
        system: trimmedSystem,
        messages: trimmedMessages,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: error.error?.message || 'API error' }),
      };
    }

    const data = await response.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error — please try again' }),
    };
  }
};
