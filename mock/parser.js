const {expect} = require('chai');

describe("parse document", () => {
	function processTypedefs(value) {
		const typedefs = [];

		value = value.replace(/\/\*\*[^\/]*?@typedef ({[^\/]*})[^\/]*?\*\/\s*let\s*([a-zA-Z0-9]+);/g, (match, type, def) => {
			typedefs.push(def);
			return match
				.replace(`${type}`, `${type} ${def}`)
				.replace(`${def};`, `${def}2;`)
		});

		for (const type of typedefs)
		{
			value = value.replace(/export {[^/]*?}/g, (match) => {
				return match.replace(type, type + '2');
			});
		}

		return value;
	}

	function removeUnusedAsterisks(value) {
		return value.replace(/\/\*\*([^\/]*?)\*\//g, (_, content) => `/**${content.replace(/(\n\s*)\*/g, '$1 ')}*/`);
	}

	it("remove aterisks", () => {
		const text = `/**
 * @typedef {{
 *   type: string,
 *   text: string,
 * }}
 */`;
		const expected = `/**
   @typedef {{
     type: string,
     text: string,
   }}
 */`;
		expect(removeUnusedAsterisks(text)).equal(expected);
	});

	it("replace typedefs", () => {
		const text = `/**
 * @typedef {{src: string}}
 */
let MyType;

/**
 * @param {MyType} article
 */
function test(article) {
	article.custom;
}

export {
	MyType,
}`;
		const expected = `/**
 * @typedef {{src: string}} MyType
 */
let MyType2;

/**
 * @param {MyType} article
 */
function test(article) {
	article.custom;
}

export {
	MyType2,
}`
		expect(processTypedefs(text)).equal(expected);
	});

	it("replace typedefs2", () => {
		const text = `/**
 * @typedef {string}
 */
let ContentStateRecordType;

/**
 * @param {ContentStateRecordType} a
 */
function t(a) {
	/**
	 * @type {number}
	 */
	let x = a;
}
t(1);

export {
	ContentStateRecordType,
}
`;
		const expected = `/**
 * @typedef {string} ContentStateRecordType
 */
let ContentStateRecordType2;

/**
 * @param {ContentStateRecordType} a
 */
function t(a) {
	/**
	 * @type {number}
	 */
	let x = a;
}
t(1);

export {
	ContentStateRecordType2,
}
`
		expect(processTypedefs(text)).equal(expected);
	});
});
