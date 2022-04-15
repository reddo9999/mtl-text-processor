import { TextProcessorProcess } from "./TextProcessorProcess";
import { closerRegExp, defaultIsolateRegexp, defaultPunctuation, defaultSplitEndsRegExp, defaultSymbols, openerRegExp, PlaceholderType, symbolsSpaces, TextProcessorOrderType } from "./_Constants";

/**
 * Options type for the Processor
 * While initiating the Processor, all options are optional.
 * Be aware that while the default values are pretty good for most use-cases, it's valuable to set values according to the project.
 * In particular ProtectedPatterns, which are not touched by default.
 * Some use-cases can also benefit from changing other Patterns,
 *      e.g. Having Line Break Pattern be a simple "\n", because you are translating a vertical menu of choices, and not a single sentence.
 */
type TextProcessorOptions = {
    /**
     * Text matching protectedPatterns will be sent to the translator as a placeholder instead of the original text.
     * This defines what the placeholder will be.
     * e.g. if \C[0] is protected, it will be sent as %A, because translators understand this better than \C[0], which they might try to translate.
     */
    placeholderType : PlaceholderType;

    /**
     * Defines the order in which processing happens. You can repeat processings if required, e.g. ESCAPE > ISOLATE > ESCAPE
     * Default order is BREAK_LINES, ESCAPE_SYMBOLS, ISOLATE_SENTENCES, CUT_CORNERS, AGGRESSIVE_SPLITTING, which should work in most use-cases.
     */
    processingOrder : Array<TextProcessorOrderType>;

    /**
     * If true, the text will be trimmed before processing.
     */
    trim : boolean;

    /**
     * If set to true, the resulting text will attempt to mimic the original's left padding.
     */
    recoverPadding : boolean;

    /**
     * Maintain the sanctity of literal strings if found.
     * e.g. "A 'text'" will be treated as if it needs to remain a string, so "A \"text\"" could be a possible translation (the end result will remain a string literal)
     * Because a lot of source texts require this treatment but aren't valid JSON, this is just a simple fix with regards to the quotes.
     * If your use-case includes valid JSON, it might be worthwhile to extend the classes so that they use JSON instead.
     */
    maintainScripts : boolean;

    /**
     * Every match will be removed from the string before translation and added back after translation. These patterns are, by nature, not translatable.
     * Use cases: remove script calls that can't be translated, or even remove Placeholders at corners to make sure they will maintain their positions after translation.
     * This assumes that the match will either be at the start of the string or at the end of it.
     */
    protectCornersPatterns : Array<RegExp>;

    /**
     * If we have multiple symbols in a row, we can merge them into a single symbol to avoid confusing the translator.
     */
    mergeSequentialPlaceholders : boolean;

    /**
     * Isolates a string for translation.
     * Whatever matches the RegExp will be replaced by a placeholder on the original string, but will be translated separatedly as a new string.
     */
    isolateSymbolsPatterns : Array<RegExp>;

    /**
     * On match, splits sentences for translation.
     * By default, the matched symbols will not be translatable nor sent to the translator.
     */
    aggressiveSplittingPatterns : Array<RegExp>;

    /**
     * If the boundary symbol needs to be translated, this can be set to true.
     * By default, the boundary symbol will be added to the string preceding the split, if it exists.
     */
    aggressiveSplittingTranslatable : boolean;

    /**
     * This changes the behavior for translatable splits by making them be added to the start of the next sentence rather than the end of the previous sentence.
     */
    agressiveSplittingNext : boolean;

    /**
     * A list of patterns that will be matched, extracted, and replaced with placeholders during the translation process.
     * e.g. /\\C\[\d+\]/gi to match RPG Maker color codes.
     */
    protectedPatterns : Array<RegExp>;

    /**
     * If set to true, when adding placeholders they will be padded with spaces.
     * So if a placeholder would normally be "%A", this will add a " %A " - useful if translating from a language which might conflict with the placeholders.
     */
    protectedPatternsPad : boolean;

    /**
     * This breaks the line into multiple lines.
     * It works similarly to the splitter, except that the match is discarded and replaced with lineBreakReplacement.
     * Main use for this is when using translators that don't create new lines automatically, but translation quality and speed will improve even on the cases where they do.
     */
    lineBreakPatterns : Array<RegExp>;

    /**
     * This will be added to the final text whenever lineBreakPattern Happens.
     */
    lineBreakReplacement : string;
}

