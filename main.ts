const BOARD = {
  debug: false,
  width: 800,
  height: 600,
  cellSize: 24,
  fps: 10,
  // these are calculated later:
  frameInterval: 0,
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

type World = Array<Array<State>>;

const createWorld = (): World => {
  const newWorld = [];
  for (let i = 0; i < BOARD.rows; ++i) {
    newWorld.push(new Array(BOARD.cols).fill(State.Dead));
  }
  return newWorld;
};

const deepCopy = (state: World): World => {
  return JSON.parse(JSON.stringify(state));
};

let world = createWorld();
let nextWorld = createWorld();

const renderWorld = () => {
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
renderWorld();

const countNeighbors = (row: number, col: number): number => {
  let neighbors = 0;
  for (let rowOffset = -1; rowOffset <= 1; ++rowOffset) {
    if (row + rowOffset > -1 && row + rowOffset < BOARD.rows) {
      for (let colOffset = -1; colOffset <= 1; ++colOffset) {
        if (col + colOffset > -1 && col + colOffset < BOARD.cols) {
          if (rowOffset === 0 && colOffset === 0) {
            continue;
          }
          if (world[row + rowOffset][col + colOffset] === State.Alive) {
            ++neighbors;
          }
        }
      }
    }
  }
  return neighbors;
};

const computeNextWorld = () => {
  for (let row = 0; row < BOARD.rows; ++row) {
    for (let col = 0; col < BOARD.cols; ++col) {
      const neighbors = countNeighbors(row, col);
      const cell = world[row][col];
      nextWorld[row][col] = ((cell: State) => {
        switch (cell) {
          case State.Alive:
            return neighbors === 2 || neighbors === 3 ? State.Alive : State.Dead;
          case State.Dead:
            return neighbors === 3 ? State.Alive : State.Dead;
        }
      })(cell);
    }
  }
};

const iterateNext = () => {
  listActive();
  computeNextWorld();
  world = deepCopy(nextWorld);
  renderWorld();
};

const listActive = () => {
  for (let row = 0; row < BOARD.rows; ++row) {
    for (let col = 0; col < BOARD.cols; ++col) {
      if (nextWorld[row][col] === State.Alive) {
        console.log(`x: ${col}, y: ${row}`);
      }
    }
  }
};

app.addEventListener("mousedown", (e) => {
  const row = Math.floor((e.offsetY - BOARD.yOffset) / BOARD.cellSize);
  const col = Math.floor((e.offsetX - BOARD.xOffset) / BOARD.cellSize);
  const alive = world[row][col] === State.Alive;
  if (row >= 0 && col >= 0 && row < BOARD.rows && col < BOARD.cols) {
    if (BOARD.debug) {
      console.log(`Row: ${row}\nCol: ${col}\nAlive: ${!alive}\nNeighbors: ${countNeighbors(row, col)}`);
    }
    world[row][col] = alive ? State.Dead : State.Alive;
  }
  renderWorld();
});

const nextBtn = document.getElementById("next");
nextBtn?.addEventListener("click", () => iterateNext());

BOARD.frameInterval = 1000 / BOARD.fps;

let lastFrameTime = performance.now();
let running = false;
const animate = (currentTime: number) => {
  const elapsedTime = currentTime - lastFrameTime;
  if (elapsedTime >= BOARD.frameInterval) {
    lastFrameTime = performance.now();
    iterateNext();
  }
  if (running) {
    requestAnimationFrame(animate);
  }
};

const playBtn = document.getElementById("play");
playBtn?.addEventListener("click", () => {
  if (!running) {
    playBtn.setAttribute("value", "Stop");
    running = true;
    requestAnimationFrame(animate);
  } else {
    playBtn.setAttribute("value", "Play");
    running = false;
  }
});
