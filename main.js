const setUpContextMenu = () => {
  chrome.contextMenus.create({
    title: 'Translate "%s" to English',
    id: "123123",
    contexts: ["selection"]
  });
};

chrome.runtime.onInstalled.addListener(() => {
  setUpContextMenu();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  checkTranslation(info.selectionText, tab);
});

const getRoot = async word => {
  const result = await fetch(
    `https://latinwordnet.exeter.ac.uk/lemmatize/${word}`,
    {
      headers: {
        "x-requested-with": "XMLHttpRequest",
        Origin: "*"
      }
    }
  );
  const resJson = await result.json();
  console.log(resJson);
  const root = resJson[0].lemma.lemma;
  console.log(root);
  return root;
};

const getTranslation = async word => {
  const result = await fetch(
    `https://www.online-latin-dictionary.com/latin-english-dictionary.php?parola=${word}`,
    {
      headers: {
        "x-requested-with": "XMLHttpRequest",
        Origin: "*"
      }
    }
  );
  const resText = await result.text();
  const matches = resText.match(
    /(?<=\<span class=\"english\">).*(?=\<\/span>)/gi
  );
  const content = {
    latinWord: word,
    translations: matches
  };
  return content;
};

const checkTranslation = async (selection, tab) => {
  if (selection.split(" ").length > 1) {
    chrome.extension
      .getBackgroundPage()
      .console.log("I can translate only one word at the time");
    console.log("I can translate only one word at the time");
    return;
  }

  const root = await getRoot(selection);
  const translated = await getTranslation(root);
  console.log(selection);
  chrome.tabs.sendMessage(tab.id, { name: "showTooltip", translated });
};
