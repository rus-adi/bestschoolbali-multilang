const FORM_URL =
  process.env.NEXT_PUBLIC_SCHOOL_INTEREST_FORM_URL?.trim() ||
  'https://forms.gle/pzrQT9VDd2j3sBN6A';

const SCHOOL_FIELD_KEY =
  process.env.NEXT_PUBLIC_SCHOOL_INTEREST_FORM_SCHOOL_FIELD?.trim() ||
  '';

export function buildSchoolInterestUrl(schoolName: string) {
  const url = new URL(FORM_URL);
  if (schoolName && SCHOOL_FIELD_KEY) {
    url.searchParams.set('usp', 'pp_url');
    url.searchParams.set(SCHOOL_FIELD_KEY, schoolName);
  }
  return url.toString();
}

export function isSchoolInterestFormConfigured() {
  return Boolean(FORM_URL);
}

export const SCHOOL_INTEREST_FORM_CONFIG = {
  formUrl: FORM_URL,
  schoolFieldKey: SCHOOL_FIELD_KEY,
};
