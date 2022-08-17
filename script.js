(function() {
  'use strict';

  const $ = document.querySelector.bind(document);
  const clamp = (min, val, max) => Math.max(min, Math.min(val, max));

  function roundTo(val, multiple) {
    return Math.max(0, Math.round((val - multiple) / multiple) * multiple);
  }

  const time = (function(target) {
    const format = num => num > 9 ? num : '0' + num;
    const [values, periods] = [...$('.picker-time').children].map(el => [...el.children]);

    return {
      __init__() {
        const date = new Date();
        values[0].textContent = format(date.getHours() % 12 || 12);
        values[1].textContent = format(date.getMinutes());

        target.addEventListener('click', (e) => {
          const trg = e.target;
          trg.matches('.picker-time__item') && this.select(trg);
        });

        this.select(periods[date.getHours() / 12 >> 0]);
        console.log(date.toLocaleTimeString('en'));
      },
      select(el) {
        const active = el.nextElementSibling || el.previousElementSibling;
        active.classList.remove('__active');
        el.classList.add('__active');
        values.includes(el) && clock.switchTo(values.indexOf(el), +el.textContent);
      },
      update(index, val) {
        values[index].textContent = format(val);
      }
    };
  })($('.picker-time'));

  const clock = (function(target) {
    const arrow = $('.picker-clock__arrow');
    const sections = $('.picker-clock__sections').children;
    let lastActiveSection = null;
    let count = 12;

    return {
      __init__() {
        let trigger = false;
        const handler = (e) => {
          const [x, y] = this.getXY(e.x, e.y);
          const multiple = 360 / count;
          let deg = this.calcDeg(x, y);
          deg = x < 0 ? 360 - deg : deg;
          deg = roundTo(deg + multiple, multiple) % 360;
          arrow.style.setProperty('--d', `${deg}deg`);
          this.selectSection(deg);

          const timeInd = count / 60 >> 0;
          const timeVal = !timeInd && !deg ? 12 : deg / multiple;
          time.update(timeInd, timeVal);
        };

        document.addEventListener('mousedown', (e) => {
          if (!target.contains(e.target)) return;
          trigger = true;
          handler(e);
        });

        document.addEventListener('mousemove', (e) => trigger && handler(e));
        document.addEventListener('mouseup', () => (trigger = false));

        this.switchTo(0, new Date().getHours() % 12);
      },
      get radius() {
        return target.offsetWidth / 2 >> 0;
      },
      getXY(cx, cy) {
        const {left, top} = target.getBoundingClientRect();
        const r = this.radius;
        const x = ~~clamp(0, cx - left, r * 2) - r;
        const y = ~~clamp(0, cy - top, r * 2) - r;
        return [x, y];
      },
      calcDeg(a, b) {
        const c = Math.sqrt(Math.abs(a) ** 2 + Math.abs(b) ** 2);
        const cosA = b / c;
        const acosA = Math.acos(cosA) / Math.PI * 180;
        return 90 - acosA + 90 || 0;
      },
      selectSection(deg) {
        const val = deg / 30;
        const that = val % 1 ? null : sections[val];

        if (lastActiveSection && lastActiveSection !== that) {
          lastActiveSection.classList.remove('__active');
        }

        that && that.classList.add('__active');
        lastActiveSection = that;
      },
      switchTo(index, val) {
        const deg = !index && val === 12 ? 0 : [30, 6][index] * val;
        count = [12, 60][index];
        target.classList.toggle('__min', index);
        arrow.style.setProperty('--d', `${deg}deg`);
        this.selectSection(deg);
      }
    };
  })($('.picker-clock'));

  time.__init__();
  clock.__init__();
})();