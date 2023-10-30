export default async function decorate(block) {
  [...block.children].forEach((row) => {
    if (row.querySelector('picture')) row.querySelector('picture').parentElement.classList.add('p-img-first');
    else row.querySelector('div').innerHTML = `<p class='p-img-first'></p>${row.querySelector('div').innerHTML}`;
    row.querySelector('h2 + p')?.classList.add('p-first');
    [...row.querySelectorAll('p:nth-child(n+2) picture')].forEach((picture) => {
      const pImg = picture.parentElement;
      pImg.classList.add('p-img');
      const span = document.createElement('span');
      span.innerHTML = pImg.innerHTML;
      pImg.innerHTML = '';
      pImg.prepend(span.querySelector('picture'));
      pImg.append(span);
    });

    const buttonsMobile = document.createElement('div');
    buttonsMobile.classList.add('buttons', 'mobile');
    buttonsMobile.innerHTML = '<span class="button-more">+</span><span class="button-less">-</span>';
    const buttons = document.createElement('div');
    buttons.classList.add('buttons', 'desktop');
    buttons.innerHTML = '<span class="button-more">More +</span><span class="button-less">Less -</span>';
    row.querySelector('div').append(buttonsMobile, buttons);

    [...row.querySelectorAll('.buttons > span')].forEach((button) => {
      button.addEventListener('click', () => {
        [...block.querySelectorAll('.active')].forEach((active) => { active.classList.remove('active'); });
        if (button.classList.contains('button-more')) buttons.parentElement.classList.toggle('active');
      });
    });
  });
}
