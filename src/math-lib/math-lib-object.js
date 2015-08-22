window.Vec3Object = (function () {
	'use strict';

	function Vec3(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	Vec3.prototype.add = function (that) {
		return new Vec3(
			this.x + that.x,
			this.y + that.y,
			this.z + that.z
		);
	};

	Vec3.prototype.addBang = function (that) {
		this.x += that.x;
		this.y += that.y;
		this.z += that.z;

		return this;
	};

	Vec3.prototype.scale = function (factor) {
		return new Vec3(
			this.x * factor,
			this.y * factor,
			this.z * factor
		);
	};

	Vec3.prototype.scaleBang = function (factor) {
		this.x *= factor;
		this.y *= factor;
		this.z *= factor;

		return this;
	};

	Vec3.prototype.length = function () {
		return Math.sqrt(
			this.x * this.x +
			this.y * this.y +
			this.z * this.z
		);
	};

	Vec3.prototype.clone = function () {
		return new Vec3(
			this.x,
			this.y,
			this.z
		);
	};

	return Vec3;
})();