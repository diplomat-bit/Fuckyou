import { http, HttpResponse, delay } from 'msw';

// Mock Data Store
let users = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', role: 'admin', createdAt: '2023-01-15T08:30:00Z' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'user', createdAt: '2023-02-20T10:15:00Z' },
  { id: '3', name: 'Alice Johnson', email: 'alice.j@example.com', role: 'user', createdAt: '2023-03-05T14:45:00Z' },
];

export const handlers = [
  // Health check endpoint
  http.get('/api/health', async () => {
    await delay(200);
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  }),

  // Auth: Login
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as Record<string, any>;
    await delay(500);

    if (body.email && body.password) {
      const user = users.find(u => u.email === body.email);
      if (user && body.password === 'password123') {
        return HttpResponse.json({
          token: `mock-jwt-token-${user.id}-${Date.now()}`,
          user
        });
      }
    }

    return HttpResponse.json(
      { message: 'Invalid email or password' },
      { status: 401 }
    );
  }),

  // Auth: Logout
  http.post('/api/auth/logout', async () => {
    await delay(200);
    return HttpResponse.json({ success: true });
  }),

  // Auth: Get Current User
  http.get('/api/auth/me', async ({ request }) => {
    await delay(300);
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer mock-jwt-token')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return HttpResponse.json(users[0]);
  }),

  // Users: Get all (with optional search/pagination)
  http.get('/api/users', async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const role = url.searchParams.get('role');

    let filteredUsers = [...users];

    if (search) {
      filteredUsers = filteredUsers.filter(u => 
        u.name.toLowerCase().includes(search) || 
        u.email.toLowerCase().includes(search)
      );
    }

    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }

    return HttpResponse.json({
      data: filteredUsers,
      total: filteredUsers.length,
      page: 1,
      limit: 10
    });
  }),

  // Users: Get by ID
  http.get('/api/users/:id', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const user = users.find((u) => u.id === id);
    
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    return HttpResponse.json(user);
  }),

  // Users: Create
  http.post('/api/users', async ({ request }) => {
    await delay(600);
    const newUser = await request.json() as Record<string, any>;
    
    if (!newUser.name || !newUser.email) {
      return HttpResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      );
    }

    if (users.some(u => u.email === newUser.email)) {
      return HttpResponse.json(
        { message: 'Email already exists' },
        { status: 409 }
      );
    }
    
    const user = {
      id: Math.random().toString(36).substring(2, 9),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role || 'user',
      createdAt: new Date().toISOString()
    };
    
    users.push(user);
    return HttpResponse.json(user, { status: 201 });
  }),

  // Users: Update
  http.put('/api/users/:id', async ({ params, request }) => {
    await delay(500);
    const { id } = params;
    const updates = await request.json() as Record<string, any>;
    
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    users[userIndex] = { ...users[userIndex], ...updates };
    return HttpResponse.json(users[userIndex]);
  }),

  // Users: Delete
  http.delete('/api/users/:id', async ({ params }) => {
    await delay(400);
    const { id } = params;
    const userIndex = users.findIndex((u) => u.id === id);
    
    if (userIndex === -1) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    users = users.filter((u) => u.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),
];