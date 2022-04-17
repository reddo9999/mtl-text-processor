import { TextProcessor } from '../TextProcessor';

test('Simple sentence translation', () => {
	let processor = new TextProcessor({
		aggressiveSplittingPatterns: [],
		isolateSymbolsPatterns: [],
		lineBreakPatterns: [],
		protectCornersPatterns: [],
		protectedPatterns: []
	});
	let originalSentences = ['I love pineapples!', 'I love pineapples on my pizza!'];

	let process = processor.process(...originalSentences);

	let translatableStrings = process.getTranslatableLines();

	translatableStrings.forEach((str, index, arr) => {
		arr[index] = str.replace('pineapples', 'MEAT');
	});

	process.setTranslatedLines(...translatableStrings);

	let translatedLines = process.getTranslatedLines();

	expect(translatedLines.length).toBe(2);
	expect(translatedLines[0]).toBe('I love MEAT!');
	expect(translatedLines[1]).toBe('I love MEAT on my pizza!');
});

test('No repeat tests', () => {
	let processor = new TextProcessor({
		aggressiveSplittingPatterns: [],
		isolateSymbolsPatterns: [/\(.+?\)/g],
		lineBreakPatterns: [],
		protectCornersPatterns: [/(^\()|(\)$)/g],
		protectedPatterns: [],
		noRepeat: true
	});
	let originalSentences = ['I have a (pen)', 'I have a (pineapple)', '(pineapple)(pen)'];

	let process = processor.process(...originalSentences);

	let translatableStrings = process.getTranslatableLines();

	// Normally we'd have at least 6:
	/**
	 * I have a
	 * I have a
	 * pen
	 * pineapple
	 * pineapple
	 * pen
	 */
	expect(translatableStrings.length).toBe(3);
	expect(translatableStrings[1]).toBe('pen');
	expect(translatableStrings[2]).toBe('pineapple');

	process.setTranslatedLines(translatableStrings[0], 'pencil', 'apple');

	let translatedLines = process.getTranslatedLines();

	expect(translatedLines.length).toBe(3);
	expect(translatedLines).toMatchObject([
		'I have a (pencil)',
		'I have a (apple)',
		'(apple)(pencil)'
	]);
});
