import {SITE} from '../../content';

export function SupportContact() {
  const {name, email, phone} = SITE.support;

  return (
    <p>
      Contact {name}
      {email && (
        <>
          {' at '}
          <a href={`mailto:${email}`}>{email}</a>
        </>
      )}
      {phone && (
        <>
          {email ? ' or ' : ' on '}
          <a href={`tel:${phone}`}>{phone}</a>
        </>
      )}{' '}
      to reset it. You'll get a temporary password to log in with, then you can
      choose a new one under Account.
    </p>
  );
}
