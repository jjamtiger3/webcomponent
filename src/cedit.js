import { autorun, observable } from 'mobx';

class CEdit extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this._value = observable({
      value: null,
    });
  }

  connectedCallback() {
    const html = `
      <div class="container">
        <input>
      </div>
    `;
    const elem = this._parseHTML(html);
    this._setCSSStyle();
    this.shadowRoot.appendChild(elem);
    this.__input = this.shadowRoot.querySelector('input');
    autorun(() => {
      if (this._value.value) {
        const newValue = this._value.value;
        // TODO apply pattern value
        const patternedValue = `$${newValue}`;
        this.patternedValue = patternedValue;
        this.__input.value = patternedValue;
      }
    });
  }

  get value() {
    return this._value.value || '';
  }

  set value(newValue) {
    this._value.value = newValue;
  }

  _parseHTML(strElem) {
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = strElem;
    return tmpDiv.firstElementChild;
  }

  _setCSSStyle() {
    const style = document.createElement('style');
    const css = `
      .container {
        width: 100%;
        height: 100%;
      }
    `;
    style.innerHTML = css;
    this.shadowRoot.appendChild(style);
  }
}
window.customElements.define('c-edit', CEdit);
