# Taskify - Simple Task Management App

A modern, full-stack task management application built with the MERN stack, featuring JWT authentication, category-based organization, and unique productivity features.

## Features

### Core Features
- **User Authentication**: Register and login with JWT tokens
- **Task Management**: Create, read, update, and delete tasks
- **Category Organization**: Organize tasks by categories with filtering
- **Task Status**: Mark tasks as complete/incomplete
- **Responsive Design**: Works on desktop and mobile devices

### Unique Features
- **Quick-Add Parser**: Type "Buy milk #personal" to auto-set title and category
- **Keyboard Shortcuts**: Press 'N' to focus the quick-add input
- **Category Persistence**: Remembers your last used category
- **Real-time Updates**: Instant UI updates with optimistic updates
- **Smart Filtering**: Filter by category and show/hide completed tasks

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** and **Helmet** for security

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **React Hook Form** for form handling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskify
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   cp env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   npm run dev
   ```

3. **Set up the frontend**
   ```bash
   cd client
   npm install
   cp env.example .env
   # Edit .env with your API URL (default: http://localhost:5000)
   npm run dev
   ```

4. **Configure Environment Variables**

   **Backend (.env)**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskify
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   CLIENT_ORIGIN=http://localhost:5173
   ```

   **Frontend (.env)**
   ```
   VITE_API_URL=http://localhost:5000
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password

### Tasks (Protected Routes)
- `GET /tasks` - Get all tasks for authenticated user
- `GET /tasks?category=work` - Get tasks filtered by category
- `POST /tasks` - Create a new task
- `PATCH /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task
- `GET /tasks/me` - Get current user info
- `GET /tasks/categories` - Get categories with task counts

## Usage

### Quick Add Feature
Type tasks quickly using the hashtag syntax:
- `Buy milk #personal` - Creates task "Buy milk" in "personal" category
- `Call client #work` - Creates task "Call client" in "work" category
- `Exercise` - Creates task "Exercise" using last used category

### Keyboard Shortcuts
- Press `N` to focus the quick-add input field

### Task Management
- Click the checkbox to mark tasks as complete
- Click the three-dot menu to edit or delete tasks
- Use category filters to organize your view
- Toggle "Show completed" to see all tasks

## Project Structure

```
taskify/
├── server/                 # Backend API
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth middleware
│   │   └── utils/         # Error handling
│   └── package.json
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── lib/           # API client
│   └── package.json
└── README.md
```

## Security Features

- Password hashing with bcryptjs (12 rounds)
- JWT tokens with 7-day expiration
- CORS protection for frontend origin
- Input validation and sanitization
- User-scoped task access (users can only access their own tasks)

## Deployment

### Backend (Render/Railway)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with Node.js buildpack

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set environment variable: `VITE_API_URL`

### Database
- Use MongoDB Atlas free tier
- Ensure your IP is whitelisted
- Use connection string in environment variables

## Testing

The application includes manual testing for:
- User registration and login
- Task CRUD operations
- Category filtering
- Quick-add functionality
- Authentication guards

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
