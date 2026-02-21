let seconds = 0;
let interval = null;
let element = null;

function init(domElement) {
  element = domElement;
  render();
}

function start() {
  clearInterval(interval);

  interval = setInterval(() => {
    seconds++;
    render();
  }, 1000);
}

function stop() {
  clearInterval(interval);
  interval = null;
}

function reset() {
  stop();
  seconds = 0;
  render();
}

function render() {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const formatted =
    String(mins).padStart(2, '0') +
    ':' +
    String(secs).padStart(2, '0');

  if (element) {
    element.textContent = formatted;
  }
}

export const Timer = {
  init,
  start,
  stop,
  reset
};