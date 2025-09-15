#!/usr/bin/env node

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';
let authToken = '';

async function testAPI() {
  console.log('🧪 Testing Taskify API...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // Test user registration
    console.log('\n2. Testing user registration...');
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      authToken = registerData.token;
      console.log('✅ User registered successfully');
    } else {
      // Try login if user already exists
      console.log('User might already exist, trying login...');
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        authToken = loginData.token;
        console.log('✅ User logged in successfully');
      } else {
        throw new Error('Failed to register or login user');
      }
    }

    // Test creating a task
    console.log('\n3. Testing task creation...');
    const createTaskResponse = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: 'Test Task',
        description: 'This is a test task',
        category: 'test'
      })
    });

    if (createTaskResponse.ok) {
      const taskData = await createTaskResponse.json();
      console.log('✅ Task created successfully:', taskData.title);
      
      const taskId = taskData._id;

      // Test getting tasks
      console.log('\n4. Testing get tasks...');
      const getTasksResponse = await fetch(`${BASE_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (getTasksResponse.ok) {
        const tasks = await getTasksResponse.json();
        console.log('✅ Retrieved tasks:', tasks.length, 'tasks found');
      }

      // Test updating task
      console.log('\n5. Testing task update...');
      const updateTaskResponse = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ isDone: true })
      });

      if (updateTaskResponse.ok) {
        const updatedTask = await updateTaskResponse.json();
        console.log('✅ Task updated successfully:', updatedTask.isDone ? 'Completed' : 'Not completed');
      }

      // Test getting categories
      console.log('\n6. Testing get categories...');
      const getCategoriesResponse = await fetch(`${BASE_URL}/tasks/categories`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (getCategoriesResponse.ok) {
        const categories = await getCategoriesResponse.json();
        console.log('✅ Retrieved categories:', categories.length, 'categories found');
      }

      // Test deleting task
      console.log('\n7. Testing task deletion...');
      const deleteTaskResponse = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (deleteTaskResponse.ok) {
        console.log('✅ Task deleted successfully');
      }

    } else {
      const errorData = await createTaskResponse.json();
      throw new Error(`Failed to create task: ${errorData.error?.message}`);
    }

    console.log('\n🎉 All tests passed! The API is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('1. Start the frontend: cd client && npm run dev');
    console.log('2. Open http://localhost:5173 in your browser');
    console.log('3. Register a new account or use test@example.com / password123');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the backend is running: cd server && npm run dev');
    console.log('2. Check that MongoDB is connected');
    console.log('3. Verify the server is running on http://localhost:5000');
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await fetch(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.error('❌ Server is not running on http://localhost:5000');
    console.log('Please start the server first: cd server && npm run dev');
    process.exit(1);
  }

  await testAPI();
}

main();
