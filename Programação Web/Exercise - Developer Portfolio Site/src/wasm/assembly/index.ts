// Dimensões da grelha
const WIDTH: i32 = 120;
const HEIGHT: i32 = 80;
const SIZE: i32 = WIDTH * HEIGHT;

// Alocar memória para a grelha (2 buffers: atual e próximo)
const grid = new Uint8Array(SIZE);
const nextGrid = new Uint8Array(SIZE);

/**
 * Retorna o ponteiro para a grelha na memória
 */
export function getGridPtr(): usize {
  return changetype<usize>(grid.buffer);
}

/**
 * Conta vizinhos vivos de uma célula
 */
function countNeighbors(x: i32, y: i32): i32 {
  let count: i32 = 0;
  
  for (let dy: i32 = -1; dy <= 1; dy++) {
    for (let dx: i32 = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      
      const nx = (x + dx + WIDTH) % WIDTH;
      const ny = (y + dy + HEIGHT) % HEIGHT;
      
      count += grid[ny * WIDTH + nx];
    }
  }
  
  return count;
}

/**
 * Atualiza a grelha seguindo as regras de Conway
 */
export function update(): void {
  // Calcular próximo estado
  for (let y: i32 = 0; y < HEIGHT; y++) {
    for (let x: i32 = 0; x < WIDTH; x++) {
      const idx = y * WIDTH + x;
      const neighbors = countNeighbors(x, y);
      const isAlive = grid[idx] === 1;
      
      if (isAlive) {
        nextGrid[idx] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
      } else {
        nextGrid[idx] = neighbors === 3 ? 1 : 0;
      }
    }
  }
  
  // Copiar nextGrid para grid
  for (let i: i32 = 0; i < SIZE; i++) {
    grid[i] = nextGrid[i];
  }
}

/**
 * Inicializa a grelha com padrão aleatório
 */
export function initRandom(seed: i32): void {
  let random = seed;
  
  // Limpar grelha
  for (let i: i32 = 0; i < SIZE; i++) {
    grid[i] = 0;
  }
  
  // Glider
  const gliderX: i32 = 10;
  const gliderY: i32 = 10;
  grid[gliderY * WIDTH + gliderX + 1] = 1;
  grid[(gliderY + 1) * WIDTH + gliderX + 2] = 1;
  grid[(gliderY + 2) * WIDTH + gliderX] = 1;
  grid[(gliderY + 2) * WIDTH + gliderX + 1] = 1;
  grid[(gliderY + 2) * WIDTH + gliderX + 2] = 1;
  
  // Células aleatórias
  for (let i: i32 = 0; i < SIZE; i++) {
    random = (random * 1103515245 + 12345) & 0x7fffffff;
    if (random % 100 < 15) {
      grid[i] = 1;
    }
  }
}

/**
 * Define o valor de uma célula
 */
export function setCell(x: i32, y: i32, value: u8): void {
  if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
    grid[y * WIDTH + x] = value;
  }
}

/**
 * Obtém o valor de uma célula
 */
export function getCell(x: i32, y: i32): u8 {
  if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
    return grid[y * WIDTH + x];
  }
  return 0;
}

/**
 * Retorna as dimensões
 */
export function getWidth(): i32 {
  return WIDTH;
}

export function getHeight(): i32 {
  return HEIGHT;
}

export function getSize(): i32 {
  return SIZE;
}