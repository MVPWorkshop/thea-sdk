/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
// these functions are copied from lodash and don't need to be tested by us

/**
 * Pads `string` on the right side if it's shorter than `length`. Padding
 * characters are truncated if they exceed `length`.
 *
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to pad.
 * @param {number} [length=0] The padding length.
 * @param {string} [chars=' '] The string used as padding.
 * @returns {string} Returns the padded string.
 * @example
 *
 * padEnd('abc', 6)
 * // => 'abc   '
 *
 * padEnd('abc', 6, '_-')
 * // => 'abc_-_'
 *
 * padEnd('abc', 2)
 * // => 'abc'
 */
export function padEnd(string: string, length: number, chars: string): string {
	const strLength = length ? stringSize(string) : 0;
	return length && strLength < length ? string + createPadding(length - strLength, chars) : string || "";
}
/**
 * Creates the padding for `string` based on `length`. The `chars` string
 * is truncated if the number of characters exceeds `length`.
 *
 * @private
 * @param {number} length The padding length.
 * @param {string} [chars=' '] The string used as padding.
 * @returns {string} Returns the padding for `string`.
 */
function createPadding(length: number, chars: string): string {
	chars = chars === undefined ? " " : baseToString(chars);

	const charsLength = chars.length;
	if (charsLength < 2) {
		return charsLength ? repeat(chars, length) : chars;
	}
	const result = repeat(chars, Math.ceil(length / stringSize(chars)));
	return hasUnicode(chars) ? castSlice(stringToArray(result), 0, length).join("") : result.slice(0, length);
}

/**
 * Converts `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function stringToArray(string: string) {
	return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
}
/**
 * Converts a Unicode `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function unicodeToArray(string: string) {
	return string.match(reUnicode) || [];
}

/**
 * Pads `string` on the left side if it's shorter than `length`. Padding
 * characters are truncated if they exceed `length`.
 *
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to pad.
 * @param {number} [length=0] The padding length.
 * @param {string} [chars=' '] The string used as padding.
 * @returns {string} Returns the padded string.
 * @example
 *
 * padStart('abc', 6)
 * // => '   abc'
 *
 * padStart('abc', 6, '_-')
 * // => '_-_abc'
 *
 * padStart('abc', 2)
 * // => 'abc'
 */
export function padStart(string: string, length: number, chars: string) {
	const strLength = length ? stringSize(string) : 0;
	return length && strLength < length ? createPadding(length - strLength, chars) + string : string || "";
}
/**
 * Converts an ASCII `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function asciiToArray(string: string) {
	return string.split("");
}
/**
 * Casts `array` to a slice if it's needed.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {number} start The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the cast slice.
 */
function castSlice(array: any[], start: number, end: number) {
	const { length } = array;
	end = end === undefined ? length : end;
	return !start && end >= length ? array : slice(array, start, end);
}
/**
 * Creates a slice of `array` from `start` up to, but not including, `end`.
 *
 * **Note:** This method is used instead of
 * [`Array#slice`](https://mdn.io/Array/slice) to ensure dense arrays are
 * returned.
 *
 * @since 3.0.0
 * @category Array
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position. A negative index will be treated as an offset from the end.
 * @param {number} [end=array.length] The end position. A negative index will be treated as an offset from the end.
 * @returns {Array} Returns the slice of `array`.
 * @example
 *
 * var array = [1, 2, 3, 4]
 *
 * _.slice(array, 2)
 * // => [3, 4]
 */
function slice(array: any[], start: number | null, end: number) {
	let length = array == null ? 0 : array.length;
	if (!length) {
		return [];
	}
	start = start == null ? 0 : start;
	end = end === undefined ? length : end;

	if (start < 0) {
		start = -start > length ? 0 : length + start;
	}
	end = end > length ? length : end;
	if (end < 0) {
		end += length;
	}
	length = start > end ? 0 : (end - start) >>> 0;
	start >>>= 0;

	let index = -1;
	const result = new Array(length);
	while (++index < length) {
		// eslint-disable-next-line security/detect-object-injection
		result[index] = array[index + start];
	}
	return result;
}
/**
 * Repeats the given string `n` times.
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to repeat.
 * @param {number} [n=1] The number of times to repeat the string.
 * @returns {string} Returns the repeated string.
 * @example
 *
 * repeat('*', 3)
 * // => '***'
 *
 * repeat('abc', 2)
 * // => 'abcabc'
 *
 * repeat('abc', 0)
 * // => ''
 */
