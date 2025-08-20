# Melhik CMS Documentation

## 🎯 **Project Overview**

### **Purpose**
Melhik CMS is a content management system for the Melhik Evangelism Tool mobile app. It allows administrators to create and manage religions, topics, and detailed explanations with Bible verse references.

### **Architecture**
- **Frontend**: Next.js with TypeScript
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Simple admin login
- **Deployment**: Vercel/Netlify ready

## 🗄️ **Database Schema**

### **Religions Table**
```sql
CREATE TABLE religions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  description TEXT,
  color VARCHAR(7) DEFAULT '#8B4513',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Topics Table**
```sql
CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  religion_id INTEGER REFERENCES religions(id),
  title VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Topic Details Table**
```sql
CREATE TABLE topic_details (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES topics(id),
  explanation TEXT NOT NULL,
  bible_verses JSONB, -- Array of verse references
  key_points JSONB, -- Array of key points
  references JSONB, -- Array of reference objects
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 **API Endpoints**

### **Authentication**
```
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

### **Religions**
```
GET /api/religions - Get all religions
GET /api/religions/:id - Get specific religion
POST /api/religions - Create new religion
PUT /api/religions/:id - Update religion
DELETE /api/religions/:id - Delete religion
```

### **Topics**
```
GET /api/religions/:id/topics - Get topics for religion
GET /api/topics/:id - Get specific topic
POST /api/topics - Create new topic
PUT /api/topics/:id - Update topic
DELETE /api/topics/:id - Delete topic
```

### **Topic Details**
```
GET /api/topics/:id/details - Get topic details
POST /api/topics/:id/details - Create topic details
PUT /api/topics/:id/details - Update topic details
```

### **Mobile App Sync**
```
GET /api/sync/check - Check for content updates
GET /api/sync/download - Download all content
GET /api/sync/version - Get current content version
```

## 🎨 **Admin Interface Features**

### **Dashboard**
- Overview of religions, topics, and content
- Recent activity and statistics
- Quick actions for content creation

### **Religion Management**
- List all religions with search/filter
- Create new religion with form
- Edit existing religion details
- Delete religion (with confirmation)

### **Topic Management**
- List topics by religion
- Create new topic with religion selection
- Edit topic title and description
- Delete topic (with confirmation)

### **Topic Detail Editor**
- Rich text editor for explanations
- Bible verse reference input (verse numbers only)
- Key points management
- Content preview
- Version control

### **Content Preview**
- Preview how content will appear in mobile app
- Test Bible verse references
- Validate content structure

## 🔧 **Technical Stack**

### **Frontend**
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.0.0",
  "headlessui": "^1.0.0",
  "react-hook-form": "^7.0.0",
  "react-query": "^3.0.0"
}
```

### **Backend**
```json
{
  "prisma": "^5.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "zod": "^3.0.0"
}
```

### **Database**
- PostgreSQL 14+
- Prisma ORM
- Connection pooling

## 📱 **Mobile App Integration**

### **Sync Process**
1. Mobile app checks `/api/sync/check` for updates
2. If updates available, downloads from `/api/sync/download`
3. Stores content locally for offline use
4. Updates UI with new content

### **Data Format**
```json
{
  "version": 1,
  "lastUpdated": "2024-01-15T10:30:00Z",
  "religions": [
    {
      "id": 1,
      "name": "እስልምና",
      "nameEn": "Islam",
      "description": "እስልምና አካል ስለ ክርስትና ያላቸው ጥያቄዎች",
      "color": "#8B4513"
    }
  ],
  "topics": [
    {
      "id": 1,
      "religionId": 1,
      "title": "ፍጹም አንድነት",
      "titleEn": "The Trinity",
      "description": "እግዚአብሔር እንዴት ሶስት በአንድ ሆኖ ይገኛል?"
    }
  ],
  "topicDetails": [
    {
      "id": 1,
      "topicId": 1,
      "explanation": "ይህ ጽንሰ ሐሳብ ለሰው ልጅ ለመረዳት አስቸጋሪ ሊሆን ይችላል...",
      "bibleVerses": ["John 1:1", "Matthew 28:19", "John 10:30"],
      "keyPoints": [
        "አንድ እግዚአብሔር በሶስት ሰዎች ውስጥ እንደ ማቴዎስ 28:19 ያለው",
        "እያንዳንዱ ሰው ሙሉ እግዚአብሔር ነው እንደ ዮሐንስ 1:1 ያለው"
      ],
      "references": [
        {
          "verse": "ማቴዎስ 28:19",
          "text": "እንግዲህ ሂዱ፥ ሁሉንም ሕዝብ ደቀ መዛሙርት አድርጉ፥ በአብ ስምም በወልድ ስምም በመንፈስ ቅዱስ ስምም አጥምቁአቸው።",
          "explanation": "ይህ ጥቅስ የሚያሳየን እግዚአብሔር በሶስት ሰዎች ውስጥ እንደሚገኝ ነው።"
        }
      ],
      "version": 1
    }
  ]
}
```

## 🔐 **Security**

### **Authentication**
- JWT-based authentication
- Admin-only access to CMS
- Session management
- Password hashing with bcrypt

### **Authorization**
- Role-based access control
- API rate limiting
- Input validation with Zod
- SQL injection prevention with Prisma

## 🚀 **Deployment**

### **Environment Variables**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/melhik_cms"
JWT_SECRET="your-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"
```

