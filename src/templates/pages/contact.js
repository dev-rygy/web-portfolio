// Contact page — Figma "Contact" (80:2752)

import { html } from '../../lib/html.js';
import { button, inputField, pageIntro } from '../components/ui.js';

export function contactPage({ site, intro }) {
  const { emailjs } = site;
  return html`${pageIntro(intro)}
<section class="contact-section">
  <div class="container">
    <form class="message-box" data-contact-form novalidate
      action="mailto:${site.email}" method="post" enctype="text/plain"
      data-public-key="${emailjs.publicKey}" data-service-id="${emailjs.serviceId}" data-template-id="${emailjs.templateId}">
      <h2 class="message-box__title">Send Message</h2>
      <div class="message-box__fields">
        <div class="message-box__row">
          ${inputField({ id: 'contact-name', name: 'name', label: 'Your_Name', placeholder: 'e.g. Commander Shepard', autocomplete: 'name' })}
          ${inputField({ id: 'contact-email', name: 'email', label: 'Your_Email', placeholder: 'e.g. shepard@alliance.mil', type: 'email', autocomplete: 'email' })}
        </div>
        ${inputField({ id: 'contact-message', name: 'message', label: 'Your_Message', placeholder: 'Type message here...', multiline: true })}
      </div>
      <input class="message-box__trap" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="message-box__actions">
        ${button({ label: 'SUBMIT', type: 'submit', variant: 'primary', className: 'message-box__submit' })}
        <p class="message-box__status" role="status" aria-live="polite"></p>
      </div>
      <p class="message-box__response">Response time: ~ 24 hours</p>
    </form>
  </div>
</section>`;
}
