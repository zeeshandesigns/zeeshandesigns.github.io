# Contributing to PakGifts

Thank you for your interest in contributing to PakGifts! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, versions)

### Suggesting Features

Feature requests are welcome! Please include:
- Clear description of the feature
- Use cases and benefits
- Possible implementation approach

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Test your changes**
   ```bash
   # Backend tests
   cd backend && npm test
   
   # Frontend tests
   cd frontend && npm test
   ```

5. **Commit your changes**
   ```bash
   git commit -m "Add: Brief description of changes"
   ```
   
   Use conventional commit format:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Provide clear description
   - Reference related issues
   - Ensure CI checks pass

## Development Setup

See [README.md](README.md) for detailed setup instructions.

## Code Style

### Backend (JavaScript/Node.js)
- Use 2 spaces for indentation
- Use semicolons
- Use const/let, not var
- Use meaningful variable names
- Add JSDoc comments for functions

### Frontend (React)
- Use functional components
- Use hooks for state management
- Use PropTypes or TypeScript
- Follow component naming conventions

### Database
- Use lowercase with underscores for table/column names
- Always use parameterized queries
- Add indexes for frequently queried columns

## Testing Guidelines

- Write unit tests for services and utilities
- Write integration tests for API endpoints
- Aim for >80% code coverage
- Test edge cases and error conditions

## Security

- Never commit secrets or credentials
- Use environment variables for configuration
- Follow OWASP security guidelines
- Report security issues privately

## Documentation

- Update README.md for user-facing changes
- Update API_DOCUMENTATION.md for API changes
- Add inline comments for complex logic
- Update DEPLOYMENT.md for infrastructure changes

## Questions?

Feel free to create an issue for questions or reach out to the maintainers.

Thank you for contributing! 🎉
