import { classNames } from '@constants/classNames.js';
import { splitClass } from '@/helpers/splitClass.js';

const overlays = document.getElementById('overlays');

export class Modal {
  selectors = {};
  active = false;

  constructor({ root } = {}) {
    this.selectors.root = root || overlays;
    this.renderModal();
  }

  show() {
    this.active = true;
    document.body.classList.add('overflow-hidden');
    this.selectors.overlay.classList.remove(
      ...splitClass('opacity-0 pointer-events-none'),
    );
    this.selectors.overlay.classList.add(
      ...splitClass('opacity-100 pointer-events-auto'),
    );
    this.selectors.modal.classList.remove(
      ...splitClass('opacity-0 pointer-events-none'),
    );
    this.selectors.modal.classList.add(
      ...splitClass('opacity-100 pointer-events-auto'),
    );
  }

  hide() {
    this.active = false;
    document.body.classList.remove('overflow-hidden');
    this.selectors.overlay.classList.remove(
      ...splitClass('opacity-100 pointer-events-auto'),
    );
    this.selectors.overlay.classList.add(
      ...splitClass('opacity-0 pointer-events-none'),
    );
    this.selectors.modal.classList.remove(
      ...splitClass('opacity-100 pointer-events-auto'),
    );
    this.selectors.modal.classList.add(
      ...splitClass('opacity-0 pointer-events-none'),
    );
  }

  setContent() {}

  renderModal() {
    const overlayElement = document.createElement('div');
    overlayElement.className =
      'fixed top-0 left-0 w-full h-full bg-overlay opacity-0 pointer-events-none transition';
    overlayElement.addEventListener('click', this.hide.bind(this));

    this.selectors.overlay = overlayElement;
    this.selectors.root.appendChild(overlayElement);

    const modalElement = document.createElement('div');
    modalElement.classList.add('modal');

    const modalWrapperElement = document.createElement('div');
    modalWrapperElement.className =
      'fixed top-0 left-0 w-full h-full grid place-items-center bg-transparent z-50 pointer-events-none';
    modalWrapperElement.appendChild(modalElement);

    this.selectors.modal = modalElement;
    this.selectors.root.appendChild(modalWrapperElement);
  }
}
