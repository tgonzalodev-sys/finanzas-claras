export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { nombre, email } = req.body || {};
  if (!nombre || !email) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const AIRTABLE_TOKEN = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE  = process.env.AIRTABLE_BASE_ID;
  const TABLE_NAME     = 'Leads';

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${TABLE_NAME}`;

  const payload = {
    fields: {
      Nombre: String(nombre).trim(),
      Email:  String(email).trim().toLowerCase(),
    }
  };

  try {
    const r = await fetch(url, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(payload),
    });

    const body = await r.json();

    if (!r.ok) {
      console.error('Airtable error:', JSON.stringify(body));
      return res.status(500).json({ error: 'Error de Airtable', detail: body });
    }

    return res.status(200).json({ ok: true, id: body.id });

  } catch (err) {
    console.error('Fetch error:', err.message);
    return res.status(500).json({ error: 'Error de red', detail: err.message });
  }
}
