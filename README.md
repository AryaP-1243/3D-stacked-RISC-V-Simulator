3D Stacked RISC-V & GPU Accelerator Simulator
![alt text](https://storage.googleapis.com/aistudio-ux-team-public/3d-risc-v-sim/screenshot.png)

An academic-grade, interactive web simulator for analysing and visualising the performance, power, and thermal characteristics of 3D-stacked processor systems compared to traditional 2D architectures. This suite includes a detailed RISC-V CPU simulator, a versatile GPU workload simulator, and a powerful AI Design Assistant powered by the Google Gemini API.

This tool is designed for students, researchers, and computer architects to intuitively explore the trade-offs and benefits of 3D integrated circuit design.

✨ Core Features


🖥️ Parametric CPU Configuration: Define detailed parameters for cache hierarchies (L1/L2/L3), main memory, Through-Silicon Vias (TSVs), and thermal properties for both a traditional 2D planar system and a 3D-stacked system.


🔬 Interactive CPU Simulation: Write, load, and execute RISC-V assembly code on your virtual architectures. Model different workload characteristics by adjusting the instruction mix and memory access patterns (sequential, strided, random).


🎮 Advanced GPU Simulation: Configure and simulate a throughput-oriented GPU architecture. Run a wide array of predefined benchmarks from domains like Machine Learning, Scientific Computing, Graphics, and Data Analytics to model real-world performance.


📊 Comprehensive Analysis Suite: Instantly visualise simulation results with a rich set of tools:
Executive Summary: High-level metrics on performance gain, power efficiency, and thermal changes.
Live Visualizers: Animated diagrams showing data flow in CPU systems and thermal heatmaps for GPU cores during live simulation.
Interactive Charts: Compare key metrics like Total Cycles, AMAT, IPC, and Operating Temperature.
Bottleneck Analysis: Automatically identify whether a GPU workload is compute-bound or memory-bound.


🧠 Gemini-Powered AI Assistant:
Design Chat: A conversational AI that leverages your current system configurations to provide expert analysis, identify bottlenecks, and suggest actionable improvements.
Web Research: Ask questions about recent technology trends and get up-to-date, cited answers powered by Google Search grounding.
AI-Predicted Hardware Validation: Go beyond simulation and use AI to predict performance on real-world FPGA hardware, providing a "reality check" for your designs.


🛡️ Ethical AI Considerations: A dedicated section exploring the potential for bias, skill erosion, and accountability challenges when using AI in chip design, promoting responsible and critical use of the tool.


🛠️ Technology Stack
Frontend: React, TypeScript, Tailwind CSS
AI/ML: Google Gemini API (@google/genai)
Backend (for OTP feature): Node.js, Express.js


🚀 Getting Started
This project is designed to run in a web-based development environment where the frontend is served automatically. However, to enable all features (specifically the "One-Time Code" login), you need to run the optional backend server.

Prerequisites
Node.js and npm are installed on your local machine.
A Google Gemini API key.
1. Set Up Your API Key
The AI-powered features require a Google Gemini API key. You must set this as an environment variable named API_KEY in the environment where the application is running.

For example, in a bash terminal:

code
Bash
export API_KEY="YOUR_API_KEY_HERE"
The application is coded to read this variable directly. Do not paste your key into the source code.

2. Running the Backend (Optional)
The backend is only required for the "One-Time Code" login feature. The primary username/password login and all simulation features work without it.

Open a terminal in the project's root directory.
Install dependencies:
code
Bash
npm install
Start the server:
code
Bash
npm start
The server will now be running on http://localhost:3001. The frontend will automatically connect to it when you use the one-time code feature. When an OTP is generated, it will be printed in this terminal window for you to use in the login form.

📖 How to Use the Simulator
Launch & Login: Open the application URL and use the "Register" or "Login" tab.
Configure: Navigate to the CPU Config or GPU Simulator pages from the sidebar to define your target architecture. You can save and load configurations for later use.
Simulate:
For CPU analysis, go to the CPU Simulator page. Load a predefined benchmark or write your own RISC-V code, select a memory access pattern, and click "Run Simulation".
For GPU analysis, select a workload and configure your GPU on the GPU Simulator page, then click "Run Benchmark".
Analyse: After a simulation completes, you will be taken to the Analysis page. Explore the charts, visualizers, and detailed metrics to understand the results.
Get Insights: At any time, navigate to the AI Assistant to ask questions, request analysis of your current configurations, or research related topics on the web.


📜 License
This project is licensed under the MIT License. See the LICENSE file for details.

Acknowledgements
This project serves as a practical demonstration of modern web technologies and the power of generative AI in specialised scientific domains.
Inspired by academic research in the fields of computer architecture and 3D integrated circuits.
