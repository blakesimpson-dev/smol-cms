import {CONTACT_FORM} from '../../content';

// Netlify Forms handles the POST: /thanks is a static page, which is where
// the form definition gets detected at deploy time
export function ContactForm() {
  return (
    <form
      name={CONTACT_FORM.name}
      method="post"
      action="/thanks"
      data-netlify="true"
      netlify-honeypot="bot-field"
      class="contact-form"
    >
      <input type="hidden" name="form-name" value={CONTACT_FORM.name} />
      <p hidden>
        <label>
          Leave this empty: <input name="bot-field" tabindex={-1} />
        </label>
      </p>
      {CONTACT_FORM.fields.map(f => (
        <label>
          {f.label}
          {f.required && ' *'}
          {f.type === 'textarea' ? (
            <textarea name={f.name} rows={5} required={f.required}></textarea>
          ) : (
            <input
              type={f.type}
              name={f.name}
              autocomplete={f.autocomplete}
              required={f.required}
            />
          )}
        </label>
      ))}
      <button type="submit">Send message</button>
    </form>
  );
}
