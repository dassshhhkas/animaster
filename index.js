function animaster() {
    // Задача 2: прячем функции внутрь animaster
    function fadeIn(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.remove('hide');
        element.classList.add('show');
    }

    function move(element, duration, translation) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(translation, null);
    }

    function scale(element, duration, ratio) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(null, ratio);
    }

    // Задача 3: создаём fadeOut
    function fadeOut(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.remove('show');
        element.classList.add('hide');
    }

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

    //Задача4: сложные анимации
    
    function moveAndHide(element, duration) {
        const moveTime = duration * 2/5;
        const fadeTime = duration * 3/5;
        
        move(element, moveTime, {x: 100, y: 20});
        
        setTimeout(() => {
            fadeOut(element, fadeTime);
        }, moveTime);
    }
    
    function showAndHide(element, duration) {
        const stepTime = duration / 3;
        
        fadeIn(element, stepTime);
        
        setTimeout(() => {
            fadeOut(element, stepTime);
        }, stepTime * 2);
    }
    
    function heartBeating(element) {
        let isRunning = true;
        let phase = 0;
        
        function pulse() {
            if (!isRunning) return;
            
            const ratio = phase === 0 ? 1.4 : 1;
            scale(element, 500, ratio);
            
            phase = 1 - phase;
            
            setTimeout(pulse, 500);
        }
        
        pulse();
        
        return {
            stop: function() {
                isRunning = false;
            }
        };
    }

    return {
        fadeIn,
        move,
        scale,
        fadeOut,
        moveAndHide,
        showAndHide,
        heartBeating
    };
}

function addListeners() {
    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animaster().fadeIn(block, 5000);
        });

    document.getElementById('movePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            animaster().move(block, 1000, {x: 100, y: 10});
        });

    document.getElementById('scalePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            animaster().scale(block, 1000, 1.25);
        });
    
    
    document.getElementById('moveAndHidePlay')?.addEventListener('click', function () {
        const block = document.getElementById('moveAndHideBlock');
        animaster().moveAndHide(block, 2000);
    });
    
    document.getElementById('showAndHidePlay')?.addEventListener('click', function () {
        const block = document.getElementById('showAndHideBlock');
        animaster().showAndHide(block, 3000);
    });
    
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
}

addListeners();