# Contributing to iRedirectX

First off, thank you for considering contributing to iRedirectX! It's people like you that make iRedirectX such a great tool. 

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to support@iredirectx.com.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title** for the issue to identify the problem
* **Describe the exact steps which reproduce the problem** in as many details as possible
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When you are creating an enhancement suggestion, please include:

* **Use a clear and descriptive title** for the issue to identify the suggestion
* **Provide a step-by-step description of the suggested enhancement** in as many details as possible
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior** and **explain which behavior you expected to see instead** and why
* **Include screenshots and animated GIFs** which help you demonstrate the steps
* **Explain why this enhancement would be useful** to most iRedirectX users

### Pull Requests

Please follow these steps to have your contribution considered:

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following the style guides below
3. **Add tests** if you've added code that should be tested
4. **Ensure the test suite passes** by running `npm test`
5. **Make sure your code lints** by running `npm run lint`
6. **Issue that pull request!**

## Development Setup

1. Fork and clone the repository
```bash
git clone https://github.com/your-username/iredirectx.git
cd iredirectx
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file and add your Supabase credentials
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Start the development server
```bash
npm run dev
```

## Style Guides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
  * 🎨 `:art:` when improving the format/structure of the code
  * ⚡ `:zap:` when improving performance
  * 🔥 `:fire:` when removing code or files
  * 🐛 `:bug:` when fixing a bug
  * ✨ `:sparkles:` when introducing new features
  * 📝 `:memo:` when writing docs
  * 🚀 `:rocket:` when deploying stuff
  * 💄 `:lipstick:` when updating the UI and style files
  * ✅ `:white_check_mark:` when adding tests
  * 🔒 `:lock:` when dealing with security
  * ⬆️ `:arrow_up:` when upgrading dependencies
  * ⬇️ `:arrow_down:` when downgrading dependencies

### TypeScript Style Guide

* Use TypeScript for all new code
* Prefer interfaces over type aliases
* Use explicit return types for functions
* Avoid using `any` type
* Use meaningful variable and function names
* Keep functions small and focused
* Add JSDoc comments for public APIs

### React/Component Guidelines

* Use functional components with hooks
* Keep components small and focused on a single responsibility
* Use descriptive component names
* Extract reusable logic into custom hooks
* Use proper TypeScript types for props
* Implement proper error boundaries
* Follow accessibility best practices

### CSS/Styling Guidelines

* Use Tailwind CSS utility classes
* Follow mobile-first responsive design
* Keep custom CSS to a minimum
* Use CSS variables for theming
* Ensure proper dark mode support

## Testing

* Write unit tests for utility functions
* Write integration tests for critical user flows
* Aim for meaningful test coverage, not 100%
* Use descriptive test names
* Follow the Arrange-Act-Assert pattern

## Documentation

* Update README.md if needed
* Update inline documentation
* Add JSDoc comments for complex functions
* Update DEPLOYMENT.md for deployment changes
* Keep documentation concise and clear

## Project Structure

When adding new features, follow the existing project structure:

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── lib/            # Third-party integrations
├── types/          # TypeScript type definitions
└── styles/         # Global styles
```

## Questions?

Feel free to open an issue with your question or reach out to support@iredirectx.com.

Thank you for contributing! 🎉
