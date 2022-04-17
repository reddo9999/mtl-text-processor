import { TextProcessor } from '../TextProcessor';
import {
	PlaceholderType,
	PlaceholderTypeRegExp,
	TextProcessorOrderType
} from '../_Constants';

test('Placeholder and escaping validity test', () => {
	Object.values(PlaceholderType).forEach((type) => {
		let processor = new TextProcessor({
			aggressiveSplittingPatterns: [],
			isolateSymbolsPatterns: [],
			lineBreakPatterns: [],
			protectCornersPatterns: [],
			protectedPatterns: [/abc/g],
			placeholderType: type,
			mergeSequentialPlaceholders: true,
			protectedPatternsPad: false,
			processingOrder: [TextProcessorOrderType.ESCAPE_SYMBOLS]
		});

		let originalSentences = ['!  abc  !', '!abc|abc!', 'abc', 'abcabcabc'];

		let process = processor.process(...originalSentences);

		let toTranslate = process.getTranslatableLines();

		// Third and fourth sentences will be entirely placeholdered and skipped, so we should only get two
		expect(toTranslate.length).toBe(2);

		let placeholderRegExp = new RegExp(`${PlaceholderTypeRegExp[type]}`, 'g');
		let matches0 = [...toTranslate[0].matchAll(placeholderRegExp)];
		let matches1 = [...toTranslate[1].matchAll(placeholderRegExp)];

		expect(matches0.length).toBe(1);
		expect(matches1.length).toBe(2);
	});
});

test('Warning on fail to readd', () => {
	Object.values(PlaceholderType).forEach((type) => {
		let processor = new TextProcessor({
			aggressiveSplittingPatterns: [],
			isolateSymbolsPatterns: [],
			lineBreakPatterns: [],
			protectCornersPatterns: [],
			protectedPatterns: [/abc/g, /cba/g],
			placeholderType: type,
			mergeSequentialPlaceholders: true,
			protectedPatternsPad: false,
			processingOrder: [TextProcessorOrderType.ESCAPE_SYMBOLS]
		});

		let start = 'abc';
		let middle = ' Is my string complete? ';
		let end = 'cba';
		let originalSentences = [start + middle + end];

		let process = processor.process(...originalSentences);

		let toTranslate = process.getTranslatableLines();

		expect(toTranslate.length).toBe(1);

		let placeholderRegExp = new RegExp(`${PlaceholderTypeRegExp[type]}`, 'g');
		let matches = [...toTranslate[0].matchAll(placeholderRegExp)];
		expect(matches.length).toBe(2);

		toTranslate[0] = toTranslate[0].substring(matches[0].index! + matches[0][0].length);

		process.setTranslatedLines(...toTranslate);

		let result = process.getTranslatedLines();

		expect(result.length).toBe(1);
		expect(process.hasWarnings()).toBe(true);
		expect(process.getWarnings().length).toBe(1);

		expect(result[0]).toBe(middle + end);
	});
});
