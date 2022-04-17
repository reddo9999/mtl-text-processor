import { TextProcessor } from '../TextProcessor';

test('Trim whole sentence and trim lines', () => {
	let processor = new TextProcessor({
		aggressiveSplittingPatterns: [],
		isolateSymbolsPatterns: [],
		lineBreakPatterns: [],
		protectCornersPatterns: [],
		protectedPatterns: [],
		trim: true,
		trimLines: true,
		recoverPadding: false
	});
	let originalSentences = [
		'     I love pineapples!       ',
		'I love pineapples\n on my pizza!'
	];

	let process = processor.process(...originalSentences);

	let translatableStrings = process.getTranslatableLines();

	expect(translatableStrings).toMatchObject([
		'I love pineapples!',
		'I love pineapples\non my pizza!'
	]);

	process.setTranslatedLines(...translatableStrings);

	// They are trimmed forever
	expect(process.getTranslatedLines()).toMatchObject([
		'I love pineapples!',
		'I love pineapples\non my pizza!'
	]);
});

test('Trims but recover pad', () => {
	let processor = new TextProcessor({
		aggressiveSplittingPatterns: [],
		isolateSymbolsPatterns: [],
		lineBreakPatterns: [],
		protectCornersPatterns: [],
		protectedPatterns: [],
		trim: true,
		trimLines: true,
		recoverPadding: true
	});
	let originalSentences = [
		'     I love pineapples!       ',
		'I love pineapples\n on my pizza!'
	];

	let process = processor.process(...originalSentences);

	let translatableStrings = process.getTranslatableLines();

	expect(translatableStrings).toMatchObject([
		'I love pineapples!',
		'I love pineapples\non my pizza!'
	]);

	process.setTranslatedLines(...translatableStrings);

	// They are trimmed forever
	expect(process.getTranslatedLines()).toMatchObject([
		'     I love pineapples!',
		'I love pineapples\n on my pizza!'
	]);
});
