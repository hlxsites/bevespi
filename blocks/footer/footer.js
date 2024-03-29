import { readBlockConfig, decorateIcons } from '../../scripts/aem.js';
import {
  decorateExternalLinks,
  wrapHyphenatedWordsInNode,
} from '../../scripts/scripts.js';

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

    const privacyoptionsIcon = document.createElement('img');
    privacyoptionsIcon.classList.add('privacy-options-icon');
    privacyoptionsIcon.src = '/icons/privacyoptions123x59.png';

    [...footer.querySelectorAll('p')].forEach(wrapHyphenatedWordsInNode);
    const privacyoptionsLink = footer.querySelector('a[href^="https://do-not-sell-my-personal-information.astrazeneca.com/"]');
    privacyoptionsLink.target = '_blank';
    privacyoptionsLink.appendChild(privacyoptionsIcon);

    decorateIcons(footer);
    decorateExternalLinks(footer);
    block.append(footer);
  }
}
