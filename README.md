Welcome to SMS Security Web Dashboard 🛡️

This is a React project built with Vite and Tailwind CSS for the SMS Security / AntiFraude SMS administrative monitoring dashboard.

Get started

1. Install dependencies

   ```bash
   npm install
   ```


2. Start the development server

    ```bash
    npm run dev
    ```

In the output, you'll find the local web server URL (usually http://localhost:5173).

You can start developing by editing the main application files inside the src directory, primarily src/App.jsx.

Key Features

Real-time KPI Monitoring: Tracks total analyzed SMS, high-risk smishing detections, pending user reports, and suspicious domains.

Smishing Categorization: Visual breakdown of threat patterns targeting users in Chile (Banks, Couriers, Public Services, Social Networks).

Interactive Audit Table: Review reports submitted from the mobile app and approve or discard classifications to improve detection models.

Available Scripts

npm run dev - Starts the Vite development server with Hot Module Replacement (HMR).

npm run build - Compiles and bundles the application for production deployment.

npm run preview - Serves the production build locally for testing.

Backend Integration

This web interface connects to the sms-dashboard-api service (Node.js/Express + MongoDB) to synchronize metrics and user reports in real time.

Learn more

To learn more about the frontend stack used in this project:

Vite Documentation: Learn about Vite configuration, plugins, and performance.

React Documentation: Explore React components, state management, and hooks.

Tailwind CSS Documentation: Learn about utility-first CSS styling.

Lucide Icons: Explore the icon set used throughout the dashboard interface.