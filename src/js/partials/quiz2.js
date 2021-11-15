window.addEventListener('DOMContentLoaded', ()=> {
  const quiz = document.querySelector('.quiz');

  if (quiz) {
    const quizForm = quiz.querySelector('.quiz__form');
    const nameField = quizForm.querySelector('.quiz__field input');
    const startQuizBtn = quizForm.querySelector('.quiz__btn');
    const quizInfo = quiz.querySelector('.quiz__info');
    const quizMain = quiz.querySelector('.quiz__main');
    let nextBtn = null;

    let questions = null;
    let questionsCopy = null;
    let userName = null;
    let currentQuestionPoints = {};
    let currentPoint = 0;
    let resultPoints = 0;
    let currentResult = null;
    const errorNameFieldMessage = 'Это поле должно быть заполнено, введите свое имя.';

    let quizStyles = window.getComputedStyle(quiz);
    const QuizPadding = {
      TOP: parseInt(quizStyles.getPropertyValue('padding-top'), 10) || 0,
      BOTTOM: parseInt(quizStyles.getPropertyValue('padding-bottom'), 10) || 0,
      VERTICAL: 0
    };

    QuizPadding.VERTICAL = QuizPadding.TOP + QuizPadding.BOTTOM;
     
    window.addEventListener('resize', () => {
      quizStyles = window.getComputedStyle(quiz);
      QuizPadding.TOP = parseInt(quizStyles.getPropertyValue('padding-top'), 10) || 0;
      QuizPadding.BOTTOM = parseInt(quizStyles.getPropertyValue('padding-bottom'), 10) || 0;
      QuizPadding.VERTICAL = QuizPadding.TOP + QuizPadding.BOTTOM;
    });

    startQuizBtn.onclick = () => {
      if (nameField.value) {
        userName = nameField.value;
        startQuiz();
      }
    }

    nameField.onblur = function() {
      if (!this.value) {
        const parent = this.parentElement;

        parent.classList.add('error');
        parent.querySelector('span').textContent = errorNameFieldMessage;
      }
    }

    nameField.oninput = function() {
      const parent = this.parentElement;
      parent.classList.remove('error');
      parent.querySelector('span').textContent = '';
    }

    quizMain.onchange = e => {
      const target = e.target.closest('input[type="radio"]');

      if (target) {
        currentPoint = currentQuestionPoints[target.value];
        nextBtn.disabled = false;
      }
    }

    quizMain.onclick = e => {
      const target = e.target.closest('.quiz__next');

      if (target) {
        target.disabled = true;
        resultPoints += currentPoint;

        //console.log(resultPoints, currentPoint)
        nextQuestion();
      }
    }

    function startQuiz() {
      quiz.style.height = quiz.offsetHeight + 'px';

      gsap.to(quizInfo, {opacity: 0, duration: .5, onComplete: () => {
        fetch('js/data/questions.json')
          .then(response => response.json())
          .then(data => {
            questions = data;
            questionsCopy = questions.slice();
            return questionsCopy;
          })
          .then(questionsCopy => {
            const questionEl = document.createElement('div');
            questionEl.className = 'question';
            quizInfo.remove();

            quizMain.appendChild(questionEl);

            const question = questionsCopy.shift();

            return new Promise((res, rej) => {
            const image = new Image();
            image.onload = () => {
              res(image);
            };

            image.onerror = () => {
              //rej(new Error("Изображение не загружено"))
              res(false)
            }

            image.src = `images/quiz/question-${question.id}.jpg`;
          })
            .then((isLoad) => {
              renderQuestion(question, isLoad);
            })
           
          })
          .then(() => {
            const controlEl = document.createElement('div');
            controlEl.className = 'quiz__control';
            controlEl.innerHTML = `<button class="quiz__next" type="button" disabled>Дальше</button>`;
            
            quizMain.appendChild(controlEl);
            nextBtn = quizMain.querySelector('.quiz__next');
            return quizMain.offsetHeight
          })
          .then(quizMainHeight => {
            const tl = gsap.timeline();
            tl.to(quiz, {height: quizMainHeight + QuizPadding.VERTICAL, duration: .5})
              .to(quizMain, {opacity: 1, duration: .5})
          });
      }})

    }

    function renderQuestion(item, isLoad) {
      const questionEl = quizMain.querySelector('.question');
      let answers = '';

      questionEl.classList[isLoad ? 'remove' : 'add']('is-image-not-load');

      item.answers.forEach((item, index) => {
        answers += renderAnswer(item);
        currentQuestionPoints[item.value] = item.point;

        if (index === 0) {
          //currentPoint = item.point;
        }
      });
      const img = isLoad ? `<img src="images/quiz/question-${item.id}.jpg" width="608" height="487" alt="">` : '';

      let question = `<div class="question__title"><span class="question__title-number">${item.id}</span><span class="question__title-text">${item.question}</span></div>
        <div class="question__answers custom-radio">
          ${answers}
        </div>
        <div class="question__image">${img}</div>`;

      questionEl.innerHTML = question;
    }

    function renderAnswer(item, isChecked) {
      return `<label class="custom-radio__item">
        <input class="visually-hidden" type="radio" name="answer" value="${item.value}" ${isChecked ? 'checked' : ''}><span class="custom-radio__text">${item.value}. ${item.text}</span>
      </label>`;
    }

    function nextQuestion() {
      if (questionsCopy.length) {
        const question = questionsCopy.shift();
        //const nextBtn = quizMain.querySelector('.quiz__next');
        //nextBtn.setAttribute('disabled', true);

        gsap.to(quizMain, {opacity: 0, duration: .5, onComplete: () => {
          quizMain.classList.add('is-absolute');

          new Promise((res, rej) => {
            const image = new Image();
            image.onload = () => {
              res(image);
            };

            image.onerror = () => {
              //rej(new Error("Изображение не загружено"))
              res(false)
            }

            image.src = `images/quiz/question-${question.id}.jpg`;
          })
            .then((isLoad) => {
              renderQuestion(question, isLoad);

              if (!questionsCopy.length) {
                nextBtn.textContent = 'Послать';
              }
              nextBtn.disabled = true;//setAttribute('disabled', true);
            })
            .then(() => {
              const height = quizMain.offsetHeight + QuizPadding.VERTICAL;
              const tl = gsap.timeline();

              tl.to(quiz, {height: height, duration: .5, onComplete: () => {
                quizMain.classList.remove('is-absolute');}
              })
                .to(quizMain, {opacity: 1, duration: .5})
            })

        }})

        nextBtn.disabled = false;

      } else {
        endQuiz();
      }
    }

    function endQuiz() {
      //console.log(resultPoints)
      renderResult();
    }

    function renderResult() {
      fetch('js/data/results.json')
        .then(response => response.json())
        .then(data => {
          return data.filter(it => {
            return it.points.min <= resultPoints && resultPoints <= it.points.max;
          }).pop();
        })
        .then(result => {
          currentResult = result;
          return Promise.all([
            new Promise((resolve, reject) => {
              const image = new Image();
              image.onload = () => {
                resolve(image);
              }
              image.onerror = () => {
                resolve(false);
              }
              image.src = `images/quiz/result0-${result.image}.jpg`;
            }),
            new Promise((resolve, reject) => {
              const image = new Image();
              image.onload = () => {
                resolve(image);
              }
              image.onerror = () => {
                resolve(false);
              }
              image.src = `images/quiz/result0-mobile-${result.image}.jpg`;
            })
          ]);
        })
        .then(isLoad => {
          const resultEl = document.createElement('section');
          resultEl.className = 'result';
          resultEl.style.height = quiz.offsetHeight + 'px';
          resultEl.style.opacity = 0;

          resultEl.classList[isLoad.includes(false) ? 'remove' : 'add']('is-image-not-load');

          let img = isLoad.includes(false) ? '' : `<picture> 
                <source media="(max-width: 767px)" srcset="images/quiz/result-mobile-${currentResult.image}.jpg"><img src="images/quiz/result-${currentResult.image}.jpg" alt="">
              </picture>`;

          resultEl.innerHTML = `<div class="result__panorama">
            <div class="result__points"><span>Ваш результат</span><span class="big">${resultPoints} ${getWord(resultPoints, ['балл', 'балла', 'баллов'])}</span></div>
            <div class="result__panorama-image">
              ${img}
            </div>
            <div class="result__appeal">${userName}, <br>${currentResult.appeal}</div>
          </div>
          <div class="container">
            <div class="result__main"> 
              ${currentResult.text}
            </div>
          </div>`;


          quiz.replaceWith(resultEl);

          const resultElStyles = window.getComputedStyle(resultEl);
          const pesultElPaddings = parseInt(resultElStyles.getPropertyValue('padding-top'), 10) + parseInt(resultElStyles.getPropertyValue('padding-bottom'), 10)

          gsap.timeline().to(resultEl, {height: resultEl.scrollHeight + pesultElPaddings, duration: .5})
            .to(resultEl, {opacity: 1, duration: .5})
        });
        
    }

    function getWord(num, words) {
      let n = num * 100;
      n = n % 100;

      if (n > 19) {
        n = n % 10;
      }
      
      switch (n) {
        case 1: {
          return words[0];
        }
        case 2:
        case 3:
        case 4: {
          return words[1];
        }
        default: {
          return words[2];
        }
      }
    }

  

  }

})