# Bypass x Frame
It acts as a proxy and tries to remove cross origin blocking headers.

Still some work left to make it fully dynamic. It works good with static sites. 

If you try do any illegal activity with these code, I'm or this repo is not responsible for that.

## Do you need to use it
If you just want to open iframe in your own browser, you may want to use something like a chrome plugin to achieve it. 

## Requirements
#### for client 
Make sure that you run that file with http or https protocol. Yes, you can use live server. 

## Before

<img width="1366" height="742" alt="screenshot_Wed Jul 23 06:45:34 PM +06 2025" src="https://github.com/user-attachments/assets/bc90317d-ce3f-48fc-8c7b-d286f0bcbd8e" />


## After
https://github.com/user-attachments/assets/c97752ef-c284-4976-ad9d-76609fe95980




## Deploying on Dokploy
If Dokploy shows `Error: ❌ Github Provider not found` during **Initializing deployment**, the Dokploy project is pointing to a missing GitHub OAuth provider (this is a Dokploy project configuration issue, not an app runtime error).

Use one of these options:
1. Reconnect a **GitHub Provider** in Dokploy and re-select it for the project.
2. Or switch the service to **Dockerfile deployment from Git repo URL** (without GitHub provider binding), then use this repo's root `Dockerfile`.

This repo now includes a production Dockerfile and reads `PORT` from environment variables so Dokploy can map ports correctly.

### Runtime notes
- The server now serves `client/index.html` at `/` so the app opens directly after deployment.
- Client assets use same-origin paths (no hardcoded `localhost`) so hosted deployments work without edits.
- Healthcheck endpoint: `/health`.
