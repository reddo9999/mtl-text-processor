import { PlaceholderRecoveryType, TextProcessor } from '../TextProcessor';
import {
	PlaceholderType,
	PlaceholderTypeRegExp,
	TextProcessorOrderType
} from '../_Constants';

test('Guess position - Start and End', () => {
	Object.values(PlaceholderType).forEach((type) => {
		let processor = new TextProcessor({
			placeholderRecoveryType: PlaceholderRecoveryType.GUESS,
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

		toTranslate[0] = toTranslate[0]
			.substring(matches[0].index! + matches[0][0].length)
			.trim();

		process.setTranslatedLines(...toTranslate);

		let result = process.getTranslatedLines();

		expect(result.length).toBe(1);
		expect(process.hasWarnings()).toBe(true);
		expect(process.getWarnings().length).toBe(1);

		expect(result[0]).toBe(start + middle + end);
	});
});

test('Guess position - Middle', () => {
	Object.values(PlaceholderType).forEach((type) => {
		let processor = new TextProcessor({
			placeholderRecoveryType: PlaceholderRecoveryType.GUESS,
			aggressiveSplittingPatterns: [],
			isolateSymbolsPatterns: [],
			lineBreakPatterns: [],
			protectCornersPatterns: [],
			protectedPatterns: [/Esmeralda/g],
			placeholderType: type,
			mergeSequentialPlaceholders: true,
			protectedPatternsPad: false,
			processingOrder: [TextProcessorOrderType.ESCAPE_SYMBOLS]
		});

		let originalSentence = 'The frog jumped over Esmeralda, who is a princess.';

		let process = processor.process(originalSentence);

		let toTranslate = process.getTranslatableLines();

		expect(toTranslate.length).toBe(1);

		process.setTranslatedLines('The frog jumped over % a, who is a princess.');

		let result = process.getTranslatedLines();

		expect(result.length).toBe(1);
		expect(process.hasWarnings()).toBe(true);
		expect(process.getWarnings().length).toBe(1);

		expect(result[0]).toBe('The frog jumped over % Esmeralda a, who is a princess.');
	});
});

test('Guess position - Middle, but add at start', () => {
	Object.values(PlaceholderType).forEach((type) => {
		let processor = new TextProcessor({
			placeholderRecoveryType: PlaceholderRecoveryType.ADD_AT_START,
			aggressiveSplittingPatterns: [],
			isolateSymbolsPatterns: [],
			lineBreakPatterns: [],
			protectCornersPatterns: [],
			protectedPatterns: [/Esmeralda/g],
			placeholderType: type,
			mergeSequentialPlaceholders: true,
			protectedPatternsPad: false,
			processingOrder: [TextProcessorOrderType.ESCAPE_SYMBOLS]
		});

		let originalSentence = 'The frog jumped over Esmeralda, who is a princess.';

		let process = processor.process(originalSentence);

		let toTranslate = process.getTranslatableLines();

		expect(toTranslate.length).toBe(1);

		process.setTranslatedLines('The frog jumped over % a, who is a princess.');

		let result = process.getTranslatedLines();

		expect(result.length).toBe(1);
		expect(process.hasWarnings()).toBe(true);
		expect(process.getWarnings().length).toBe(1);

		expect(result[0]).toBe('Esmeralda The frog jumped over % a, who is a princess.');
	});
});

test('Guess position - Middle, but add at end', () => {
	Object.values(PlaceholderType).forEach((type) => {
		let processor = new TextProcessor({
			placeholderRecoveryType: PlaceholderRecoveryType.ADD_AT_END,
			aggressiveSplittingPatterns: [],
			isolateSymbolsPatterns: [],
			lineBreakPatterns: [],
			protectCornersPatterns: [],
			protectedPatterns: [/Esmeralda/g],
			placeholderType: type,
			mergeSequentialPlaceholders: true,
			protectedPatternsPad: false,
			processingOrder: [TextProcessorOrderType.ESCAPE_SYMBOLS]
		});

		let originalSentence = 'The frog jumped over Esmeralda, who is a princess.';

		let process = processor.process(originalSentence);

		let toTranslate = process.getTranslatableLines();

		expect(toTranslate.length).toBe(1);

		process.setTranslatedLines('The frog jumped over % a, who is a princess.');

		let result = process.getTranslatedLines();

		expect(result.length).toBe(1);
		expect(process.hasWarnings()).toBe(true);
		expect(process.getWarnings().length).toBe(1);

		expect(result[0]).toBe('The frog jumped over % a, who is a princess. Esmeralda');
	});
});
