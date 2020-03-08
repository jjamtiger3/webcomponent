import { autorun, observable } from 'mobx';
import { merge, fromEvent } from 'rxjs';
import util from '../util/util';
import { patternLibs } from '../util/patternLibs';

class CEdit extends HTMLElement {
  constructor() {
    super();
    this._value = observable({
      value: null,
    });
    this._patternedValue = '';
  }

  connectedCallback() {
    const length = patternLibs._getPatternLength(this.pattern || '');
    const html = `
      <div class="container">
        <input maxlength="${length}">
      </div>
    `;
    const elem = util._parseHTML(html);
    this.appendChild(elem);
    this.__input = this.querySelector('input');

    autorun(() => {
      if (this._value.value) {
        const newValue = this._value.value;
        // TODO apply pattern value
        const pattern = this.pattern;
        const _patternedValue = patternLibs._applyPattern(pattern, newValue);
        this._patternedValue = _patternedValue;
        this.__input.value = patternLibs._applyMasking(pattern, _patternedValue);
      }
    });
    _addEvents(this);

    function _addEvents(elem) {
      const input = elem.__input;
      const input$ = fromEvent(input, 'input');
      input$.subscribe((inputEvent) => {
        const { target, data } = inputEvent;
        let pos = target.selectionStart;
        let _data = data;
        const { _patternedValue } = elem;

        let newValue;
        if (_data) {
          // 캐럿 위치에 삽입 구현. input과 _patternedValue의 값의 길이는 동일하므로 캐럿위치의 값을 수정하며 됨
          newValue = util.insertAt(_patternedValue, _data, pos - 1);
          pos += 1;
        } else {
          // 문자열을 삭제하는 경우
          newValue = util.removeAt(_patternedValue, pos);
        }
        // 원래 값을 editor의 _value에 할당하면 자동으로 패턴적용
        elem._value.value = newValue.replace(/[^0-9a-zA-Z.]/g, '');
        util._setCursorPosition(input, _patternedValue, newValue, pos);
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
