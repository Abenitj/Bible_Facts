const testUserAPI = async () => {
  try {
    // Step 1: Login to get token
    console.log('🔐 Logging in...')
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    })

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`)
    }

    const loginData = await loginResponse.json()
    console.log('✅ Login successful')
    console.log('Token:', loginData.token ? 'Received' : 'Missing')

    // Step 2: Test user creation
    console.log('\n👤 Testing user creation...')
    const createUserResponse = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'test123',
        role: 'content_manager',
        status: 'active'
      })
    })

    console.log('Create user response status:', createUserResponse.status)
    
    if (createUserResponse.ok) {
      const userData = await createUserResponse.json()
      console.log('✅ User created successfully:', userData.data.username)
    } else {
      const errorData = await createUserResponse.json()
      console.log('❌ User creation failed:', errorData)
    }

    // Step 3: Test user listing
    console.log('\n📋 Testing user listing...')
    const listUsersResponse = await fetch('http://localhost:3000/api/users?page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    })

    if (listUsersResponse.ok) {
      const usersData = await listUsersResponse.json()
      console.log('✅ Users listed successfully')
      console.log('Total users:', usersData.pagination.total)
      console.log('Users:', usersData.data.map(u => u.username))
    } else {
      const errorData = await listUsersResponse.json()
      console.log('❌ User listing failed:', errorData)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testUserAPI()
