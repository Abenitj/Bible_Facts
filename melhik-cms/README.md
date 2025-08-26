# Melhik CMS

A content management system for the Melhik Evangelism Tool mobile app. Built with Next.js, Prisma, and PostgreSQL.

## 🚀 **Quick Start**

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with initial data
npm run db:seed

# Start development server
npm run dev
```

## 🗄️ **Database Setup**

### Option 1: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database: `createdb melhik_cms`
3. Update `.env` with your connection string

### Option 2: Supabase (Recommended)
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your database URL from Settings > Database
4. Update `.env` with the connection string

### Option 3: Railway
1. Create account at [railway.app](https://railway.app)
2. Create a new PostgreSQL service
3. Copy the connection string to `.env`

## 🔧 **Environment Variables**

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/melhik_cms"

# JWT Secret (auto-generated)
JWT_SECRET="your-super-secret-jwt-key"

# NextAuth (if using)
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## 📊 **Database Schema**

### Religions
- `id`: Primary key
- `name`: Amharic name
- `nameEn`: English name
- `description`: Description
- `color`: Hex color code
- `createdAt`, `updatedAt`: Timestamps

### Topics
- `id`: Primary key
- `religionId`: Foreign key to religions
- `title`: Amharic title
- `titleEn`: English title
- `description`: Description
- `createdAt`, `updatedAt`: Timestamps

### Topic Details
- `id`: Primary key
- `topicId`: Foreign key to topics
- `explanation`: Detailed explanation
- `bibleVerses`: JSON array of verse references
- `keyPoints`: JSON array of key points
- `references`: JSON array of reference objects
- `version`: Content version number
- `createdAt`, `updatedAt`: Timestamps

### Users
- `id`: Primary key
- `username`: Unique username
- `password`: Hashed password
- `role`: User role (admin/editor)
- `createdAt`, `updatedAt`: Timestamps

## 🚀 **Available Scripts**

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

## 🔐 **Authentication**

### Default Admin User
- **Username**: `admin`
- **Password**: `admin123`

### Creating New Users
Use the seed script or create directly in the database:

```typescript
import { createUser } from '@/lib/auth'

await createUser('newadmin', 'securepassword', 'admin')
```

## 📱 **Mobile App Integration**

### Sync API Endpoints
- `POST /api/sync/check` - Check for content updates
- `GET /api/sync/download` - Download all content

### Data Format
The mobile app expects data in this format:

```json
{
  "version": 1,
  "lastUpdated": "2024-01-15T10:30:00Z",
  "religions": [...],
  "topics": [...],
  "topicDetails": [...]
}
```

## 🎨 **Features**

### Content Management
- ✅ Religion management (CRUD)
- ✅ Topic management (CRUD)
- ✅ Topic detail management with rich text
- ✅ Bible verse reference system
- ✅ Content versioning

### User Interface
- ✅ Modern, responsive design
- ✅ Dashboard with statistics
- ✅ Professional admin interface
- ✅ Amharic language support

### API Features
- ✅ RESTful API endpoints
- ✅ JWT authentication
- ✅ Input validation with Zod
- ✅ Error handling
- ✅ Mobile app sync endpoints

## 🔧 **Development**

### Project Structure
```
melhik-cms/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── login/          # Login page
│   │   └── page.tsx        # Dashboard
│   ├── lib/                # Utilities
│   │   ├── auth.ts         # Authentication
│   │   ├── prisma.ts       # Database client
│   │   └── validation.ts   # Zod schemas
│   └── components/         # React components
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Database seed
└── public/                # Static assets
```

### Adding New Features
1. **API Routes**: Add to `src/app/api/`
2. **Pages**: Add to `src/app/`
3. **Components**: Add to `src/components/`
4. **Database**: Update `prisma/schema.prisma`

## 🚀 **Deployment**

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Other Platforms
- **Netlify**: Similar to Vercel
- **Railway**: Full-stack deployment
- **DigitalOcean**: App Platform

## 🔒 **Security**

### Authentication
- JWT-based authentication
- HTTP-only cookies
- Password hashing with bcrypt
- Role-based access control

### API Security
- Input validation with Zod
- SQL injection prevention (Prisma)
- Rate limiting (recommended)
- CORS configuration

## 📚 **Documentation**

### API Documentation
- **Authentication**: `/api/auth/*`
- **Religions**: `/api/religions/*`
- **Topics**: `/api/topics/*`
- **Sync**: `/api/sync/*`

### Database Documentation
- **Schema**: `prisma/schema.prisma`
- **Migrations**: `prisma/migrations/`
- **Studio**: Run `npm run db:studio`

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

---

**Built with ❤️ for the Melhik Evangelism Tool**
