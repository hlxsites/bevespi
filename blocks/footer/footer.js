import { readBlockConfig, decorateIcons, getMetadata } from '../../scripts/aem.js';
import { decorateExternalLinks } from '../../scripts/scripts.js';
import { loadFragment, renderStickyFragmentInformationBlock } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch footer content
  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});

  if (resp.ok) {
    const html = await resp.text();

    // decorate footer DOM
    const footer = document.createElement('div');
    footer.innerHTML = html;

    const logo = footer.querySelector('div > p > picture');
    const a = document.createElement('a');
    a.href = 'https://www.astrazeneca-us.com/';
    a.setAttribute('aria-label', 'Home');
    logo?.parentElement?.append(a);
    a?.append(logo);

    decorateIcons(footer);
    decorateExternalLinks(footer);
    block.append(footer);
  }

  const path = getMetadata('isi');
  const fragment = await loadFragment(path);
  console.log(fragment);
  if (fragment) {
    const main = document.querySelector('main');
    main.append(fragment);
  }
}
