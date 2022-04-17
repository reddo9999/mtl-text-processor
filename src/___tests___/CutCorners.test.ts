import { TextProcessor } from '../TextProcessor';
import { TextProcessorOrderType } from '../_Constants';


test('Cutting corners', () => {
	let processor = new TextProcessor({
		aggressiveSplittingPatterns: [],
		isolateSymbolsPatterns: [],
		protectCornersPatterns: [/^\(/g, /\)$/g],
		protectedPatterns: [],
		lineBreakPatterns: [],
		processingOrder: [TextProcessorOrderType.CUT_CORNERS],
	});

    let innerString = "There are many like it, but this is my string.";

    let process = processor.process(`(${innerString})`);

    let toTranslate = process.getTranslatableLines();

    expect(toTranslate.length).toBe(1);
    expect(toTranslate[0]).toBe(innerString);

    let newInnerString = "And now it is mine.";
    process.setTranslatedLines(newInnerString);

    let translated = process.getTranslatedLines();

    expect(translated.length).toBe(1);
    expect(translated[0]).toBe(`(${newInnerString})`);
});