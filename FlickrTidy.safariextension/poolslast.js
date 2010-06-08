safari.self.addEventListener("message", function(e) {
	if (e.name == "pools-last") {
		var pools = document.getElementById("otherContexts_div");
		if (pools) {
			var poolsParent = pools.parentNode;
			poolsParent.removeChild(pools);
			poolsParent.insertBefore(pools, poolsParent.lastChild);
		}
	}
}, false);

safari.self.tab.dispatchMessage("maybe-pools-last", null);
