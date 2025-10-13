# 3D Stacked RISC-V & GPU Accelerator Simulator

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Educational-green.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)
![AI Powered](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)

**An academic-grade, interactive web platform for exploring 3D chip architectures**

[Features](#-core-features) • [Demo](#-live-demo) • [Installation](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🎯 Overview

A cutting-edge simulation platform that bridges the gap between theoretical computer architecture and practical chip design. Explore the revolutionary world of 3D integrated circuits through interactive simulations, real-time visualisations, and AI-powered insights.

**Perfect for:**
- 🎓 Computer Architecture students learning about modern processor design
- 🔬 Researchers exploring 3D integration trade-offs
- 👨‍💻 Hardware engineers prototyping new architectures
- 🏫 Educators demonstrating advanced computer organisation concepts

### Why 3D Stacking?

3D chip stacking represents the future of semiconductor design, offering:
- **Higher Performance:** Reduced wire lengths and latency through vertical integration
- **Lower Power:** Shorter interconnects mean less energy consumption
- **Greater Density:** More functionality in smaller footprints
- **Thermal Challenges:** Unique heat dissipation problems requiring innovative solutions

This simulator lets you explore these trade-offs interactively, comparing 2D vs 3D architectures with real metrics.

---

## ✨ Core Features

### 🖥️ Parametric CPU & GPU Configuration

<details>
<summary><b>Click to expand CPU features</b></summary>

**Cache Hierarchy Modelling:**
- L1/L2/L3 cache configuration with adjustable:
  - Cache sizes (KB to MB range)
  - Associativity (direct-mapped to fully associative)
  - Access latencies (cycle-accurate)
  - Miss penalties and bandwidth
- Main memory parameters (size, latency, bandwidth)

**3D Integration Specifics:**
- Through-Silicon Via (TSV) configuration
  - Latency impact modelling
  - Bandwidth characteristics
  - Density constraints
- Thermal modelling for each layer
  - Heat dissipation rates
  - Thermal resistance values
  - Hotspot prediction

**Pre-configured Profiles:**
- Mobile/Low-Power
- Desktop/Balanced
- Server/High-Performance
- Research/Experimental

</details>

<details>
<summary><b>Click to expand GPU features</b></summary>

**Massively Parallel Architecture:**
- Configurable number of CUDA-like cores (32-1024+)
- Clock frequency optimisation (MHz to GHz)
- Memory bandwidth modelling (GB/s)
- Compute vs memory intensity analysis

**Thermal Management:**
- Per-core temperature monitoring
- Dynamic thermal throttling simulation
- Power density heatmaps
- Cooling efficiency modelling

**Workload Presets:**
- Machine Learning (matrix ops, convolutions)
- Scientific Computing (FFT, molecular dynamics)
- Graphics (ray tracing, rasterisation)
- Data Analytics (sorting, reduction operations)

</details>

### 🔬 Interactive CPU Simulation Engine

- **RISC-V ISA Support:** Write and execute authentic RISC-V assembly code
- **Workload Characterisation:**
  - Instruction mix adjustment (ALU, memory, branch operations)
  - Memory access patterns (sequential, strided, random, spatial locality)
  - Custom benchmark creation
- **Predefined Benchmarks:**
  - Matrix multiplication
  - Quick sort
  - Binary search
  - Linked list traversal
  - FFT computation
- **Cycle-Accurate Simulation:** See exactly how your code executes on both architectures

### 🎮 Advanced GPU Workload Simulator

**Real-Time Visualisation:**
- Live thermal heatmap showing core temperatures
- Throttling indicator per core
- Memory bandwidth utilisation graph
- Compute unit activity monitor

**Comprehensive Benchmark Suite:**

| Category | Benchmarks |
|----------|-----------|
| **Machine Learning** | Matrix Multiply, Convolution, Neural Network Training |
| **Scientific** | N-Body Simulation, FFT, Molecular Dynamics |
| **Graphics** | Ray Tracing, Vertex Processing, Texture Mapping |
| **Data Analytics** | Map-Reduce, Database Queries, Graph Traversal |

**Performance Bottleneck Detection:**
- Automatic classification: Compute-bound vs Memory-bound
- Roofline model visualisation
- Optimisation suggestions based on workload characteristics

### 📊 Comprehensive Analysis Suite

**Executive Dashboard:**
- Performance gain comparison (2D vs 3D)
- Power efficiency metrics (performance/watt)
- Thermal impact assessment
- Area efficiency calculations

**Interactive Visualisations:**
- **Data Flow Animator:** See cache hits/misses propagate through the hierarchy
- **Thermal Heatmaps:** Real-time temperature distribution across chip layers
- **Performance Graphs:** Line charts, bar charts, and radar plots
- **Comparative Tables:** Side-by-side metric comparison

**Key Metrics Tracked:**
- Total execution cycles
- Average Memory Access Time (AMAT)
- Instructions Per Cycle (IPC)
- Cache hit/miss rates (L1/L2/L3)
- Memory bandwidth utilisation
- Operating temperature (average/peak)
- Power consumption (static/dynamic)
- Energy efficiency (ops/joule)

**Export & Sharing:**
- Download results as CSV/JSON
- Generate PDF reports
- Share configuration snapshots
- Export charts as images

### 🧠 Gemini-Powered AI Design Assistant

Transform your simulation experience with integrated AI assistance:

#### 1️⃣ **Intelligent Design Chat**
```
You: "Why is my 3D design showing higher temperatures?"
AI: "Your L3 cache is generating significant heat in the middle layer,
     and the TSV density in that region is limiting heat dissipation.
     Consider redistributing the cache across layers or increasing
     TSV spacing near high-power blocks..."
```

**Capabilities:**
- Context-aware analysis of your current configurations
- Bottleneck identification with actionable recommendations
- Parameter tuning suggestions based on your constraints
- Trade-off exploration (performance vs power vs thermal)
- Design optimisation strategies

#### 2️⃣ **Web-Grounded Research Assistant**
```
You: "What are the latest TSV fabrication techniques in 2024?"
AI: "Recent advances include... [with citations from IEEE, Nature, etc.]"
```

**Features:**
- Real-time web search integration via Google
- Cited responses with source links
- Latest research paper summaries
- Industry trend analysis
- Technology roadmap insights

#### 3️⃣ **AI Hardware Performance Predictor**
```
AI: "Based on your design, I predict:
     - FPGA implementation: ~450 MHz max clock, 12W power
     - ASIC implementation: ~2.8 GHz, 45nm node, 8W TDP
     - Performance gap from simulation: ~15% (realistic)"
```

**Predictions Include:**
- Real-world FPGA performance estimates
- ASIC synthesis projections
- Power consumption accuracy
- Clock frequency achievability
- Resource utilisation (LUTs, DSPs, BRAMs)

**How It Works:**
- Analyses your configuration parameters
- Compares against a database of actual implementations
- Uses ML models trained on real silicon data
- Provides confidence intervals and caveats

### 🛡️ Ethical AI Considerations

We take responsible AI seriously. Our dedicated ethics section addresses:

**Potential Risks:**
- **Algorithmic Bias:** AI suggestions may favour certain design patterns
- **Skill Erosion:** Over-reliance on AI may reduce manual analysis skills
- **Accountability Gaps:** Who's responsible when AI gives poor advice?
- **Black Box Concerns:** Understanding why AI makes certain recommendations

**Mitigation Strategies:**
- Transparent AI reasoning with explanations
- Encourage manual verification of AI suggestions
- Provide "AI-free" simulation mode
- Educational content on AI limitations
- User feedback loop for AI improvement

**Best Practices:**
- Always validate AI recommendations through simulation
- Use AI as a guide, not a replacement for understanding
- Cross-reference AI insights with established literature
- Document decision-making process beyond AI input

---

## 🛠️ Technology Stack

**Frontend Architecture:**
- **React 18.x:** Component-based UI with hooks
- **TypeScript 5.x:** Type-safe development
- **Tailwind CSS 3.x:** Utility-first styling
- **Recharts:** Interactive data visualization
- **Lucide React:** Modern icon library

**AI/ML Integration:**
- **Google Gemini API:** Advanced language models
- **@google/generative-ai:** Official Gemini SDK
- **Web Search Grounding:** Real-time information retrieval

**Backend Services:**
- **Node.js:** JavaScript runtime
- **Express.js:** Web application framework
- **In-Memory Storage:** Session management

**Development Tools:**
- **Vite:** Lightning-fast build tool
- **ESLint:** Code quality enforcement
- **Prettier:** Code formatting

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/3d-risc-v-simulator.git
cd 3d-risc-v-simulator
```

#### 2. Install Dependencies

```bash
npm install
```

This will install all required packages for both frontend and backend.

#### 3. Configure API Key

The AI features require a Google Gemini API key.

**Option A: Environment Variable (Recommended)**
```bash
# Linux/macOS
export API_KEY="your_gemini_api_key_here"

# Windows (Command Prompt)
set API_KEY=your_gemini_api_key_here

# Windows (PowerShell)
$env:API_KEY="your_gemini_api_key_here"
```

**Option B: .env File**
```bash
# Create .env file in project root
echo "API_KEY=your_gemini_api_key_here" > .env
```

**Getting an API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (keep it secure!)

#### 4. Run the Application

**Frontend Only (Main Simulator):**
```bash
npm run dev
```
Access at: `http://localhost:5173`

**Backend (For OTP Login Feature):**

Open a second terminal:
```bash
npm start
```
Backend runs on: `http://localhost:3001`

> **Note:** The backend is **optional** and only needed for the One-Time Password login feature. All core simulation features work without it.

#### 5. Build for Production

```bash
npm run build
```

The optimised build will be in the `dist/` folder.

---

## 📖 User Guide

### First-Time Setup

1. **Launch Application:** Open `http://localhost:5173` in your browser
2. **Create Account:**
   - Click the "Register" tab
   - Enter username, email, password
   - Or use "One-Time Code" (requires backend)
3. **Login:** Use your credentials to access the simulator

### CPU Simulation Workflow

#### Step 1: Configure Your CPU Architecture

Navigate to **CPU Config** from the sidebar.

**Quick Start with Templates:**
- Click "Load Template" 
- Select a preset (Mobile, Desktop, Server)
- Customise as needed

**Advanced Configuration:**

<details>
<summary><b>Cache Configuration Guide</b></summary>

**L1 Cache (Fast, Small):**
- Size: 32-64 KB typical
- Access Time: 1-4 cycles
- Associativity: 2-way or 4-way

**L2 Cache (Medium, Moderate):**
- Size: 256KB-1MB
- Access Time: 10-20 cycles
- Associativity: 8-way typical

**L3 Cache (Large, Slower):**
- Size: 2-32 MB
- Access Time: 40-80 cycles
- Associativity: 16-way typical

**3D Stacking Tips:**
- Place L3 cache on separate die for thermal isolation
- Use TSVs for inter-die communication
- Balance access latency vs. thermal benefits

</details>

**Save Your Configuration:**
- Click "Save Configuration"
- Give it a descriptive name
- Load it later from "Load Configuration"

#### Step 2: Write or Load RISC-V Code

Navigate to **CPU Simulator**.

**Option A: Use Predefined Benchmarks**
```
Click "Load Benchmark" → Select workload → View code
```

**Option B: Write Custom Code**
``` assembly
# Example: Array sum
    li t0, 0        # sum = 0
    li t1, 0        # i = 0
    li t2, 100      # n = 100
loop:
    slli t3, t1, 2  # t3 = i * 4
    lw t4, 0(t3)    # load array[i]
    add t0, t0, t4  # sum += array[i]
    addi t1, t1, 1  # i++
    blt t1, t2, loop # if i < n, repeat
```

**Workload Characterisation:**
- **Instruction Mix:** Adjust % of ALU, memory, and branch operations
- **Memory Pattern:** 
  - Sequential: Linear array traversal
  - Strided: Every N-th element
  - Random: Unpredictable accesses

#### Step 3: Run Simulation

1. Click **"Run Simulation"**
2. Watch progress bar (simulates both 2D and 3D)
3. Automatically redirected to the Analysis page

### GPU Simulation Workflow

#### Step 1: Configure GPU Architecture

Navigate to **GPU Simulator**.

**Basic Settings:**
- Number of cores: 64, 128, 256, 512, 1024
- Clock speed: 800 MHz - 2.5 GHz
- Memory bandwidth: 50 GB/s - 1 TB/s

**Thermal Settings:**
- Base temperature: 30-40°C (ambient)
- Thermal threshold: 80-95°C (throttling point)
- Cooling efficiency: 0.1-1.0 (higher = better cooling)

#### Step 2: Select Workload

**Browse by Category:**
- Machine Learning
- Scientific Computing
- Graphics Rendering
- Data Analytics

**Each Workload Shows:**
- Compute intensity rating
- Memory intensity rating
- Expected duration
- Best-case GPU configuration

#### Step 3: Run Benchmark

1. Click **"Run Benchmark"**
2. Watch **Live GPU Visualizer:**
   - Real-time core temperature heatmap
   - Throttling indicators (cores turn red)
   - Performance counters
3. Review results on the Analysis page

### Analysis & Insights

**Executive Summary Card:**
- 🚀 Performance: % improvement of 3D over 2D
- ⚡ Power: Efficiency comparison
- 🌡️ Thermal: Temperature changes
- 📈 Overall: Which architecture wins?

**Detailed Metrics Table:**

| Metric | 2D Architecture | 3D Architecture | Difference |
|--------|----------------|-----------------|------------|
| Total Cycles | 1,250,000 | 875,000 | -30% ✅ |
| AMAT | 15.2 cycles | 9.8 cycles | -35% ✅ |
| IPC | 1.85 | 2.41 | +30% ✅ |
| Avg Temp | 68°C | 79°C | +16% ⚠️ |
| Power | 12.5W | 14.2W | +14% ⚠️ |

**Interactive Visualizers:**
- **Data Flow:** Watch memory accesses propagate
- **Thermal Map:** See heat distribution
- **Performance Graph:** Compare metrics visually

**Bottleneck Analysis:**
- Identifies limiting factor (compute vs memory)
- Suggests specific optimisations
- Shows the roofline model position

### AI Assistant Usage

#### Starting a Design Conversation

Navigate to **AI Assistant** → **Design Chat** tab.

**Example Queries:**

```plaintext
"Analyse my current CPU configuration"
→ AI examines your cache sizes, latencies and provides an assessment

"Why is 3D showing worse thermal performance?"
→ AI explains heat stacking issues and suggests mitigations

"Optimise my GPU for machine learning workloads"
→ AI recommends core count, clock speed, and memory bandwidth

"Compare my design to industry standards"
→ AI benchmarks against commercial processors
```

**Tips for Better Responses:**
- Be specific about your goals (performance, power, area)
- Mention constraints (thermal budget, power limit)
- Ask follow-up questions for clarification
- Request step-by-step explanations

#### Web Research Mode

Switch to the **Web Research** tab for the latest information.

**Example Queries:**
```plaintext
"Latest research on TSV reliability in 3D ICs"
"Commercial 3D stacked processors in 2024"
"Thermal management techniques for chiplets"
"RISC-V performance comparison with ARM"
```

**What You Get:**
- Real-time web search results
- Properly cited sources (IEEE, ACM, industry sites)
- Summarised key findings
- Links to sources

#### Hardware Prediction

Switch to the **Hardware Prediction** tab.

**Example Request:**
```plaintext
"Predict FPGA performance for my CPU design"
```

**AI Response Includes:**
- Expected clock frequency (MHz)
- Resource utilisation (LUTs, registers, DSPs)
- Estimated power consumption
- Comparison to simulation results
- Confidence level and caveats

**Use Cases:**
- Validate simulation results
- Plan FPGA prototyping
- Estimate ASIC synthesis outcomes
- Budget planning for real hardware

---

## 📂 Project Structure

```
3d-risc-v-simulator/
│
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Login/Register
│   │   ├── cpu/            # CPU simulator components
│   │   ├── gpu/            # GPU simulator components
│   │   ├── analysis/       # Results visualization
│   │   ├── ai/             # AI assistant interface
│   │   └── shared/         # Reusable components
│   │
│   ├── lib/                # Core simulation logic
│   │   ├── cpuSimulator.ts    # RISC-V simulation engine
│   │   ├── gpuSimulator.ts    # GPU workload engine
│   │   ├── thermalModel.ts    # Thermal calculations
│   │   └── powerModel.ts      # Power estimation
│   │
│   ├── types/              # TypeScript type definitions
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Helper functions
│   └── App.tsx             # Main application component
│
├── server/                 # Optional backend
│   ├── server.js          # Express server for OTP
│   └── routes/            # API endpoints
│
├── public/                # Static assets
├── docs/                  # Documentation
├── tests/                 # Unit tests
│
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite build config
└── README.md             # This file
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test: coverage

# Run specific test file
npm test -- cpuSimulator.test.ts
```

### Test Categories

- **Unit Tests:** Individual function testing
- **Integration Tests:** Component interaction testing
- **Simulation Tests:** Verify correctness of simulation results
- **AI Tests:** Mock API responses for AI features

---

## 🤝 Contributing

We welcome contributions from the community!

### How to Contribute

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make Your Changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation
4. **Commit Your Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Contribution Ideas

- 🐛 **Bug Fixes:** Check issues tab for known bugs
- ✨ **New Features:** 
  - Additional benchmarks
  - More visualisation options
  - Support for other ISAs (ARM, x86)
- 📚 **Documentation:** 
  - Tutorial videos
  - Example projects
  - API documentation
- 🎨 **UI/UX:** Design improvements and accessibility
- 🧪 **Testing:** Expand test coverage

### Code Style

- Use TypeScript for type safety
- Follow React best practices (hooks, functional components)
- Write descriptive commit messages
- Comment on complex algorithms
- Use Prettier for formatting

---

## 📚 Documentation

### Additional Resources

- **[User Manual](docs/USER_MANUAL.md):** Comprehensive usage guide
- **[API Documentation](docs/API.md):** Backend API reference
- **[Simulation Theory](docs/THEORY.md):** Mathematical models explained
- **[Benchmark Guide](docs/BENCHMARKS.md):** Creating custom benchmarks
- **[Troubleshooting](docs/TROUBLESHOOTING.md):** Common issues and solutions

### Academic References

Key papers that informed this simulator:

1. **3D IC Design:**
   - Pavlidis & Friedman, "3-D Topologies for Networks-on-Chip," IEEE Trans. VLSI, 2007
   - Loi et al., "A low-overhead fault tolerance scheme for TSV-based 3D network-on-chip links," ICCAD 2008

2. **Thermal Modeling:**
   - Coskun et al., "Analysis and Optimisation of MPSoC Reliability," J. Low Power Electronics, 2006
   - Skadron et al., "Temperature-aware microarchitecture," ISCA 2003

3. **RISC-V Architecture:**
   - Waterman & Asanović, "The RISC-V Instruction Set Manual," 2019
   - Patterson & Waterman, "The RISC-V Reader," 2017

---

## 🐛 Known Issues & Limitations

### Current Limitations

- **Browser Performance:** Very large simulations (>1M instructions) may slow down browsers
- **AI Rate Limits:** Gemini API has usage quotas (monitor your usage)
- **Mobile Support:** Best experienced on desktop/laptop (mobile UI in progress)
- **Offline Mode:** Requires an internet connection for AI features

### Planned Features

- [ ] Export simulation as HDL (Verilog/VHDL)
- [ ] Multi-user collaboration mode
- [ ] Cloud-based simulation queue
- [ ] Advanced power modelling (leakage, voltage scaling)
- [ ] Support for heterogeneous architectures
- [ ] Machine learning model training on simulation data

---

## 💡 Tips & Best Practices

### Getting Accurate Results

1. **Start Simple:** Use templates before custom configurations
2. **Validate Configs:** Ensure cache sizes are realistic (L1 < L2 < L3)
3. **Run Multiple Tests:** Try different workloads to see patterns
4. **Compare Fairly:** Keep most parameters constant when comparing 2D vs 3D
5. **Check Thermal:** High temperatures may throttle performance

### Performance Optimisation

- **Cache Optimisation:** Tune cache sizes to match your workload
- **Memory Bandwidth:** Ensure sufficient bandwidth for data-intensive tasks
- **TSV Count:** More TSVs reduce latency but increase cost
- **Clock Frequency:** Higher isn't always better (power/thermal trade-off)

### AI Assistant Best Practices

- **Be Specific:** "Optimize L2 cache for matrix multiplication" > "Make it faster"
- **Provide Context:** Mention your constraints and goals
- **Verify Suggestions:** Always simulate AI recommendations
- **Learn from AI:** Ask "why" to understand the reasoning
- **Iterate:** Use AI insights to refine your designs

---

## 📜 License

This project is released under the **MIT License with Educational Use Clause**.

```
MIT License with Educational Use

Copyright (c) 2024 [Your Name/Organisation]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software for educational, research, and non-commercial purposes.

Commercial use requires separate licensing - contact [email@example.com]

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

See [LICENSE](LICENSE) file for full terms.

---




## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/3d-risc-v-simulator&type=Date)](https://star-history.com/#yourusername/3d-risc-v-simulator&Date)

---

<div align="center">

**Made with ❤️ for the Computer Architecture Community**

[⬆ Back to Top](#3d-stacked-risc-v--gpu-accelerator-simulator)

</div>
