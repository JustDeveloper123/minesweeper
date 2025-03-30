import { classNames } from '@constants/classNames.js';
import { splitClass } from '@/helpers/splitClass.js';

const overlays = document.getElementById('overlays');

const keyboardHideModal = ['Escape'];

export class Modal {
  selectors = {};
  active = false;

  constructor({ root } = {}) {
    this.selectors.root = root || overlays;

    this.init();
  }

  init() {
    this.renderModal();
    this.keyboard();
  }

  keyboard() {
    window.addEventListener('keydown', e => {
      if (this.active && keyboardHideModal.includes(e.code)) {
        this.hide();
      }
    });
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
      ...splitClass('opacity-0 -translate-y-[200%] pointer-events-none'),
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
      ...splitClass('opacity-0 -translate-y-[200%] pointer-events-none'),
    );
  }

  setContent(contentElement) {
    this.selectors.modalContent.innerHTML = '';
    this.selectors.modalContent.appendChild(contentElement);
  }

  renderModal() {
    const overlayElement = document.createElement('div');
    overlayElement.className =
      'fixed top-0 left-0 w-full h-full bg-overlay opacity-0 pointer-events-none transition';
    overlayElement.addEventListener('click', this.hide.bind(this));

    this.selectors.overlay = overlayElement;
    this.selectors.root.appendChild(overlayElement);

    const modalElement = document.createElement('div');
    modalElement.classList.add(classNames.modal);
    modalElement.innerHTML = `<div>
        <div class="${classNames.modalTopBar}">
          <button><span>&times;</span></button>
        </div>
        <div class="${classNames.modalContent}"><div>
      </div>`;

    // Add close event
    modalElement
      .querySelector(`.${classNames.modalTopBar} > button`)
      .addEventListener('click', this.hide.bind(this));

    const modalWrapperElement = document.createElement('div');
    modalWrapperElement.className =
      'fixed top-0 left-0 w-full h-full py-5 px-3 grid place-items-center bg-transparent z-50 pointer-events-none';
    modalWrapperElement.appendChild(modalElement);

    this.selectors.modal = modalElement;
    this.selectors.modalContent = modalElement.querySelector(
      '.' + classNames.modalContent,
    );
    this.selectors.root.appendChild(modalWrapperElement);
  }
}
