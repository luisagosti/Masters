import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

export default function GameOfLife() {
    const canvasRef = useRef(null);
    const [isRunning, setIsRunning] = useState(false);
    const [generation, setGeneration] = useState(0);
    const [fps, setFps] = useState(0);
    const [wasmModule, setWasmModule] = useState(null);
    const [memory, setMemory] = useState(null);
    const [wasmLoaded, setWasmLoaded] = useState(false);
    const animationRef = useRef(null);
    const fpsRef = useRef({ frames: 0, lastTime: performance.now() });

    const CELL_SIZE = 8;
    const GRID_WIDTH = 120;
    const GRID_HEIGHT = 80;
    const GRID_SIZE = GRID_WIDTH * GRID_HEIGHT;

    // Carregar módulo WebAssembly
    useEffect(() => {
        async function loadWasm() {
            try {
                console.log('Loading WASM module...');

                const response = await fetch('/wasm/build/optimized.wasm');

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const bytes = await response.arrayBuffer();
                console.log('WASM size:', bytes.byteLength, 'bytes');

                // Verificar magic number
                const view = new Uint8Array(bytes);
                if (view[0] !== 0x00 || view[1] !== 0x61 || view[2] !== 0x73 || view[3] !== 0x6d) {
                    throw new Error('Invalid WASM magic number');
                }

                // Instantiate sem memória customizada (AS gerencia a própria memória)
                const result = await WebAssembly.instantiate(bytes, {
                    env: {
                        abort: (msg, file, line, col) => {
                            console.error('WASM abort:', { msg, file, line, col });
                        }
                    }
                });

                const exports = result.instance.exports;

                console.log('Exported functions:', Object.keys(exports).join(', '));
                console.log('Grid size:', exports.getSize ? exports.getSize() : 'N/A');
                console.log('Grid pointer:', exports.getGridPtr ? exports.getGridPtr() : 'N/A');

                setWasmModule(exports);
                setMemory(exports.memory);
                setWasmLoaded(true);

                // Inicializar grelha
                if (exports.initRandom) {
                    exports.initRandom(Date.now());
                }

                console.log('WebAssembly loaded successfully');

            } catch (error) {
                console.error('Failed to load WASM:', error);
                setWasmLoaded(false);
                alert('Falha ao carregar WebAssembly. Verifique o console para detalhes.');
            }
        }

        loadWasm();
    }, []);

    // Desenhar grelha
    const drawGrid = (ctx) => {
        if (!memory || !wasmModule) return;

        try {
            const gridPtr = wasmModule.getGridPtr();
            const gridSize = wasmModule.getSize();
            const buffer = new Uint8Array(memory.buffer, gridPtr, gridSize);

            ctx.fillStyle = '#FAF8F7';
            ctx.fillRect(0, 0, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);

            ctx.fillStyle = '#323232';
            for (let y = 0; y < GRID_HEIGHT; y++) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    if (buffer[y * GRID_WIDTH + x] === 1) {
                        ctx.fillRect(
                            x * CELL_SIZE,
                            y * CELL_SIZE,
                            CELL_SIZE - 1,
                            CELL_SIZE - 1
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Error drawing grid:', error);
        }
    };

    // Loop de animação
    useEffect(() => {
        if (!wasmModule || !memory) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        drawGrid(ctx);

        if (isRunning) {
            const animate = () => {
                try {
                    // Atualizar FPS
                    const now = performance.now();
                    fpsRef.current.frames++;
                    if (now - fpsRef.current.lastTime >= 1000) {
                        setFps(fpsRef.current.frames);
                        fpsRef.current.frames = 0;
                        fpsRef.current.lastTime = now;
                    }

                    // Atualizar grelha
                    wasmModule.update();

                    setGeneration(g => g + 1);
                    drawGrid(ctx);

                    animationRef.current = requestAnimationFrame(animate);
                } catch (error) {
                    console.error('Animation error:', error);
                    setIsRunning(false);
                }
            };

            animationRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isRunning, wasmModule, memory]);

    // Reset
    const handleReset = () => {
        if (!wasmModule) return;

        setIsRunning(false);
        setGeneration(0);
        setFps(0);

        try {
            wasmModule.initRandom(Date.now());

            const ctx = canvasRef.current.getContext('2d');
            drawGrid(ctx);
        } catch (error) {
            console.error('Reset error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF8F7] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Zap size={32} className="text-[#323232]" />
                        <h1 className="text-3xl md:text-5xl font-light text-[#323232]">
                            WebAssembly Demo
                        </h1>
                    </div>
                    <p className="text-lg md:text-xl text-[#323232] opacity-70 font-light">
                        Conway's Game of Life - Computação de alto desempenho com WebAssembly
                    </p>
                </div>

                {/* Status indicator */}
                <div className="mb-4 p-4 rounded-lg" style={{
                    backgroundColor: wasmLoaded ? '#d4edda' : '#fff3cd',
                    border: `1px solid ${wasmLoaded ? '#c3e6cb' : '#ffeeba'}`
                }}>
                    <div className="text-sm font-light">
                        {wasmLoaded ? (
                            <span>WebAssembly ativo - Performance otimizada</span>
                        ) : (
                            <span>A carregar WebAssembly...</span>
                        )}
                    </div>
                </div>

                {/* Canvas */}
                <div className="bg-[#DDD0C8] p-4 md:p-6 rounded-lg mb-6">
                    <canvas
                        ref={canvasRef}
                        width={GRID_WIDTH * CELL_SIZE}
                        height={GRID_HEIGHT * CELL_SIZE}
                        className="w-full border-2 border-[#323232]"
                        style={{ imageRendering: 'pixelated', maxWidth: '100%', height: 'auto' }}
                    />

                    {/* Controls */}
                    <div className="mt-6 flex flex-wrap gap-4">
                        <button
                            onClick={() => setIsRunning(!isRunning)}
                            disabled={!wasmLoaded}
                            className="flex items-center gap-2 px-6 py-3 bg-[#323232] text-white hover:bg-[#4a4a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRunning ? <Pause size={18} /> : <Play size={18} />}
                            {isRunning ? 'Pause' : 'Start'}
                        </button>

                        <button
                            onClick={handleReset}
                            disabled={!wasmLoaded}
                            className="flex items-center gap-2 px-6 py-3 border-2 border-[#323232] text-[#323232] hover:bg-[#323232] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RotateCcw size={18} />
                            Reset
                        </button>

                        <div className="flex items-center gap-2 px-4 py-3 bg-white rounded">
                            <span className="text-sm text-[#323232] font-light">
                                {wasmLoaded ? 'WebAssembly' : 'Carregando...'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#DDD0C8] p-6 rounded-lg">
                        <div className="text-3xl md:text-4xl font-light text-[#323232]">
                            {generation}
                        </div>
                        <div className="text-xs md:text-sm text-[#323232] opacity-60">
                            Gerações
                        </div>
                    </div>
                    <div className="bg-[#DDD0C8] p-6 rounded-lg">
                        <div className="text-3xl md:text-4xl font-light text-[#323232]">
                            {fps}
                        </div>
                        <div className="text-xs md:text-sm text-[#323232] opacity-60">
                            FPS
                        </div>
                    </div>
                    <div className="bg-[#DDD0C8] p-6 rounded-lg">
                        <div className="text-2xl md:text-3xl font-light text-[#323232]">
                            {GRID_SIZE.toLocaleString()}
                        </div>
                        <div className="text-xs md:text-sm text-[#323232] opacity-60">
                            Células
                        </div>
                    </div>
                    <div className="bg-[#DDD0C8] p-6 rounded-lg">
                        <div className="text-2xl md:text-3xl font-light text-[#323232]">
                            {(fps * GRID_SIZE / 1000).toFixed(1)}K
                        </div>
                        <div className="text-xs md:text-sm text-[#323232] opacity-60">
                            Cel/s
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-8 grid md:grid-cols-2 gap-6">
                    {/* About */}
                    <div className="bg-[#DDD0C8] p-6 rounded-lg">
                        <h3 className="text-lg font-light text-[#323232] mb-3">
                            Sobre o Projeto
                        </h3>
                        <div className="space-y-2 text-sm text-[#323232] opacity-70 font-light">
                            <p>
                                <strong className="opacity-100">WebAssembly</strong> permite executar código a velocidade próxima da nativa no navegador (near-native performance).
                            </p>
                            <p>
                                Esta simulação processa <strong className="opacity-100">{GRID_SIZE.toLocaleString()} células</strong> em cada frame, demonstrando as capacidades de computação intensiva do WASM.
                            </p>
                            <p>
                                <strong className="opacity-100">Tecnologias:</strong> AssemblyScript, React, Canvas API
                            </p>
                        </div>
                    </div>

                    {/* Conway's Rules */}
                    <div className="bg-[#DDD0C8] p-6 rounded-lg">
                        <h3 className="text-lg font-light text-[#323232] mb-3">
                            Regras de Conway
                        </h3>
                        <div className="space-y-2 text-sm text-[#323232] opacity-70 font-light">
                            <p>
                                <strong className="opacity-100">1.</strong> Célula viva com 2-3 vizinhos: <strong className="opacity-100">sobrevive</strong>
                            </p>
                            <p>
                                <strong className="opacity-100">2.</strong> Célula viva com &lt;2 ou &gt;3 vizinhos: <strong className="opacity-100">morre</strong>
                            </p>
                            <p>
                                <strong className="opacity-100">3.</strong> Célula morta com exatamente 3 vizinhos: <strong className="opacity-100">nasce</strong>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Technical Details */}
                <div className="mt-8 bg-[#DDD0C8] p-8 rounded-lg">
                    <h3 className="text-2xl font-light text-[#323232] mb-6">
                        Detalhes Técnicos
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
                                <li>• {(fps * GRID_SIZE).toLocaleString()} células/segundo</li>
                                <li>• Processamento otimizado em WASM</li>
                                <li>• Zero garbage collection overhead</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}