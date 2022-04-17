import { TextProcessor } from '../TextProcessor';

test('Error on too many strings', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    let f = () => {
        let processor = new TextProcessor({
            aggressiveSplittingPatterns: [],
            isolateSymbolsPatterns: [],
            protectCornersPatterns: [],
            protectedPatterns: [],
            lineBreakPatterns: [],
            processingOrder: [],
        });
        
        let process = processor.process("First", "Second");
        let toTranslate = process.getTranslatableLines();

        expect(toTranslate.length).toBe(2);

        toTranslate.push("Third wheel");
        process.setTranslatedLines(...toTranslate);
    }

	expect(f).toThrowError();
});

test('Error on too few strings', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    let f = () => {
        let processor = new TextProcessor({
            aggressiveSplittingPatterns: [],
            isolateSymbolsPatterns: [],
            protectCornersPatterns: [],
            protectedPatterns: [],
            lineBreakPatterns: [],
            processingOrder: [],
        });
        
        let process = processor.process("First", "Second");
        let toTranslate = process.getTranslatableLines();

        expect(toTranslate.length).toBe(2);

        toTranslate.pop();

        process.setTranslatedLines(...toTranslate);
        process.getTranslatedLines();
    }

	// We should get a single string back
	expect(f).toThrowError();
});