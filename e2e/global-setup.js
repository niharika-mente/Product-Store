import http from 'http';

const BACKEND = process.env.VITE_API_URL || 'http://localhost:5000';

function apiPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(`${BACKEND}${path}`);
    const req = http.request(url, {
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


async function waitForBackend() {
  for (let i = 0; i < 30; i++) {
    try {
      const url = new URL(`${BACKEND}/api/products`);
      const res = await new Promise((resolve, reject) => {
        const req = http.request(url, { method: 'GET' }, resolve);
        req.on('error', reject);
        req.end();
      });
      if (res.statusCode >= 200 && res.statusCode < 500) {
        console.log('[globalSetup] Backend is ready.');
        return;
      }
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  console.warn('[globalSetup] Backend might not be ready, proceeding anyway...');
}

export default async function globalSetup() {
  await waitForBackend();

  // Test User Registration Seed
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  try {
    const res = await apiPost('/api/users/signup', testUser);
    if (res.error) {
       console.log('[globalSetup] User seed message:', res.error);
    } else {
       console.log('[globalSetup] Seeded test user.');
    }
  } catch (err) {
    console.warn(`[globalSetup] Failed to seed user:`, err.message);
  }

  // Clear existing products? No direct route, so we just add new ones.
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
    {
      name: 'Out of Stock Monitor',
      price: 199,
      image: 'https://via.placeholder.com/300x300?text=Monitor',
      category: 'Electronics',
      brand: 'VisionTech',
      stock: 0,
      description: '24 inch IPS monitor',
    },
  ];

  let seededCount = 0;
  for (const product of seeds) {
    try {
      const res = await apiPost('/api/products', product);
      if (res && res._id) seededCount++;
    } catch (err) {
      console.warn(`[globalSetup] Failed to seed product "${product.name}":`, err.message);
    }
  }

  console.log('[globalSetup] Seeded', seededCount, 'test products.');
}
