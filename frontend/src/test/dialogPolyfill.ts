/**
 * jsdom does not implement HTMLDialogElement.showModal/close. This mimics what
 * browsers do closely enough for component tests: toggle `open`, focus the
 * autofocus (or first focusable) element, and fire `close`.
 */
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
    const target =
      this.querySelector<HTMLElement>('[autofocus]') ?? this.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus();
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
