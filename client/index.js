// import styling page
import './index.css';

// controle of js werkt
console.log('index.js is working');



document.querySelectorAll('.experiences-wrapper li').forEach((item) => {
    const details = item.querySelector('details');

    item.addEventListener('mouseenter', () => {
      details.setAttribute('open', true);
    });

    item.addEventListener('mouseleave', () => {
      details.removeAttribute('open');
    });
  });

