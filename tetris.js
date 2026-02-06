const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');

const scale = 20;
ctx.scale(scale, scale);

/* MATRIZ DEL JUEGO */
function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

const arena = createMatrix(12, 20);

/* PIEZAS */
function createPiece(type) {
  if (type === 'T') {
    return [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ];
  }
}

/* JUGADOR */
const player = {
  pos: { x: 5, y: 0 },
  matrix: createPiece('T'),
  score: 0
};

/* DIBUJAR */
function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = 'red';
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

/* COLISIONES */
function collide(arena, player) {
  for (let y = 0; y < player.matrix.length; y++) {
    for (let x = 0; x < player.matrix[y].length; x++) {
      if (
        player.matrix[y][x] !== 0 &&
        (arena[y + player.pos.y] &&
          arena[y + player.pos.y][x + player.pos.x]) !== 0
      ) {
        return true;
      }
    }
  }
  return false;
}

/* FUSIÓN */
function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

/* LIMPIAR FILAS + PUNTOS */
function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y >= 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) continue outer;
    }

    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;

    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

/* ROTAR PIEZA */
function rotate(matrix) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < y; x++) {
      [matrix[x][y], matrix[y][x]] =
        [matrix[y][x], matrix[x][y]];
    }
  }
  matrix.forEach(row => row.reverse());
}

function playerRotate() {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix);
      rotate(player.matrix);
      rotate(player.matrix);
      player.pos.x = pos;
      return;
    }
  }
}

/* CAÍDA */
function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    arenaSweep();
    player.pos.y = 0;
    player.matrix = createPiece('T');
  }
}

/* CONTROLES */
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    player.pos.x--;
    if (collide(arena, player)) player.pos.x++;
  }
  if (event.key === 'ArrowRight') {
    player.pos.x++;
    if (collide(arena, player)) player.pos.x--;
  }
  if (event.key === 'ArrowDown') {
    playerDrop();
  }
  if (event.key === 'ArrowUp') {
    playerRotate();
  }
});

/* LOOP */
function update() {
  draw();
  document.getElementById('score').innerText = player.score;
  requestAnimationFrame(update);
}

update();
