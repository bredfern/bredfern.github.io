const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// 1. Check for saved theme OR system preference
const currentTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

// 2. Apply the theme on page load
if (currentTheme === 'dark') {
  htmlElement.classList.add('dark');
}

// 3. Handle the toggle click
themeToggle.addEventListener('click', () => {
  const isDark = htmlElement.classList.toggle('dark');
  
  // Save the choice to localStorage
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

