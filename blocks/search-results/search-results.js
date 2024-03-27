async function fetchData(path) {
  const response = await fetch(`${path}.json`);
  return response.json();
}

function addEventListeners(element, functionToCall) {
  element.addEventListener('click', () => {
    functionToCall();
  });
  element.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      functionToCall();
    }
  });
}

function buildUserFeedbackContainer(titleContainer, ...content) {
  titleContainer.classList.add('user-feedback-message');
  const h2 = document.createElement('h2');
  titleContainer.append(h2);
  h2.append(...content);
  return h2;
}

function highlightTerms(text, terms) {
  const pattern = terms.map((term) => `\\w*${term}\\w*`).join('|');
  return text.replace(new RegExp(pattern, 'gi'), (match) => `<strong>${match}</strong>`);
}

class SearchResults {
  constructor(indexJson, container, curLocation, pageSize) {
    this.indexJson = indexJson;
    this.container = container;
    this.curLocation = curLocation;
    this.pageSize = pageSize;
  }

  updateURL(query, page = 1) {
    // eslint-disable-next-line no-restricted-globals
    const { state } = history;
    const { title } = document;
    const url = new URL(this.curLocation.origin + this.curLocation.pathname);
    url.searchParams.set('q', query.trim());
    url.searchParams.set('p', page.toString());
    if (this.pageSize !== 10) {
      url.searchParams.set('s', this.pageSize.toString());
    }
    // eslint-disable-next-line no-restricted-globals
    history.pushState(state, title, url.toString());
  }

  searchIndex(queryString, requestedPage) {
    this.container.querySelector('.results-container')?.remove();
    this.container.querySelector('.title-container')?.remove();
    this.container.querySelector('.paginationitems')?.remove();

    const titleContainer = document.createElement('div');
    this.container.append(titleContainer);
    titleContainer.classList.add('title-container');

    const query = queryString.trim();
    if (query.length >= 3) {
      const showingSerResult = document.createElement('span');
      showingSerResult.classList.add('showingSerResult');
      showingSerResult.textContent = 'Showing results for: ';
      titleContainer.append(showingSerResult);
      const searchQuery = document.createElement('span');
      searchQuery.classList.add('search-query');
      searchQuery.textContent = query;
      titleContainer.append(searchQuery);
    } else {
      buildUserFeedbackContainer(
        titleContainer,
        'You did not enter any search terms.',
        document.createElement('br'),
        'Please enter a search term and try again.',
      );
      return;
    }

    const resultsContainer = document.createElement('div');
    resultsContainer.classList.add('results-container');
    this.container.append(resultsContainer);

    const terms = query.split(' ')
      .filter((term) => term.length > 0)
      .map((term) => term.toLowerCase());

    const results = this.indexJson.data.filter((row) => terms.length > 0
      && terms.every((term) => row.title.toLowerCase().includes(term)
        || row.description?.toLowerCase()?.includes(term)
        || row.content?.toLowerCase()?.includes(term)));

    const count = results.length;
    const pages = Math.ceil(count / this.pageSize);
    // if requestedPage is out-of-bounds, set page to 1
    const page = (requestedPage < 1 || requestedPage > pages) ? 1 : requestedPage;
    this.updateURL(query, page);

    results.forEach((row, index) => {
      const pos = index + 1;
      if (pos > (page - 1) * this.pageSize && pos <= page * this.pageSize) {
        const resultSection = document.createElement('div');
        resultSection.classList.add('result-item');
        const linkParagraph = document.createElement('p');
        linkParagraph.classList.add('search-result-pagename');
        resultSection.append(linkParagraph);
        const link = document.createElement('a');
        link.href = row.path;
        link.title = row.title;
        link.innerHTML = highlightTerms(row.title, terms);
        linkParagraph.append(link);

        const descriptionParagraph = document.createElement('p');
        descriptionParagraph.classList.add('search-result-abstract');
        if (row.description) {
          descriptionParagraph.innerHTML = highlightTerms(row.description, terms);
        } else {
          descriptionParagraph.innerHTML = 'No description available.';
        }
        resultSection.append(descriptionParagraph);
        resultsContainer.append(resultSection);
      }
    });

    if (count === 0) {
      buildUserFeedbackContainer(titleContainer, 'We\'re sorry, but no results matched your search term.');
    } else if (pages > 1) {
      const paginationItems = document.createElement('ul');
      paginationItems.classList.add('paginationitems');
      this.container.append(paginationItems);
      const previousPageArrow = document.createElement('li');
      previousPageArrow.classList.add('nav-arrow', 'first');
      if (page === 1) {
        previousPageArrow.classList.add('nav-disabled');
      } else {
        previousPageArrow.tabIndex = 0;
        const arrowImage = document.createElement('img');
        arrowImage.src = '/icons/search-prev-button.png';
        previousPageArrow.append(arrowImage);
        addEventListeners(previousPageArrow, () => {
          const activePage = Number(document.querySelector('li.active-page').textContent);
          this.searchIndex(query, activePage - 1);
        });
      }
      paginationItems.append(previousPageArrow);

      let currentPage = 1;
      while (currentPage <= pages) {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = currentPage.toString();
        if (currentPage === page) {
          li.classList.add('active-page');
        } else {
          li.tabIndex = 0;
          const pageNumber = currentPage;
          addEventListeners(li, () => {
            this.searchIndex(query, pageNumber);
          });
        }
        li.append(span);
        paginationItems.append(li);
        currentPage += 1;
      }

      const nextPageArrow = document.createElement('li');
      nextPageArrow.classList.add('nav-arrow', 'last');
      if (page === pages) {
        nextPageArrow.classList.add('nav-disabled');
      } else {
        nextPageArrow.tabIndex = 0;
        const arrowImage = document.createElement('img');
        arrowImage.src = '/icons/search-next-button.png';
        nextPageArrow.append(arrowImage);
        addEventListeners(nextPageArrow, () => {
          const activePage = Number(document.querySelector('li.active-page').textContent);
          this.searchIndex(query, activePage + 1);
        });
      }
      paginationItems.append(nextPageArrow);
    }
  }
}

