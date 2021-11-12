window.addEventListener('load', function() {
  const html = document.documentElement;
  let width = html.clientWidth;
  //const sectionTexts = document.querySelectorAll('[class*="__section-text"]');
  //const sectionTitles = document.querySelectorAll('[class*="__section-title"]');

  //sectionTexts.forEach(it => it.setAttribute('contenteditable', true));
  //sectionTitles.forEach(it => it.setAttribute('contenteditable', true));

  AOS.init();
  const hero = document.querySelector('.hero');
  const heroArrow = hero.querySelector('.hero__arrow');

  if (hero && heroArrow) {
    let minHeight = hero.offsetHeight - 80;

    if ( !(html.clientHeight >= hero.offsetHeight - 80) ) {
      let difference = hero.offsetHeight - html.clientHeight + 40;
      heroArrow.style.bottom = difference + 'px';

      
      window.addEventListener('resize', () => {
        //width = html.clientWidth;
        
        difference = hero.offsetHeight - html.clientHeight + 40;
        minHeight = hero.offsetHeight - 80;

        if ( !(html.clientHeight >= minHeight) ) {
          heroArrow.style.bottom = difference + 'px';
        }
        
        //historySectionRect = historySection.getBoundingClientRect();
        
      });
      
      window.addEventListener('scroll', () => {
        let scroll = window.pageYOffset;

        if (scroll + html.clientHeight < minHeight) {
          heroArrow.style.bottom = (difference - scroll) + 'px';
        } else {
          heroArrow.style.bottom = '80px'
        }
      });

    }


    
    //http://pubads.g.doubleclick.net/gampad/clk?id=5813485185&iu=/81006599/hmiru-woman-media/desktop/count

 
  }

 

});
