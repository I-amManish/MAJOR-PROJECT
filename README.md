# Vite + React Project Setup

This guide explains how to install and run a Vite-powered React project.

## Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Installation Steps

1. **Create a Vite React Project**
   ```sh
   npm create vite@latest my-vite-app --template react
   ```
   Or using yarn:
   ```sh
   yarn create vite my-vite-app --template react
   ```

2. **Navigate to the Project Directory**
   ```sh
   cd my-vite-app
   ```

3. **Install Dependencies**
   ```sh
   npm install
   ```
   Or using yarn:
   ```sh
   yarn install
   ```

4. **Start the Development Server**
   ```sh
   npm run dev
   ```
   Or using yarn:
   ```sh
   yarn dev
   ```

5. **Open in Browser**
   The development server will start at `http://localhost:5173/` by default.

## Building for Production

To create an optimized production build, run:
```sh
npm run build
```
Or using yarn:
```sh
yarn build
```
The output will be in the `dist/` folder.

## Running the Production Build Locally

To preview the production build locally:
```sh
npm run preview
```
Or using yarn:
```sh
yarn preview
```

## Additional Configuration
For further customization, refer to the [Vite documentation](https://vitejs.dev/).

---

