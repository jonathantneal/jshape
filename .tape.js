const { asArray, asShape, asHashmap, asOptional } = require('.');

const fullYear = new Date().getFullYear();

const stringify = value => Number.isNaN(value) ? NaN : JSON.stringify(value);

const test = (source, expect) => new Promise((resolve, reject) => {
	if (source === expect) {
		return resolve();
	} else if (Number.isNaN(source) && Number.isNaN(expect)) {
		return resolve();
	} else if (source !== Object(source)) {
		if (expect !== Object(expect)) {
			return reject(`Expected ${stringify(source)} to be ${stringify(expect)}.`);
		} else {
			return reject(`Expected ${stringify(source)} to be an object.`);
		}
	} else if (expect !== Object(expect)) {
		return reject(`Expected "${expect}" to be an object.`);
	}

	const keys1 = Object.keys(source).sort(), keys2 = Object.keys(expect).sort();

	if (keys1.join() !== keys2.join()) {
		return reject(`Expected an object with these keys: ${keys1}.`);
	}

	return Promise.all(
		keys1.map(key => test(source[key], expect[key]))
	).then(resolve, reject);
});

const tests = (...array) => Promise.all(
	array.map(item => console.log(`Test: ${item.message}`) || test(item.source, item.expect))
);

tests(
	{
		message: 'Shapes a Boolean',
		source: asShape('true', Boolean),
		expect: true
	},
	{
		message: 'Shapes a Number',
		source: asShape('1337.1138', Number),
		expect: 1337.1138
	},
	{
		message: 'Shapes a String',
		source: asShape(true, String),
		expect: 'true'
	},
	{
		message: 'Shapes an Array',
		source: asShape({ 0: 5, 1: '2', 2: null }, [String]),
		expect: ['5', '2', '']
	},
	{
		message: 'Shapes an Object with a Boolean',
		source: asShape(
			{ foo: 'true' },
			{ foo: Boolean }
		),
		expect: {
			foo: true
		}
	},
	{
		message: 'Shapes an Object with a Number',
		source: asShape(
			{ foo: '1337.1138' },
			{ foo: Number }
		),
		expect: {
			foo: 1337.1138
		}
	},
	{
		message: 'Shapes an Object with a String',
		source: asShape(
			{ foo: true },
			{ foo: String }
		),
		expect: {
			foo: 'true'
		}
	},
	{
		message: 'Shapes and defaults',
		source: asShape([
			{ title: 'Preserved Title' },
			{ isSomething: null },
			{ year: '2017' },
			{}
		], [
			{ title: 'Something', isSomething: true, year: fullYear }
		]),
		expect: [{
			title: 'Preserved Title',
			isSomething: true,
			year: fullYear
		}, {
			title: 'Something',
			isSomething: false,
			year: fullYear
		}, {
			title: 'Something',
			isSomething: true,
			year: 2017
		}, {
			title: 'Something',
			isSomething: true,
			year: fullYear
		}]
	},
	{
		message: 'Shapes and optionals',
		source: asShape([
			{ title: 'Preserved Title' },
			{ isSomething: 0 },
			{ year: '2017' },
			{}
		], [
			{ title: 'Something', isSomething: asOptional(Boolean), year: fullYear }
		]),
		expect: [{
			title: 'Preserved Title',
			isSomething: undefined,
			year: fullYear
		}, {
			title: 'Something',
			isSomething: false,
			year: fullYear
		}, {
			title: 'Something',
			isSomething: undefined,
			year: 2017
		}, {
			title: 'Something',
			isSomething: undefined,
			year: fullYear
		}]
	},
	{
		message: 'Shape with Hashmap',
		source: asShape(
			{
				'1111': { title: 'Something A', year: 2000 },
				'2222': { title: 'Something B', year: '2001' },
				'3333': { title: 'Something C', year: '2002' },
				'ffff': { title: 'Something D', year: 2003 }
			},
			asHashmap({
				title: String,
				year: Number
			}, /^\d+/)
		),
		expect: {
			'1111': { title: 'Something A', year: 2000 },
			'2222': { title: 'Something B', year: 2001 },
			'3333': { title: 'Something C', year: 2002 }
		}
	},
	{
		message: 'README.md example',
		source: asShape(
			{
				titles: {
					0: { title: 'Something A', isSomething: '1', year: '2018' },
					1: { title: 'Something B', isSomething: null, year: '2018' },
					2: { title: 'Something C', isSomething: null }
				}
			},
			{
				titles: [{
					title: String,
					isSomething: Boolean,
					year: Number
				}]
			}
		),
		expect: {
			titles: [
				{ title: 'Something A', isSomething: true, year: 2018 },
				{ title: 'Something B', isSomething: false, year: 2018 },
				{ title: 'Something C', isSomething: false, year: NaN }
			]
		}
	}
).then(
	() => console.log('\nAll tests have passed!') || process.exit(0),
	errors => console.log(`\nSome tests have failed.\n${errors}`) || process.exit(1)
);
