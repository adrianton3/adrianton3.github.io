(function () {
	'use strict';

	// JavaScript does not have support for enums and most projects that rely on them
	// have ad-hoc implementations. Most simple implementations are vulnerable to bugs
	// caused by simple typos; take the following example:

	// Bananas can be in one of four states: green, yellow, spotty or brown.
	// We'd like to write a function that tells if a banana is just right (yellow).

	(function enumExample1() {
		// Candidate function number one: notice the type in *yellow*.
		// This function will never return true and we won't figure that out until the
		// code is tested thoroughly (for each and every state a banana can be).
		// While stumbling upon code like this one might wonder what other states a banana
		// can be in. This is very hard to dig up out unless it is documented somewhere.
		function justRight(bananaState) {
			return bananaState === 'yeallow';
		}

		// ### use
		console.log(justRight('green')); // false
		console.log(justRight('yellow')); // false
	})();

	(function enumExample2() {
		var BANANA_STATE = {
			GREEN: 'green',
			YELLOW: 'yellow',
			SPOTTY: 'spotty',
			BROWN: 'brown'
		};

		// Can we do better? How about putting all valid values in an enum-like object?
		// Since *YEALLOW* is mistyped again it evaluates to `undefined` so the function
		// returns false no matter what the input is. The syntax is acceptable - it's
		// not as terse as in the previous example but simple enough and one can
		// inspect `BANANA_STATE` while debugging to see all possible values.
		function justRight(bananaState) {
			return bananaState === BANANA_STATE.YEALLOW;
		}

		// ### use
		console.log(justRight(BANANA_STATE.GREEN)); // false
		console.log(justRight(BANANA_STATE.YELLOW)); // false
	})();

	(function enumExample3() {
		var BANANA_STATE_GREEN = 'green';
		var BANANA_STATE_YELLOW = 'yellow';
		var BANANA_STATE_SPOTTY = 'spotty';
		var BANANA_STATE_BROWN = 'brown';

		// If banana states instead are declared as individual variables then an error
		// will be signaled as soon as the code is executed. What's not so attractive
		// now is that all banana states have to be all declared at the same level and
		// not packed nicely in their own *namespace*. Importing and exporting them to
		// other modules is going to be a pain as well.
		function justRight(bananaState) {
			return bananaState === BANANA_STATE_YEALLOW;
		}

		// ### use
		try {
			console.log(justRight(BANANA_STATE_GREEN)); // exception, good!
			console.log(justRight(BANANA_STATE_YELLOW)); // exception, good!
		} catch (ex) {
			console.log(ex);
		}
	})();

	(function enumExample4() {
		var BANANA_STATE = createEnum(['green', 'yellow', 'spotty', 'brown']);

		// If `BANANA_STATE` is a function that verifies that *yeallow* is valid or not
		// then the bug is revealed as soon as the function executes. The syntax however
		// is alien for just using an enum.
		function justRight(bananaState) {
			return bananaState === BANANA_STATE('yeallow');
		}

		// ### use
		try {
			console.log(justRight(BANANA_STATE('green'))); // exception, good!
			console.log(justRight(BANANA_STATE('yellow'))); // exception, good!
		} catch (ex) {
			console.log(ex);
		}

		// ### implementation
		function createEnum(keys) {
			var map = {};

			keys.forEach(function (key) {
				map[key] = Symbol();
			});

			return function (key) {
				if (map[key]) {
					throw new Error(key + ' not a valid enum value');
				}

				return map[key];
			};
		}
	})();

	(function enumExample5() {
		var BANANA_STATE = createEnum(['GREEN', 'YELLOW', 'SPOTTY', 'BROWN']);

		// This looks exactly like `enumExample2` however BANANA_STATE is not a simple
		// object anymore. It's a proxy with a defined `get` handle. The handle itself
		// is a function and it can do the same check as the in the case of `enumExample4`.
		function justRight(bananaState) {
			return bananaState === BANANA_STATE.YEALLOW;
		}

		// ### use
		try {
			console.log(justRight(BANANA_STATE.GREEN)); // exception, good!
			console.log(justRight(BANANA_STATE.YELLOW)); // exception, good!
		} catch (ex) {
			console.log(ex);
		}

		// ### implementation
		function createEnum(keys) {
			var map = {};

			keys.forEach(function (key) {
				map[key] = Symbol();
			});

			return new Proxy(map, {
				get: function (target, property) {
					if (map[property]) {
						throw new Error(property + ' not a valid enum value');
					}

					return map[property];
				}
			});
		}
	})();
})();