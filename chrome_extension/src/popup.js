'use strict';

import './popup.css';

const url = "https://chatbot-arena-woad.vercel.app";

function login() {
  window.open(url + '/login?chromeExtension=true', '_blank');
  return;
}

function openIFrame() {
  const app = document.querySelector('.app');
  // Remove all child elements of app
  app.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.src = url + '/chat?chromeExtension=true';
  iframe.width = '100%';
  iframe.height = '100%';
  iframe.frameBorder = '0';
  app.appendChild(iframe);
}

(function() {
  document.querySelector('.privacy').addEventListener('click', () => {
    window.open(url + '/privacy.txt', '_blank');
  });
  document.querySelector('.login').addEventListener('click', login);
  chrome.cookies.get(
    {
      url: url,
      name: '__Secure-authjs.session-token',
    },
    (cookie) => {
      // If cookie is not found, open login page
      if (!cookie) {
        chrome.cookies.get(
          {
            url: url,
            name: 'authjs.session-token',
          },
          (cookie2) => {
            if (cookie2) {
              openIFrame();
            }
          }
        );
      }
      if (cookie) {
        openIFrame();
      }
    }
  );
})();
