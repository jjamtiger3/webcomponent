import util from './util';

export const patternLibs = {
  _applyPattern: (pattern, value) => {
    const patterns = pattern.split(';');
    const patternLen = patterns.length; // 패턴의 개수
    let firstPatternLen = 0;
    let secondPatternLen = 0;
    let objPattern;
    let _patternedValue = value;

    const splitter = pattern.replace(/[AZ()]/g, '')[0];
    if (splitter) {
      // 첫번째 패턴이 두번째 패턴보다 길이가 길면 두번째 패턴이 먼저 나와야 하므로 위치 교환하는 로직
      if(patternLen > 1) {
        if(patterns[0].replace(/(\W)/g, '').length > patterns[1].replace(/(\W)/g, '').length) {
          var tmp = patterns[0];
          patterns[0] = patterns[1];
          patterns[1] = tmp;
        }
      }

      firstPatternLen = patterns[0].replace(/(\W)/g, '').trim().length; // 첫번째 패턴에서 특수기호를 제거한 실제 패턴의 길이
      objPattern = patternLibs._getExpFromPattern(value, patterns[0], splitter); // 첫번째 패턴을 토대로 정규식과 변환식을 리턴받음

      if(patternLen > 1) {
        // 일단 패턴이 최대 두개라는 가정하에. 추후3개이상인 경우 반복문 처리해야 할듯
        patterns[1] = patterns[1].replace(/[\[\]]/g, '').trim();
        secondPatternLen = patterns[1].replace(/(\W)/g, '').trim().length;

        // 두번째 패턴의 길이가 짧고 실제 값이 두번째 패턴 길이보다 크면 첫번째 패턴값을 적용
        // 첫번째 패턴의 길이가 짧고 실제 값이 첫번째 패턴 길이보다 크면 두번째 패턴값을 적용
        if(firstPatternLen > secondPatternLen && value.length > secondPatternLen || firstPatternLen === secondPatternLen) {
          objPattern = patternLibs._getExpFromPattern(value, patterns[0], splitter);
        } else if (firstPatternLen < secondPatternLen && value.length > firstPatternLen) {
          objPattern = patternLibs._getExpFromPattern(value, patterns[1], splitter);
        }
      }
      // 출력값에 실제값을 정규식 변환한 내용을 저장한다.
      const { regExp, repExp } = objPattern;
      _patternedValue = _patternedValue.replace(regExp, repExp);
    }
    return _patternedValue;
  },
  _applyMasking: (pattern, patternValue) => {
    let applyValue = patternValue;
    const editLen = applyValue.length;
    for (let pos = 0; pos < editLen; pos += 1) {
      if (pattern[pos] === '*') {
        applyValue = util.replaceAt(applyValue, pos, pattern[pos]);
      }
    }
    return applyValue;
  },
  _getPatternLength: (pattern) => {
    let pattLen = 0;
    const arrPatterns = pattern.split(';');
    if (arrPatterns.length > 1) {
      for (let i = 0; i < arrPatterns.length; i += 1) {
        const _pattern = arrPatterns[i];
        if(_pattern) {
          const _pattLen = _pattern.replace(/(\W)/g, '').trim().length; // 패턴에서 특수기호를 제거한 실제 패턴의 길이
          pattLen = pattLen < _pattLen ? _pattern.length : pattLen;
        }
      }
    } else {
      pattLen = pattern.length;
      // 패턴이 AAA-AAA같은 형식이 아니라 A(10)형식일 수 있음
      if (pattern.indexOf('(') > -1) {
        pattLen = pattern.replace(/[a-zA-Z()]/g, '');
      }
    }
    return parseInt(pattLen, 10);
  },
  _getExpFromPattern: (_patternedValue, pattern, splitter) => {
    const _patternPiece = pattern.split(splitter);
    const _pattLen = _patternPiece.length;

    const strExp = [];
    const repExp = [];

    const arrCurrPattern = [];
    const charPatt = patternLibs.type === 'number' ? 'Z' : 'A';
    for (let i = 0; i < _pattLen; i += 1) {
      let _strReg;
      switch (charPatt) {
        case 'Z':
          if (i === 0) { // 첫번째 패턴 영역인 경우 무조건 전체 길이를 받아옴
            _strReg = `(\\d{${_patternPiece[i].length}})`;
            strExp.push(_strReg);
            repExp.push(`$${i + 1}`);
          } else { // 그 외엔 앞에 1, 패턴길이로 받아옴
            _strReg = `(\\d{1,${_patternPiece[i].length}})`;
            strExp.push(_strReg);
            repExp.push(`$${i + 1}`);
          }
          arrCurrPattern.push(_patternPiece[i]);
          break;
        case 'A':
          if (i === 0) { // 첫번째 패턴 영역인 경우 무조건 전체 길이를 받아옴
            _strReg = `(\\w{${_patternPiece[i].length}})`;
            strExp.push(_strReg);
            repExp.push(`$${i + 1}`);
          } else { // 그 외엔 앞에 1, 패턴길이로 받아옴
            _strReg = `(\\w{1,${_patternPiece[i].length}})`;
            strExp.push(_strReg);
            repExp.push(`$${i + 1}`);
          }
          arrCurrPattern.push(_patternPiece[i]);
          break;
        default:
          break;
      }
      // 실제 입력된 값이 현재 길이보다 짧다면 패턴을 만들면 안되므로 break;
      if (_patternedValue.length <= arrCurrPattern.join('').length) {
        break;
      }
    }
    return { // 정규식과 $1-$2-$3같은 변환식을 만들어서 리턴
      // eslint-disable-next-line no-eval
      regExp: new RegExp(eval(`/${strExp.join('')}/g`)),
      repExp: repExp.join(splitter),
    };
  }
}
