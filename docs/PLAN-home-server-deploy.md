# Deployment Plan: Home Server (Ubuntu + aaPanel)

> **Goal**: Deploy the R4B application to a home server running Ubuntu 22.04, managed via aaPanel, accessible via a custom domain (Cloudflare).

## Phase 1: Server & aaPanel Preparation
**Objective**: Ensure the server has the necessary runtime environment (Docker) installed via aaPanel.

- [ ] **Install Docker in aaPanel**
    - Log in to aaPanel.
    - Go to **App Store**.
    - Search for **"Docker"** and install the official Docker Manager.
    - Verify Docker is running (toggle "Status" to On).

## Phase 2: Project Transfer
**Objective**: Move the code from your local machine to the server.

- [ ] **Upload Codebase**
    - **Method A (Recommended - Git)**:
        - SSH into server (Terminal in aaPanel).
        - Navigate to `/www/wwwroot/`.
        - `git clone <your-repo-url> r4b-app`.
    - **Method B (Manual Upload)**:
        - Zip the project (excluding `node_modules`, `.git`, `dist`).
        - Use aaPanel **Files** tab to upload to `/www/wwwroot/r4b-app`.
        - Unzip.

## Phase 3: Production Configuration
**Objective**: Configure the application for a production environment.

- [ ] **Environment Variables**
    - Create/Edit `.env` file in `/www/wwwroot/r4b-app`.
    - Set `NODE_ENV=production`.
    - Update `CLIENT_URL` to your actual domain (e.g., `https://mmopro.click`).
    - **MongoDB**: Keep using Dockerized Mongo or update `MONGO_URI` if connecting to an external DB.

- [ ] **Docker Compose (Production)**
    - Create `docker-compose.prod.yml`.
    - Remove build steps (optional, if using pre-built images) OR keep build steps for simplicity on home server.
    - Ensure ports are mapped correctly (e.g., App container maps `80:80` or `8080:80` depending on port availability. **Recommendation**: Map to `8080` internally to avoid conflict with aaPanel/Nginx on port 80).
    - Set restart policy: `restart: always`.

## Phase 4: Deployment & Reverse Proxy
**Objective**: Run the app and expose it via aaPanel's Nginx.

- [ ] **Start Application**
    - Open aaPanel Terminal.
    - `cd /www/wwwroot/r4b-app`.
    - `docker-compose -f docker-compose.prod.yml up -d --build`.
    - Verify containers are running: `docker ps`.

- [ ] **Configure aaPanel Website (Reverse Proxy)**
    - Go to **Website** -> **Add Site**.
    - Domain: `mmopro.click`.
    - Database/PHP: Not needed (Select "Pure Static" or pure Nginx).
    - **Reverse Proxy Setup**:
        - Go to Website Settings -> **Reverse Proxy**.
        - Add Proxy:
            - Name: `R4B_App`
            - Target URL: `http://127.0.0.1:8080` (or the port defined in docker-compose).
            - Save.

## Phase 5: SSL & Network (Cloudflare + OPNsense)
**Objective**: Secure the connection and enable external access.

- [ ] **Cloudflare SSL**
    - **Option A (Easiest)**: Use aaPanel's "SSL" tab -> "Let's Encrypt" (requires port 80 open).
    - **Option B (Secure)**: Generate a **Cloudflare Origin Certificate**.
        - Paste Key/Cert into aaPanel SSL -> "Other Certificate".
        - Set Cloudflare SSL/TLS mode to **Full (Strict)**.

- [ ] **OPNsense Port Forwarding (NAT)**
    - **Source**: Any (WAN).
    - **Destination**: WAN Address (Ports 80 & 443).
    - **Redirect Target**: Your Ubuntu Server IP (e.g., `192.168.1.xxx`).
    - **NAT Reflection**: Enable (to access via domain from inside home network).

## Phase 6: Verification
- [ ] Check Domain Access: `https://mmopro.click`.
- [ ] Test Login & API: Verify frontend connects to backend correctly.
- [ ] Test TPBank/Binance Webhooks: Ensure external services can reach your server.
