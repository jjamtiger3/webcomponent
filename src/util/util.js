export default {
  replaceAt: (value, index, character) => {
    const lastPos = index + character.length;
    return value.substr(0, index) + character + value.substr(lastPos);
  },
  _parseHTML: (strElem) => {
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = strElem;
    return tmpDiv.firstElementChild;
  }

}
