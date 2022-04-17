import { TextProcessor } from '../TextProcessor';

test('Simple sentence translation', () => {
	let processor = new TextProcessor({
		aggressiveSplittingPatterns: [],
		isolateSymbolsPatterns: [],
		lineBreakPatterns: [],
		protectCornersPatterns: [],
		protectedPatterns: []
	});
	let originalSentences = [
		'I love pineapples!',
		'I love pineapples on my pizza!'
	];

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

test('Simple script translation', () => {
	let processor = new TextProcessor({
		aggressiveSplittingPatterns: [],
		isolateSymbolsPatterns: [],
		lineBreakPatterns: [],
		protectCornersPatterns: [],
		protectedPatterns: [],
        maintainScripts : true,
	});
	let originalSentences = [
		'"pineapples"'
	];

	let process = processor.process(...originalSentences);

	let translatableStrings = process.getTranslatableLines();

    expect(translatableStrings.length).toBe(1);
    expect(translatableStrings[0]).toBe("pineapples");

	translatableStrings.forEach((str, index, arr) => {
		arr[index] = str.replace('pineapples', 'MEAT');
	});

	process.setTranslatedLines(...translatableStrings);

	let translatedLines = process.getTranslatedLines();

	expect(translatedLines.length).toBe(1);
	expect(translatedLines[0]).toBe('"MEAT"');
});