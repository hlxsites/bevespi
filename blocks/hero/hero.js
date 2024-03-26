import { wrapHyphenatedWordsInNode } from '../../scripts/scripts.js';

/**
 * loads and decorates the footer
 * @param {Element} block The hero block element
 */
export default async function decorate(block) {
  /* wrap hero block in dedicated section */
  const section = block.closest('.section');
  if (section.children.length > 1) {
    const heroSection = document.createElement('div');
    heroSection.classList.add('section', 'hero-container');
    block.closest('main').prepend(heroSection);
    heroSection.append(block.closest('.hero-wrapper'));
    section.classList.remove('hero-container');
  }

  [...block.querySelectorAll('p')].forEach(wrapHyphenatedWordsInNode);

  if (block.classList.contains('home')) {
    const btnScroll = document.createRange()
      .createContextualFragment(`<div class="btn-scroll">
        <a href="#how-bevespiaerosphere-can-help">Scroll
        <img src="/icons/icon_pink-arrow-down.png" alt="Scroll to section 2 header"/></a>
        </div>`);
    block.appendChild(btnScroll);
  }

  /* load second image for mobile eagerly for LCP */
  const heroImageCol = block.querySelector('.hero.block > div:first-of-type');
  const isDesktop = window.matchMedia('(min-width: 900px)');
  const isMobileImg = heroImageCol.querySelector('picture:nth-of-type(2), p:nth-of-type(2)');
  if (!isDesktop.matches && isMobileImg) {
    heroImageCol.querySelector('p:nth-of-type(1) picture img, picture:nth-of-type(1) img').setAttribute('loading', 'lazy');
    heroImageCol.querySelector('p:nth-of-type(2) picture img, picture:nth-of-type(2) img').setAttribute('loading', 'eager');
  }
}
