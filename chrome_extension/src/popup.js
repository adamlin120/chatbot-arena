'use strict';

import './popup.css';

const url = "http://localhost:3000";

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
            if (!cookie2) {
              window.open(url + '/login?chromeExtension=true');
              return;
            }
            openIFrame();
          }
        );
      }
      openIFrame();
    }
  );
})();
