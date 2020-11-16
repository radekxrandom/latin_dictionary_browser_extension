const setUpContextMenus = () => {
  /*  chrome.contextMenus.create({
      type: "separator",
      id: "sep1",
      contexts: ["selection"]
    }); */
  chrome.contextMenus.create({
    title: 'Translate "%s" to English',
    id: "123123",
    contexts: ["selection"],
    onclick: (info, tab) => {
      checkTranslation(info.selectionText);
    }
  });
};

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    title: 'Translate "%s" to English',
    id: "123123",
    contexts: ["selection"]
  });
  //setUpContextMenus();
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
/*   `https://cors-anywhere.herokuapp.com/https://www.online-latin-dictionary.com/latin-english-dictionary.php?parola=${word}`, */

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
  console.log(matches);
  console.log(matches[0]);
  const content = {
    latinWord: word,
    translations: matches
  };
  return content;
};

const checkTranslation = async (selection, tab) => {
  //alert(selection);
  /*chrome.tabs.sendMessage(tab.id, "getClickedEl", function(cords) {
    let { x, y } = cords;
    console.log(x);
    console.log(y);
  });*/
  if (selection.split(" ").length > 1) {
    chrome.extension
      .getBackgroundPage()
      .console.log("I can translate only one word at the time");
    console.log("I can translate only one word at the time");
    return;
  }
  console.log(chrome.tabs.url);
  chrome.extension.getBackgroundPage().console.log(selection);
  chrome.tabs.executeScript({ code: "console.log('test');" }, () => {
    console.log("test");
  });
  const root = await getRoot(selection);
  const translated = await getTranslation(root);
  console.log(selection);
  chrome.tabs.sendMessage(tab.id, { name: "getClickedEl", msg: translated });
};
