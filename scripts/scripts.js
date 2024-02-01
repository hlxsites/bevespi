import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS, createOptimizedPicture,
} from './aem.js';

const LCP_BLOCKS = ['hero']; // add your LCP blocks to the list

export function wrapHyphenatedWords(element) {
  element.innerHTML = element.textContent.split(/\s+/).map((word) => {
    if (word.includes('-')) {
      return `<span class="nowrap">${word}</span>`;
    }
    return word;
  }).join(' ');
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * load a script by adding to page head
 * @param {string} url the script src url
 * @param {function} callback a funciton to callback after loading
 */
export function loadScript(url, callback) {
  const head = document.querySelector('head');
  let script = head.querySelector(`script[src="${url}"]`);
  if (!script) {
    script = document.createElement('script');
    script.src = url;
    script.defer = true;
    head.append(script);
    script.onload = callback;
    return script;
  }
  return script;
}

/*
  * Returns the environment type based on the hostname.
*/
export function getEnvType(hostname = window.location.hostname) {
  const fqdnToEnvType = {
    'bevespi.com': 'live',
    'www.bevespi.com': 'live',
    'franklin.bevespi.com': 'live',
    'main--bevespi--hlxsites.hlx.page': 'preview',
    'main--bevespi--hlxsites.hlx.live': 'live',
    'analytics--bevespi--hlxsites.hlx.page': 'preview',
    'analytics--bevespi--hlxsites.hlx.live': 'live',
  };
  return fqdnToEnvType[hostname] || 'dev';
}

/*
  * Decorates external links
*/
export function decorateExternalLinks(container) {
  container.querySelectorAll('a').forEach((a) => {
    const isPdfLink = a.getAttribute('href')?.includes('.pdf');
    const isExternalLink = !a.getAttribute('href')?.startsWith('/');
    if (isExternalLink || isPdfLink) a.setAttribute('target', '_blank');
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
// eslint-disable-next-line no-unused-vars
function buildAutoBlocks(main) {
  // eslint-disable-next-line no-empty
  try {
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

function addSectionBackgroundImages(main) {
  main.querySelectorAll('.section[data-background]').forEach((section) => {
    const imageUrl = section.getAttribute('data-background');

    const image = createOptimizedPicture(imageUrl);
    image.classList.add('section-background-img');
    section.append(image);
    main.querySelector('.section:first-of-type .section-background-img img')?.setAttribute('loading', 'eager');
  });
}

function decorateSeparatorIcon(main) {
  main.querySelectorAll('span.icon-separator').forEach((icon) => {
    icon.classList.remove('icon');
    icon.append(document.createElement('hr'));
  });
}

function decorateAriaLabels(main) {
  [...main.querySelectorAll('a')].forEach((anchor) => {
    const ariaLabelResult = anchor.textContent.match(/(.+)\[aria-label=["”]([^"”]+)["”]\]/);
    if (ariaLabelResult) {
      anchor.setAttribute('aria-label', ariaLabelResult[2]);
      anchor.textContent = ariaLabelResult[1].trim();
      anchor.title = ariaLabelResult[1].trim();
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateAriaLabels(main);
  decorateSeparatorIcon(main);
  decorateIcons(main);
  // buildAutoBlocks(main);
  decorateSections(main);
  addSectionBackgroundImages(main);
  decorateBlocks(main);
  decorateExternalLinks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  // icons alt attribute fix - new boilerplate has low a11y (svgs are rendered as img without alt)
  doc.querySelectorAll('[data-icon-name]').forEach((icon) => {
    icon.alt = `icon ${icon.getAttribute('data-icon-name')}`;
  });

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
