let x;
let y;
const bubbleDOM = document.createElement("div");
bubbleDOM.setAttribute("class", "selection_bubble");
const xpkej = document.createElement("div");
document.body.appendChild(bubbleDOM);

document.addEventListener(
	"contextmenu",
	event => {
		const r = window.
			getSelection().
			getRangeAt(0).
			getBoundingClientRect();
		y = r.top + window.scrollY;
		x = (r.right + r.left) / 2 + window.scrollX;
		x -= r.width * 0.2;
		console.log(r);
	},
	true
);

const closeTooltip = e => {
	const tooltip = document.getElementsByClassName("selection_bubble")[0];
	//tooltip.style.visibility = "hidden";
	tooltip.classList.remove("shown");
	bubbleDOM.style.marginTop = "unset";
	tooltip.className = "selection_bubble";
	console.log(tooltip);
};

const createTranslatedHtml = wordsArr => {
	console.log(wordsArr);
	let word = "";
	for (let i = 0; i < wordsArr.length; i++) {
		word += `<p>${i}. ${wordsArr[i]}</p> \n`;
	}
	return word;
};

const closeOnClickOutside = e => {
	const tooltip = document.getElementById("transTip");
	const closeBtn = document.getElementById("closebtn");
	const checkTooltip = tooltip.contains(e.target);
	const checkBtn = closeBtn.contains(e.target);
	if (!checkTooltip || checkBtn) {
		closeTooltip();
	}
};

const renderBubble = (x, y, selection) => {
	const trs = createTranslatedHtml(selection.translations);
	//bubbleDOM.style.padding = "0.4rem";
	bubbleDOM.style.background = "#f1f1f1";
	//bubbleDOM.style.visibility = "visible";
	bubbleDOM.classList.add("shown");
	bubbleDOM.innerHTML = `
  <div class='translationTooltip' id='transTip'>
    <div class='latin_word'>${selection.latinWord} <span id="closebtn">x</span></div>
    <div class='translations'>${trs}</div>
  </div>
  `;

	const dimensions = bubbleDOM.getBoundingClientRect();

	if (
		dimensions.width + x >=
    (window.innerWidth || document.documentElement.clientWidth)
	) {
		bubbleDOM.style.left = x - dimensions.width + "px";
	} else {
		bubbleDOM.style.left = x + "px";
	}

	if (y - dimensions.height - window.scrollY < 20) {
		bubbleDOM.style.top = y + "px";
		bubbleDOM.style.marginTop = "1em";
		bubbleDOM.classList.add("arrow_top");
	} else {
		bubbleDOM.style.top = y - dimensions.height + "px";
		bubbleDOM.style.marginTop = "-1em";
		bubbleDOM.classList.add("arrow_bottom");
	}

	document.addEventListener("click", closeOnClickOutside);
};

const adjustModalForPdf = () => {
	console.log("pach");
	bubbleDOM.style.top = "30%";
	bubbleDOM.style.left = "50%";
	bubbleDOM.style.transform = "translate(-50%, 0%)";
	bubbleDOM.style.position = "fixed";
	bubbleDOM.style.zIndex = "10";
};

chrome.runtime.onMessage.addListener((request, sender) => {
	if (request.name === "showTooltip") {
		const pdfRegex = /^.*\.(doc|DOC|pdf|PDF)$/;
		const path = window.location.pathname;
		const isPdf = pdfRegex.test(path);
		renderBubble(x, y, request.translated);
		isPdf && adjustModalForPdf();
	}
});
