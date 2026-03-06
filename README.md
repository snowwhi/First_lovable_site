# First Lovable Site (RedditTales)

A modern, responsive web application built with React, Vite, Tailwind CSS, and Appwrite. 

## 🚀 Tech Stack

- **Frontend Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Routing:** React Router DOM
- **State Management:** React Query (@tanstack/react-query)
- **Backend/BaaS:** Appwrite (Authentication, Databases, Storage)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm (comes with Node.js)

## 🛠️ Setup & Installation

Follow these steps to get the project running on your local machine:

### 1. Install Dependencies
Clone the repository and install the required npm packages.
```bash
npm install
```

### 2. Configure Tailwind CSS
*(Note: If the repository was freshly downloaded, the Tailwind CSS setup might need to be initialized).*
Ensure that `tailwindcss` is installed and the configuration files exist. If styles are missing, run:
```bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```
Make sure `tailwind.config.js` is updated with the custom `shadcn` color variables defined in `src/index.css`.

### 3. Setup Environment Variables
This project requires connection to an Appwrite backend. You must create a `.env` file in the root of your project directory (at the same level as `package.json`).

Create a file named `.env` and add your Appwrite credentials:
```env
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_PROJECT_NAME="Your Project Name"
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_ID=your_collection_id
VITE_APPWRITE_BUCKET_ID=your_bucket_id
```

**⚠️ Important Appwrite Configuration Notes:**
- **No Quotes:** Do not wrap your IDs in single quotes (e.g., `'123'`). Vite will parse the quotes literally, which will corrupt the ID and cause Appwrite `404` or `401 CORS` errors.
- **Regional Endpoints:** If your Appwrite Cloud project is hosted in a specific region (e.g., Singapore), you **must** use the regional endpoint to avoid CORS blocks. For example, use `https://sgp.cloud.appwrite.io/v1` instead of the global `cloud.appwrite.io` endpoint.
- **Add Platform:** Ensure you have added `localhost` as a "Web App" platform in your Appwrite Console under project settings, otherwise Appwrite will block local development requests with a CORS error.

### 4. Run the Development Server
Start the Vite development server:
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser to view the application.

## 🐛 Common Troubleshooting

**Issue:** `Failed to Fetch` or `CORS policy` error in the browser console during signup/login.
**Solutions:**
1. Check that your `.env` variables do not contain stray quotation marks.
2. Verify that you are using the correct Regional Endpoint in `VITE_APPWRITE_ENDPOINT` (e.g., `sgp.cloud.appwrite.io`).
3. Confirm that `localhost` is added to the "Platforms" list in your Appwrite project dashboard.

**Issue:** `404 Project with the requested ID could not be found.`
**Solution:** Do not append region prefixes (like `sgp-`) to your `VITE_APPWRITE_PROJECT_ID`. The ID is purely alphanumeric. The region suffix belongs only in the `VITE_APPWRITE_ENDPOINT` URL.

**Issue:** The site loads, but looks like plain HTML without any styling.
**Solution:** Tailwind CSS requires processing. Stop the server, run `npm install -D tailwindcss@3 postcss autoprefixer`, create a basic `tailwind.config.js`, and restart with `npm run dev`.

## 📦 Build for Production

To create an optimized production build:
```bash
npm run build
```
The compiled files will be generated in the `dist` directory.
