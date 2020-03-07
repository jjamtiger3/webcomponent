import { autorun, observable } from 'mobx';
import { fromEvent } from 'rxjs';
import util from '../util/util';
import { patternLibs } from '../util/patternLibs';

class CEdit extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this._value = observable({
      value: null,
    });
  }

  connectedCallback() {
    const length = patternLibs._getPatternLength(this.pattern);
    const html = `
      <div class="container">
        <input maxlength="${length}">
      </div>
    `;
    const elem = util._parseHTML(html);
    this.shadowRoot.appendChild(elem);
    this.__input = this.shadowRoot.querySelector('input');
    _setCSSStyle(this);
    autorun(() => {
      if (this._value.value) {
        const newValue = this._value.value;
        // TODO apply pattern value
        const pattern = this.pattern;
        const _patternedValue = patternLibs._applyPattern(pattern, newValue);
        this._patternedValue = _patternedValue;
        this.__input.value = _patternedValue;
      }
    });
    _addEvents(this);

    function _setCSSStyle(elem) {
      const style = document.createElement('style');
      const css = `
        .container {
          width: 100%;
          height: 100%;
        }
      `;
      style.innerHTML = css;
      elem.shadowRoot.appendChild(style);
    }

    function _addEvents(elem) {
      const input = elem.__input;
      const keydown$ = fromEvent(input, 'keydown');
      const input$ = fromEvent(input, 'input');
      input$.subscribe((inputEvent) => {
        const { target, data } = inputEvent;
        let _data = data;
        const oldValue = elem.value;
        // TODO 삭제 중간 수정 등도 구현해야함. 현재 입력상황만 구현
        elem.value = oldValue + _data;
      });
    }
  }

  get pattern() {
    return this.getAttribute('pattern');
  }

  set pattern(newValue) {
    this.setAttribute('pattern', newValue);
  }

  get value() {
    return this._value.value || '';
  }

  set value(newValue) {
    this._value.value = newValue.toString();
  }

  get type() {
    return this.getAttribute('typep');
  }

  set type(newValue) {
    this.setAttribute('type', newValue);
  }
}
window.customElements.define('custom-editor', CEdit);
