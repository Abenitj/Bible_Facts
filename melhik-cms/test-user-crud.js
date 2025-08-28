const testUserCRUD = async () => {
  let token = null
  let testUserId = null

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
    token = loginData.token
    console.log('✅ Login successful')

    // Step 2: Test user creation
    console.log('\n👤 Testing user creation...')
    const createUserResponse = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username: 'testuser_crud',
        email: 'test_crud@example.com',
        password: 'test123',
        role: 'content_manager',
        status: 'active'
      })
    })

    console.log('Create user response status:', createUserResponse.status)
    
    if (createUserResponse.ok) {
      const userData = await createUserResponse.json()
      testUserId = userData.data.id
      console.log('✅ User created successfully:', userData.data.username, '(ID:', testUserId, ')')
    } else {
      const errorData = await createUserResponse.json()
      console.log('❌ User creation failed:', errorData)
      return
    }

    // Step 3: Test user update
    console.log('\n✏️ Testing user update...')
    const updateUserResponse = await fetch(`http://localhost:3000/api/users/${testUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username: 'testuser_updated',
        email: 'test_updated@example.com',
        role: 'content_manager',
        status: 'active'
      })
    })

    console.log('Update user response status:', updateUserResponse.status)
    
    if (updateUserResponse.ok) {
      const userData = await updateUserResponse.json()
      console.log('✅ User updated successfully:', userData.data.username)
    } else {
      const errorData = await updateUserResponse.json()
      console.log('❌ User update failed:', errorData)
    }

    // Step 4: Test get user details
    console.log('\n📋 Testing get user details...')
    const getUserResponse = await fetch(`http://localhost:3000/api/users/${testUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (getUserResponse.ok) {
      const userData = await getUserResponse.json()
      console.log('✅ User details retrieved successfully:', userData.data.username)
    } else {
      const errorData = await getUserResponse.json()
      console.log('❌ Get user details failed:', errorData)
    }

    // Step 5: Test user listing
    console.log('\n📋 Testing user listing...')
    const listUsersResponse = await fetch('http://localhost:3000/api/users?page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`
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

    // Step 6: Test password reset
    console.log('\n🔑 Testing password reset...')
    const resetPasswordResponse = await fetch(`http://localhost:3000/api/users/${testUserId}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        newPassword: 'newpassword123'
      })
    })

    if (resetPasswordResponse.ok) {
      console.log('✅ Password reset successfully')
    } else {
      const errorData = await resetPasswordResponse.json()
      console.log('❌ Password reset failed:', errorData)
    }

    // Step 7: Test user deactivation (soft delete)
    console.log('\n🚫 Testing user deactivation...')
    const deactivateUserResponse = await fetch(`http://localhost:3000/api/users/${testUserId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (deactivateUserResponse.ok) {
      console.log('✅ User deactivated successfully')
    } else {
      const errorData = await deactivateUserResponse.json()
      console.log('❌ User deactivation failed:', errorData)
    }

    console.log('\n🎉 All CRUD operations completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testUserCRUD()
