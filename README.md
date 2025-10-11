# 10xdevsFishcards

A flashcard application designed for developers to learn and memorize programming concepts, prepare for technical interviews, and enhance their knowledge.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Tech Stack

- **Framework**: [Astro](https://astro.build/)
- **UI**: [React](https://react.dev/), [Shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Supabase](https://supabase.io/)

## Getting Started Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js installed. The required version is specified in the `.nvmrc` file. It's recommended to use a Node Version Manager like `nvm`.

- Install `nvm` by following the instructions [here](https://github.com/nvm-sh/nvm#installing-and-updating).
- Use `nvm` to install and use the correct Node.js version:
  ```sh
  nvm install
  nvm use
  ```

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username/10xdevsFishcards.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Set up your environment variables by creating a `.env` file in the root of the project. You can copy the example file:
    ```sh
    cp .env.example .env
    ```
    Then, fill in the required values for your Supabase project.

### Running the Application

To start the development server, run:

```sh
npm run dev
```

The application will be available at `http://localhost:4321`.

## Available Scripts

In the project directory, you can run the following scripts:

- `npm run dev`: Runs the app in the development mode.
- `npm run start`: Starts the app in production mode after building.
- `npm run build`: Builds the app for production to the `dist/` folder.
- `npm run preview`: Serves the production build locally for preview.
- `npm run astro`: Provides access to the Astro CLI.

## Project Structure

```md
.
├── src/
│   ├── layouts/    # Astro layouts
│   ├── pages/      # Astro pages
│   │   └── api/    # API endpoints
│   ├── components/ # UI components (Astro & React)
│   └── assets/     # Static assets
├── public/         # Public assets
```

## Project Scope

The current scope of the project includes the following features:

- **User Authentication**: Secure user registration and login.
- **Flashcard Decks**:
  - Browse existing decks.
  - Create, edit, and delete personal decks.
- **Learning Mode**:
  - View flashcards one by one.
  - Mark cards as "learned" to track progress.

## Project Status

[![Project Status: In Development](https://img.shields.io/badge/status-in_development-yellowgreen.svg)](https://github.com/your_username/10xdevsFishcards)

This project is currently in the development phase. New features and improvements are being actively worked on.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

