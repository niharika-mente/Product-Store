# Contributing to Product Store 🛒

Thank you for your interest in contributing to **Product Store**!

Product Store is a full-stack MERN application built with MongoDB, Express.js, React.js, Node.js, and Chakra UI. The project provides a modern product management experience with full CRUD functionality, responsive design, and a scalable architecture.

Whether you're fixing bugs, improving the UI, enhancing API performance, adding new features, or improving documentation, your contributions are highly appreciated.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Fork & Clone the Repository](#fork--clone-the-repository)
  - [Development Setup](#development-setup)
  - [Pre-Commit Hooks](#pre-commit-hooks)
- [Project Structure](#project-structure)
- [Contribution Areas](#contribution-areas)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Good First Contributions](#good-first-contributions)
- [Need Help?](#need-help)

---

## Code of Conduct

By participating in this project, you agree to:

- Be respectful and inclusive.
- Provide constructive feedback.
- Collaborate professionally.
- Welcome contributors of all experience levels.

Please help maintain a positive and beginner-friendly environment.

---

## Getting Started

### Fork & Clone the Repository

#### 1. Fork the repository

Click the **Fork** button on GitHub.

#### 2. Clone your fork

```bash
git clone https://github.com/YOUR_USERNAME/Product-Store.git
cd Product-Store
```

#### 3. Add the upstream remote

```bash
git remote add upstream https://github.com/niharika-mente/Product-Store.git
```

#### 4. Verify remotes

```bash
git remote -v
```

#### 5. Keep your fork updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

---

## Development Setup

### Prerequisites

| Tool | Version |
|--------|----------|
| Node.js | 18+ |
| npm | Latest |
| MongoDB | Latest |
| Git | Latest |

---

### Install Dependencies

Install backend dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd FRONTEND
npm install
cd ..
```

---

### Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Update the values:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
VITE_API_URL=http://localhost:5000
```

---

### Run the Application

Start the backend:

```bash
npm run dev
```

In a separate terminal:

```bash
cd FRONTEND
npm run dev
```

Application URLs:

```text
Backend:  http://localhost:5000
Frontend: http://localhost:5173
```

---

### Pre-Commit Hooks

This project uses **Husky** and **lint-staged** to automatically enforce code quality before commits.

#### What Happens When You Commit

Before each commit, the following checks automatically run on your changed files:

1. **ESLint** — Fixes fixable linting issues (unused variables, formatting, etc.)
2. **Prettier** — Automatically formats your code

#### If a Commit is Rejected

If your commit is blocked due to unfixable linting errors:

1. **Review the error messages** — they will specify what needs to be fixed
2. **Fix the issues** — manually resolve any errors that ESLint couldn't auto-fix
3. **Stage your changes** — `git add .`
4. **Try committing again** — `git commit -m "your message"`

#### Example Workflow

```bash
# Make changes to a file
# Stage changes
git add .

# Attempt to commit
git commit -m "Add new feature"

# ✅ If code is clean: Commit succeeds
# ✖️ If there are errors: Commit is blocked with error details
#    → Fix the errors
#    → Run git commit again
```

#### Reinstalling Hooks (After Cloning)

If hooks don't run after cloning the repository:

```bash
husky install
```

#### Bypassing Hooks (Not Recommended)

To skip the pre-commit checks (only when absolutely necessary):

```bash
git commit --no-verify
```

**⚠️ Note:** Bypassing hooks can lead to code quality issues and PR review delays. Use only in exceptional cases.

---

## Project Structure

```text
Product-Store/
├── BACKEND/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── config/
│
├── FRONTEND/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── assets/
│
├── package.json
├── .env.example
└── README.md
```

---

## Contribution Areas

Contributions are welcome in:

### Frontend

- Chakra UI improvements
- Responsive design fixes
- Accessibility enhancements
- Dark mode improvements
- Component optimization

### Backend

- API improvements
- Validation enhancements
- Error handling
- Performance optimization
- Security improvements

### Database

- MongoDB schema improvements
- Query optimization
- Data validation

### Documentation

- README updates
- Setup guides
- API documentation
- Contribution guides

---

## Branch Naming Conventions

Never commit directly to `main`.

Create a dedicated branch:

```bash
git checkout -b feature/your-feature-name
```

Examples:

```text
feature/product-search

feature/category-filter

feature/dark-mode

bugfix/product-update-error

bugfix/mobile-layout

docs/update-readme

refactor/api-structure

style/chakra-ui-improvements
```

---

## Coding Standards

### Backend (Node.js / Express)

- Follow consistent REST API conventions.
- Use meaningful variable and function names.
- Handle errors appropriately.
- Keep controllers modular.

### Frontend (React)

- Use reusable components.
- Keep components focused on a single responsibility.
- Avoid unnecessary re-renders.
- Follow React best practices.

### Styling

- Use Chakra UI components whenever possible.
- Maintain consistency with the existing design system.
- Ensure responsive layouts across devices.

---

## Commit Message Guidelines

Follow Conventional Commits:

```text
type(scope): short description
```

Examples:

```text
feat(products): add product search functionality

feat(ui): add dark mode toggle

fix(api): resolve update product validation issue

fix(frontend): prevent empty product submission

docs(readme): improve installation instructions

refactor(products): simplify product controller logic
```

---

## Pull Request Process

### Before Submitting

Make sure:

- [ ] Application runs successfully
- [ ] Backend starts without errors
- [ ] Frontend builds successfully
- [ ] No console errors
- [ ] Documentation updated if required
- [ ] Changes tested locally
- [ ] Related issue linked

---

### Push Your Branch

```bash
git push origin your-branch-name
```

---

### Open a Pull Request

Create a Pull Request against the `main` branch.

Include:

- Summary of changes
- Why the change is needed
- Screenshots (for UI changes)
- Related issue number

Example:

```text
feat(products): add product category filtering

Fixes #21
```

---

## Pull Request Checklist

Before submitting:

- [ ] Code follows project conventions
- [ ] No linting issues
- [ ] No console warnings/errors
- [ ] Responsive UI verified
- [ ] Environment variables documented
- [ ] Documentation updated
- [ ] Issue linked

---

## Reporting Issues

When opening a bug report, include:

- Clear title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser information
- Screenshots (if applicable)
- Console logs/errors

---

## Feature Requests

Please include:

- Problem statement
- Proposed solution
- Benefits
- Alternative approaches considered

---

## Good First Contributions

If you're new to open source, consider:

- Improving documentation
- Fixing UI inconsistencies
- Improving responsiveness
- Enhancing accessibility
- Improving error messages
- Refactoring components
- Adding loading states
- Improving form validation

---

## Need Help?

If you have questions:

- Review existing issues first.
- Read the README carefully.
- Open a discussion or issue.
- Ask maintainers for clarification before large changes.

---

## Maintainer

**Niharika Mente**

Project Focus:

- Full-Stack MERN Development
- Modern UI/UX
- Product Management Systems
- Scalable Web Applications

---

Thank you for contributing to **Product Store**! 🎉

Every contribution helps improve the project and creates a better learning experience for developers exploring full-stack development.

Happy Coding! 🚀