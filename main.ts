const APP = {
  debug: false,
  width: 800,
  height: 600,
  cellSize: 12,
  fps: 10,
  grid: true,
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
    fill: "#afcbff",
    grid: "#acb9f0",
  },
};

const root = document.getElementById("root") as HTMLCanvasElement;
if (!root) {
  throw new Error("Could not find canvas");
}
root.width = APP.width;
root.height = APP.height;

const ctx = root.getContext("2d");
if (!ctx) {
  throw new Error("Could not initialize 2D context");
}
APP.rows = Math.floor(APP.height / APP.cellSize);
APP.cols = Math.floor(APP.width / APP.cellSize);
APP.xOffset = (APP.width % APP.cellSize) / 2;
APP.yOffset = (APP.height % APP.cellSize) / 2;

type World = Array<Array<State>>;

const createWorld = (): World => {
  const newWorld = [];
  for (let i = 0; i < APP.rows; ++i) {
    newWorld.push(new Array(APP.cols).fill(State.Dead));
  }
  return newWorld;
};

const deepCopy = (state: World): World => {
  return JSON.parse(JSON.stringify(state));
};

let world: World, nextWorld: World;

const renderWorld = () => {
  for (let row = 0; row < APP.rows; ++row) {
    for (let col = 0; col < APP.cols; ++col) {
      const cell = {
        x: col * APP.cellSize + APP.xOffset,
        y: row * APP.cellSize + APP.yOffset,
        size: APP.cellSize,
        state: world[row][col],
      };
      ctx.fillStyle = COLORS[cell.state].fill;
      ctx.fillRect(cell.x, cell.y, cell.size, cell.size);
      if (APP.grid) {
        ctx.strokeStyle = COLORS[cell.state].grid;
        ctx.strokeRect(cell.x, cell.y, cell.size, cell.size);
      }
    }
  }
};

const init = () => {
  world = createWorld();
  nextWorld = createWorld();
  renderWorld();
};
init();

const countNeighbors = (row: number, col: number): number => {
  let neighbors = 0;
  for (let rowOffset = -1; rowOffset <= 1; ++rowOffset) {
    if (row + rowOffset > -1 && row + rowOffset < APP.rows) {
      for (let colOffset = -1; colOffset <= 1; ++colOffset) {
        if (col + colOffset > -1 && col + colOffset < APP.cols) {
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
  for (let row = 0; row < APP.rows; ++row) {
    for (let col = 0; col < APP.cols; ++col) {
      const neighbors = countNeighbors(row, col);
      const cell = world[row][col];
      nextWorld[row][col] = (() => {
        switch (cell) {
          case State.Alive:
            return neighbors === 2 || neighbors === 3 ? State.Alive : State.Dead;
          case State.Dead:
            return neighbors === 3 ? State.Alive : State.Dead;
        }
      })();
    }
  }
};

const iterateNext = () => {
  computeNextWorld();
  world = deepCopy(nextWorld);
  renderWorld();
};

root.addEventListener("mousedown", (e) => {
  const row = Math.floor((e.offsetY - APP.yOffset) / APP.cellSize);
  const col = Math.floor((e.offsetX - APP.xOffset) / APP.cellSize);
  const alive = world[row][col] === State.Alive;
  if (row >= 0 && col >= 0 && row < APP.rows && col < APP.cols) {
    if (APP.debug) {
      console.log(`Row: ${row}\nCol: ${col}\nAlive: ${!alive}\nNeighbors: ${countNeighbors(row, col)}`);
    }
    world[row][col] = alive ? State.Dead : State.Alive;
  }
  renderWorld();
});

const nextBtn = document.getElementById("next");
nextBtn?.addEventListener("click", iterateNext);

APP.frameInterval = 1000 / APP.fps;

let lastFrameTime = performance.now();
let running = false;
const animate = (currentTime: number) => {
  const elapsedTime = currentTime - lastFrameTime;
  if (elapsedTime >= APP.frameInterval) {
    iterateNext();
    lastFrameTime = performance.now();
  }
  if (running) {
    requestAnimationFrame(animate);
  }
};

const playPause = () => {
  running = !running;
  playBtn?.setAttribute("value", running ? "Stop" : "Play");
  if (running) {
    nextBtn?.setAttribute("disabled", "");
    requestAnimationFrame(animate);
  } else {
    nextBtn?.removeAttribute("disabled");
  }
};

const playBtn = document.getElementById("play");
playBtn?.addEventListener("click", () => {
  playPause();
});

const clearBtn = document.getElementById("clear");
clearBtn?.addEventListener("click", () => {
  if (running) {
    playPause();
  }
  init();
});

type ControlElement = {
  type: HTMLInputElement["type"];
  label: string;
  id: string;
  onChange: (input: HTMLInputElement) => void;
  value?: string;
  min?: number;
  max?: number;
  checked?: boolean;
  fieldset?: string;
};

const controlFields: ControlElement[] = [
  {
    type: "checkbox",
    label: "Debug logs",
    id: "debugSwitch",
    onChange(checkbox) {
      APP.debug = checkbox.checked;
    },
  },
  {
    type: "number",
    label: "FPS",
    id: "fps",
    onChange(e) {
      APP.fps = parseInt(e.value);
      if (APP.debug) {
        console.log(`FPS set to ${e.value}`);
      }
    },
    value: "10",
    min: 1,
    max: 100,
  },
];

const renderConfigBox = () => {
  const configBox = document.getElementById("config");
  if (!configBox) {
    throw new Error("Failed to get the config box");
  }
  for (let i = 0; i < controlFields.length; ++i) {
    const field = controlFields[i];

    const input = document.createElement("input");
    input.type = field.type;
    input.id = field.id;
    input.addEventListener("change", (e) => field.onChange(e.target as HTMLInputElement));

    field.value ? (input.value = field.value) : {};

    const prop = document.createElement("label");
    prop.textContent = `${field.label}:`;
    prop.appendChild(input);

    configBox.appendChild(prop);
    // const elm = document.getElementById(field.id);
    // if (!elm) {
    //   throw new Error("Couldn't rootend element");
    // }
  }
};
renderConfigBox();
