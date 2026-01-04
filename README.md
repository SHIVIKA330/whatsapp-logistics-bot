# Jain Kante Wale - Service Complaint WhatsApp Bot

A WhatsApp automation bot for allocating Service Technicians and sending Complaint Notifications. Built with `whatsapp-web.js` and Express.js.

## Features
- **Complaint Allocation**: Automated WhatsApp alerts with Complaint No, Product, and Technician details.
- **Interactive Menu**: Buy Scale, Repair, and Support options.
- **Operator Dashboard**: Web interface for easy data entry.
- **Auto-Reply**: Handles basic customer queries.
- **State Management**: Context-aware conversations.

## Prerequisites
- Node.js (v18+)
- A WhatsApp account (phone number)

## Local Setup
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    npm start
    ```
4.  Scan the QR code in the terminal with your WhatsApp.
5.  Open Dashboard at `http://localhost:3000`.

## Deployment (Render)
To deploy this bot on [Render.com](https://render.com):

1.  **Create a New Web Service** connected to this repo.
2.  **Build Command**: `npm install`
3.  **Start Command**: `npm start`
4.  **Important**: Since this bot uses Puppeteer (Chrome), you must add a specialized buildpack if deployment fails, but `whatsapp-web.js` usually handles basic setups.
5.  **Session Persistence**: On the free tier, the file system is ephemeral. This means you will need to **re-scan the QR code** every time the server restarts (which is daily on free tier). For production, use a Persistent Disk (Paid) or Docker.

## Environment Variables
- `PORT`: Defaults to 3000 (Render sets this automatically).
