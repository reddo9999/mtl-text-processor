import { TextProcessor } from '../TextProcessor';
import { PlaceholderType, TextProcessorOrderType } from '../_Constants';

test('Isolated string test', () => {
	let processor = new TextProcessor({
		aggressiveSplittingPatterns: [],
		isolateSymbolsPatterns: [/\(.+\)/g],
		protectCornersPatterns: [],
		protectedPatterns: [],
		lineBreakPatterns: [],
		processingOrder: [TextProcessorOrderType.ISOLATE_SENTENCES],
		placeholderType: PlaceholderType.curlieLetter // Can't isolate without placeholders
	});

	let isolated = 'A Symbol for what is to come';

	function fullString (isolated : string) {
        return `This is the entire sentence, it likes to talk about (${isolated}), sometimes.`;;
    }
    
	let process = processor.process(fullString(isolated));

	let toTranslate = process.getTranslatableLines();

	// We should get the main string with a placeholder and the secondary string.
	expect(toTranslate.length).toBe(2);

	expect(toTranslate[1]).toBe(`(${isolated})`);

    let newIsolated = "A tarnished symbol of future lost";
    toTranslate[1] = `(${newIsolated})`;

	process.setTranslatedLines(...toTranslate);

	let translatedStrings = process.getTranslatedLines();

	// We should get a single string back
	expect(translatedStrings.length).toBe(1);

	// It should now have the new isolated symbol
	expect(translatedStrings[0]).toBe(fullString(newIsolated));
});
