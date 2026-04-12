const btn = document.getElementById('btn-toggle');

btn.addEventListener("click", function() {
  const element = document.body;
  element.classList.toggle("dark-mode");
  if (btn.innerHTML === '🌛') {
    btn.innerHTML = '🌞';
  } else {
    btn.innerHTML = '🌛';
  }
});
