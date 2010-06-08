function getHead() {
	return document.getElementsByTagName('head')[0];
}

function makeStyle(css) {
	var style = document.createElement('style');
	style.type = 'text/css';
	style.appendChild(document.createTextNode(css));
	return style;
}

function injectCSS(css) {
	var head = getHead();
	if (!head) return;
	head.appendChild(makeStyle(css));
}

function Toggle(element) {
	this.on = false;

	this.turnOn = function() {
		if (!this.on) {
			element.className += ' gm_obnoxious';
			this.on = true;
		}
	};

	this.turnOff = function() {
		if (this.on) {
			element.className = element.className.replace("gm_obnoxious", "");
			this.on = false;
		}
	};

	this.toggle = function() {
		if (this.on) {
			this.turnOff();
		} else {
			this.turnOn();
		}
	};

	this.makeToggler = function(text) {
		var self = this;
		var togglerContainer = document.createElement('p');
		var toggler = document.createElement('a');
		toggler.href = "javascript:void(0);";
		toggler.addEventListener("click", function() { self.toggle(); }, false);
		toggler.innerHTML = text || 'toggle';
		togglerContainer.appendChild(toggler);
		return togglerContainer;
	};
}

function hideSingleComment(comment, descr) {
	var content = comment.getElementsByTagName('p')[0];
	var toggle = new Toggle(content);
	toggle.turnOn();
	comment.insertBefore(toggle.makeToggler(descr), content);
}

safari.self.addEventListener("message", function(e) {
    if (e.name == "hide-comments") {
		var commentHideStyle = e.message;

		injectCSS(".gm_obnoxious { display : none !important; }");

		var aboutSection = document.getElementById("DiscussPhoto");

		var commentsSection = document.evaluate(".//div[.//div/@class='comment-block']", aboutSection,
		                                        null, XPathResult.ANY_UNORDERED_NODE_TYPE, null)
		    .singleNodeValue;

		var numberOfComments = document.evaluate("count(//div[@class='comment-block'])", document,
		                                         null, XPathResult.NUMBER_TYPE, null)
		    .numberValue;

		var obnoxiousCommentsType = {"group-links": { expression: ".//a[contains(@href, 'flickr.com/groups')]",
		                                              singular: "group link",
		                                              plural: "group links" },
		                             "images":      { expression: "p//img",
		                                              singular: "image",
		                                              plural: "images" }
		                            } [commentHideStyle];

		if (!obnoxiousCommentsType) {
			throw "Unknown comment hide style: " + commentHideStyle;
		}

		var obnoxiousComments = document.evaluate(".//div[@class='comment-content' and " + obnoxiousCommentsType.expression + "]",
		                                          commentsSection,
		                                          null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

		var commentsHider = new Toggle(commentsSection);
		commentsHider.turnOn();
		aboutSection.insertBefore(commentsHider.makeToggler
		                          ("(toggle " + numberOfComments + " comment"
		                           + (numberOfComments == 1 ? "" : "s") + ", "
		                           + obnoxiousComments.snapshotLength + " with " + obnoxiousCommentsType.plural + ")")
		                          , commentsSection);

		var linkText = "toggle comment with " + obnoxiousCommentsType.singular;
		for (var i = 0; i < obnoxiousComments.snapshotLength; i++) {
			hideSingleComment(obnoxiousComments.snapshotItem(i), linkText);
		}
    }
}, false);

safari.self.tab.dispatchMessage("maybe-hide-comments", null);
