export default {
  insertAt: (value, character, pos) => {
    const arrValue = value.split('');
    arrValue.splice(pos, 0, character);
    return arrValue.join('');
  },
  removeAt: (value, pos) => {
    const arrValue = value.split('');
    arrValue.splice(pos, 1).join('');
    return arrValue.join('');
  },
  replaceAt: (value, index, character) => {
    const lastPos = index + character.length;
    return value.substr(0, index) + character + value.substr(lastPos);
  },
  _parseHTML: (strElem) => {
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = strElem;
    return tmpDiv.firstElementChild;
  },
  _setCursorPosition: (elem, beforeValue, afterValue, nStart) => {
    let pos = nStart;
    const input = elem;
    const splitter = afterValue.replace(/[a-zA-Z0-9*]/g, '');
    const reg = RegExp(`[${splitter}]`, 'gi');
    const beforeMatching = beforeValue.slice(0, nStart).match(reg);
    const beforeMatched = beforeMatching || [];
    const afterMatching = afterValue.slice(0, nStart).match(reg);
    const afterMatched = afterMatching || [];

    if (beforeMatched.length > 0) {
      const nLeng = afterMatched.length - beforeMatched.length;
      pos += nLeng;
    } else {
      pos += afterMatched.length;
    }
    input.selectionStart = pos;
    input.selectionEnd = pos;
  }
}
