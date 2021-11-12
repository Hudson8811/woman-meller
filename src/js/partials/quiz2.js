window.addEventListener('DOMContentLoaded', ()=> {
  const quiz = document.querySelector('.quiz');

  if (quiz) {
    const quizForm = quiz.querySelector('.quiz__form');
    const nameField = quizForm.querySelector('.quiz__field input');
    const startQuizBtn = quizForm.querySelector('.quiz__btn');
    const quizMain = quiz.querySelector('.quiz__main');

    let questions = null;
    let questionsCopy = null;
    let userName = null;
    let currentQuestionPoints = {};
    let currentPoint = 0;
    let resultPoints = 0;
    let currentResult = null;
    const errorNameFieldMessage = 'Это поле должно быть заполнено, введите свое имя.';

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
        //console.log(currentPoint)
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
          quiz.querySelector('.quiz__intro').remove();
          quiz.querySelector('.quiz__form').remove();

          quizMain.appendChild(questionEl);

          const question = questionsCopy.shift();
          renderQuestion(question);
        })
        .then(() => {
          const controlEl = document.createElement('div');
          controlEl.className = 'quiz__control';
          controlEl.innerHTML = `<button class="quiz__next" type="button">Дальше</button>`;
          
          quizMain.appendChild(controlEl);
        })
    }

    function renderQuestion(item) {
      const questionEl = quizMain.querySelector('.question');
      let answers = '';

      item.answers.forEach((item, index) => {
        answers += renderAnswer(item, index === 0);
        currentQuestionPoints[item.value] = item.point;

        if (index === 0) {
          currentPoint = item.point;
        }
      });

      //console.log(currentQuestionPoints)

      let question = `<div class="question__title"><span class="question__title-number">${item.id}</span><span class="question__title-text">${item.question}</span></div>
        <div class="question__answers custom-radio">
          ${answers}
        </div>
        <div class="question__image"><img src="images/quiz/question-1.jpg" width="608" height="487" alt=""></div>`;

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
        const nextBtn = quizMain.querySelector('.quiz__next')
        renderQuestion(question);

        if (!questionsCopy.length) {
          nextBtn.textContent = 'Отправить';
        }

        nextBtn.disabled = false;

      } else {
        endQuiz();
      }
    }

    function endQuiz() {
      //console.log(resultPoints)
      renderResult()
    }

    function renderResult() {
      fetch('js/data/results.json')
        .then(response => response.json())
        .then(data => {
          return data.filter(it => {
            //console.log(it.points.min <= resultPoints <= it.points.max)
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
              image.src = `images/quiz/result-${result.image}.jpg`;
            }),
            new Promise((resolve, reject) => {
              const image = new Image();
              image.onload = () => {
                resolve(image);
              }
              image.src = `images/quiz/result-mobile-${result.image}.jpg`;
            })
          ]);
        })
        .then(images => {
          const resultEl = document.createElement('section');
          resultEl.className = 'result';
          resultEl.innerHTML = `<div class="result__panorama">
            <div class="result__points"><span>Ваш результат</span><span class="big">${resultPoints} ${getWord(resultPoints, ['балл', 'балла', 'баллов'])}</span></div>
            <div class="result__panorama-image">
              <picture> 
                <source media="(max-width: 767px)" srcset="images/quiz/result-mobile-${currentResult.image}.jpg"><img src="images/quiz/result-${currentResult.image}.jpg" alt="">
              </picture>
            </div>
            <div class="result__appeal">${userName}, <br>${currentResult.appeal}</div>
          </div>
          <div class="container">
            <div class="result__main"> 
              ${currentResult.text}
            </div>
          </div>`;

          quiz.replaceWith(resultEl);
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

  const qqqqqqqqq = `
        <div class="result__panorama">
          <div class="result__points"><span>Ваш результат</span><span class="big">2 балла</span></div>
          <div class="result__panorama-image">
            <picture> 
              <source media="(max-width: 767px)" srcset="images/quiz/result-mobile-1.jpg"><img src="images/quiz/result-1.jpg" alt="">
            </picture>
          </div>
          <div class="result__appeal">Ольга, <br>вы гуру здорового питания и образа жизни!</div>
        </div>
        <div class="container">
          <div class="result__main"> 
            <p>Поздравляем, вашему умению заботиться о себе можно только позавидовать. Вы знаете, как найти баланс между делами и отдыхом, умеете восстанавливать свои ресурсы и наверняка хорошо спите, и правильно питаетесь. Но вам следует уделить больше внимания Омега-3 в вашем рационе.</p>
            <p>Именно Омега-3 помогают поддерживать работу иммунной и эндокринной систем, процессы метаболизма, состояние кожи и волос, укреплять здоровье в целом и быть более активным и продуктивным! По данным ВОЗ оптимальная суточная норма Омега-3 кислот для взрослых составляет 1000 мг в день.</p>
            <p>Хорошими источниками Омега-3 может стать рыба жирных сортов (палтус, скумбрия и т.д.) и морепродукты, употреблять которые нужно 2-3 раза в неделю. Если это для вас не очень удобно, то хорошим решением может стать добавка к пище! </p>
            <p>Рекомендуем выбирать высококачественные добавки Омега-3, с высоким содержанием кислот, дополненных витаминами А, Д, Е, которые не содержат консервантов и красителей и сделаны норвежским производителем. Обратите внимание на натуральный источник Омега-3 в виде рыбьего жира. </p>
            <p>Именно Омега-3 жирные кислоты могут стать финальным «кирпичиком» в вашей крепости заботы о себе и своем организме!</p>
          </div>
        </div>
      `
})