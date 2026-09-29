export function InstagramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function PhoneIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.3 3.5h3.2l1.6 4.2-2 1.6a13.5 13.5 0 0 0 6.4 6.4l1.6-2 4.2 1.6v3.2c0 1-.9 1.8-1.9 1.6-4-.6-7.8-2.6-10.7-5.5C3.8 11.7 1.8 7.9 1.2 3.9c-.2-1 .6-1.9 1.6-1.9h1.5z" />
    </svg>
  )
}
