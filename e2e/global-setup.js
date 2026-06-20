import http from 'http';

const BACKEND = 'http://localhost:5000';

function apiPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(`${BACKEND}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

export default async function globalSetup() {
  const seeds = [
    {
      name: 'Laptop Pro X',
      price: 999,
      image: 'https://via.placeholder.com/300x300?text=Laptop',
      category: 'Electronics',
      brand: 'TechBrand',
      stock: 10,
      description: 'High-performance laptop for professionals',
    },
    {
      name: 'Gaming Laptop Ultra',
      price: 1499,
      image: 'https://via.placeholder.com/300x300?text=Gaming+Laptop',
      category: 'Electronics',
      brand: 'GameTech',
      stock: 5,
      description: 'Laptop built for gaming',
    },
    {
      name: 'Wireless Headphones',
      price: 79,
      image: 'https://via.placeholder.com/300x300?text=Headphones',
      category: 'Audio',
      brand: 'SoundCo',
      stock: 20,
      description: 'Premium wireless headphones',
    },
  ];

  for (const product of seeds) {
    try {
      await apiPost('/api/products', product);
    } catch (err) {
      console.warn(`[globalSetup] Failed to seed product "${product.name}":`, err.message);
    }
  }

  console.log('[globalSetup] Seeded', seeds.length, 'test products.');
}
