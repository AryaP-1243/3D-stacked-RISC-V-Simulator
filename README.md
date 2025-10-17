<div align="center">

# 3D Stacked RISC-V Accelerator Simulator

**An Academic-Grade Web Platform for Computer Architecture Research & Education**

[![Built with Google AI Studio](https://img.shields.io/badge/Built%20with-AI%20Studio-blue)](https://ai.studio/apps/drive/1P62K3Z_QuTCY0-t84fXgvaLwv9AjzSsT)
[![Powered by Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-React-61DAFB)](https://reactjs.org/)

*Design, simulate, and analyze modern processor architectures with AI-powered insights*

[View Demo](https://ai.studio/apps/drive/1P62K3Z_QuTCY0-t84fXgvaLwv9AjzSsT) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 🎯 Overview

The **3D Stacked RISC-V Accelerator Simulator** is a comprehensive web application that bridges the gap between theoretical computer architecture and practical hardware design. It enables researchers, students, and engineers to:

- **Compare** traditional 2D architectures against cutting-edge 3D-stacked systems
- **Simulate** RISC-V and GPU workloads with cycle-accurate precision
- **Analyze** performance, power consumption, and thermal characteristics
- **Optimize** designs with AI-powered recommendations and real-world hardware predictions

Unlike conventional simulators, this platform integrates **Google Gemini AI** to provide intelligent design assistance, automated bottleneck analysis, and industry research capabilities—making it an invaluable tool for both education and research.

---

## ✨ Key Features

### 🖥️ **CPU Simulation Suite**

#### System Configurator
- **Dual Architecture Design**: Configure and compare 2D baseline vs. 3D-stacked systems side-by-side
- **Comprehensive Parameters**: 
  - Multi-level cache hierarchy (L1/L2/L3) with adjustable size, latency, and associativity
  - Main memory configuration (latency, bandwidth)
  - Through-Silicon Via (TSV) properties for 3D designs
  - Thermal modeling (TDP, thermal resistance, throttle temperature)
- **Configuration Management**: Save, load, and share architectural configurations

#### RISC-V Benchmark Simulator
- **Assembly Execution**: Write and run custom RISC-V assembly code
- **Extensive Benchmark Library**: Pre-built benchmarks across categories:
  - Sorting & Searching (QuickSort, Binary Search, Merge Sort)
  - Cryptography (AES, RSA, SHA-256)
  - Data Structures (Linked Lists, Hash Tables, Trees)
  - Scientific Computing (Matrix Operations, FFT)
- **Workload Modeling**: Abstract workloads by memory access patterns (sequential, random, strided)
- **Live Visualization**: Real-time animation of data flow through 2D buses and 3D TSVs

### 🎮 **GPU Simulation Suite**

- **Parallel Architecture Modeling**: Configure GPU core count, clock speed, memory bandwidth, and thermal properties
- **Real-World Workloads**: 
  - **Machine Learning**: GEMM, Transformer Inference, CNN Training
  - **Scientific Computing**: N-Body Simulation, Stencil Computations
  - **Graphics**: Ray Tracing, Vertex/Fragment Shading
  - **Data Analytics**: Radix Sort, Graph Traversal
- **Live Thermal Heatmap**: Visualize hotspot formation and thermal throttling in real-time
- **Compute vs. Memory Bound Analysis**: Automatic workload characterization

### 📊 **Advanced Analysis Dashboard**

- **Executive Summary**: At-a-glance performance metrics and efficiency gains
- **Interactive Comparisons**: Dynamic charts for cycles, AMAT, IPC, temperature
- **Thermal Performance**: Visual thermometers showing throttle limits and thermal headroom
- **Power Breakdown**: Dynamic vs. static power consumption analysis
- **Cache Hierarchy Metrics**: Hit/miss rates across all cache levels
- **Data Export**: Export complete simulation results to JSON

### 🤖 **AI Integration (Powered by Google Gemini)**

#### AI Design Assistant
- **Context-Aware Guidance**: Chat with an AI expert that understands your current configuration
- **Optimization Advice**: Get actionable recommendations for architecture improvements
- **Code Generation**: Assistance with writing RISC-V assembly
- **Concept Explanation**: In-depth explanations of computer architecture principles

#### AI-Powered Insights
- **Automated Analysis**: Post-simulation expert-level bottleneck identification
- **Hardware Prediction**: Real-world performance projections accounting for simulation-to-silicon gap
- **Web Research**: Integrated Google Search grounding for latest industry trends and research

### 🔐 **Authentication System**

- **Traditional Login**: Secure password-based registration and authentication
- **OTP System**: Modern one-time password authentication via dedicated Node.js backend

### 🧭 **Educational Resources**

- **Ethics Page**: Discussion of AI bias and responsible use in engineering design
- **Guided Learning**: Structured introduction to 2D vs. 3D architecture tradeoffs

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Google Gemini API Key** ([Get one free](https://aistudio.google.com/app/apikey))
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd 3d-risc-v-simulator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Optional: OTP Authentication Backend

To enable OTP login functionality:

1. Navigate to the backend directory
2. Start the Express server:
   ```bash
   node server.js
   ```
3. The OTP code will be logged to the console for testing

---

## 📖 Usage Guide

### Basic Workflow

1. **Configure Your System**
   - Navigate to CPU Configurator
   - Design your 2D baseline architecture
   - Configure the 3D-stacked alternative
   - Save your configuration for future use

2. **Run Simulations**
   - Choose a benchmark from the library or write custom RISC-V code
   - Watch the live visualization as the simulation executes
   - View real-time performance metrics

3. **Analyze Results**
   - Review the executive summary for key insights
   - Explore detailed charts and breakdowns
   - Read AI-generated analysis and recommendations

4. **Optimize**
   - Chat with the AI Design Assistant for optimization ideas
   - Iterate on your configuration based on insights
   - Compare multiple design points

### Example: Comparing Cache Configurations

```assembly
# Load a memory-intensive benchmark
# Configure 2D: L1=32KB, L2=256KB, L3=8MB
# Configure 3D: Same caches + low-latency TSVs
# Run simulation
# Observe 3D system's reduced memory latency
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 with TypeScript |
| **Styling** | Tailwind CSS |
| **AI/ML** | Google Gemini API (`@google/genai`) |
| **Backend** | Node.js + Express (OTP service) |
| **Architecture** | ESM modules via CDN (importmap) |
| **Visualization** | Custom React components with real-time animation |

---

## 🏗️ Project Structure

```
├── src/
│   ├── components/
│   │   ├── Login.tsx              # Authentication
│   │   ├── LandingPage.tsx        # Welcome screen
│   │   ├── Configurator.tsx       # CPU configuration
│   │   ├── Simulator.tsx          # RISC-V execution
│   │   ├── GpuSimulator.tsx       # GPU simulation
│   │   ├── Analysis.tsx           # Results dashboard
│   │   ├── AIAssistant.tsx        # Gemini chat interface
│   │   ├── SystemVisualizer.tsx   # 2D/3D animation
│   │   ├── GpuVisualizer.tsx      # Thermal heatmap
│   │   └── Ethics.tsx             # AI ethics discussion
│   ├── index.html                 # Entry point with importmap
│   └── ...
├── server.js                      # OTP backend
├── .env.local                     # API keys
├── package.json
└── README.md
```

---

## 🎓 Educational Use Cases

- **Computer Architecture Courses**: Hands-on labs for cache design, memory hierarchy, thermal management
- **Research**: Rapid prototyping of novel 3D architectures
- **Capstone Projects**: Complete design-to-analysis workflow for student projects
- **Self-Learning**: Interactive exploration of modern processor design principles

---

## 🤝 Contributing

We welcome contributions from the community! Areas of interest:

- Additional benchmark implementations
- New visualization modes
- Enhanced thermal models
- Multi-core simulation support
- Extended ISA support beyond RISC-V

**To contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini**: AI capabilities powering intelligent analysis
- **RISC-V International**: Open ISA specification
- **Academic Community**: Research inspiring this work

---

## 📚 Related Resources

- [RISC-V ISA Specification](https://riscv.org/technical/specifications/)
- [3D IC Technology Overview](https://en.wikipedia.org/wiki/Three-dimensional_integrated_circuit)
- [Thermal Design Power (TDP) Explained](https://en.wikipedia.org/wiki/Thermal_design_power)


---

<div align="center">

**Built with ❤️ for the Computer Architecture Community**

*Empowering the next generation of hardware designers*

</div>
