export function onScroll() {
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
      const windowBottomPosition = window.scrollY + window.innerHeight - importantSafetyInformationSectionsHeight;
      if (windowBottomPosition <= offset) {
        stickySections[0].classList.add('fixed-section');
      } else {
        stickySections[0].classList.remove('fixed-section');
      }
    }
  }
}

export function scrollToInformationBlock() {
  const informationBlockElement = document.getElementsByClassName(
    'important-safety-information',
  );

  if (informationBlockElement.length > 0) {
    const offsetPosition =
      informationBlockElement[0].getBoundingClientRect().top +
      window.scrollY +
      1;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
}

export function renderStickyFragmentInformationBlock(block) {
  const stickyInformationBlock = document.createElement('div');
  stickyInformationBlock.classList.add('sticky-fragment-block');
  stickyInformationBlock.classList.add('fixed-section');
  const stickyInformationBlockHeader = document.createElement('div');
  stickyInformationBlockHeader.classList.add('sticky-fragment-header');
  const stickyInformationBlockHeaderContainer = document.createElement('div');
  stickyInformationBlockHeaderContainer.classList.add(
    'sticky-fragment-header-container',
  );
  stickyInformationBlockHeader.appendChild(
    stickyInformationBlockHeaderContainer
  );
  stickyInformationBlock.appendChild(stickyInformationBlockHeader);
  const stickyInformationBlockContent = document.createElement('div');
  stickyInformationBlockContent.classList.add('sticky-framgent-content');
  stickyInformationBlock.appendChild(stickyInformationBlockContent);

  const informationBlockHeader = block.querySelector('h2');
  if (informationBlockHeader) {
    const copyOfInfoBlockHeader = informationBlockHeader.cloneNode(
      informationBlockHeader,
    );
    stickyInformationBlockHeaderContainer.appendChild(copyOfInfoBlockHeader);
    const informationBlockScrollButton = document.createElement('a');
    informationBlockScrollButton.setAttribute('role', 'button');
    informationBlockScrollButton.setAttribute('aria-label', 'Scroll');
    informationBlockScrollButton.classList.add('sticky-fragment-scroll-button');
    informationBlockScrollButton.addEventListener(
      'click',
      scrollToInformationBlock,
    );
    stickyInformationBlockHeaderContainer.appendChild(
      informationBlockScrollButton
    );
  }

  const informationBlockFirstListItem = block.querySelector('li');
  if (informationBlockFirstListItem) {
    const listContainer = document.createElement('ul');
    const content = informationBlockFirstListItem.cloneNode(
      informationBlockFirstListItem
    );
    listContainer.appendChild(content);
    stickyInformationBlockContent.appendChild(listContainer);
  }

  block.appendChild(stickyInformationBlock);
  document.addEventListener('scroll', onScroll);
}
