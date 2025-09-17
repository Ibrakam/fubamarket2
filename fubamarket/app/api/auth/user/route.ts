import { NextRequest, NextResponse } from 'next/server'

const DJANGO_API_URL = 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${DJANGO_API_URL}/api/auth/user/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
    })

    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error proxying to Django:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${DJANGO_API_URL}/api/auth/user/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error proxying to Django:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
