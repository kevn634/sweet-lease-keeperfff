# Sweet Lease Keeper

Welcome to the **Sweet Lease Keeper** repository! This is a modern, high-performance web application built with a cutting-edge technology stack.

## 🚀 Tech Stack

### Frontend & Core
*   **[React 19](https://react.dev/)**: The latest React features for building user interfaces.
*   **[TanStack Start](https://tanstack.com/start/latest) & Router**: Handles full-stack routing, Server-Side Rendering (SSR), and seamless API integration.
*   **[Vite](https://vitejs.dev/) & Nitro**: Ultra-fast build tooling powered by the Nitro server engine.

### Styling & UI
*   **[Tailwind CSS v4](https://tailwindcss.com/)**: Utility-first CSS framework for rapid UI development.
*   **[Radix UI](https://www.radix-ui.com/)**: Accessible, unstyled UI primitives.
*   **[Framer Motion](https://www.framer.com/motion/)**: Smooth animations and fluid transitions.
*   **[Lucide React](https://lucide.dev/)**: Crisp vector icons.

### Data & Backend
*   **[Supabase](https://supabase.com/)**: The open-source Firebase alternative providing the PostgreSQL database, authentication, and backend services.
*   **[TanStack Query (React Query)](https://tanstack.com/query/latest)**: Robust async state management and caching.

### Forms & Validation
*   **[React Hook Form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)**: Highly performant form management with strict, schema-based validation.

---

## 🛠️ Local Development

To run this project locally on your machine:

1. **Install Dependencies**:
   ```bash
   npm install
   ```
   *(or `yarn`, `pnpm`, `bun install` depending on your preference)*

2. **Environment Variables**:
   Ensure you have your `.env` file configured with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (or another port if 5173 is busy).

---

## 🌍 Deployment

This project is configured to be deployed natively on **Netlify** without any build errors!

### Deploying to Netlify
1. Push your code to GitHub (or your preferred Git provider).
2. Go to your [Netlify Dashboard](https://app.netlify.com/) and click **Add new site** > **Import an existing project**.
3. Select this repository.
4. Netlify will automatically detect the `netlify.toml` file and configure the build settings.
5. In Netlify's **Site Settings**, make sure to add your Environment Variables (e.g., `VITE_SUPABASE_URL`).
6. Click **Deploy**.

> **Note**: Under the hood, this uses the `NITRO_PRESET="netlify"` environment variable, allowing the TanStack Start app to compile perfectly into Netlify Edge/Functions!
