const FORM_URL =
  process.env.NEXT_PUBLIC_SCHOOL_INTEREST_FORM_URL?.trim() ||
  'https://docs.google.com/forms/d/e/FORM_ID/viewform';

const SCHOOL_FIELD_KEY =
  process.env.NEXT_PUBLIC_SCHOOL_INTEREST_FORM_SCHOOL_FIELD?.trim() ||
  'entry.SCHOOL_FIELD_ID';

export function buildSchoolInterestUrl(schoolName: string) {
  const url = new URL(FORM_URL);
  url.searchParams.set('usp', 'pp_url');
  if (schoolName) {
    url.searchParams.set(SCHOOL_FIELD_KEY, schoolName);
  }
  return url.toString();
}

export function isSchoolInterestFormConfigured() {
  return !FORM_URL.includes('FORM_ID') && !SCHOOL_FIELD_KEY.includes('SCHOOL_FIELD_ID');
}

export const SCHOOL_INTEREST_FORM_CONFIG = {
  formUrl: FORM_URL,
  schoolFieldKey: SCHOOL_FIELD_KEY,
};
