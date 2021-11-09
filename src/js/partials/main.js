window.addEventListener('load', function() {
  //const sectionTexts = document.querySelectorAll('[class*="__section-text"]');
  //const sectionTitles = document.querySelectorAll('[class*="__section-title"]');

  //sectionTexts.forEach(it => it.setAttribute('contenteditable', true));
  //sectionTitles.forEach(it => it.setAttribute('contenteditable', true));

  AOS.init();
  const heroButton = document.querySelector('.hero__button');

  if (heroButton) {
    const historySection = document.querySelector('.history');
    let width = document.documentElement.clientWidth;
    let historySectionRect = historySection.getBoundingClientRect();
    let heroButtonRect = heroButton.getBoundingClientRect();
    let isFixed = false;
    let isShifted = true;
    
    //http://pubads.g.doubleclick.net/gampad/clk?id=5813485185&iu=/81006599/hmiru-woman-media/desktop/count

    heroButton.classList.remove('opacity-0');
    
    window.addEventListener('resize', () => {
      width = document.documentElement.clientWidth;

      if (width >= 768) {
        historySectionRect = historySection.getBoundingClientRect();
      }
    });

    window.addEventListener('scroll', () => {
      let scroll = window.pageYOffset;

      if (width >= 768) {

        if (scroll > heroButtonRect.bottom + 200 && !isShifted && scroll < historySectionRect.top) {
          heroButton.style.visibility = 'hidden';
          heroButton.classList.add('is-shifted');
          heroButton.classList.add('is-fixed');
          isShifted = true;
        } else if (scroll < heroButtonRect.bottom + 200 && isShifted && scroll < historySectionRect.top) {
          heroButton.classList.remove('is-shifted');
          heroButton.classList.remove('is-fixed');
          isShifted = false
        }

        if (scroll > historySectionRect.top && !isFixed) {
          heroButton.style.visibility = '';
          heroButton.classList.remove('is-shifted');
          isFixed = true;
          



        } else if (scroll < historySectionRect.top && isFixed) {
          heroButton.classList.add('is-shifted');
          isFixed = false;
        }

      }
    });
  }

 

});
