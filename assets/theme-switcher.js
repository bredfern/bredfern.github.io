const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function handleThemeChange(e) {
  if (e.matches) {
    console.log("Switching to Dark Mode");
    // Add your dark mode logic here
  } else {
    console.log("Switching to Light Mode");
    // Add your light mode logic here
  }
}

// Watch for changes while the user is on the page
darkModeMediaQuery.addEventListener('change', handleThemeChange);

// Initial check
handleThemeChange(darkModeMediaQuery);
