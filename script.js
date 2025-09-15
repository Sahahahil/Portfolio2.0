const hamMenu = document.querySelector(".ham-menu");
const offScreenMenu = document.querySelector(".off-screen-menu");
const navLinks = document.querySelectorAll(".off-screen-menu ul li a");

// Toggle menu
hamMenu.addEventListener("click", (e) => {
  e.stopPropagation(); // prevent auto-close
  hamMenu.classList.toggle("active");
  offScreenMenu.classList.toggle("active");
});

// Close when clicking a link
navLinks.forEach(link => {
  link.addEventListener("click", () => {
    offScreenMenu.classList.remove("active");
    hamMenu.classList.remove("active");
  });
});

// Close when clicking outside
document.addEventListener("click", (e) => {
  if (!hamMenu.contains(e.target) && !offScreenMenu.contains(e.target)) {
    offScreenMenu.classList.remove("active");
    hamMenu.classList.remove("active");
  }
});

// Reset on resize
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    offScreenMenu.classList.remove("active");
    hamMenu.classList.remove("active");
  }
});
