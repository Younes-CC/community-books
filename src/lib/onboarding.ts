export const ONBOARDING_STORAGE_KEY = "readdeen4free.onboarding.v1";
export const ONBOARDING_OPEN_EVENT = "readdeen:open-onboarding";

// Runs before first paint (inline <script> on the homepage) so returning visitors never see the overlay.
export const ONBOARDING_BOOT_SCRIPT = `try{if(localStorage.getItem("${ONBOARDING_STORAGE_KEY}"))document.documentElement.setAttribute("data-onboarding","seen")}catch(e){}`;
