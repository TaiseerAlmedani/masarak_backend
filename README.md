# Masarak Backend

This is the backend for the Masarak public transportation guidance application, built with Node.js, Express.js, and PostgreSQL.

## Project Structure

- `app.js`: Main application file, entry point.
- `controllers/`: Contains the logic for handling requests (e.g., `authController.js`, `routeController.js`).
- `models/`: Defines the Sequelize models for database entities (e.g., `user.js`, `route.js`, `station.js`).
- `middleware/`: Contains middleware functions (e.g., `authMiddleware.js` for JWT authentication).
- `routes/`: Defines API routes (e.g., `auth.js`, `routes.js`).
- `swagger.yaml`: OpenAPI/Swagger documentation for the API.
- `.env.example`: Example environment variables file.

## Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/TaiseerAlmedani/masarak_backend.git
    cd masarak_backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add the following:
    ```env
    PORT=5000
    DATABASE_URL="postgresql://user:password@host:port/database"
    JWT_SECRET="your_jwt_secret_key"
    JWT_EXPIRES_IN="1d"
    ```
    *Replace `user`, `password`, `host`, `port`, and `database` with your PostgreSQL credentials.*

4.  **Run database migrations (if any) and seed data:**
    *(Note: This project currently uses `sequelize.sync({ force: true })` for development, which drops and recreates tables. For production, use proper migrations.)*

5.  **Start the server:**
    ```bash
    npm start
    # Or for development with hot-reloading:
    npm run dev
    ```

    The API documentation will be available at `http://localhost:5000/api-docs`.

## Deployment to Render.com

Render.com is recommended for deploying the Node.js backend and PostgreSQL database due to its ease of use and free tier options.

### 1. Create a PostgreSQL Database on Render

1.  Go to [Render.com](https://render.com/) and log in.
2.  Navigate to the Dashboard and click **New > PostgreSQL**.
3.  Choose a name for your database (e.g., `masarak-db`).
4.  Select the free tier plan.
5.  Click **Create Database**. Render will provision your database and provide a `External Database URL`.

### 2. Deploy the Backend Service on Render

1.  From the Render Dashboard, click **New > Web Service**.
2.  Connect your GitHub account and select the `TaiseerAlmedani/masarak_backend` repository.
3.  **Service Name:** `masarak-backend` (or your preferred name).
4.  **Region:** Choose a region close to your users (e.g., Frankfurt for Syria).
5.  **Branch:** `master` (or your main branch).
6.  **Root Directory:** `/` (if your `package.json` is in the root).
7.  **Runtime:** `Node`.
8.  **Build Command:** `npm install`
9.  **Start Command:** `npm start`
10. **Environment Variables:**
    *   Click **Advanced** to add environment variables.
    *   `PORT`: `10000` (Render requires this specific port for web services).
    *   `DATABASE_URL`: Copy the `Internal Database URL` from your `masarak-db` (created in step 1). This allows your backend service to connect to the database securely within Render's network.
    *   `JWT_SECRET`: A strong, random secret key (e.g., generated online).
    *   `JWT_EXPIRES_IN`: `1d` (or your desired expiration time).

11. **Health Check Path:** `/api/health` (You might need to implement a simple health check endpoint in your `app.js` if you don't have one).
12. **Scaling:** Choose the free tier instance type.
13. Click **Create Web Service**. Render will automatically build and deploy your backend.

### 3. Accessing the Deployed Backend

Once deployed, Render will provide a public URL for your backend service (e.g., `https://masarak-backend.onrender.com`). You can use this URL to access your API endpoints and Swagger documentation (`https://masarak-backend.onrender.com/api-docs`).

## API Documentation

Access the interactive API documentation (Swagger UI) at `/api-docs` endpoint after the server is running.

## Contributing

Feel free to fork the repository and submit pull requests.
