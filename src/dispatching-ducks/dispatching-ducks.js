// dispatching ducks
// =================

// demo
// ----
var demo = function () {
	'use strict';

	console.log(({ x: 3, y: 4 }).length()); // 5

	console.log(({ x: 2, y: 3, z: 6 }).length()); // 7

	console.log('asd'.length); // 3, untouched
};


// types & methods setup
// ---------------------
var setup = function () {
	'use strict';

	register('length', ['x', 'y'], function () {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	});

	register('length', ['x', 'y', 'z'], function () {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	});
};


// dispatching library
// -------------------
var duck = function (window) {
	'use strict';

	// Mapping from method names (strings) to a list of methods,
	// each with its own member requirements.
	var mapping = new Map();


	function isSubset(subset, set) {
		for (var element of subset) {
			if (!set.has(element)) {
				return false;
			}
		}
		return true;
	}


	function findFirst(collection, predicate) {
		for (var element of collection) {
			if (predicate(element)) {
				return element;
			}
		}
		return null;
	}


	function register(name, members, method) {
		var entry = {
			members: members,
			method: method
		};

		if (mapping.has(name)) {
			var entries = mapping.get(name);
			entries.push(entry);

			// We'd like this to be sorted by the number of fields,
			// otherwise methods that require less members get priority.
			// There are plenty of better ways to keep this sorted.
			entries.sort(function (a, b) {
				return b.members.length - a.members.length;
			});
		} else {
			var entries = [entry];
			mapping.set(name, entries);

			Object.prototype[name] = function () {
				var members = new Set(Object.keys(this));

				var found = findFirst(entries, function (entry) {
					return isSubset(entry.members, members);
				});

				// Forward the call to our method.
				return found.method.apply(this, arguments);
			};
		}
	}

	window.register = register;
};

// Tie everything together.
duck(window);
setup();
demo();