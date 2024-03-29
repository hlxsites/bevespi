import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { decorateExternalLinks } from '../../scripts/scripts.js';

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

        if (c === 'bottom') {
          const links = section.querySelectorAll(':scope a');
          if (links.length > 0) {
            links.forEach((link) => {
              const br = link.querySelector('br');
              if (br) {
                const beforeBrElement = document.createElement('span');
                beforeBrElement.appendChild(br.previousSibling);
                const afterBrElement = document.createElement('span');
                afterBrElement.appendChild(br.nextSibling);
                link.innerHTML = '';
                link.appendChild(beforeBrElement);
                link.appendChild(afterBrElement);
              }
            });
          }
        }
      }
    });

    const expandTop = document.createElement('div');
    expandTop.classList.add('expand-top');
    expandTop.addEventListener('click', () => {
      nav.querySelector('.nav-top').classList.toggle('expanded');
      nav.querySelector('.expand-top').classList.toggle('expanded');
      block.parentElement.classList.toggle('nav-expanded');
    });
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
    nav.querySelector('.nav-bottom > div').append(search.cloneNode(true));

    const explore = nav.querySelector('.nav-middle > div > div > div > div:nth-of-type(3)');
    if (explore) {
      explore.innerHTML = "<span class='explore'>Explore</span><span class='close'>Close</span>";
      explore.addEventListener('click', () => {
        nav.classList.toggle('expanded');
        document.body.classList.toggle('nav-expanded');
        console.log('NAv expanded explore');
      });
      const mobileExplore = explore.cloneNode(true);
      mobileExplore.addEventListener('click', () => {
        nav.classList.toggle('expanded');
        document.body.classList.toggle('nav-expanded');
        console.log('NAv expanded mobile explore');
      });
      nav.querySelector('.nav-bottom > div').append(mobileExplore);
    }

    const brandImg = nav.querySelector('.nav-middle picture');
    const brandImgLink = document.createElement('a');
    brandImgLink.href = '/';
    brandImgLink.title = 'Home';
    brandImg.after(brandImgLink);
    brandImgLink.appendChild(brandImg);

    decorateIcons(nav);
    decorateExternalLinks(nav);
    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.append(nav);
    block.append(navWrapper);

    if (getMetadata('platform')) document.head.prepend(document.createComment(getMetadata('platform')));
  }
}
