# HenAi Backend System - Software Requirements Specification (SRS)

## Document Information
- **Project**: HenAi Backend API System
- **Version**: 1.0
- **Date**: January 2025
- **Author**: Development Team
- **Status**: Draft

---

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for developing a backend system for the HenAi mobile application. The backend will replace the current hardcoded AI image generation styles with a dynamic, manageable system using Node.js, Fastify, MongoDB, and AdminJS, deployed on Google Cloud Platform (Cloud Run) with GCP Cloud Storage buckets for image storage.

### 1.2 Scope
The backend system will provide:
- Public RESTful API for managing AI image generation styles
- Admin panel for CRUD operations on styles (no authentication required)
- MongoDB-based data storage and retrieval
- Integration endpoints for the React Native mobile app
- Category-based style organization (Objects, Female, Male)
- Deployment on Google Cloud Platform (Cloud Run)
- GCP Cloud Storage buckets for style images with CDN delivery

### 1.3 Current System Analysis
**Existing HenAi App Structure:**
- React Native TypeScript application
- Google OAuth authentication
- AdMob integration (banner and interstitial ads)
- Hardcoded styles in HomeScreen.tsx:
  - **Objects**: 7 styles (Collectible Figurine, Blueprint Statue, Painter's Studio, etc.)
  - **Female**: 3 styles (Retro Saree Portrait, Hyper Realistic, Lehenga Portrait)
  - **Male**: 1 style (Retro Male Portrait)
- Each style contains: id, title, placeholder (AI prompt), image asset

---

## 2. System Overview

### 2.1 Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │◄──►│   Backend API   │◄──►│   Admin Panel   │
│   Mobile App    │    │   (Fastify)     │    │   (AdminJS)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   MongoDB       │
                       │   (Database)    │
                       └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  GCP Cloud Run  │
                       │  (Deployment)   │
                       └─────────────────┘
```

### 2.2 Technology Stack
- **Backend Framework**: Node.js with Fastify
- **Database**: MongoDB (Cloud-based)
- **Admin Interface**: AdminJS (No authentication)
- **API Format**: RESTful JSON API
- **Authentication**: None (All endpoints public)
- **File Storage**: GCP Cloud Storage buckets with CDN delivery
- **Deployment**: Google Cloud Platform (Cloud Run)
- **Environment**: Containerized (Docker)

---

## 3. Functional Requirements

### 3.1 Style Management System

#### 3.1.1 Style Entity Structure
```typescript
interface Style {
  id: string;                    // Unique identifier (UUID)
  title: string;                 // Display name
  description?: string;          // Optional description
  prompt: string;                // AI generation prompt
  category: 'Objects' | 'Female' | 'Male';
  imageUrl: string;              // Image asset URL
  isActive: boolean;             // Enable/disable flag
  sortOrder: number;             // Display order
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last modification timestamp
  metadata?: {                   // Optional metadata
    tags?: string[];
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    estimatedTime?: number;      // In minutes
  };
}
```

#### 3.1.2 Category Management
```typescript
interface Category {
  id: string;
  name: string;                  // 'Objects', 'Female', 'Male'
  displayName: string;           // User-friendly name
  icon: string;                  // Emoji or icon identifier
  description?: string;
  isActive: boolean;
  sortOrder: number;
  styleCount: number;            // Computed field
}
```

### 3.2 API Endpoints (All Public - No Authentication)

#### 3.2.1 Categories API
```
GET    /api/v1/categories                    # Get all categories
GET    /api/v1/categories/:id                # Get specific category
POST   /api/v1/categories                    # Create category
PUT    /api/v1/categories/:id                # Update category
DELETE /api/v1/categories/:id                # Delete category
```

#### 3.2.2 Styles API
```
GET    /api/v1/styles                        # Get all styles (with pagination)
GET    /api/v1/styles/:id                    # Get specific style
GET    /api/v1/styles/category/:categoryId   # Get styles by category
GET    /api/v1/styles/search?q=:query        # Search styles
POST   /api/v1/styles                        # Create style
PUT    /api/v1/styles/:id                    # Update style
DELETE /api/v1/styles/:id                    # Delete style
POST   /api/v1/styles/:id/image              # Upload style image
PUT    /api/v1/styles/reorder                # Bulk reorder styles
```

#### 3.2.3 Bulk Operations API
```
POST   /api/v1/styles/bulk-import            # Import styles from JSON
GET    /api/v1/styles/bulk-export            # Export styles to JSON
PUT    /api/v1/styles/bulk-update            # Bulk update styles
DELETE /api/v1/styles/bulk-delete           # Bulk delete styles
```

#### 3.2.4 System API
```
GET    /api/v1/health                        # Health check
GET    /api/v1/stats                         # System statistics
POST   /api/v1/reset                         # Reset to default data (dev only)
```

### 3.3 Admin Panel Features (No Authentication Required)

#### 3.3.1 Dashboard
- Total styles count by category
- System health metrics
- Quick actions (Add Style, Import Data, Reset Data)
- MongoDB connection status

#### 3.3.2 Style Management
- **List View**: Paginated table with filters (category, status, search)
- **Create/Edit Form**: 
  - Title, description, category selection
  - Rich text editor for AI prompts
  - Image upload with preview to GCP Cloud Storage buckets
  - Metadata fields (tags, difficulty, time)
  - Active/inactive toggle
- **Bulk Operations**: Import/export, bulk edit, reordering
- **Preview Mode**: Test how styles appear in mobile app

#### 3.3.3 Category Management
- CRUD operations for categories
- Reorder categories
- View styles count per category
- Bulk assign styles to categories

#### 3.3.4 Media Management
- Image upload to GCP Cloud Storage buckets
- Automatic image optimization and resizing
- CDN delivery via Google Cloud CDN
- Bulk image operations with bucket management

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **API Response Time**: < 200ms for style retrieval
- **Database Operations**: < 50ms for MMKV queries
- **Concurrent Users**: Support 1000+ concurrent mobile app users
- **Admin Panel**: < 1s page load times
- **Image Loading**: Optimized images with lazy loading

### 4.2 Scalability
- Horizontal scaling support with load balancers
- MMKV clustering for high availability
- CDN integration for image delivery
- Caching layer (Redis) for frequently accessed data

### 4.3 Security
- Rate limiting on all APIs
- Input validation and sanitization
- CORS configuration for mobile app
- Secure file upload with type validation
- Environment-based configuration
- MongoDB connection security
- GCP IAM roles and permissions

### 4.4 Reliability
- **Uptime**: 99.9% availability
- **Data Backup**: Automated daily backups
- **Error Handling**: Graceful error responses
- **Logging**: Comprehensive request/error logging
- **Health Monitoring**: System health endpoints

### 4.5 Usability
- **Admin Panel**: Intuitive UI with responsive design
- **API Documentation**: Comprehensive Swagger/OpenAPI docs
- **Mobile Integration**: Seamless data synchronization
- **Error Messages**: Clear, actionable error responses

---

## 5. Technical Specifications

### 5.1 Database Schema (MongoDB)

#### 5.1.1 Collections Structure
```javascript
// styles collection
{
  _id: ObjectId,
  id: String,                    // UUID for external reference
  title: String,
  description: String,
  prompt: String,
  category: String,              // Reference to categories.name
  imageUrl: String,              // GCP Cloud Storage bucket URL
  isActive: Boolean,
  sortOrder: Number,
  createdAt: Date,
  updatedAt: Date,
  metadata: {
    tags: [String],
    difficulty: String,
    estimatedTime: Number
  }
}

// categories collection
{
  _id: ObjectId,
  id: String,                    // UUID for external reference
  name: String,                  // 'Objects', 'Female', 'Male'
  displayName: String,
  icon: String,
  description: String,
  isActive: Boolean,
  sortOrder: Number,
  createdAt: Date,
  updatedAt: Date
}

// system_config collection (for app settings)
{
  _id: ObjectId,
  key: String,                   // Configuration key
  value: Mixed,                  // Configuration value
  updatedAt: Date
}
```

#### 5.1.2 MongoDB Indexes
```javascript
// styles collection indexes
db.styles.createIndex({ "category": 1, "sortOrder": 1 })
db.styles.createIndex({ "isActive": 1 })
db.styles.createIndex({ "title": "text", "description": "text", "prompt": "text" })
db.styles.createIndex({ "id": 1 }, { unique: true })

// categories collection indexes
db.categories.createIndex({ "name": 1 }, { unique: true })
db.categories.createIndex({ "sortOrder": 1 })
db.categories.createIndex({ "id": 1 }, { unique: true })
```

#### 5.1.3 Data Migration Strategy
```typescript
// Migration from hardcoded data to MongoDB
const migrationData = {
  categories: [
    { id: 'objects', name: 'Objects', displayName: 'Objects', icon: '🎨', sortOrder: 1, isActive: true },
    { id: 'female', name: 'Female', displayName: 'Female', icon: '👩', sortOrder: 2, isActive: true },
    { id: 'male', name: 'Male', displayName: 'Male', icon: '👨', sortOrder: 3, isActive: true }
  ],
  styles: [
    // Migrate existing 11 styles from HomeScreen.tsx
    // Preserve IDs, titles, prompts, and upload images to GCS
  ]
};
```

### 5.2 API Response Formats

#### 5.2.1 Success Response
```json
{
  "success": true,
  "data": {
    "styles": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "timestamp": "2025-01-26T08:51:33Z"
}
```

#### 5.2.2 Error Response
```json
{
  "success": false,
  "error": {
    "code": "STYLE_NOT_FOUND",
    "message": "Style with ID 'xyz' not found",
    "details": {}
  },
  "timestamp": "2025-01-26T08:51:33Z"
}
```

### 5.3 File Structure
```
henai-backend/
├── src/
│   ├── controllers/          # Route handlers
│   ├── services/            # Business logic
│   ├── models/              # MongoDB models (Mongoose)
│   ├── middleware/          # Custom middleware
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration
│   └── admin/               # AdminJS setup
├── migrations/              # MongoDB migrations
├── tests/                   # Test files
├── docs/                    # API documentation
├── scripts/                 # Utility scripts
├── Dockerfile               # Docker configuration
├── cloudbuild.yaml          # GCP Cloud Build config
└── .gcloudignore           # GCP ignore file
```

---

## 6. Integration Requirements

### 6.1 Mobile App Integration

#### 6.1.1 API Client Service
```typescript
// New service for React Native app
class StylesApiService {
  private baseUrl = 'https://henai-backend-xxxxx-uc.a.run.app'; // Cloud Run URL
  
  async getCategories(): Promise<Category[]>
  async getStylesByCategory(categoryId: string): Promise<Style[]>
  async getStyle(styleId: string): Promise<Style>
  async searchStyles(query: string): Promise<Style[]>
  async createStyle(style: Partial<Style>): Promise<Style>
  async updateStyle(id: string, style: Partial<Style>): Promise<Style>
  async deleteStyle(id: string): Promise<void>
}
```

#### 6.1.2 Data Synchronization
- Replace hardcoded arrays with API calls
- Implement caching for offline support
- Add loading states and error handling
- Maintain existing UI/UX patterns

#### 6.1.3 Image Handling
- Update image references from local assets to GCP Cloud Storage bucket URLs
- Implement image caching and lazy loading
- Support different image sizes (thumbnail, full) via GCP Cloud Storage transformations
- CDN delivery for optimal performance

### 6.2 Backward Compatibility
- Maintain existing style IDs during migration
- Preserve current app functionality during transition
- Gradual rollout with feature flags
- Fallback to hardcoded data if API unavailable

---

## 7. Development Phases

### 7.1 Phase 1: Core Backend (Week 1-2)
- [ ] Setup Node.js + Fastify project structure
- [ ] Implement MongoDB connection with Mongoose
- [ ] Create basic CRUD APIs for styles and categories (all public)
- [ ] Setup GCP Cloud Storage buckets for image uploads
- [ ] Data migration from hardcoded styles to MongoDB

### 7.2 Phase 2: Admin Panel (Week 3-4)
- [ ] Setup AdminJS interface (no authentication)
- [ ] Implement style management UI
- [ ] Add GCP Cloud Storage bucket image upload functionality
- [ ] Create category management
- [ ] Implement bulk operations

### 7.3 Phase 3: Mobile Integration (Week 5-6)
- [ ] Create API client service for React Native
- [ ] Replace hardcoded data with API calls
- [ ] Implement caching and offline support
- [ ] Add error handling and loading states
- [ ] Testing and optimization

### 7.4 Phase 4: GCP Deployment (Week 7-8)
- [ ] Create Dockerfile for containerization
- [ ] Setup GCP Cloud Run deployment
- [ ] Configure MongoDB Atlas or GCP MongoDB
- [ ] Setup GCP Cloud Storage buckets and CDN
- [ ] Performance optimization and monitoring
- [ ] Comprehensive testing
- [ ] Documentation completion

---

## 8. Success Criteria

### 8.1 Functional Success
- ✅ All existing styles migrated successfully
- ✅ Mobile app displays styles from backend API
- ✅ Admin panel allows full CRUD operations
- ✅ Image upload and management working
- ✅ Search functionality operational

### 8.2 Performance Success
- ✅ API response times under 200ms (via Cloud Run)
- ✅ Mobile app maintains current performance
- ✅ Admin panel loads under 1 second
- ✅ Support for 1000+ concurrent users (Cloud Run auto-scaling)
- ✅ Images load quickly via Google Cloud CDN

### 8.3 Business Success
- ✅ Reduced development time for adding new styles
- ✅ Non-technical team members can manage content
- ✅ Improved content organization and discoverability
- ✅ Foundation for future features (analytics, A/B testing)

---

## 9. Risk Assessment

### 9.1 Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| MongoDB performance issues | Medium | Low | Proper indexing, MongoDB Atlas optimization |
| GCP Cloud Run cold starts | Medium | Medium | Keep-alive requests, proper resource allocation |
| Mobile app integration complexity | Medium | Medium | Gradual migration, thorough testing |
| Google Cloud Storage costs | Medium | Medium | Image optimization, lifecycle policies |
| Data migration errors | High | Low | Backup strategy, rollback plan |

### 9.2 Business Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| User experience degradation | High | Low | Maintain existing UI patterns |
| Content management learning curve | Medium | Medium | Training, intuitive UI design |
| Increased infrastructure costs | Low | High | Cost monitoring, optimization |

---

## 10. Appendices

### 10.1 Current Hardcoded Styles Analysis
**Objects Category (7 styles):**
1. The Collectible Figurine (ID: 1)
2. The Blueprint Statue (ID: 2)
3. The Painter's Studio (ID: 3)
4. Harry Potter Transformation (ID: 4)
5. The Passport Portrait (ID: 5)
6. The Collector's Showcase (ID: 6)
7. Birthday Card (ID: 11)

**Female Category (3 styles):**
1. Retro Saree Portrait (ID: 7)
2. Hyper Realistic (ID: 8)
3. Lehenga Portrait (ID: 10)

**Male Category (1 style):**
1. Retro Male Portrait (ID: 9)

### 10.2 API Documentation
- Swagger/OpenAPI specification will be generated
- Interactive API explorer for testing
- Code examples for mobile integration
- Postman collection for development

### 10.3 GCP Deployment Architecture
```
Internet → Google Cloud Load Balancer → Cloud Run (Fastify) → MongoDB Atlas
                      ↓                           ↓
            Google Cloud CDN ← Google Cloud Storage (Images)
                      ↓
              React Native App
```

### 10.4 GCP Services Used
- **Cloud Run**: Serverless container deployment
- **Cloud Storage**: Image and file storage
- **Cloud CDN**: Global content delivery
- **Cloud Build**: CI/CD pipeline
- **Cloud Monitoring**: Application monitoring
- **Cloud Logging**: Centralized logging
- **MongoDB Atlas**: Managed MongoDB (or Cloud SQL if preferred)

---

**Document End**

*This SRS document serves as the foundation for developing the HenAi backend system. It should be reviewed and approved by all stakeholders before development begins.*