/**
 * This class initiates the processing of strings for translation.
 * It is mainly used for configuration.
 * Usage:
 * processor = new TextProcessor(options);
 * process = processor.process("My beautiful text");
 * translations = sendToTranslator(process.getTranslatableLines());
 * process.setTranslatedLines(translations);
 * process.getTranslatedLines() will return the translated lines (same amount as input).
 */
export class TextProcessor {
    protected static DEFAULT_OPTIONS : TextProcessorOptions = {
        placeholderType : PlaceholderType.mvStyleLetter,
        processingOrder : [TextProcessorOrderType.BREAK_LINES, TextProcessorOrderType.ESCAPE_SYMBOLS, TextProcessorOrderType.ISOLATE_SENTENCES, TextProcessorOrderType.CUT_CORNERS, TextProcessorOrderType.AGRESSIVE_SPLITTING],
        maintainScripts : true,
        mergeSequentialPlaceholders : true,
        recoverPadding : true,
        trim : true,
        aggressiveSplittingPatterns : [], // disabled by default
        agressiveSplittingNext : false, // by default goes to the previous
        aggressiveSplittingTranslatable : false, // by default is not translated
        lineBreakPatterns : [
            new RegExp(`([${symbolsSpaces}]*\\r?\\n[${symbolsSpaces}]*\\r?\\n)`, "g"), // "Paragraph break"
            new RegExp(`(?<=[${defaultPunctuation + closerRegExp + defaultSymbols}])([${symbolsSpaces}]*\r?\n)`, "g"), // Previous sentence ended definitely.
            new RegExp(`(\r?\n[${symbolsSpaces}]*)(?=[${openerRegExp + defaultSymbols}])`, "g"), // Next sentence appears like a brand new start!
        ],
        lineBreakReplacement : "\n",
        isolateSymbolsPatterns : [
            new RegExp(defaultIsolateRegexp, "gi"), // Tries to avoid certain RPG Maker stuff, includes colors. idk how good this is as a default, but should be fine
        ],
        protectCornersPatterns : [
            new RegExp(`^[${symbolsSpaces}]*[${openerRegExp}]+`, "g"), // Brackets at start
            new RegExp(`[${closerRegExp}]+[${symbolsSpaces}]*$`, "g"), // Brackets at end
            new RegExp(`(^[${symbolsSpaces}]*[${defaultSymbols}])`, "g"), // Symbols at start
            new RegExp(`([${defaultSymbols}][${symbolsSpaces}]*$)`, "g"), // Symbols at end
        ],
        protectedPatterns : [
            // this is far too personal to set up a default.
        ],
        protectedPatternsPad : false, // Assume translators are not eating them up
    };

    private options : TextProcessorOptions = Object.assign({}, TextProcessor.DEFAULT_OPTIONS);

    constructor (options? : Partial<TextProcessorOptions>) {
        if (typeof options != "undefined") {
            this.setOptions(options);
        }
    }

    public setOptions (options : Partial<TextProcessorOptions>) {
        Object.assign(this.options, options);
    }

    public getLineBreakPatterns () {
        return this.options.lineBreakPatterns;
    }

    public getLineBreakReplacement () {
        return this.options.lineBreakReplacement;
    }

    public getProcessingOrder () : Array<TextProcessorOrderType> {
        return this.options.processingOrder;
    }

    public getIsolatePatterns () {
        return this.options.isolateSymbolsPatterns;
    }

    public getEscapePatterns () {
        return this.options.protectedPatterns;
    }

    public isEscapePatternPad () {
        return this.options.protectedPatternsPad;
    }

    public getPlaceholderType () {
        return this.options.placeholderType;
    }

    public getProtectCornersPatterns () {
        return this.options.protectCornersPatterns;
    }

    public getAggressiveSplittingPatterns () {
        return this.options.aggressiveSplittingPatterns;
    }

    public isAggressiveSplittingTranslatable () {
        return this.options.aggressiveSplittingTranslatable;
    }

    public isAggressiveSplittingNext () {
        return this.options.agressiveSplittingNext
    }

    public isMaintainScripts () {
        return this.options.maintainScripts;
    }

    public isMergeSequentialSymbols () {
        return this.options.mergeSequentialPlaceholders;
    }

    public isRecoverPadding () {
        return this.options.recoverPadding;
    }

    public isTrim () {
        return this.options.trim;
    }

    /**
     * This initiates a translation process.
     * Any number of strings can be passed as parameters. The final result will contain the exact same amount of strings.
     * TextProcessorProcess handles the rest - this main Class is just used for options.
     * @param lines = the strings which will be considered for translation
     * @returns TextProcessorProcess
     */
    public process (...lines : Array<string>) {
        return new TextProcessorProcess(this, lines);
    }
}