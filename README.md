# WebRTC Project

Welcome to my WebRTC project repository! Here, I'll be experimenting with WebRTC and implementing various features to learn more about real-time communication over the web.

## Live Preview

[https://webrtc-sahilverma.netlify.app/](https://webrtc-sahilverma.netlify.app/)

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Contact Me](#contact-me)

## Introduction

WebRTC (Web Real-Time Communication) is a powerful API that enables real-time communication directly between web browsers. It allows for peer-to-peer audio, video, and data sharing without the need for plugins or additional software.

In this project, I'll explore different aspects of WebRTC, including:

- Setting up a basic peer-to-peer connection
- Implementing audio and video streams
- Integrating data channels for non-media communication
- Exploring advanced features like screen sharing and file transfer

## Todo

- [x] Custom TURN server
- [ ] File transfer
- [ ] Group video chat with SFU

## Features

- Peer-to-peer audio and video communication under same network

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/sahilverma-dev/webrtc/
   ```

2. **Install Packages:**

   **Client (React Frontend):**

   ```bash
   cd webrtc/client
   npm install
   ```

   **Server (Node.js in TypeScript):**

   ```bash
   cd ../server
   npm install
   ```

3. **Run the Application:**

   **Client:**

   ```bash
   npm run dev
   ```

   **Server:**

   ```bash
   npm run dev
   ```

   You may now access the application at the specified address in your browser.

4. **Setup TURN server (optional)**
   This step us only required if you're planning to host the project.
   Read this to [setup your custom TURN Server](./setup-custom-turn-server.md).

## Contact Me

- **Email:** [sahilverma.webdev@gmail.com](mailto:sahilverma.webdev@gmail.com)
- **Portfolio:** [sahilverma.dev](https://sahilverma.dev/)
- **GitHub:** [@sahilverma-dev](https://github.com/sahilverma-dev)
- **Twitter:** [@sahilverma_dev](https://twitter.com/sahilverma_dev)
- **LinkedIn:** [sahilverma-dev](https://www.linkedin.com/in/sahilverma-dev/)
