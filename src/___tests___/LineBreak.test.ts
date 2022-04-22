import { TextProcessor } from '../TextProcessor';
import { TextProcessorOrderType } from '../_Constants';

test('Line Break tests', () => {
	let processor = new TextProcessor({
		aggressiveSplittingPatterns: [],
		isolateSymbolsPatterns: [],
		protectCornersPatterns: [],
		protectedPatterns: [],
		lineBreakPatterns: [/\n+/g],
		lineBreakReplacement: '\n',
		processingOrder: [TextProcessorOrderType.BREAK_LINES]
	});

	let lines = [
		'First line!',
		'Second line!',
		'Third line after a break!',
		'Fourth line!'
	];
	let process = processor.process(
		`${lines[0]}\n${lines[1]}\n\n\n\n${lines[2]}\n\n${lines[3]}`
	);

	let toTranslate = process.getTranslatableLines();

	// Because we're merging all lines we should only get four
	expect(toTranslate.length).toBe(4);

	process.setTranslatedLines(...lines);

	let translatedStrings = process.getTranslatedLines();

	// We should get a single string back
	expect(translatedStrings.length).toBe(1);

	// Multiple line breaks should have been merged into a single line break
	expect(translatedStrings[0]!.split('\n').length).toBe(4);
});
