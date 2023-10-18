import { getMetadata, decorateIcons } from '../../scripts/aem.js';

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // fetch nav content
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const resp = await fetch(`${navPath}.plain.html`);

  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.id = 'nav';
    nav.innerHTML = html;

    const classes = ['top', 'middle', 'bottom'];
    classes.forEach((c, i) => {
      const section = nav.children[i];
      if (section) {
        section.classList.add(`nav-${c}`);
        section.innerHTML = `<div>${section.innerHTML}</div>`;
      }
    });

    const expandTop = document.createElement('div');
    expandTop.classList.add('expand-top');
    expandTop.addEventListener('click', () => { nav.querySelector('.nav-top').classList.toggle('expanded'); });
    nav.querySelector('.nav-middle').appendChild(expandTop);

    const search = document.createElement('div');
    search.classList.add('search');
    search.innerHTML = `
    <form action="/search-results" method="get">
    <label for="search">Search</label>
    <input id="search" name="q" placeholder="SEARCH" maxlength="50"> 
    <button type="submit">Go</button>
    </form>`;
    nav.querySelector('.nav-top > div').append(search);

    const explore = nav.querySelector('.nav-middle .columns > div > div:nth-of-type(3)');
    explore.innerHTML = "<span class='explore'>Explore</span><span class='close'>Close</span>";
    explore.addEventListener('click', () => { nav.classList.toggle('expanded'); });

    decorateIcons(nav);
    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.append(nav);
    block.append(navWrapper);
  }
}
