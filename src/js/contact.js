// Contact form → EmailJS (keys come from content/site.json via data attributes).
(() => {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const status = form.querySelector('.message-box__status');
  const submit = form.querySelector('[type="submit"]');
  const fields = {
    name: form.elements.namedItem('name'),
    email: form.elements.namedItem('email'),
    message: form.elements.namedItem('message'),
  };

  const MESSAGES = {
    required: 'Error: Please fill in all required information.',
    email: 'Error: Please enter a valid email.',
    rate: 'Error: Please wait a few seconds before sending another message.',
    failed: 'Error: Your message could not be sent. Please try again later.',
    success: 'Message sent! I’ll get back to you within ~24 hours.',
  };
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

  const show = (key, invalid = []) => {
    status.textContent = MESSAGES[key];
    status.classList.toggle('is-success', key === 'success');
    Object.values(fields).forEach((field) => field.removeAttribute('aria-invalid'));
    invalid.forEach((field) => field.setAttribute('aria-invalid', 'true'));
    invalid[0]?.focus();
  };

  const setBusy = (busy) => {
    submit.disabled = busy;
    submit.querySelector('span').textContent = busy ? 'SENDING…' : 'SUBMIT';
  };

  Object.values(fields).forEach((field) =>
    field.addEventListener('input', () => {
      field.removeAttribute('aria-invalid');
    }),
  );

  let initialized = false;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const values = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value.trim()]));
    if (form.elements.namedItem('website')?.value) return; // honeypot — silently drop bots

    const empty = Object.entries(values)
      .filter(([, value]) => !value)
      .map(([key]) => fields[key]);
    if (empty.length) return show('required', empty);
    if (!EMAIL_PATTERN.test(values.email)) return show('email', [fields.email]);

    const emailjs = window.emailjs;
    if (!emailjs) return show('failed');
    if (!initialized) {
      emailjs.init({
        publicKey: form.dataset.publicKey,
        blockHeadless: true,
        limitRate: { id: 'contact-form', throttle: 10000 },
      });
      initialized = true;
    }

    setBusy(true);
    try {
      await emailjs.send(form.dataset.serviceId, form.dataset.templateId, {
        ...values,
        sent_at: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      });
      show('success');
      form.reset();
    } catch (error) {
      if (error?.status === 429) show('rate');
      else if (error?.status === 422 || /email/i.test(error?.text ?? '')) show('email', [fields.email]);
      else show('failed');
      console.error('EmailJS error', error);
    } finally {
      setBusy(false);
    }
  });
})();