function buildSearchInputField(value) {
  const searchInput = document.createElement('input');
  searchInput.id = 'search';
  searchInput.name = 'q';
  searchInput.maxLength = 50;
  searchInput.placeholder = 'SEARCH';
  if (value) {
    searchInput.value = value;
  }
  return searchInput;
}

function buildSearchButton() {
  const searchButton = document.createElement('button');
  searchButton.id = 'search-button';
  const buttonSpan = document.createElement('span');
  searchButton.append(buttonSpan);
  buttonSpan.append('SEARCH');
  const img = document.createElement('img');
  img.src = '/icons/icon_pink-arrow-right-md.png';
  buttonSpan.append(img);
  searchButton.type = 'button';
  return searchButton;
}

function buildSearchSection(block) {
  const searchSection = document.createElement('div');
  searchSection.classList.add('search');
  block.append(searchSection);
  return searchSection;
}

function parseIntOrDefault(value, defaultValue) {
  const parsedValue = parseInt(value, 10);
  if (Number.isNaN(parsedValue)) {
    return defaultValue;
  }
  return parsedValue;
}

export default async function decorate(block, curLocation = window.location) {
  const indexJson = await fetchData('/query-index');

  const queryParams = new URLSearchParams(curLocation.search);
  const query = queryParams.get('q')?.trim();
  const page = parseIntOrDefault(queryParams.get('p'), 1);
  const pageSize = parseIntOrDefault(queryParams.get('s'), 10);

  const searchSection = buildSearchSection(block);
  const searchFormSection = document.createElement('div');
  searchFormSection.classList.add('search-form');
  searchSection.append(searchFormSection);
  const searchInput = buildSearchInputField(query);
  searchFormSection.append(searchInput);
  const searchButton = buildSearchButton();
  searchFormSection.append(searchButton);

  const searchResultsContainer = document.createElement('div');
  searchResultsContainer.classList.add('search-results', 'section');
  searchSection.append(searchResultsContainer);

  const searchResults = new SearchResults(
    indexJson,
    searchResultsContainer,
    curLocation,
    pageSize,
  );

  searchButton.addEventListener('click', () => {
    searchResults.searchIndex(searchInput.value, page);
  });
  searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      searchResults.searchIndex(searchInput.value, page);
    }
  });

  searchResults.searchIndex(query, page);
}
