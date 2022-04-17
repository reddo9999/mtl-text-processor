import { TextProcessor } from '../TextProcessor';
import { PlaceholderType, TextProcessorOrderType } from '../_Constants';

test('Untranslatable Splitting', () => {
	let processor = new TextProcessor({
		aggressiveSplittingPatterns: [/\|/g],
		aggressiveSplittingTranslatable: false,
		isolateSymbolsPatterns: [],
		lineBreakPatterns: [],
		protectCornersPatterns: [],
		protectedPatterns: [],
		processingOrder: [TextProcessorOrderType.AGGRESSIVE_SPLITTING]
	});

	let process = processor.process('Option 1|Option 2|Option 3');
	let toTranslate = process.getTranslatableLines();
	expect(toTranslate.length).toBe(3);

	expect(toTranslate[0]).toBe('Option 1');
	expect(toTranslate[1]).toBe('Option 2');
	expect(toTranslate[2]).toBe('Option 3');

	process.setTranslatedLines('Opção 1', 'Opção 2', 'Opção 3');

	let translated = process.getTranslatedLines();

	expect(translated.length).toBe(1);
	expect(translated[0]).toBe('Opção 1|Opção 2|Opção 3');
});

test('Translatable Splitting (Previous)', () => {
	let processor = new TextProcessor({
		aggressiveSplittingPatterns: [/[!?\.]+/g],
		aggressiveSplittingTranslatable: true,
		agressiveSplittingNext: false,
		isolateSymbolsPatterns: [],
		lineBreakPatterns: [],
		protectCornersPatterns: [],
		protectedPatterns: [],
		processingOrder: [TextProcessorOrderType.AGGRESSIVE_SPLITTING]
	});

	let fullString =
		'First sentence.Second sentence?Third sentence!Fourth and last sentence!!?!??!!?';
	let process = processor.process(fullString);
	let toTranslate = process.getTranslatableLines();

	expect(toTranslate).toMatchObject([
		'First sentence.',
		'Second sentence?',
		'Third sentence!',
		'Fourth and last sentence!!?!??!!?'
	]);

	process.setTranslatedLines(...toTranslate);

	let translation = process.getTranslatedLines();
	expect(translation.length).toBe(1);
	expect(translation[0]).toBe(fullString);
});

test('Translatable Splitting (next)', () => {
	let processor = new TextProcessor({
		aggressiveSplittingPatterns: [/\-+/g],
		aggressiveSplittingTranslatable: true,
		agressiveSplittingNext: true,
		isolateSymbolsPatterns: [],
		lineBreakPatterns: [],
		protectCornersPatterns: [],
		protectedPatterns: [],
		processingOrder: [TextProcessorOrderType.AGGRESSIVE_SPLITTING]
	});

	let fullString =
		'First sentence.-Second sentence?-Third sentence!-Fourth and last sentence!!?!??!!?';
	let process = processor.process(fullString);
	let toTranslate = process.getTranslatableLines();

	expect(toTranslate).toMatchObject([
		'First sentence.',
		'-Second sentence?',
		'-Third sentence!',
		'-Fourth and last sentence!!?!??!!?'
	]);

	process.setTranslatedLines(...toTranslate);

	let translation = process.getTranslatedLines();
	expect(translation.length).toBe(1);
	expect(translation[0]).toBe(fullString);
});
