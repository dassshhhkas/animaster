function animaster(initialSteps = []) {
    // ПРИВАТНЫЕ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    
    function getTransform(translation, ratio) {
        const result = [];
        if (translation) {
            result.push(`translate(${translation.x}px,${translation.y}px)`);
        }
        if (ratio) {
            result.push(`scale(${ratio})`);
        }
        return result.join(' ');
    }
    
    function saveInitialState(element) {
        return {
            transform: element.style.transform,
            transitionDuration: element.style.transitionDuration,
            classListValue: element.classList.value
        };
    }
    
    // ПРИВАТНЫЕ ЭЛЕМЕНТАРНЫЕ АНИМАЦИИ (пункт 2)
    
    function fadeIn(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.remove('hide');
        element.classList.add('show');
    }

    function fadeOut(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.remove('show');
        element.classList.add('hide');
    }

    function move(element, duration, translation) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(translation, null);
    }

    function scale(element, duration, ratio) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(null, ratio);
    }
    
    // ПУНКТ 6: ФУНКЦИИ ОТМЕНЫ (приватные) 
    
    function resetFadeIn(element) {
        element.style.transitionDuration = null;
        element.classList.remove('show');
    }
    
    function resetFadeOut(element) {
        element.style.transitionDuration = null;
        element.classList.remove('hide');
    }
    
    function resetMoveAndScale(element) {
        element.style.transitionDuration = null;
        element.style.transform = null;
    }
    
    // ПУБЛИЧНЫЙ ИНТЕРФЕЙС 
    
    const api = {
        _steps: [...initialSteps] 
    };
    
    // ПУНКТ 8, 10: МЕТОДЫ ЦЕПОЧКИ (addMove, addScale, addFadeIn, addFadeOut, addDelay) 
    // ПУНКТ 16: возвращаем НОВЫЙ экземпляр, чтобы a и b были разными
    
    api.addFadeIn = function(duration) {
        return animaster([...this._steps, { type: 'fadeIn', duration, params: null }]);
    };
    
    api.addFadeOut = function(duration) {
        return animaster([...this._steps, { type: 'fadeOut', duration, params: null }]);
    };
    
    api.addMove = function(duration, translation) {
        return animaster([...this._steps, { type: 'move', duration, params: translation }]);
    };
    
    api.addScale = function(duration, ratio) {
        return animaster([...this._steps, { type: 'scale', duration, params: ratio }]);
    };
    
    api.addDelay = function(duration) {
        return animaster([...this._steps, { type: 'delay', duration, params: null }]);
    };
    
    // ПУНКТ 8, 12, 13: МЕТОД PLAY 
    
    api.play = function(element, cycled = false) {
        if (this._steps.length === 0) {
            return { stop: () => {}, reset: () => {} };
        }
        
        let currentIndex = 0;
        let timerId = null;
        let isStopped = false;
        let isReset = false;
        const initialState = saveInitialState(element);
        const steps = [...this._steps];
        
        function runStep(index) {
            if (isStopped || isReset) return;
            if (index >= steps.length) {
                if (cycled && !isStopped && !isReset) {
                    runStep(0);
                }
                return;
            }
            
            const step = steps[index];
            
            if (step.type === 'delay') {
                timerId = setTimeout(() => runStep(index + 1), step.duration);
            } else {
                switch (step.type) {
                    case 'fadeIn': fadeIn(element, step.duration); break;
                    case 'fadeOut': fadeOut(element, step.duration); break;
                    case 'move': move(element, step.duration, step.params); break;
                    case 'scale': scale(element, step.duration, step.params); break;
                }
                timerId = setTimeout(() => runStep(index + 1), step.duration);
            }
        }
        
        runStep(0);
        
        // ПУНКТ 13: возвращаем объект с stop и reset
        return {
            stop: function() {
                isStopped = true;
                if (timerId) clearTimeout(timerId);
            },
            reset: function() {
                isStopped = true;
                isReset = true;
                if (timerId) clearTimeout(timerId);
                // ПУНКТ 6: используем функции отмены
                resetFadeIn(element);
                resetFadeOut(element);
                resetMoveAndScale(element);
                restoreInitialState(element, initialState);
            }
        };
    };
    
    function restoreInitialState(element, state) {
        element.style.transform = state.transform;
        element.style.transitionDuration = state.transitionDuration;
        element.classList.value = state.classListValue;
    }
    
    // ПУНКТ 9: МЕТОД move через addMove/play 
    
    api.move = function(element, duration, translation) {
        return this.addMove(duration, translation).play(element);
    };
    
    //ПУНКТ 10: ОСТАЛЬНЫЕ ПРЯМЫЕ МЕТОДЫ 
    
    api.fadeIn = function(element, duration) {
        return this.addFadeIn(duration).play(element);
    };
    
    api.fadeOut = function(element, duration) {
        return this.addFadeOut(duration).play(element);
    };
    
    api.scale = function(element, duration, ratio) {
        return this.addScale(duration, ratio).play(element);
    };
    
    // ПУНКТ 4, 12: СЛОЖНЫЕ АНИМАЦИИ (переписаны через add... и play) 
    
    api.moveAndHide = function(element, duration) {
        const moveTime = duration * 2/5;
        const fadeTime = duration * 3/5;
        return animaster()
            .addMove(moveTime, {x: 100, y: 20})
            .addFadeOut(fadeTime)
            .play(element);
    };
    
    api.showAndHide = function(element, duration) {
        const stepTime = duration / 3;
        return animaster()
            .addFadeIn(stepTime)
            .addDelay(stepTime)
            .addFadeOut(stepTime)
            .play(element);
    };
    
    api.heartBeating = function(element) {
        let timerId = null;
        let isStopped = false;
        let phase = 0;
        const initialState = saveInitialState(element);
        
        function pulse() {
            if (isStopped) return;
            scale(element, 500, phase === 0 ? 1.4 : 1);
            phase = 1 - phase;
            timerId = setTimeout(pulse, 500);
        }
        
        pulse();
        
        // ПУНКТ 5: возвращаем объект с методом stop
        return {
            stop: function() {
                isStopped = true;
                if (timerId) clearTimeout(timerId);
                resetMoveAndScale(element);
                restoreInitialState(element, initialState);
            }
        };
    };
    
    // ПУНКТ 15: БОНУСНАЯ АНИМАЦИЯ (wobble - дрожание) 
    
    api.wobble = function(element, duration) {
        const step = duration / 4;
        return animaster()
            .addMove(step, {x: 15, y: 0})
            .addMove(step, {x: -15, y: 0})
            .addMove(step, {x: 15, y: 0})
            .addMove(step, {x: 0, y: 0})
            .play(element);
    };
    
    // ПУНКТ 14: МЕТОД buildHandler 
    
    api.buildHandler = function() {
        const self = this;
        return function(event) {
            self.play(event.currentTarget);
        };
    };
    
    return api;
}


