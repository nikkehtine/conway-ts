// Config
const BOARD = {
  width: 800,
  height: 800,
  cellSize: 24,
  // these are calculated later:
  rows: 0,
  cols: 0,
  xOffset: 0,
  yOffset: 0,
};

enum State {
  Dead,
  Alive,
}

const COLORS = {
  [State.Dead]: {
    fill: "#202020",
    grid: "#292929",
  },
  [State.Alive]: {
    fill: "#666",
    grid: "#555",
  },
};

// Logic
const app = document.getElementById("app") as HTMLCanvasElement;
if (!app) {
  throw new Error("Could not find canvas");
}
app.width = BOARD.width;
app.height = BOARD.height;

const ctx = app.getContext("2d");
if (!ctx) {
  throw new Error("Could not initialize 2D context");
}
BOARD.rows = Math.floor(BOARD.height / BOARD.cellSize);
BOARD.cols = Math.floor(BOARD.width / BOARD.cellSize);
BOARD.xOffset = (BOARD.width % BOARD.cellSize) / 2;
BOARD.yOffset = (BOARD.height % BOARD.cellSize) / 2;

const createWorld = (): Array<Array<State>> => {
  const newWorld = [];
  for (let i = 0; i < BOARD.rows; ++i) {
    newWorld.push(new Array(BOARD.cols).fill(State.Dead));
  }
  return newWorld;
};

const world = createWorld();
const nextWorld = createWorld();

const render = () => {
  for (let row = 0; row < BOARD.rows; ++row) {
    for (let col = 0; col < BOARD.cols; ++col) {
      const cell = {
        x: col * BOARD.cellSize + BOARD.xOffset,
        y: row * BOARD.cellSize + BOARD.yOffset,
        size: BOARD.cellSize,
        state: world[row][col],
      };
      ctx.fillStyle = COLORS[cell.state].fill;
      ctx.strokeStyle = COLORS[cell.state].grid;
      ctx.fillRect(cell.x, cell.y, cell.size, cell.size);
      ctx.strokeRect(cell.x, cell.y, cell.size, cell.size);
    }
  }
};
render();

const setState = (row: number, col: number, newState: State) => {
  world[row][col] = newState;
};

const computeNextWorld = () => {
  for (let row = 0; row < BOARD.rows; ++row) {
    for (let col = 0; col < BOARD.cols; ++col) {
      world;
    }
  }
};

app.addEventListener("mousedown", (e) => {
  const row = Math.floor((e.offsetY - BOARD.yOffset) / BOARD.cellSize);
  const col = Math.floor((e.offsetX - BOARD.xOffset) / BOARD.cellSize);
  if (row >= 0 && col >= 0 && row < BOARD.rows && col < BOARD.cols) {
    switch (world[row][col]) {
      case State.Alive: {
        setState(row, col, State.Dead);
        break;
      }
      default: {
        setState(row, col, State.Alive);
        break;
      }
    }
  }
  render();
});
