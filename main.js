const setUpContextMenu = () => {
	chrome.contextMenus.create({
		title: "Translate \"%s\" to English",
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
	const matches = resText.match(/(?<=<span class="english">).*(?=<\/span>)/gi);
	if (!matches) {
		throw new Error();
	}
	const content = {
		latinWord: word,
		translations: matches
	};
	return content;
};

const altTranslation = async word => {
	const result = await fetch(
		`http://www.perseus.tufts.edu/hopper/morph?l=${word}&la=la`,
		{
			headers: {
				"x-requested-with": "XMLHttpRequest",
				Origin: "*"
			}
		}
	);
	const resText = await result.text();
	const translation = resText.match(
		/(?<=<span class="lemma_definition">)[\w,\n\t\s]*(?=(\s+)?<\/span>)/gi
	);
	const lemma = resText.match(/(?<=<h4 class=\"la\">).*(?=<\/h4>)/gi);
	console.log(lemma);
	console.log(translation);
	let translatedArr;
	let content;
	if (lemma.length > 1) {
		translatedArr = translation.map(el => el.trim());
		const data = lemma.map((el, i) => el + " - " + translatedArr[i]);
		content = {
			latinWord: "Multiple words found",
			translations: data
		};
	} else {
		translatedArr = translation[0].split(",");
		translatedArr[0] = translatedArr[0].trim();
		content = {
			latinWord: lemma[0],
			translations: translatedArr
		};
	}
	console.log(translatedArr);
	console.log(content);
	return content;
};

const checkTranslation = async (selection, tab) => {
	if (selection.split(" ").length > 1) {
		chrome.extension.
			getBackgroundPage().
			console.log("I can translate only one word at the time");
		console.log("I can translate only one word at the time");
		return;
	}
	let translated;
	const latinWord = selection.trim();
	/*
	 *	if (selection.match(/(?<=\w)que$/)) {
	 *	latinWord = selection.match(/(\w+)que$/)[1];
	 *	}
	 */
	try {
		const root = await getRoot(latinWord);
		translated = await getTranslation(root);
	} catch (err) {
		console.log(err);
		translated = await altTranslation(latinWord);
	}
	console.log(selection);
	console.log(latinWord);
	console.table(translated);
	console.dir(tab);
	console.log(tab.id);
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		const tabb = tabs[0];
		chrome.tabs.sendMessage(tabb.id, {name: "showTooltip", translated});
	});
};
