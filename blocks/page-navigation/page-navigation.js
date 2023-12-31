export default async function decorate(block) {
  const navURL = block.querySelector('a')?.textContent;
  const navPath = new URL(navURL).pathname;
  const resp = await fetch(`${navPath}.plain.html`);

  if (resp.ok) {
    const html = await resp.text();
    const nav = document.createElement('nav');
    nav.innerHTML = html;
    [...nav.querySelectorAll('a')].forEach((link) => {
      if (new URL(link).pathname === window.location.pathname) {
        link.classList.add('current');
        let scrolled = false;
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(() => {
            const div = link.closest('ul').parentElement;
            if (!scrolled) {
              div.scrollTo({ left: (link.offsetLeft - div.offsetLeft - 15), behavior: 'smooth' });
              scrolled = true;
            }
          });
        });
        observer.observe(link);
      }
    });
    block.innerHTML = '';
    block.append(nav);
  }
}
