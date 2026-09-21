# 360 View Hotel Booking App

A modern Next.js hotel booking application featuring interactive 360-degree virtual tours, floor plan viewing/editing, booking management, and owner dashboard.

## Features

- **360° Virtual Tours**: Interactive panorama viewer powered by Photo Sphere Viewer.
- **Interactive Floor Plans**: Explore property layouts with visual floor plan views and markers.
- **Listing & Booking**: Search and book hotel rooms / properties with booking management.
- **Owner Dashboard**: Manage listings, bookings, and customer details.
- **Modern Tech Stack**: Built with Next.js (App Router), React 19, Tailwind CSS, PostgreSQL, and Drizzle ORM.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env` (e.g. database connection string):
   ```env
   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
   ```

3. Push schema to database:
   ```bash
   npx drizzle-kit push
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
