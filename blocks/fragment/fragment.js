/*
 * Fragment Block
 * Include content from one Helix page in another.
 * https://www.hlx.live/developer/block-collection/fragment
 */

import { decorateMain } from '../../scripts/scripts.js';

import { loadBlocks } from '../../scripts/aem.js';

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

function onScroll() {
  const importantSafetyInformationSections = document.getElementsByClassName(
    'important-safety-information',
  );
  if (importantSafetyInformationSections.length > 0) {
    const offset = importantSafetyInformationSections[0].offsetTop;
    const stickySections = document.getElementsByClassName(
      'sticky-fragment-block',
    );
    if (stickySections.length > 0) {
      const importantSafetyInformationSectionsHeight = stickySections[0].clientHeight;
      const windowBottomPosition = window.scrollY
        + window.innerHeight
        - importantSafetyInformationSectionsHeight;
      if (windowBottomPosition <= offset) {
        stickySections[0].classList.add('fixed-section');
      } else {
        stickySections[0].classList.remove('fixed-section');
      }
    }
  }
}

function scrollToInformationBlock() {
  const informationBlockElement = document.getElementsByClassName(
    'important-safety-information',
  );

  if (informationBlockElement.length > 0) {
    const offsetPosition = informationBlockElement[0].getBoundingClientRect().top
     + window.scrollY
     + 1;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
}

function renderStickyFragmentInformationBlock(block) {
  const stickyInformationBlock = document.createElement('div');
  stickyInformationBlock.classList.add('sticky-fragment-block');
  stickyInformationBlock.classList.add('fixed-section');
  const stickyInformationBlockHeader = document.createElement('div');
  stickyInformationBlockHeader.classList.add('sticky-fragment-header');
  const stickyInformationBlockHeaderContainer = document.createElement('div');
  stickyInformationBlockHeaderContainer.classList.add(
    'sticky-fragment-header-container',
  );
  stickyInformationBlockHeader.appendChild(stickyInformationBlockHeaderContainer);
  stickyInformationBlock.appendChild(stickyInformationBlockHeader);
  const stickyInformationBlockContent = document.createElement('div');
  stickyInformationBlockContent.classList.add('sticky-framgent-content');
  stickyInformationBlock.appendChild(stickyInformationBlockContent);

  const informationBlockHeader = block.querySelector('h2');
  if (informationBlockHeader) {
    const copyOfInfoBlockHeader = informationBlockHeader.cloneNode(informationBlockHeader);
    stickyInformationBlockHeaderContainer.appendChild(copyOfInfoBlockHeader);
    const informationBlockScrollButton = document.createElement('a');
    informationBlockScrollButton.href = '#';
    informationBlockScrollButton.setAttribute('aria-label', 'Scroll');
    informationBlockScrollButton.classList.add('sticky-fragment-scroll-button');
    informationBlockScrollButton.addEventListener(
      'click',
      scrollToInformationBlock,
    );
    stickyInformationBlockHeaderContainer.appendChild(informationBlockScrollButton);
  }

  const informationBlockFirstListItem = block.querySelector('li');
  if (informationBlockFirstListItem) {
    const listContainer = document.createElement('ul');
    const content = informationBlockFirstListItem.cloneNode(informationBlockFirstListItem);
    listContainer.appendChild(content);
    stickyInformationBlockContent.appendChild(listContainer);
  }

  block.appendChild(stickyInformationBlock);
  document.addEventListener('scroll', onScroll);
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      if (fragmentSection.classList.contains('important-safety-information')) {
        renderStickyFragmentInformationBlock(fragmentSection);
      }

      block.closest('.section').classList.add(...fragmentSection.classList);
      block.closest('.fragment-wrapper').replaceWith(...fragmentSection.childNodes);
    }
  }
}