function repeat(string: string, n: number) {
	let result = "";
	if (!string || n < 1 || n > Number.MAX_SAFE_INTEGER) {
		return result;
	}
	// Leverage the exponentiation by squaring algorithm for a faster repeat.
	// See https://en.wikipedia.org/wiki/Exponentiation_by_squaring for more details.
	do {
		if (n % 2) {
			result += string;
		}
		n = Math.floor(n / 2);
		if (n) {
			string += string;
		}
	} while (n);

	return result;
}
/** Used as references for various `Number` constants. */
const INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
const symbolToString = Symbol.prototype.toString;

/**
 * The base implementation of `toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value: any): string {
	// Exit early for strings to avoid a performance hit in some environments.
	if (typeof value === "string") {
		return value;
	}
	if (Array.isArray(value)) {
		// Recursively convert values (susceptible to call stack limits).
		return `${value.map(baseToString)}`;
	}
	if (isSymbol(value)) {
		return symbolToString ? symbolToString.call(value) : "";
	}
	const result = `${value}`;
	return result === "0" && 1 / value === -INFINITY ? "-0" : result;
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * isSymbol(Symbol.iterator)
 * // => true
 *
 * isSymbol('abc')
 * // => false
 */
function isSymbol(value: any): boolean {
	const type = typeof value;
	return type == "symbol" || (type === "object" && value != null && getTag(value) == "[object Symbol]");
}
const toString = Object.prototype.toString;

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function getTag(value: null | undefined) {
	if (value == null) {
		return value === undefined ? "[object Undefined]" : "[object Null]";
	}
	return toString.call(value);
}
/**
 * Gets the number of symbols in `string`.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {number} Returns the string size.
 */
function stringSize(string: string): number {
	return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
}
/** Used to compose unicode character classes. */
const rsAstralRange = "\\ud800-\\udfff";
const rsComboMarksRange = "\\u0300-\\u036f";
const reComboHalfMarksRange = "\\ufe20-\\ufe2f";
const rsComboSymbolsRange = "\\u20d0-\\u20ff";
const rsComboMarksExtendedRange = "\\u1ab0-\\u1aff";
const rsComboMarksSupplementRange = "\\u1dc0-\\u1dff";
const rsComboRange =
	rsComboMarksRange +
	reComboHalfMarksRange +
	rsComboSymbolsRange +
	rsComboMarksExtendedRange +
	rsComboMarksSupplementRange;
const rsVarRange = "\\ufe0e\\ufe0f";

/** Used to compose unicode capture groups. */
const rsZWJ = "\\u200d";

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
// eslint-disable-next-line no-misleading-character-class
const reHasUnicode = RegExp(`[${rsZWJ + rsAstralRange + rsComboRange + rsVarRange}]`);

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode(string: string): boolean {
	return reHasUnicode.test(string);
}
/**
 * Gets the size of an ASCII `string`.
 *
 * @private
 * @param {string} string The string inspect.
 * @returns {number} Returns the string size.
 */
function asciiSize(string: string): number {
	return string.length;
}
/** Used to compose unicode capture groups. */
const rsAstral = `[${rsAstralRange}]`;
const rsCombo = `[${rsComboRange}]`;
const rsFitz = "\\ud83c[\\udffb-\\udfff]";
const rsModifier = `(?:${rsCombo}|${rsFitz})`;
const rsNonAstral = `[^${rsAstralRange}]`;
const rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
const rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";

/** Used to compose unicode regexes. */
const reOptMod = `${rsModifier}?`;
const rsOptVar = `[${rsVarRange}]?`;
const rsOptJoin = `(?:${rsZWJ}(?:${[rsNonAstral, rsRegional, rsSurrPair].join("|")})${rsOptVar + reOptMod})*`;
const rsSeq = rsOptVar + reOptMod + rsOptJoin;
const rsNonAstralCombo = `${rsNonAstral}${rsCombo}?`;
const rsSymbol = `(?:${[rsNonAstralCombo, rsCombo, rsRegional, rsSurrPair, rsAstral].join("|")})`;

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
const reUnicode = RegExp(`${rsFitz}(?=${rsFitz})|${rsSymbol + rsSeq}`, "g");

/**
 * Gets the size of a Unicode `string`.
 *
 * @private
 * @param {string} string The string inspect.
 * @returns {number} Returns the string size.
 */
function unicodeSize(string: string): number {
	let result = (reUnicode.lastIndex = 0);
	while (reUnicode.test(string)) {
		++result;
	}
	return result;
}
