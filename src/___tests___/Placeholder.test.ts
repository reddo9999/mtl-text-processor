import { TextProcessor } from '../TextProcessor';
import { PlaceholderType, PlaceholderTypeRegExp, TextProcessorOrderType } from '../_Constants';

test('Placeholder and escaping validity test', () => {
    Object.values(PlaceholderType).forEach(type => {
        let processor = new TextProcessor({
            aggressiveSplittingPatterns: [],
            isolateSymbolsPatterns: [],
            lineBreakPatterns: [],
            protectCornersPatterns: [],
            protectedPatterns: [/abc/g],
            placeholderType : type,
            mergeSequentialPlaceholders : false,
            protectedPatternsPad : false,
            processingOrder : [TextProcessorOrderType.ESCAPE_SYMBOLS]
        });

        let originalSentences = [
            '!  abc  !',
            '!abcabc!',
            'abc'
        ];

        let process = processor.process(...originalSentences);

        let toTranslate = process.getTranslatableLines();

        // Third sentence will be entirely placeholdered and skipped.
        expect(toTranslate.length).toBe(2);

        let placeholderRegExp = new RegExp(`${PlaceholderTypeRegExp[type]}`, "g");
        let matches0 = [...toTranslate[0].matchAll(placeholderRegExp)];
        let matches1 = [...toTranslate[1].matchAll(placeholderRegExp)];

        expect(matches0.length).toBe(1);
        expect(matches1.length).toBe(2);
    })
});