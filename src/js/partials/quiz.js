window.addEventListener('load', () => {
  let retina = window.devicePixelRatio > 1 ? true : false;
  const viewportWidth = document.documentElement.clientWidth;
  let isMobile = viewportWidth < 768;

  window.addEventListener('resize', () => {
    retina = window.devicePixelRatio > 1 ? true : false;
    viewportWidth = document.documentElement.clientWidth;
    isMobile = viewportWidth < 768;
  })

  const quiz = document.querySelector('.quiz');

  if (quiz) {
    const inner = quiz.querySelector('.quiz__inner');
    const overlay = quiz.querySelector('.quiz__overlay');

    let currentQ = 0;
    let maxPoints = 0;
    let quizResult = null;
    let questions = null;
    let results = null;

    const onAnswerChangeDebounced = debounce(onAnswerChange, 700);

    fetch('js/data/questions.json')
      .then(response => response.json())
      .then(data => {
        questions = data;

        fetch('js/data/results.json')
          .then(response => response.json())
          .then(resultsData => {
            results = resultsData;

            for (let key in results) {
              results[key].points = 0;
              results[key].mod = key;
            }

            const hash = window.location.hash.slice(1);
            const isResult = results.hasOwnProperty(hash);
           

            if (isResult) {
              results[hash].points = 1;
              quizResult = getResults(results);
              renderResult();
              
              overlay.classList.remove('shown');
            } else {
              renderQuestion(currentQ);
            }

            quiz.addEventListener('change', onAnswerChangeDebounced);
            quiz.addEventListener('click', (e) => {
              if (e.target.classList.contains('__js_more-result')) {
                overlay.classList.add('shown');

                overlay.ontransitionend = () => {
                  overlay.ontransitionend = null;
                  renderResult();
                  overlay.classList.remove('shown');

                }
              }

              if (e.target.classList.contains('__js_again')) {
                currentQ = 0;
                maxPoints = 0;
                quizResult = null;

                overlay.classList.add('shown');

                overlay.ontransitionend = () => {
                  overlay.ontransitionend = null;
                  window.location.hash = '';
                  renderQuestion(currentQ);
                  overlay.classList.remove('shown');
                }
              }
            });
          });
      });

    function renderQuestion(currentQ) {
      quiz.className = `quiz quiz--q${questions[currentQ].id}`;
      const question = `<h3 class="quiz__question title">${questions[currentQ].id}. ${questions[currentQ].question}</h3>`;

      const answers = getAnswersHtml(questions[currentQ].id, questions[currentQ].answers);

      inner.innerHTML = question;
      inner.append(answers);

      if (currentQ < questions.length - 1) {
        preloadNextBgImage(questions[currentQ].id + 1, 'quiz-bg-');
      }

      overlay.classList.remove('shown');
    }

    function getAnswersHtml(id, answers) {
      const answersWrapper = document.createElement('div');
      answersWrapper.classList.add('quiz__answers');
      let result = '';

      answers.forEach(it => {
        result += `<label class="quiz__answer">
          <input class="visually-hidden" type="radio" name="q${id}" value="${it.value}">
          <span class="quiz__answer-text">
            <span>${it.text}</span>
          </span>
        </label>`;
      });

      answersWrapper.innerHTML = result;

      return answersWrapper;
    }

    function renderResult() {
      let resultActionHtml = `<button class="quiz__btn __js_again" type="button">Пройти еще раз</button>`;

      if (quizResult.length > 1) {
        resultActionHtml += `<button class="quiz__btn __js_more-result" type="button">Еще результат</button>`;
      }

      const result = quizResult.pop();

      //preloadNextBgImage(result.mod, 'quiz-bg-result-');
      window.location.hash = result.mod;

      quiz.className = `quiz quiz--result quiz--r-${result.mod}`;

      const resultHtml = `<div class="quiz__result">
        <div class="quiz__result-image">
          <img src="images/quiz/${result.image}.jpg" srcset="images/quiz/${result.image}@2x.jpg 2x" width="400" height="474" alt="">
        </div>
        <div class="quiz__result-content">
          <h3 class="quiz__result-title title">Результат</h3>
          <div class="quiz__result-text">${result.text}</div>
        </div>
        <div class="quiz__result-action">
          ${resultActionHtml}
        </div>
      </div>`;

      inner.innerHTML = resultHtml;
    }

    function getResults(results) {
      const resultArray = [];

      for (let key in results) {
        if (maxPoints < results[key].points) {
          maxPoints = results[key].points;
        }

        resultArray.push(results[key]);
      }

      return resultArray.filter(it => it.points === maxPoints);
    }

    function onAnswerChange(e) {
      const input = e.target.closest('input[type="radio"]');
      
      if (input) {
        const value = input.value;
        
        results[value].points++;

        if (currentQ < questions.length - 1) {
          currentQ++;
          overlay.classList.add('shown');

          overlay.ontransitionend = () => {
            overlay.ontransitionend = null;
            renderQuestion(currentQ);
            overlay.classList.remove('shown');
          }
        } else {
          overlay.classList.add('shown');

          //console.log(results);
          quizResult = getResults(results);

          overlay.ontransitionend = () => {
            overlay.ontransitionend = null;
            renderResult();
            overlay.classList.remove('shown');
          }
        }
      }
    }

    function preloadNextBgImage(id, imgPrefix) {
      const mobilePart = isMobile ? 'mobile-' : '';
      const imgName = retina ? `${imgPrefix}${mobilePart}${id}@2x.jpg` : `${imgPrefix}${mobilePart}${id}.jpg`;

      let preloadImageDiv = document.querySelector('.preload-image-div')

      if (preloadImageDiv) {
        preloadImageDiv.querySelector('img').src = `images/quiz/${imgName}`;
      } else {
        preloadImageDiv = document.createElement('div');
        preloadImageDiv.className = 'preload-image-div visually-hidden';

        const img = `<img src="images/quiz/${imgName}" alt="">`;

        preloadImageDiv.innerHTML = img;
        document.body.append(preloadImageDiv);
      }


    }

    function preloadImage(id, imgPrefix, onSuccess, onError) {
      const mobilePart = isMobile ? 'mobile-' : '';
      const imgName = retina ? `${imgPrefix}${mobilePart}${id}@2x.jpg` : `${imgPrefix}${mobilePart}${id}.jpg`;

      return new Promise((onSuccess, onError) => {
        const image = new Image();

        image.onload = () => onSuccess(image);
        image.onerror = () => onError();
        image.src = `images/quiz/${imgName}`;
      })
    }

  }

  function debounce(func, wait, immediate) {
    let timeout;

    return function executedFunction() {
      const context = this;
      const args = arguments;

      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };

      const callNow = immediate && !timeout;

      clearTimeout(timeout);

      timeout = setTimeout(later, wait);

      if (callNow) func.apply(context, args);
    };
  };






});