import { toClassName } from '../../scripts/aem.js';

function closeOtherModals(block) {
  block.querySelectorAll('.cover.with-modal').forEach((cover) => {
    cover.removeAttribute('aria-expanded');
  });
}

const classesToMap = {
  'six-tips-to-help': '/html-fragments/six-tips.html',
  'five-ways-to-enjoy-time': '/html-fragments/five-ways-to-enjoy.html',
  'four-common-triggers': '/html-fragments/four-common-triggers.html',
};

async function loadMappings(tile, cover) {
  await Promise.all([...tile.classList].map(async (c) => {
    if (Object.keys(classesToMap).includes(c)) {
      const fragment = await fetch(classesToMap[c]);
      if (fragment.ok) {
        cover.outerHTML = await fragment.text();
        tile.classList.remove(c);
        tile.classList.remove('numbered');
      }
    }
  }));
}

export default function decorate(block) {
  block.querySelectorAll(':scope > div').forEach(async (tile) => {
    tile.classList.add('tile');

    let cover = tile.querySelector(':scope > div:first-child');
    const modalContent = tile.querySelector(':scope > div:nth-child(2)');
    const propertiesElement = tile.querySelector(':scope > div:nth-child(3)');

    const propertiesText = propertiesElement.innerText;
    const properties = propertiesText?.trim().split(',').map((prop) => toClassName(prop)) ?? [];
    if (propertiesText) {
      tile.classList.add(...properties);
    }
    propertiesElement.remove();

    const picture = cover.querySelector('picture');
    picture?.closest('p').replaceWith(picture);

    if (tile.classList.contains('with-separator')) {
      const h3 = tile.querySelector('h3:last-of-type');
      h3.parentElement.insertBefore(document.createElement('hr'), h3.nextSibling);
    }

    await loadMappings(tile, cover);
    cover = tile.querySelector('.cover') ?? cover;

    if (modalContent.classList.contains('button-container')) {
      // only has a button. Then the tile becomes a link
      const a = modalContent.querySelector('a');
      a.innerHTML = '';
      a.append(cover);
      a.parentElement.replaceWith(a);
      a.classList.add('cover');
      a.classList.remove('button');

      tile.append(document.createRange().createContextualFragment(`
        <img class="bottom-icon" src="/icons/icon-redirect.png" alt="redirect icon" />
      `));
    } else {
      // there is a modal. The tile opens a modal.
      modalContent.classList.add('modal');
      cover.classList.add('cover', 'with-modal');

      modalContent.append(document.createRange().createContextualFragment(`
        <button name="close-modal"><img src="/icons/modal-close.png" alt="close icon"/></button>
      `));

      cover.addEventListener('click', (e) => {
        closeOtherModals(block);
        cover.toggleAttribute('aria-expanded');
        if (e.pageX > document.body.clientWidth / 2) {
          cover.classList.add('open-right');
        }
        e.target.closest('.tile').scrollIntoView(true);
      });
      modalContent.querySelector('button[name="close-modal"]').addEventListener('click', () => {
        cover.toggleAttribute('aria-expanded');
      });

      tile.append(document.createRange().createContextualFragment(`
        <img class="bottom-icon" src="/icons/icon-expand.png" alt="expand icon" />
      `));
    }

    if (tile.classList.contains('modal-bg-img')) {
      const pictureCopy = picture.cloneNode(true);
      modalContent.append(pictureCopy);
    }
  });
}
