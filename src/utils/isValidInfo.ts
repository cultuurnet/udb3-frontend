const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
const PHONE_REGEX = /^[0-9\/\-_.+ ]{0,15}$/;
const URL_REGEX_FOR_FORCING_PROTOCOL_AND_TLD =
  /^https?:\/\/(?:www\.)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s?#]*)?(?:\?[^\s#]*)?(?:#[^\s]*)?$/;

const isValidEmail = (email: string) => {
  return (
    typeof email === 'undefined' || email === '' || EMAIL_REGEX.test(email)
  );
};

const isValidUrl = (url: string) => {
  try {
    const urlObj = new URL(url);

    if (!URL_REGEX_FOR_FORCING_PROTOCOL_AND_TLD.test(urlObj.toString())) {
      throw new Error('not a valid url');
    }

    return true;
  } catch (e) {
    return false;
  }
};

const isValidPhone = (phone: string) => {
  return (
    typeof phone === 'undefined' || phone === '' || PHONE_REGEX.test(phone)
  );
};

const isValidInfo = (type: string, value: string): boolean => {
  if (value === '') return true;
  if (type === 'email') return isValidEmail(value);
  if (type === 'url') return isValidUrl(value);
  if (type === 'phone') return isValidPhone(value);
};

export { isValidEmail, isValidInfo, isValidPhone, isValidUrl };
