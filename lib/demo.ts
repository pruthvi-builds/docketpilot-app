// Shared constants for the public read-only demo firm. The firm ID is fixed
// (rather than looked up by email) so middleware.ts can block mutating
// requests to it without needing a database call on the Edge runtime.
export const DEMO_FIRM_ID = "demo-firm-fixed-id-docketpilot";
export const DEMO_USER_EMAIL = "demo-viewer@docketpilot.app";
