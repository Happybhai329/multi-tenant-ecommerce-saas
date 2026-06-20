# Contributing to Multi-Tenant E-Commerce Platform

Thank you for your interest in contributing to this project! This document provides guidelines for contributing.

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Git

### Setup Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/multi-tenant-ecommerce.git
   cd multi-tenant-ecommerce
   ```

3. Install dependencies:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

4. Configure environment variables:
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your credentials

   # Frontend
   cd ../frontend
   cp .env.example .env
   # Edit .env if needed (use /api for local dev)
   ```

5. Seed the database (optional):
   ```bash
   cd backend
   npm run db:seed
   ```

6. Start development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Development Workflow

### Branch Naming
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation updates
- `refactor/code-improvement` - Code refactoring

### Commit Messages
Follow conventional commits format:
- `feat: add user registration`
- `fix: resolve payment processing error`
- `docs: update API documentation`
- `refactor: simplify auth middleware`

### Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes
3. Test your changes thoroughly
4. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   ```

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a pull request

## Code Style

### JavaScript/React
- Use ES6+ features
- Follow existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Backend
- Use async/await for asynchronous operations
- Handle errors properly
- Validate input data
- Use middleware for cross-cutting concerns
- Follow RESTful API conventions

### Frontend
- Use functional components with hooks
- Use Redux Toolkit for state management
- Keep components small and reusable
- Use proper TypeScript/PropTypes (if applicable)
- Follow React best practices

## Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test
npm run smoke-test

# Frontend linting
cd frontend
npm run lint
```

### Writing Tests
- Write unit tests for utility functions
- Write integration tests for API endpoints
- Test edge cases and error conditions
- Keep tests independent and fast

## Project Structure

### Backend
```
backend/src/
├── config/          # Configuration files
├── controllers/     # Route handlers
├── middleware/      # Express middleware
├── models/          # Mongoose models
├── routes/          # API routes
└── utils/           # Helper functions
```

### Frontend
```
frontend/src/
├── api/             # API service layer
├── components/      # Reusable components
├── features/        # Redux slices
├── pages/           # Page components
└── router/          # Route configuration
```

## Common Tasks

### Adding a New API Endpoint
1. Create controller function in `controllers/`
2. Add route in `routes/`
3. Add middleware if needed (auth, validation)
4. Update API documentation
5. Test the endpoint

### Adding a New Page
1. Create page component in `pages/`
2. Add route in `router/AppRouter.jsx`
3. Add API service functions if needed
4. Add navigation links
5. Test the page

### Adding a New Model
1. Create model in `models/`
2. Add validation and indexes
3. Create controller methods
4. Add routes
5. Seed test data
6. Update documentation

## Pull Request Guidelines

### PR Description
Include:
- Description of changes
- Why the change is needed
- How you tested the changes
- Screenshots (if applicable)
- Related issues

### PR Checklist
- [ ] Code follows project style
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive design (frontend)
- [ ] Environment variables documented

## Issues

### Reporting Bugs
Use the issue template and include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Screenshots/logs

### Feature Requests
Use the issue template and include:
- Description of the feature
- Use case
- Proposed implementation
- Alternatives considered

## Questions

For questions about the project:
- Check existing documentation
- Search existing issues
- Create a new issue with the "question" label

## Code of Conduct

Be respectful and constructive:
- Use inclusive language
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## License

By contributing, you agree that your contributions will be licensed under the ISC License.
