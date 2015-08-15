// dispatching ducks
// =================

// demo
// ----
var demo = function () {
	'use strict';

	// Let's define some data, like points for instance;
	// We'll call the 2-dimensional point `vec2` and the 3-dimensional one `vec3`.
	// Remember they're just data - they hold no type/prototype/constructor information.
	var vec2 = { x: 3, y: 4 };
	var vec3 = { x: 2, y: 3, z: 6 };

	// It's unfortunate that we can't invoke operations on these pieces of data.
	// Duck typing is based on the "*if it quacks, walks and flies like a duck it must be a duck*".
	// Notice that all the traits used to discern if it's a "duck" are actions (methods) - there are no
	// mentions of beaks, legs or wings.
	// Our plain pieces of data have no addition, scale or norm methods associated with them and yet,
	// that's what we'd expect to do with something that has an `x` and a `y`.
	console.log(vec2.add(vec3)); // { x: 5, y: 7 }
	console.log(vec2.scale(2)); // { x: 6, y: 8 }
	console.log(vec2.norm()); // 5

	console.log(vec3.norm()); // 7
};


// types & methods setup
// ---------------------
var setup = function () {
	'use strict';

	// You'd expect that anything with a beak should be able to quack - and so
	// we define that everything with an `x` and a `y` should have an `add`,
	// `scale` and `norm` methods associated.
	register('add', ['x', 'y'], function (that) {
		return {
			x: this.x + that.x,
			y: this.y + that.y
		};
	});

	register('scale', ['x', 'y'], function (scale) {
		return {
			x: this.x * scale,
			y: this.y * scale
		};
	});

	register('norm', ['x', 'y'], function () {
		return Math.sqrt(
			this.x * this.x +
			this.y * this.y
		);
	});

	// It's totally OK to have multiple methods sharing the same name
	// as long as they're targeting data with different members.
	// The previous norm method
	register('norm', ['x', 'y', 'z'], function () {
		return Math.sqrt(
			this.x * this.x +
			this.y * this.y +
			this.z * this.z
		);
	});

	// Note that `add` and `scale` were not defined for { x, y, z } objects;
	// instead the `add` and `scale` methods defined for { x, y } objects will be invoked.
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

				if (!found) {
					throw new Error('undefined is not a function'); // the classic
				}

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