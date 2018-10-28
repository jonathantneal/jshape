/**
 * Returns a value as a specific kind of value determined by a shape.
 * @param {*} value - The value being guaranteed as a specific shape.
 * @param {*} shape - The function or value used to shape the value.
 * @param {*} [source] - The source being shaped, which is otherwise the value.
 * @returns {*}
 */

export const asShape = (value, shape, source) => {
	const isOptionalShape = shape instanceof Optional;
	const trueShape = isOptionalShape ? shape.shape : shape;
	const isExplicitShape = typeof trueShape === 'function' || trueShape === undefined;
	const Shape = isExplicitShape ? trueShape : Object(trueShape).constructor;
	const shouldReturnValue = Shape === undefined || isOptionalShape && (value === null || value === undefined);

	return shouldReturnValue
		? value
	: Shape === Object
		? isExplicitShape
			? Object(value) === value
				? value
			: {}
		: asObjectShape(
			value,
			Object(trueShape),
			source
		)
	: Shape === Array
		? isExplicitShape
			? asArray(value)
		: asArrayShape(
			value,
			Object(trueShape),
			source
		)
	: Shape === Boolean
		? Boolean(value)
	: Shape === String
		? asString(value)
	: Shape === Number
		? asNumber(value)
	: Shape === Hashmap
		? asHashmapShape(value, trueShape, source)
	: new Shape(value);
};

/**
 * Returns any value as an array, conditionally preserving the original array.
 * @param {*} value - The value being guaranteed as an array.
 * @returns {Array}
 */

export const asArray = value => Object(value).constructor === Array
	? value
: value === null || value === undefined || value === Object(value)
	? Array.prototype.slice.call(
		Object.assign(
			{
				length: 'length' in Object(value)
					? value.length
				: Object.keys(
					Object(value)
				).length
			},
			value
		)
	)
: [value];

/**
 * Returns an array conditionally shaped as a specific array.
 * @param {*} values - The value being guaranteed as a shaped array.
 * @param {Object|Array} shapes - The function or array used to shape the value.
 * @param {*} [source] - The array being shaped, which is otherwise values.
 * @returns {Array}
 */

const asArrayShape = (values, shapes, source) => Array.prototype.reduce.call(
	asArray(values === undefined ? shapes : values),
	(result, item, index) => {
		const shape = shapes[index] || shapes[shapes.length - 1];

		result[index] = asShape(
			// shape the available key or use a primative fallback
			index in Object(values) || shape === Object(shape)
				? Object(values)[index]
			: shape,
			shape,
			result[index]
		);

		return result;
	},
	asArray(source === undefined ? values : source)
);

/**
 * Returns any value as a boolean.
 * @param {*} value - The value being guaranteed as a primative boolean.
 * @returns {Boolean}
 */

export const asBoolean = value => Boolean(value);

/**
 * Returns any value as a primative number.
 * @param {*} value - The value being guaranteed as a primative number.
 * @returns {Number}
 */

export const asNumber = value => Number(value);

/**
 * Returns an object conditionally shaped as a specific object.
 * @param {*} values - The object being guaranteed as a shaped object.
 * @param {Object|Array} shapes - The object used to shape the values.
 * @param {*} [source] - The object being shaped, which is otherwise values.
 * @returns {Object}
 */

const asObjectShape = (values, shapes, source) => Object.keys(shapes).reduce(
	(result, key) => {
		result[key] = asShape(
			// shape the available key or use a primative fallback
			key in Object(values) || shapes[key] === Object(shapes[key])
				? Object(values)[key]
			: shapes[key],
			shapes[key],
			result[key]
		);

		return result
	},
	Object(source === undefined ? values : source)
);

/**
 * Returns any value as a string.
 * @param {*} value - The value being guaranteed as a primative string.
 * @returns {String}
 */

export const asString = value => value === undefined || value === null
	? ''
: String(value);

/**
 * Returns a hashmap shape for inner element shaping.
 * @param {*} shape - The value being used to guarantee each element in the object hashmap.
 * @param {*} match - The pattern being used to shape hashmap keys.
 * @returns {Boolean}
 */

export const asHashmap = (shape, match) => new Hashmap(shape, match);

const asHashmapShape = (value, hashmap, source) => Object.keys(
	Object(value)
).filter(
	key => hashmap.match.test(key)
).reduce(
	(object, key) => {
		object[key] = asShape(Object(value)[key], hashmap.shape, Object(source)[key]);

		return object;
	},
	{}
);

function Hashmap(shape, match) {
	this.shape = shape;
	this.match = new RegExp(match);
}

/**
 * Returns an optional shape for conditional shaping.
 * @param {*} shape - The value used to conditionally shape another value.
 * @returns {Optional}
 */

export const asOptional = shape => new Optional(shape);

function Optional(shape) {
	this.shape = shape;
}
