let withAutocollapse = true;
let withPreview = true;
let hasTitle = false;

function collapseOtherRows(rows, selectedRow) {
  const currentRowIndex = parseInt(selectedRow.getAttribute('expandable-row-index'), 10);
  [...rows].forEach((row, index) => {
    if (index === currentRowIndex) {
      return;
    }

    if (row.classList.contains('expanded')) {
      row.classList.remove('expanded');
      const expandableButtonLabel = row.getElementsByClassName('expandable-button > a > label');
      if (expandableButtonLabel.length > 0) {
        expandableButtonLabel[0].textContent = 'MORE';
        expandableButtonLabel[0].parentElement.setAttribute('aria-label', 'MORE');
      }
    }
  });
}

function handleExpandableButtonClick(rows, event) {
  const selectedRow = event.currentTarget.parentElement.parentElement;

  selectedRow.classList.toggle('expanded');
  const buttonLabel = event.currentTarget.querySelector('label');
  const buttonText = selectedRow.classList.contains('expanded')
    ? 'LESS'
    : 'MORE';
  buttonLabel.textContent = buttonText;
  buttonLabel.parentElement.setAttribute('aria-label', buttonText);

  if (withAutocollapse) {
    collapseOtherRows(rows, selectedRow);
  }
}

function addExpandableButton(row, rows) {
  const expandableButtonLabel = document.createElement('label');
  expandableButtonLabel.textContent = 'MORE';
  const expandableButton = document.createElement('div');
  expandableButton.role = 'button';
  expandableButton.classList.add('expandable-button');
  expandableButton.setAttribute('aria-label', 'MORE');
  expandableButton.addEventListener('click', handleExpandableButtonClick.bind(null, rows));
  expandableButton.appendChild(expandableButtonLabel);
  row.appendChild(expandableButton);
}

function wrapNextSiblingsInDiv(element) {
  const wrapper = document.createElement('div');
  let currentElement = element.nextSibling;
  while (currentElement) {
    const { nextSibling } = currentElement;
    wrapper.appendChild(currentElement);
    currentElement = nextSibling;
  }

  return wrapper;
}

function markItemsWithPictureBefore(row) {
  const pictures = row.querySelectorAll('picture');
  if (pictures.length > 0) {
    [...pictures].forEach((picture) => {
      if (picture.parentElement.tagName === 'P'
        && picture.textContent.length > 0) {
        picture.parentElement.classList.add('item-with-picture-before');
        const wrapper = wrapNextSiblingsInDiv(picture);
        picture.after(picture, wrapper);
      }
    });
  }
}

function createAccordionRowHeader(row) {
  const rowHeader = document.createElement('div');
  rowHeader.classList.add('accordion-row-header');
  if (withPreview) {
    const picture = row.querySelector('picture');
    if (picture) {
      rowHeader.appendChild(picture.cloneNode(true));
      picture.parentElement.remove();
    }
  }

  const titleContainer = document.createElement('div');
  titleContainer.classList.add('accordion-title-header-container');
  const title = row.querySelector('h2');
  if (title) {
    titleContainer.appendChild(title);
  }

  if (withPreview) {
    const firstParagraph = row.querySelector('p');
    if (firstParagraph) {
      titleContainer.appendChild(firstParagraph.cloneNode(true));
    }
  }

  rowHeader.appendChild(titleContainer);
  row.insertBefore(rowHeader, row.children[0]);
}

function createAccordion(block) {
  [...block.children].forEach((row, index) => {
    if (row.children.length === 0) {
      return;
    }

    if (index === 0 && hasTitle) {
      row.classList.add('accordion-row-arrow-above');
    }

    row.classList.add('accordion-row');
    row.setAttribute('expandable-row-index', index);
    const rowContent = row.children[0];
    rowContent.classList.add('accordion-row-content');
    createAccordionRowHeader(rowContent);
    markItemsWithPictureBefore(rowContent);
    addExpandableButton(rowContent, block.children);
  });
}

export default function decorate(block) {
  if (block.parentElement.parentElement.children[0].children[0].tagName === 'H2') {
    hasTitle = true;
  }

  if (block.classList.contains('pink')) {
    block.parentElement.parentElement.classList.add('full-width');
  }

  if (block.classList.contains('without-autoclose')) {
    withAutocollapse = false;
  }

  if (block.classList.contains('without-preview')) {
    withPreview = false;
  }

  createAccordion(block);
}
