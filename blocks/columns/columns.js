export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    row.classList.add('columns-row');
    const rowInner = document.createElement('div');
    [...row.children].forEach((col) => {
      col.classList.add('columns-col');
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
      rowInner.appendChild(col);
    });
    row.appendChild(rowInner);
  });
}