function addListeners() {
    document.getElementById('fadeInPlay')?.addEventListener('click', function () {
        const block = document.getElementById('fadeInBlock');
        animaster().fadeIn(block, 5000);
    });

    document.getElementById('movePlay')?.addEventListener('click', function () {
        const block = document.getElementById('moveBlock');
        animaster().move(block, 1000, {x: 100, y: 10});
    });

    document.getElementById('scalePlay')?.addEventListener('click', function () {
        const block = document.getElementById('scaleBlock');
        animaster().scale(block, 1000, 1.25);
    });
    
    // ПУНКТ 7: moveAndHide с кнопкой reset
    let moveAndHideControl = null;
    
    document.getElementById('moveAndHidePlay')?.addEventListener('click', function () {
        const block = document.getElementById('moveAndHideBlock');
        if (moveAndHideControl) moveAndHideControl.reset();
        moveAndHideControl = animaster().moveAndHide(block, 2000);
    });
    
    document.getElementById('moveAndHideReset')?.addEventListener('click', function () {
        if (moveAndHideControl) {
            moveAndHideControl.reset();
            moveAndHideControl = null;
        }
    });
    
    document.getElementById('showAndHidePlay')?.addEventListener('click', function () {
        const block = document.getElementById('showAndHideBlock');
        animaster().showAndHide(block, 3000);
    });
    
    // ПУНКТ 5: heartBeating с кнопкой stop
    let heartbeatControl = null;
    
    document.getElementById('heartBeatingPlay')?.addEventListener('click', function () {
        const block = document.getElementById('heartBeatingBlock');
        if (heartbeatControl) heartbeatControl.stop();
        heartbeatControl = animaster().heartBeating(block);
    });
    
    document.getElementById('heartBeatingStop')?.addEventListener('click', function () {
        if (heartbeatControl) {
            heartbeatControl.stop();
            heartbeatControl = null;
        }
    });
    
    // ПУНКТ 15: бонусная анимация wobble
    document.getElementById('wobblePlay')?.addEventListener('click', function () {
        const block = document.getElementById('wobbleBlock');
        animaster().wobble(block, 800);
    });
    
    // ПУНКТ 14: пример buildHandler
    const worryAnimationHandler = animaster()
        .addMove(200, {x: 80, y: 0})
        .addMove(200, {x: 0, y: 0})
        .addMove(200, {x: 80, y: 0})
        .addMove(200, {x: 0, y: 0})
        .buildHandler();

    document.getElementById('worryAnimationBlock')?.addEventListener('click', worryAnimationHandler);
}

// Запуск после загрузки страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addListeners);
} else {
    addListeners();
}