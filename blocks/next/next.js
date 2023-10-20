export default async function decorate(block) {
  const link = block.querySelector('a');
  link.innerHTML = `
    <span class="next-large">NEXT:</span>
    <span class="next-small">${link.textContent}</span>
    <span class="next-icon"></span>`;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('active'); });
  });
  observer.observe(block);
}
