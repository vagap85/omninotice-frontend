export const MAILING_DRAFT_KEY = "omni_notice_mailing_draft";

/** Сбрасывает черновик при перезагрузке вкладки; при SPA-навигации не вызывается. */
export function registerClearMailingDraftBeforeUnload(): () => void {
  const clear = () => {
    sessionStorage.removeItem(MAILING_DRAFT_KEY);
  };
  window.addEventListener("beforeunload", clear);
  return () => window.removeEventListener("beforeunload", clear);
}
