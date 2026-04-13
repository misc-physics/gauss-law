const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  redraw();
}

let drawing = false;
let scale = 1;
let offsetX = 0;
let offsetY = 0;

let lastX = 0;
let lastY = 0;

canvas.addEventListener("pointerdown", (e) => {
  drawing = true;
  const pos = getTransformedPoint(e.clientX, e.clientY);
  lastX = pos.x;
  lastY = pos.y;
});

canvas.addEventListener("pointerup", () => drawing = false);
canvas.addEventListener("pointercancel", () => drawing = false);

canvas.addEventListener("pointermove", (e) => {
  if (!drawing) return;

  const pos = getTransformedPoint(e.clientX, e.clientY);

  ctx.strokeStyle = document.getElementById("color").value;
  ctx.lineWidth = document.getElementById("width").value;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();

  lastX = pos.x;
  lastY = pos.y;

  save();
});

function getTransformedPoint(x, y) {
  return {
    x: (x - offsetX) / scale,
    y: (y - offsetY) / scale
  };
}

/* Zoom (pinch simulation via wheel for testing) */
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();

  const zoom = e.deltaY < 0 ? 1.1 : 0.9;
  scale *= zoom;

  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
});

/* Pan with two fingers (basic) */
let isPanning = false;

canvas.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "touch" && e.isPrimary === false) {
    isPanning = true;
  }
});

canvas.addEventListener("pointermove", (e) => {
  if (isPanning) {
    offsetX += e.movementX;
    offsetY += e.movementY;
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  }
});

canvas.addEventListener("pointerup", () => isPanning = false);

/* Clear */
document.getElementById("clear").onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  localStorage.removeItem("drawing");
};

/* Save / Load */
function save() {
  localStorage.setItem("drawing", canvas.toDataURL());
}

function redraw() {
  const data = localStorage.getItem("drawing");
  if (!data) return;

  const img = new Image();
  img.src = data;
  img.onload = () => ctx.drawImage(img, 0, 0);
}

redraw();
