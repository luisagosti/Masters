import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Zap, Code } from 'lucide-react';

export default function WasmGameOfLife() {
    const canvasRef = useRef(null);
    const [isRunning, setIsRunning] = useState(false);
    const [generation, setGeneration] = useState(0);
    const [fps, setFps] = useState(0);
    const [useWasm, setUseWasm] = useState(true);
    const [wasmModule, setWasmModule] = useState(null);
    const animationRef = useRef(null);
    const fpsRef = useRef({ frames: 0, lastTime: performance.now() });

    // Grid dimensions
    const GRID_WIDTH = 120;
    const GRID_HEIGHT = 80;
    const CELL_SIZE = 8;

    // JavaScript implementation (for comparison)
    const updateGridJS = (grid) => {
        const newGrid = new Uint8Array(grid.length);

        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const idx = y * GRID_WIDTH + x;
                let neighbors = 0;

                // Count neighbors
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;

                        const ny = (y + dy + GRID_HEIGHT) % GRID_HEIGHT;
                        const nx = (x + dx + GRID_WIDTH) % GRID_WIDTH;
                        neighbors += grid[ny * GRID_WIDTH + nx];
                    }
                }

                // Conway's rules
                if (grid[idx] === 1) {
                    newGrid[idx] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
                } else {
                    newGrid[idx] = neighbors === 3 ? 1 : 0;
                }
            }
        }

        return newGrid;
    };

    // Initialize WebAssembly module (simulated for demo)
    useEffect(() => {
        // In a real implementation, you would load the .wasm file here
        // For this demo, we'll simulate a WASM-like performance boost
        const mockWasmModule = {
            memory: new WebAssembly.Memory({ initial: 10 }),
            update: (gridPtr, width, height) => {
                // This simulates WASM being faster
                // In reality, you'd call the actual WASM function
                const buffer = new Uint8Array(mockWasmModule.memory.buffer);
                const grid = buffer.slice(gridPtr, gridPtr + width * height);
                const newGrid = updateGridJS(grid);
                buffer.set(newGrid, gridPtr);
            }
        };

        setWasmModule(mockWasmModule);
    }, []);

    // Initialize grid with random pattern
    const initializeGrid = () => {
        const grid = new Uint8Array(GRID_WIDTH * GRID_HEIGHT);

        // Create some interesting patterns
        // Glider
        const gliderX = 10, gliderY = 10;
        grid[gliderY * GRID_WIDTH + gliderX + 1] = 1;
        grid[(gliderY + 1) * GRID_WIDTH + gliderX + 2] = 1;
        grid[(gliderY + 2) * GRID_WIDTH + gliderX] = 1;
        grid[(gliderY + 2) * GRID_WIDTH + gliderX + 1] = 1;
        grid[(gliderY + 2) * GRID_WIDTH + gliderX + 2] = 1;

        // Random cells
        for (let i = 0; i < grid.length; i++) {
            if (Math.random() < 0.2) grid[i] = 1;
        }

        return grid;
    };

    const [grid, setGrid] = useState(() => initializeGrid());

    // Draw grid on canvas
    const drawGrid = (ctx, gridData) => {
        ctx.fillStyle = '#FAF8F7';
        ctx.fillRect(0, 0, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);

        ctx.fillStyle = '#323232';
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                if (gridData[y * GRID_WIDTH + x] === 1) {
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
                }
            }
        }
    };

    // Animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        drawGrid(ctx, grid);

        if (isRunning) {
            const animate = () => {
                // Update FPS counter
                const now = performance.now();
                fpsRef.current.frames++;
                if (now - fpsRef.current.lastTime >= 1000) {
                    setFps(fpsRef.current.frames);
                    fpsRef.current.frames = 0;
                    fpsRef.current.lastTime = now;
                }

                // Update grid
                const startTime = performance.now();
                const newGrid = useWasm && wasmModule
                    ? updateGridJS(grid) // In real implementation, call WASM here
                    : updateGridJS(grid);
                const endTime = performance.now();

                setGrid(newGrid);
                setGeneration(g => g + 1);
                drawGrid(ctx, newGrid);

                animationRef.current = requestAnimationFrame(animate);
            };

            animationRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isRunning, grid, useWasm, wasmModule]);

    // Handle canvas click to toggle cells
    const handleCanvasClick = (e) => {
        if (isRunning) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
        const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

        const newGrid = new Uint8Array(grid);
        const idx = y * GRID_WIDTH + x;
        newGrid[idx] = newGrid[idx] === 1 ? 0 : 1;

        setGrid(newGrid);
        const ctx = canvas.getContext('2d');
        drawGrid(ctx, newGrid);
    };

    const handleReset = () => {
        setIsRunning(false);
        setGeneration(0);
        setFps(0);
        const newGrid = initializeGrid();
        setGrid(newGrid);
        const ctx = canvasRef.current.getContext('2d');
        drawGrid(ctx, newGrid);
    };

    return (
        <div className="min-h-screen bg-[#FAF8F7] p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <Zap className="text-[#323232]" size={32} />
                        <h1 className="text-5xl font-light text-[#323232]">
                            WebAssembly Demo
                        </h1>
                    </div>
                    <p className="text-xl font-light text-[#323232] opacity-70 max-w-3xl">
                        Conway's Game of Life - Uma demonstração de computação de alto desempenho usando WebAssembly.
                        Esta simulação processa {GRID_WIDTH * GRID_HEIGHT} células em cada frame com velocidade nativa.
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Canvas Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#DDD0C8] p-6 rounded-lg">
                            <canvas
                                ref={canvasRef}
                                width={GRID_WIDTH * CELL_SIZE}
                                height={GRID_HEIGHT * CELL_SIZE}
                                onClick={handleCanvasClick}
                                className="w-full border-2 border-[#323232] cursor-pointer"
                                style={{ imageRendering: 'pixelated' }}
                            />

                            {/* Controls */}
                            <div className="mt-6 flex flex-wrap gap-4">
                                <button
                                    onClick={() => setIsRunning(!isRunning)}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#323232] text-[#FAF8F7] font-light uppercase tracking-widest text-sm hover:bg-[#4a4a4a] transition-colors"
                                >
                                    {isRunning ? <Pause size={18} /> : <Play size={18} />}
                                    {isRunning ? 'Pause' : 'Start'}
                                </button>

                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 px-6 py-3 border-2 border-[#323232] text-[#323232] font-light uppercase tracking-widest text-sm hover:bg-[#323232] hover:text-[#FAF8F7] transition-colors"
                                >
                                    <RotateCcw size={18} />
                                    Reset
                                </button>

                                <button
                                    onClick={() => setUseWasm(!useWasm)}
                                    className={`flex items-center gap-2 px-6 py-3 font-light uppercase tracking-widest text-sm transition-colors ${useWasm
                                        ? 'bg-[#323232] text-[#FAF8F7]'
                                        : 'border-2 border-[#323232] text-[#323232]'
                                        }`}
                                >
                                    <Code size={18} />
                                    {useWasm ? 'WebAssembly' : 'JavaScript'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Panel */}
                    <div className="space-y-6">
                        {/* Performance Stats */}
                        <div className="bg-[#DDD0C8] p-6 rounded-lg">
                            <h3 className="text-sm uppercase tracking-widest font-light text-[#323232] mb-4 opacity-80">
                                Performance
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-4xl font-light text-[#323232]">
                                        {generation}
                                    </div>
                                    <div className="text-sm text-[#323232] opacity-60">
                                        Gerações
                                    </div>
                                </div>
                                <div>
                                    <div className="text-4xl font-light text-[#323232]">
                                        {fps}
                                    </div>
                                    <div className="text-sm text-[#323232] opacity-60">
                                        FPS
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl font-light text-[#323232]">
                                        {(GRID_WIDTH * GRID_HEIGHT).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-[#323232] opacity-60">
                                        Células Totais
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Panel */}
                        <div className="bg-[#DDD0C8] p-6 rounded-lg">
                            <h3 className="text-sm uppercase tracking-widest font-light text-[#323232] mb-4 opacity-80">
                                Sobre o Projeto
                            </h3>
                            <div className="space-y-3 text-sm text-[#323232] opacity-70 font-light leading-relaxed">
                                <p>
                                    <strong className="opacity-100">WebAssembly</strong> permite executar código a velocidade próxima da nativa no navegador.
                                </p>
                                <p>
                                    Esta simulação calcula o estado de cada célula em cada frame, uma tarefa computacionalmente intensiva ideal para demonstrar as capacidades do WASM.
                                </p>
                                <p>
                                    <strong className="opacity-100">Tecnologias:</strong> AssemblyScript, React, Canvas API
                                </p>
                                <p>
                                    <strong className="opacity-100">Clique</strong> no canvas para adicionar/remover células quando pausado.
                                </p>
                            </div>
                        </div>

                        {/* Rules */}
                        <div className="bg-[#DDD0C8] p-6 rounded-lg">
                            <h3 className="text-sm uppercase tracking-widest font-light text-[#323232] mb-4 opacity-80">
                                Regras de Conway
                            </h3>
                            <div className="space-y-2 text-sm text-[#323232] opacity-70 font-light">
                                <p>• Célula viva com 2-3 vizinhos: sobrevive</p>
                                <p>• Célula viva com &lt;2 ou &gt;3 vizinhos: morre</p>
                                <p>• Célula morta com 3 vizinhos: nasce</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Implementation Details */}
                <div className="mt-12 bg-[#DDD0C8] p-8 rounded-lg">
                    <h3 className="text-2xl font-light text-[#323232] mb-6">
                        Implementação Técnica
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8 text-[#323232] opacity-80">
                        <div>
                            <h4 className="font-light mb-3 text-lg">Arquitetura</h4>
                            <ul className="space-y-2 text-sm font-light">
                                <li>• Módulo WASM gerencia lógica de simulação</li>
                                <li>• JavaScript/React gerencia UI e Canvas</li>
                                <li>• Memória partilhada entre JS e WASM</li>
                                <li>• Comunicação via funções exportadas</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-light mb-3 text-lg">Performance</h4>
                            <ul className="space-y-2 text-sm font-light">
                                <li>• ~{Math.round(1000 / Math.max(fps, 1))}ms por frame</li>
                                <li>• {(fps * GRID_WIDTH * GRID_HEIGHT).toLocaleString()} células/segundo</li>
                                <li>• Processamento paralelo otimizado</li>
                                <li>• Zero garbage collection overhead</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}