import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

const uploadDir = `${process.cwd()}/public/uploads`

export async function GET(request: NextRequest) {
	try {
		const token = getTokenFromHeader(request.headers.get('authorization') || undefined)
		if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		const payload = verifyToken(token)
		if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

		const fs = await import('fs')
		const path = await import('path')
		if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
		const files = await fs.promises.readdir(uploadDir)
		const images = files
			.filter(f => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f))
			.map(name => ({ name, url: `/uploads/${name}`, size: fs.statSync(path.join(uploadDir, name)).size }))
		return NextResponse.json({ success: true, data: images })
	} catch (error) {
		console.error('Images GET error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const token = getTokenFromHeader(request.headers.get('authorization') || undefined)
		if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		const payload = verifyToken(token)
		if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

		const contentType = request.headers.get('content-type') || ''
		if (!contentType.includes('multipart/form-data')) {
			return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 415 })
		}
		const form = await request.formData()
		const file = form.get('file') as File | null
		if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
		const arrayBuffer = await file.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)
		const fs = await import('fs')
		const path = await import('path')
		if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
		const originalName = (file as any).name || 'image'
		const ext = (originalName.split('.').pop() || 'png').toLowerCase()
		const safeExt = ['png','jpg','jpeg','gif','webp','svg'].includes(ext) ? ext : 'png'
		const fileName = `img_${payload.userId}_${Date.now()}.${safeExt}`
		const finalPath = path.join(uploadDir, fileName)
		await fs.promises.writeFile(finalPath, buffer)
		return NextResponse.json({ success: true, data: { name: fileName, url: `/uploads/${fileName}` } })
	} catch (error) {
		console.error('Images POST error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const token = getTokenFromHeader(request.headers.get('authorization') || undefined)
		if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		const payload = verifyToken(token)
		if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

		const { searchParams } = new URL(request.url)
		const name = searchParams.get('name')
		if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })
		const fs = await import('fs')
		const path = await import('path')
		const filePath = path.join(uploadDir, name)
		if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
		await fs.promises.unlink(filePath)
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Images DELETE error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