### **Database Setup**
1. Create PostgreSQL database
2. Run Prisma migrations
3. Seed initial data
4. Configure connection pooling

### **Deployment Platforms**
- **Vercel**: Recommended for Next.js
- **Netlify**: Alternative option
- **Railway**: For database hosting

## 📊 **Content Management Workflow**

### **Creating New Religion**
1. Navigate to Religions page
2. Click "Add New Religion"
3. Fill form: name, description, color
4. Save and verify in list

### **Creating New Topic**
1. Select religion from dropdown
2. Enter topic title and description
3. Save topic
4. Add topic details

### **Adding Topic Details**
1. Select topic from list
2. Use rich text editor for explanation
3. Add Bible verse references (e.g., "John 3:16")
4. Add key points and references
5. Preview content
6. Save and publish

### **Content Updates**
1. Edit existing content
2. Preview changes
3. Save updates
4. Mobile app syncs automatically

## 🔄 **Version Control**

### **Content Versioning**
- Each topic detail has version number
- Track changes over time
- Rollback capability
- Change history

### **Sync Versioning**
- Global content version for mobile app
- Incremental updates
- Conflict resolution
- Data integrity checks

## 📋 **Prisma Schema**

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Religion {
  id          Int      @id @default(autoincrement())
  name        String
  nameEn      String?
  description String?
  color       String   @default("#8B4513")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  topics      Topic[]

  @@map("religions")
}

model Topic {
  id          Int      @id @default(autoincrement())
  religionId  Int
  title       String
  titleEn     String?
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  religion    Religion @relation(fields: [religionId], references: [id])
  details     TopicDetail?

  @@map("topics")
}

model TopicDetail {
  id           Int      @id @default(autoincrement())
  topicId      Int      @unique
  explanation  String
  bibleVerses  Json?    // Array of verse references
  keyPoints    Json?    // Array of key points
  references   Json?    // Array of reference objects
  version      Int      @default(1)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  topic        Topic    @relation(fields: [topicId], references: [id])

  @@map("topic_details")
}
```

## 🎯 **Implementation Phases**

### **Phase 1: Foundation**
- [ ] Set up Next.js project with TypeScript
- [ ] Configure Prisma with PostgreSQL
- [ ] Create database schema
- [ ] Set up authentication system

### **Phase 2: Core Features**
- [ ] Religion CRUD operations
- [ ] Topic CRUD operations
- [ ] Topic detail management
- [ ] Basic admin interface

### **Phase 3: Advanced Features**
- [ ] Rich text editor integration
- [ ] Bible verse reference system
- [ ] Content preview functionality
- [ ] Version control system

### **Phase 4: Mobile Integration**
- [ ] Sync API endpoints
- [ ] Data export functionality
- [ ] Mobile app integration testing
- [ ] Performance optimization

### **Phase 5: Production**
- [ ] Security hardening
- [ ] Performance optimization
- [ ] Deployment configuration
- [ ] Monitoring and logging

## 🔧 **Development Commands**

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npx prisma studio
npx prisma migrate dev
npx prisma db seed
```

## 📝 **API Response Examples**

### **Get All Religions**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "እስልምና",
      "nameEn": "Islam",
      "description": "እስልምና አካል ስለ ክርስትና ያላቸው ጥያቄዎች",
      "color": "#8B4513",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### **Get Topics for Religion**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "religionId": 1,
      "title": "ፍጹም አንድነት",
      "titleEn": "The Trinity",
      "description": "እግዚአብሔር እንዴት ሶስት በአንድ ሆኖ ይገኛል?",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### **Sync Check Response**
```json
{
  "success": true,
  "data": {
    "hasUpdates": true,
    "currentVersion": 2,
    "lastUpdated": "2024-01-15T10:30:00Z",
    "updateSize": "15.2KB"
  }
}
```

This CMS will provide a complete content management solution for the Melhik Evangelism Tool, enabling easy creation and management of religious content with Bible verse references.
