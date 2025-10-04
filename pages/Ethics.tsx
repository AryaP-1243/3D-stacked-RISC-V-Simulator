import React from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon, LightBulbIcon } from '../components/icons';

const Ethics: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="bg-yellow-500/10 p-4 rounded-full inline-block">
                        <ShieldCheckIcon className="w-10 h-10 text-yellow-500 dark:text-yellow-400" />
                    </div>
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Ethics and Bias in AI-Powered Chip Design</h1>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                    As AI becomes a powerful co-pilot in complex fields like semiconductor design, it is crucial to understand and mitigate the ethical challenges and potential biases that can arise.
                </p>
            </div>

            <div className="space-y-8">
                {/* Card 1: Bias */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex items-start space-x-4">
                        <div className="text-red-500 flex-shrink-0 mt-1"><ExclamationTriangleIcon className="w-6 h-6"/></div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Bias in Training Data and Algorithms</h3>
                            <p className="mt-2 text-slate-800 dark:text-slate-200">
                                AI models, including the Gemini model powering this simulator's assistant, are trained on vast datasets of existing human-created designs, research papers, and documentation. This can introduce several forms of bias:
                            </p>
                            <ul className="mt-4 space-y-2 list-disc list-inside text-slate-800 dark:text-slate-200">
                                <li><strong>Architectural Bias:</strong> The model may favor design patterns from dominant architectures (e.g., x86, ARM) or manufacturers, potentially overlooking novel or more efficient solutions for specific RISC-V use cases.</li>
                                <li><strong>Optimization Bias:</strong> If an AI is optimized solely for a single metric like performance (Instructions Per Clock), it might generate designs that have poor power efficiency, manufacturability, or even security vulnerabilities, as these were not primary optimization goals.</li>
                                <li><strong>Legacy Bias:</strong> The training data may contain outdated or suboptimal design choices that the AI learns and perpetuates, hindering the adoption of modern best practices.</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                {/* Card 2: Over-Reliance */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex items-start space-x-4">
                        <div className="text-yellow-500 flex-shrink-0 mt-1"><LightBulbIcon className="w-6 h-6"/></div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Challenges of Over-Reliance and Accountability</h3>
                            <p className="mt-2 text-slate-800 dark:text-slate-200">
                                The convenience of AI-generated suggestions presents its own set of challenges for the engineering community:
                            </p>
                            <ul className="mt-4 space-y-2 list-disc list-inside text-slate-800 dark:text-slate-200">
                                <li><strong>Skill Erosion:</strong> Over-reliance on AI can reduce an engineer's critical thinking and deep understanding of architectural trade-offs, turning design into a "prompt-and-paste" exercise.</li>
                                <li><strong>Lack of Transparency:</strong> The "black box" nature of some complex models can make it difficult to understand <em>why</em> the AI made a particular recommendation, complicating debugging, validation, and trust in the system.</li>
                                <li><strong>Accountability:</strong> If an AI-suggested design contains a critical flaw or security vulnerability (e.g., a side-channel leak), who is responsible? The user, the AI provider, or the tool developer? This is a significant open question in the field.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Card 3: Mitigation */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex items-start space-x-4">
                        <div className="text-green-500 flex-shrink-0 mt-1"><ShieldCheckIcon className="w-6 h-6"/></div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Mitigation and Responsible Use</h3>
                            <p className="mt-2 text-slate-800 dark:text-slate-200">
                                This simulator and its AI features are intended to be a <strong>tool for exploration, not a source of absolute truth</strong>. Users are encouraged to adopt a mindset of critical partnership with the AI:
                            </p>
                            <ol className="mt-4 space-y-2 list-decimal list-inside text-slate-800 dark:text-slate-200">
                                <li><strong>Validate and Verify:</strong> Always treat AI suggestions as a starting point. Use the simulator to rigorously test the AI's proposals against a diverse set of benchmarks and compare them to your own human-derived designs.</li>
                                <li><strong>Question the "Why":</strong> Use the AI assistant to ask for justifications for its recommendations. Understanding the model's reasoning is key to identifying potential blind spots.</li>
                                <li><strong>Diversify Your Goals:</strong> When prompting the AI, don't just ask for "better performance." Ask for designs that are "more power-efficient," "more secure against timing attacks," or "optimized for a small area." This helps guide the AI beyond a single-metric optimization path.</li>
                                <li><strong>Continuous Learning:</strong> Use the AI as a learning tool to discover new design possibilities, but always return to first principles and foundational knowledge to ensure the suggestions are sound.</li>
                            </ol>
                            <p className="mt-4 text-slate-800 dark:text-slate-200">
                                By remaining aware of these challenges and actively engaging with the AI as a critical partner, we can harness its power to accelerate innovation in computer architecture responsibly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ethics;
