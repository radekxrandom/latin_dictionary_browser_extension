// https://developer.mozilla.org/en-US/docs/Web/API/Range
let x;
let y;
document.addEventListener(
  'contextmenu',
  event => {
    console.log(window.getSelection().rangeCount);
    if (window.getSelection().rangeCount < 1) {
      return;
    }
    const r = window.getSelection().getRangeAt(0).getBoundingClientRect();
    y = r.top + window.scrollY;
    x = (
      r.right + r.left) / 2 + window.scrollX;
    x -= r.width * 0.2;
    console.log(r);
  },
  true,
);

const createElement = (elementType, attributes, appendableParam = []) => {
  const elem = attributes.reduce((acc, curr) => {
    acc.setAttribute(curr.type, curr.value);
    return acc;
  }, document.createElement(elementType));
  if (appendableParam.length) {
    appendableParam.map(el => elem.append(el));
  }
  return elem;
};

const tooltipWrapper = createElement('div', [{type: 'class', value: 'selection_bubble'}, {
  type: 'id',
  value: 'slectionBbl',
}]);
document.body.appendChild(tooltipWrapper);

const createTranslatedWordsSegment = wordsArr => {
  console.log(wordsArr);
  const translations = wordsArr.reduce((translationList, paragraphWord, i) => {
    let p = document.createElement('p');
    p.append(`${i + 1}. ${paragraphWord}`);
    translationList.append(p);
    return translationList;
  }, document.createElement('div'));
  translations.setAttribute('class', 'translations');
  return translations;
};

const createLatinWordSegment = ({title}) => {
  const latinWordContainer = createElement('div', [{type: 'class', value: 'latin_word'}], [title]);
  const segment = createElement('div', [{type: 'class', value: 'segment'}], [latinWordContainer]);
  return segment;
};

const populateTooltip = (arr, tooltip) => (
  arr.reduce((acc, curr, i) => {
    if (curr.title) {
      const segment = createLatinWordSegment(curr);
      const words = createTranslatedWordsSegment(curr.words);
      segment.append(words);
      acc.append(segment);
    } else {
      const words = createTranslatedWordsSegment(curr.words);
      acc.append(words);
    }
    return acc;
  }, tooltip));

const createTooltip = content => {
  const exitButton = createElement('span', [{type: 'id', value: 'exitButton'}], ['x']);
  const latinWordContainer = createElement('div', [{
    type: 'class',
    value: 'latin_word',
  }], [content.latinWord, exitButton]);
  const tooltip = createElement('div', [{type: 'class', value: 'translationTooltip'}, {
    type: 'id',
    value: 'transTip',
  }], [latinWordContainer]);
  
  const tooltipPopulatedWithTranslations = populateTooltip(content.translations, tooltip);
  return tooltipPopulatedWithTranslations;
};

const renderBubble = (x, y, selection) => {
  
  tooltipWrapper.style.background = '#F1F1F1';
  tooltipWrapper.classList.add('shown');
  const transTooltip = createTooltip(selection);
  tooltipWrapper.append(transTooltip);
  
  const dimensions = tooltipWrapper.getBoundingClientRect();
  
  if (
    dimensions.width + x >=
    (
      window.innerWidth || document.documentElement.clientWidth)
  ) {
    tooltipWrapper.style.left = x - dimensions.width + 'px';
  } else {
    tooltipWrapper.style.left = x + 'px';
  }
  
  if (y - dimensions.height - window.scrollY < 20) {
    tooltipWrapper.style.top = y + 'px';
    tooltipWrapper.style.marginTop = '1em';
    tooltipWrapper.classList.add('arrow_top');
  } else {
    tooltipWrapper.style.top = y - dimensions.height + 'px';
    tooltipWrapper.style.marginTop = '-1em';
    tooltipWrapper.classList.add('arrow_bottom');
  }
  
  document.addEventListener('click', closeOnEitherOutsideOrXClick);
};

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.name === 'showTooltip') {
    renderBubble(x, y, request.translated);
  }
});

const closeTooltip = () => {
  const tooltip = document.getElementsByClassName('selection_bubble')[0];
  tooltip.classList.remove('shown');
  tooltip.style.marginTop = 'unset';
  const element = document.getElementById('transTip');
  tooltip.removeChild(element);
  tooltip.className = 'selection_bubble';
  console.log(tooltip);
};

const closeOnEitherOutsideOrXClick = (e) => {
  const tooltip = document.getElementById('transTip');
  const closeBtn = document.getElementById('exitButton');
  const isInsideTooltip = tooltip?.contains(e.target);
  const isInsideCloseBtn = closeBtn?.contains(e.target);
  if (!isInsideTooltip || isInsideCloseBtn) {
    closeTooltip();
  }
};
