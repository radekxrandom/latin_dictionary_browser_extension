const setUpContextMenu = () => {
  chrome.contextMenus.create({
    title: 'Translate "%s" to English',
    id: '123123',
    contexts: ['selection'],
  });
};

chrome.runtime.onInstalled.addListener(() => {
  setUpContextMenu();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  checkTranslation(info.selectionText, tab);
});

const getRoot = async word => {
  const result = await fetch(`https://latinwordnet.exeter.ac.uk/lemmatize/${word}`);
  const resJson = await result.json();
  console.log(resJson);
  const [{lemma: {lemma: root}}] = resJson;
  console.log(root);
  return root;
};

const getTranslation = async word => {
  const result = await fetch(`https://www.online-latin-dictionary.com/latin-english-dictionary.php?parola=${word}`);
  const resText = await result.text();
  let broadMatches = resText.match(/(?<=<span class="english">).*(?=<\/span>)/gi);
  if (!broadMatches) {
    throw new Error();
  }
  const specificMatch = broadMatches[0].match(/<span class="paradigma">/gi);
  if (specificMatch) {
    if (broadMatches.length > 1) {
      broadMatches = broadMatches.slice(1);
    } else {
      throw new Error();
    }
  }
  const translationObj = {
    words: broadMatches,
  }; //matches.map(el => ({word: el}));
  const content = {
    latinWord: word,
    translations: [translationObj],
  };
  return content;
};

const altTranslation = async word => {
  const result = await fetch(`http://www.perseus.tufts.edu/hopper/morph?l=${word}&la=la`);
  const resText = await result.text();
  const translation = resText.match(
    /(?<=<span class="lemma_definition">)[\w,\n\t\s]*(?=(\s+)?<\/span>)/gi,
  );
  const lemma = resText.match(
    /(?<=<div class="lemma_header">[\w,\n\t\s]*<h4 class=\"la\">).*(?=<\/h4>)/gi,
  );
  let content;
  if (lemma.length > 1) {
    const matchedAdditionalDefinitions = [
      ...resText.matchAll(
        /(?<=<h4 class="la">)(\w+)<\/h4>[\w,\n\t\s]*(<span class="lemma_definition">)([,\w\s]*)(?=(\s+)?<\/span>)/gi,
      ),
    ];
    // translatedArr = translation.map(el => el.trim());
    //const data = lemma.map((el, i) => el + " - " + translatedArr[i]);
    const nestedSegments = matchedAdditionalDefinitions.map((el, i) => {
      const index = el[1].length - 1;
      const title = !isNaN(parseInt(el[1][index])) ? el[1].slice(0, index) : el[1];
      const words = el[3].replace(/[↵]+/g, '').trim().split(',');
      const segment = {
        title,
        words,
      };
      return segment;
    });
    content = {
      latinWord: 'Multiple words found',
      translations: nestedSegments,
    };
  } else {
    const translatedArr = translation[0].split(',');
    translatedArr[0] = translatedArr[0].trim();
    content = {
      latinWord: lemma[0],
      translations: [{words: translatedArr}],
    };
  }
  return content;
};

const checkTranslation = async (selection, tab) => {
  let translated;
  const latinWord = selection.trim();
  
  if (latinWord.split(' ').length > 1) {
    chrome.extension.getBackgroundPage().console.log('I can translate only one word at the time');
    console.log('I can translate only one word at the time');
    return;
  }
  try {
    const root = await getRoot(latinWord);
    translated = await getTranslation(root);
  } catch (err) {
    translated = await altTranslation(latinWord);
  }
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    const tabb = tabs[0];
    chrome.tabs.sendMessage(tabb.id, {name: 'showTooltip', translated});
  });
};
