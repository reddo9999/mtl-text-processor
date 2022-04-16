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

	process.setTranslatedLines(translatableStrings);

	let translatedLines = process.getTranslatedLines();

	expect(translatedLines.length).toBe(2);
	expect(translatedLines[0]).toBe('I love MEAT!');
	expect(translatedLines[1]).toBe('I love MEAT on my pizza!');
});

// TODO: Write more tests
// Test all placeholders... fuck me
// Test line breaks
// Test isolated strings
// Test protected symbols
// Test corner cuts
// General mixed test
// Test if errors are thrown when mismatch
// Test if warnings are sent when failure to reinsert placeholder
