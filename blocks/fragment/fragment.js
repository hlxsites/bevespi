/*
 * Fragment Block
 * Include content from one Helix page in another.
 * https://www.hlx.live/developer/block-collection/fragment
 */

import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadBlocks,
} from '../../scripts/aem.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();
      decorateMain(main);
      await loadBlocks(main);
      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      if (fragmentSection.classList.contains('isi')) {
        const tags = fragmentSection.querySelectorAll('.section.isi > div > *:nth-child(-n+2)');
        if (tags && tags.length >= 2) {
          const sticky = document.createElement('div');
          sticky.classList.add('isi', 'sticky');
          sticky.innerHTML = `
            <div class='title'><div>${tags.item(0).outerHTML}</div><div class='plus'></div></div>
            <div class='content'>${tags.item(1).outerHTML}</div>`;
            const section = block.closest('.section');
            section.parentElement.insertBefore(sticky, section);
            const plus = sticky.querySelector('.plus');
            plus.addEventListener('click', () => {
              sticky.classList.add('hidden');
              sticky.scrollIntoView(true, { behavior: "smooth" });
            });
        }
      }
      block.closest('.section').classList.add(...fragmentSection.classList);
      block.closest('.fragment-wrapper').replaceWith(...fragmentSection.childNodes);
    }
  }
}
