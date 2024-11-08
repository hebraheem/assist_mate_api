# Assist Mate API

**Assist Mate API**
Your local guide in a new city. Connect with friendly locals who can help you navigate life in your new home. From language assistance to local knowledge, we're here to make your transition smoother.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Available Scripts](#available-scripts)
- [API Documentation](#api-documentation)
- [Error Handling](#error-handling)
- [Linting and Formatting](#linting-and-formatting)

## Features

- **Node.js & Express** for server-side handling.
- **Firebase Authentication** for secure user management.
- **MongoDB & Mongoose** as the database and ORM.
- **Swagger** for API documentation.
- **ESLint & Prettier** for code quality and style consistency.
- **Robust Error Handling** with custom error middleware.
- **CORS** configured for cross-origin requests.
- **SSL/TLS Support** for secure connections.

## Project Structure

```plaintext
assist_mate_api/
├── config/                 # Configuration files (Firebase, MongoDB, etc.)
│   ├── firebase.js         # Firebase configuration
│   ├── db.js               # Database connection setup
├── controllers/            # Controller functions
│   ├── userController.js   # User controller for authentication and management
├── models/                 # Mongoose models
│   ├── User.js             # User schema and model
├── routes/                 # API routes
│   ├── userRoutes.js       # Routes for user operations
├── middleware/             # Custom middlewares
│   ├── errorHandler.js     # Error handling middleware
│   ├── authMiddleware.js   # Authentication middleware using Firebase
├── utils/                  # Utility functions (if any)
├── public/                 # Public files (for static assets if needed)
├── swagger/                # Swagger documentation setup
│   ├── swagger.json        # Swagger API documentation
├── eslint.config.cjs       # ESLint configuration file
├── .prettierrc             # Prettier configuration file
├── package.json            # Node.js dependencies and scripts
└── README.md               # Project documentation
```

## Installation

### Prerequisites

- **Node.js** (>=14)
- **MongoDB** (local or cloud-based)
- Firebase project with service account credentials.

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/assist_mate_api.git
   cd assist_mate_api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   Create a `.env` file in the root directory and configure the following variables:

   ```plaintext
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   ```

4. Set up Firebase and MongoDB configurations under `config/`.

## Configuration

- **MongoDB**: Connection configuration is located in `config/db.js`.
- **Firebase**: Firebase service account details should be added to `config/firebase.js` for authentication.
- **CORS**: Configured to allow specific origins (adjustable in `app.js`).

## Available Scripts

### Development

```bash
npm run dev
```

Runs the server in development mode with `nodemon`.

### Production

```bash
npm start
```

Starts the server in production mode.

### Linting

```bash
npm run lint
```

Lints the code using ESLint.

```bash
npm run lint:fix
```

Lints and fixes issues automatically.

### Formatting

```bash
npm run format
```

Formats code according to Prettier settings.

### Testing

You can configure tests under a `tests/` folder and add test scripts (e.g., using Mocha, Jest).

## API Documentation

Swagger documentation is generated from the `swagger/swagger.json` file. To view the API documentation:

1. Start the server.
2. Visit `http://localhost:5000/api-docs` in your browser.

## Error Handling

The app includes a robust error-handling middleware (`middleware/errorHandler.js`) that provides consistent error responses in JSON format. Errors are logged to the console for easy debugging in development.

## Linting and Formatting

- **ESLint**: Enforces code quality standards. Configured in `eslint.config.cjs`.
- **Prettier**: Maintains consistent code style. Configured in `.prettierrc`.

**Note**: ESLint and Prettier are automatically run on each commit (consider using Husky for Git hooks to automate this).

---

### Commit Messages

Follow the conventional commit format for commit messages:

```bash
<type>(<scope>): <subject>
```

Example:

```bash
feat(auth): add login functionality
fix(button): correct alignment issue
```

## Contributing

We welcome contributions! Please follow the [coding conventions](#coding-conventions--style-guide) and make sure to submit a pull request to the `develop` branch for review.

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Create a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

Feel free to update the readme as the project may require!
