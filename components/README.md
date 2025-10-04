An academic-grade, interactive web simulator for analysing the performance, power, and thermal characteristics of 3D-stacked systems versus traditional 2D designs, with a dedicated module for modern GPU architectures.

https://service-3d-stacked-risc-v-accelerator-simulator-510594466659.us-west1.run.app

## Overview

This project provides a powerful, web-based platform for computer architecture research and education. It allows users to design, simulate, and visualize the trade-offs between two fundamental chip designs:

1.  **A Traditional 2D Baseline System:** Where the processor and memory are separate components on a single plane.
2.  **A Modern 3D Stacked System:** Where logic and memory dies are stacked vertically and connected with high-bandwidth Through-Silicon Vias (TSVs).

The simulator also includes a robust **GPU simulation module** to model and analyse the performance of throughput-oriented parallel architectures on a variety of industry-relevant benchmarks.

The core of the application is its ability to provide immediate, quantitative feedback on design choices, enhanced with AI-powered analysis to help users interpret results and make informed decisions.

## ✨ Key Features

*   **💻 CPU System Configurator:** Tune detailed parameters for the main memory, a full cache hierarchy (L1, L2, L3), TSV properties, and thermal characteristics for both 2D and 3D systems.
*   **🔬 CPU Benchmark Simulator:** Execute a wide range of pre-written RISC-V assembly benchmarks (sorting, searching, crypto, etc.) or write your own code in the built-in editor. Model different workload behaviors with selectable memory access patterns.
*   **🚀 GPU Benchmark Simulator:** Configure a detailed GPU model (cores, clock, memory, cache) and run benchmarks for Machine Learning, Scientific Computing, and Graphics. Features a live thermal heatmap of core activity during simulation.
*   **📊 In-Depth Analysis Dashboard:** A comprehensive visualisation suite showing performance gains, power efficiency, and thermal changes. Includes animated system diagrams, thermal thermometers, and detailed metrics tables.
*   **🧠 AI Design Assistant (Gemini-Powered):**
    *   **Automated Insights:** Get an expert summary, bottleneck identification, and actionable recommendations based on your simulation results.
    *   **Hardware Prediction:** Use AI to predict how your simulated results might translate to real-world FPGA hardware.
    *   **Conversational Chat:** Ask for design advice, code optimisation tips, or explanations of architectural concepts.
    *   **Web Research:** Use Google Search grounding to ask questions about recent technology trends.
*   **⚖️ Ethical AI Framework:** A dedicated section discussing the ethical implications and potential biases of using AI in chip design, promoting responsible use.
*   **⬇️ Publication-Ready Export:** Download complete configurations and results in JSON format for use in research papers and further analysis.

## 🛠️ Tech Stack

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **AI Integration:** Google Gemini API (`@google/genai`)
*   **Backend (for OTP demo):** Node.js, Express, CORS

## 🚀 Getting Started

To run this project locally, follow these steps:

### 1. Prerequisites

*   Node.js and npm installed.
*   A valid Google Gemini API key.

### 2. Frontend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/3d-riscv-simulator.git
    cd 3d-riscv-simulator
    ```
2.  **Set up your API Key:**
    The application is designed to source the Gemini API key from an environment variable named `process.env.API_KEY`. In your development environment, ensure this variable is set. For example, you can create a `.env` file in the root of the project:
    ```
    API_KEY=your_google_gemini_api_key
    ```
3.  **Install dependencies and run:**
    The project is configured to work with a web-based development environment. Simply load the project files, ensure the `.env` file is present, and the development server will handle the rest.

### 3. Backend Setup (for OTP Login Feature)

The one-time password (OTP) feature uses a minimal Node.js backend.

1.  **Navigate to the project root directory in your terminal.**
2.  **Install backend dependencies:**
    ```bash
    npm install
    ```
3.  **Start the backend server:**
    ```bash
    npm start
    ```
    The server will start on `http://localhost:3001` and will print OTP codes to the console for the demo.

## 📁 Project Structure
/
├── components/ # Reusable React components (UI elements, visualizers)
├── pages/ # Top-level page components (Dashboard, Simulator, Analysis, etc.)
├── types.ts # TypeScript interfaces for all data structures
├── App.tsx # Main application component, manages state and routing
├── index.tsx # Entry point for the React application
├── server.js # Minimal Node.js backend for OTP
└── package.json # Backend dependencies and scripts

## 📜 License

This project is licensed under the MIT License.

## ✍️ Citation

If you use this simulator in your academic research, please cite it as:

```bibtex
@inproceedings{3d-riscv-sim-2024,
  author    = {A. User},
  title     = {A Web-Based Simulator for Exploring Performance, Power, and Thermal Trade-offs in 3D-Stacked RISC-V and GPU Systems},
  booktitle = {Proceedings of the Workshop on Computer Architecture Education (WCAE)},
  year      = {2024}
}
