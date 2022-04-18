import type { TextProcessorPattern } from './TextProcessor';
import type { TextProcessorProcess } from './TextProcessorProcess';
import {
	PlaceholderCreator,
	PlaceholderType,
	PlaceholderTypeRegExp,
	symbolsSpaces,
	TextProcessorOrderType
} from './_Constants';

type MatchAllOptions = {
	text: string;
	resultingArray: Array<string | number>;
	matches: Array<RegExpMatchArray>;
	startPosition: number;
};

export class TextProcessorRowLine {
	private process: TextProcessorProcess;
	private originalString: string;
	private parts: Array<string | number> = [];
	private symbols: Array<string> = [];
	private placeholders: Array<string> = [];
	private placeholderIndexFromMatch: { [match: string]: number } = {};
	private placeholderContent: {
		[placeholder: string]: string | TextProcessorRowLine;
	} = {};
	private placeholderCount = 0;
	private extractedStrings: Array<TextProcessorRowLine> = [];
	private translations: Array<string> = [];
	private expecting: number = 0;
	private isScript: boolean = false;
	private quoteType: string = '"';
	private processed: boolean = false;
    private passes : {[id : number] : number} = {};

	constructor(process: TextProcessorProcess, text: string) {
		this.process = process;
		this.originalString = text;
        for (let key in TextProcessorOrderType) {
            this.passes[key] = 0;
        }
	}

	public getProcessingOrder(): Array<TextProcessorOrderType> {
		return this.process.getProcessor().getProcessingOrder();
	}

	protected storeSymbol(text: string) {
		return this.symbols.push(text) - 1;
	}

	public hasPlaceholder(match: string) {
		return typeof this.placeholderIndexFromMatch[match] != 'undefined';
	}

	public getPlaceholder(match: string) {
		return this.placeholders[this.placeholderIndexFromMatch[match]];
	}

	protected isolateSymbols() {
		let patterns = this.getIsolatePatterns();
		this.replaceAll(true, patterns, (match) => {
			let placeholder = this.createPlaceholder(match);
			this.placeholderContent[placeholder] = new TextProcessorRowLine(
				this.process,
				match
			);
			this.extractedStrings.push(
				<TextProcessorRowLine>this.placeholderContent[placeholder]
			);
			return placeholder;
		}, this.passes[TextProcessorOrderType.ISOLATE_SENTENCES]++);
	}

	protected protectCorners() {
		let patterns = this.getProtectCornersPatterns();
		this.matchAll(patterns, (matching, match) => {
			return [this.storeSymbol(match[0])];
		}, this.passes[TextProcessorOrderType.CUT_CORNERS]++);
	}

	protected breakLines() {
		let patterns = this.getLineBreakPatterns();
		this.matchAll(patterns, (matching, match) => {
			return [this.storeSymbol(this.getLineBreakReplacement())];
		}, this.passes[TextProcessorOrderType.BREAK_LINES]++);
	}

	protected splitSentences() {
		let patterns = this.getSplittingPatterns();
		// Our matchAll function won't work here... or would it?
		let splitsOn: Array<number> = [];
		this.matchAll(patterns, (matching, match) => {
			let idx = this.storeSymbol(match[0]);
			splitsOn.push(idx);
			return [idx];
		}, this.passes[TextProcessorOrderType.AGGRESSIVE_SPLITTING]++);

		if (this.isSplittingTranslatable()) {
			for (let i = this.parts.length - 1; i >= 0; i--) {
				let part = this.parts[i];
				if (typeof part == 'number' && splitsOn.indexOf(<number>part) != -1) {
					let originalText = this.symbols[part];
					if (this.isSplittingIncludedOnNext()) {
						let nextPart = this.parts[i + 1];
						if (typeof nextPart == 'string') {
							this.parts[i + 1] = originalText + nextPart;
							// Remove the index
							this.parts.splice(i, 1);
						}
					} else {
						let previousPart = this.parts[i - 1];
						if (typeof previousPart == 'string') {
							this.parts[i - 1] = previousPart + originalText;
							// Remove the index
							this.parts.splice(i, 1);
						}
					}
				}
			}
		}
	}

	protected escapeSymbols() {
		let patterns = this.getEscapePatterns();
		this.replaceAll(false, patterns, (match) => {
			let placeholder = this.createPlaceholder(match);
			return placeholder;
		}, this.passes[TextProcessorOrderType.ESCAPE_SYMBOLS]++);
	}

	protected mergeSequentialSymbols() {
		let pattern = PlaceholderTypeRegExp[this.getPlaceholderType()];
		if (typeof pattern == 'undefined') {
			// Do not report this to the Process - this is spam and should only happen with invalid placeholder type.
			console.warn(
				'[TextProcessorRowLine] Merging of sequential symbols was requested, but there is no pattern available for ' +
					this.getPlaceholderType
			);
		} else {
			let padding = '[' + symbolsSpaces + ']*';
			let regexPattern = new RegExp(`(${padding + pattern + padding}){2,}`, 'g');
			this.replaceAll(false, [regexPattern], (match) => {
				let placeholder = this.createPlaceholder(match);
				return placeholder;
			}, 0);
		}
	}

	protected protectPureSymbols() {
		let pattern = PlaceholderTypeRegExp[this.getPlaceholderType()];
		if (typeof pattern == 'undefined') {
			// Do not report this to the Process - this is spam and should only happen with invalid placeholder type.
			console.warn(
				'[TextProcessorRowLine] No pattern available for ' + this.getPlaceholderType
			);
		} else {
			let padding = '[' + symbolsSpaces + ']*';
			let regexPattern = new RegExp(`^(${padding + pattern + padding})+$`, 'g');
			for (let i = 0; i < this.parts.length; i++) {
				if (typeof this.parts[i] == 'string') {
					let match = (<string>this.parts[i]).match(regexPattern);
					if (match != null) {
						this.parts[i] = this.storeSymbol(<string>this.parts[i]);
					}
				}
			}
		}
	}

    public regExpFromPattern (unfilteredPattern : TextProcessorPattern, options : {pass : number, fullString : string}) : RegExp | void {
        if (unfilteredPattern instanceof RegExp) {
            return unfilteredPattern;
        } else if (Array.isArray(unfilteredPattern)) {
            let exps : Array<string> = [];
            (<Array<string>> unfilteredPattern).forEach((str : string) => {
                exps.push("(" + str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + ")");
            });
            return new RegExp(exps.join("\|"), "gi");
        } else if (typeof unfilteredPattern == "function") {
            return this.regExpFromPattern((<Function> unfilteredPattern)(options), options);
        }
    }

	public matchAll(
		patterns: Array<TextProcessorPattern>,
		onMatch: (
			matching: MatchAllOptions,
			match: RegExpMatchArray
		) => Array<string | number>,
        pass: number
	) {
		let found = true;
		while (found) {
			found = false;
			for (let patternIndex = 0; patternIndex < patterns.length; patternIndex++) {
				for (let textIndex = this.parts.length - 1; textIndex >= 0; textIndex--) {
					if (typeof this.parts[textIndex] != 'string') {
						continue;
					}

                    let pattern = this.regExpFromPattern(patterns[patternIndex], {fullString : <string>this.parts[textIndex], pass : pass});
                    if (pattern == undefined) {
                        continue;
                    }
					let matching = {
						text: <string>this.parts[textIndex],
						resultingArray: <Array<string | number>>[],
						matches: [
							...(<string>this.parts[textIndex]).matchAll(pattern)
						],
						startPosition: 0
					};

					matching.matches.forEach((match) => {
						found = true;
						let line = matching.text.substring(matching.startPosition, match.index);
						let lineBreak = match[0];
						let length = lineBreak.length;
						matching.startPosition = match.index! + length;
						if (line.length > 0) matching.resultingArray.push(line);
						matching.resultingArray.push(...onMatch(matching, match));
					});

					// Did we get everything?
					if (matching.startPosition < matching.text.length) {
						matching.resultingArray.push(matching.text.substring(matching.startPosition));
					}

					this.parts[textIndex] = matching.resultingArray[0];
					for (let i = 1; i < matching.resultingArray.length; i++) {
						this.parts.splice(textIndex + i, 0, matching.resultingArray[i]);
					}
				}
			}
		}
	}

	public replaceAll(
		translatable: boolean,
		patterns: Array<TextProcessorPattern>,
		replacer: (match: string) => string,
        pass : number,
	) {
		for (let patternIndex = 0; patternIndex < patterns.length; patternIndex++) {
			for (let textIndex = this.parts.length - 1; textIndex >= 0; textIndex--) {
				if (typeof this.parts[textIndex] != 'string') {
					continue;
				}

				let text = <string>this.parts[textIndex];
                let pattern = this.regExpFromPattern(patterns[patternIndex], {fullString : text, pass : pass});
                if (pattern == undefined) {
                    continue;
                }

				let matches = [...text.matchAll(pattern)];
				for (let i = matches.length - 1; i >= 0; i--) {
					let match = matches[i];
					if (match.index == 0 && match[0].length == text.length) {
						if (!translatable) {
							this.parts[textIndex] = this.storeSymbol(text); // will only have one match, so no need to break
						}
					} else {
						text =
							text.substring(0, match.index) +
							replacer(match[0]) +
							text.substring(match.index! + match[0].length);
					}
				}

				if (typeof this.parts[textIndex] == 'string') {
					this.parts[textIndex] = text;
				}
			}
		}
	}

	public createPlaceholder(match: string) {
		// Is this a symbol we already have?
		let existingIndex = this.placeholderIndexFromMatch[match];
		if (typeof existingIndex != 'undefined') {
			let placeholder = this.placeholders[existingIndex];
			this.placeholders.push(placeholder);
			return placeholder;
		}

		let creator = PlaceholderCreator[this.getPlaceholderType()];

		// Is the placeholdertype valid?
		if (typeof creator == 'undefined') {
			this.process.addWarning({
				message:
					'[TextProcessorRowLine] Invalid PlaceholderType provided - ' +
					this.getPlaceholderType() +
					'. Not escaping.',
				originalSentence: this.originalString
			});
			return match;
		}

		// Everything is right in the world
		let count = this.placeholderCount++;
		let placeholder = creator(count);

		if (this.isEscapePatternPad()) {
			placeholder = ' ' + placeholder + ' ';
		}

		this.placeholderIndexFromMatch[match] = this.placeholders.push(placeholder) - 1;
		this.placeholderContent[placeholder] = match;

		return placeholder;
	}

	public getTranslatableStrings() {
		this.init();
		let strings: Array<string> = [];

		// My own strings
		for (let i = 0; i < this.parts.length; i++) {
			if (typeof this.parts[i] == 'string') {
				strings.push(<string>this.parts[i]);
			}
		}

		// Strings from what I extracted
		for (let i = 0; i < this.extractedStrings.length; i++) {
			strings.push(...this.extractedStrings[i].getTranslatableStrings());
		}

		this.expecting = strings.length;

		return strings;
	}

	public addTranslations(...translations: Array<string>) {
		if (this.translations.length + translations.length > this.expecting) {
			throw new Error(
				'Too many translations. Expected ' +
					this.expecting +
					', but received ' +
					(this.translations.length + translations.length)
			);
		}
		this.translations.push(...translations);
	}

	public isDone() {
		return this.translations.length == this.expecting;
	}

	protected applyTranslations() {
		let innerIndex = 0;
		let currentPart = this.parts[innerIndex];
		let extractedIndex = 0;
		let currentExtracted = this.extractedStrings[extractedIndex];
		for (let i = 0; i < this.translations.length; i++) {
			while (typeof currentPart == 'number') {
				currentPart = this.parts[++innerIndex];
			}
			if (typeof currentPart == 'undefined') {
				// start applying to extracteds
				while (typeof currentExtracted != 'undefined' && currentExtracted.isDone()) {
					currentExtracted = this.extractedStrings[++extractedIndex];
				}
				currentExtracted.addTranslations(this.translations[i]);
			} else {
				this.parts[innerIndex] = this.translations[i];
				currentPart = this.parts[++innerIndex];
			}
		}
	}

	protected init() {
		if (this.processed) {
			return;
		}

		let text = this.originalString;

		if (this.isTrim()) {
			text = text.trim();
		}

		if (this.isMaintainScripts()) {
			let trim = text.trim();
			// Ideally we would do something like a JSON.parse, but just because it is a literal string doesn't mean it is a valid JSON string.
			// Depending on the source of the original text, it might have invalid stuff like \C or \V (RPG Maker).
			if (
				['"', "'"].indexOf(trim.charAt(0)) != -1 &&
				trim.charAt(trim.length - 1) == trim.charAt(0)
			) {
				this.isScript = true;
				this.quoteType = trim.charAt(0);
				text = trim.substring(1, trim.length - 1);
			}
		}

		this.parts = [text];

		let order = this.getProcessingOrder();
		order.forEach((action) => {
			switch (action) {
				case TextProcessorOrderType.BREAK_LINES:
					this.breakLines();
					break;
				case TextProcessorOrderType.ESCAPE_SYMBOLS:
					this.escapeSymbols();
					break;
				case TextProcessorOrderType.ISOLATE_SENTENCES:
					this.isolateSymbols();
					break;
				case TextProcessorOrderType.AGGRESSIVE_SPLITTING:
					this.splitSentences();
					break;
				case TextProcessorOrderType.CUT_CORNERS:
					this.protectCorners();
					break;
			}
		});

		if (this.isTrimLines()) {
			for (let i = 0; i < this.parts.length; i++) {
				if (typeof this.parts[i] == 'string') {
					let lines = (<string>this.parts[i]).split('\n');
					for (let k = 0; k < lines.length; k++) {
						lines[k] = lines[k].trim();
					}
					this.parts[i] = lines.join('\n');
				}
			}
		}

		if (this.isMergeSequentialSymbols()) {
			this.mergeSequentialSymbols();
		}

		this.protectPureSymbols();

		this.processed = true;
	}

	public getTranslatedString(): string {
		if (this.translations.length != this.expecting) {
			throw new Error(
				'Did not receive enough translations. Expected ' +
					this.expecting +
					', but received ' +
					this.translations.length
			);
		}
		this.applyTranslations();

		let finalString = '';

		for (let i = 0; i < this.parts.length; i++) {
			if (typeof this.parts[i] == 'number') {
				finalString += this.symbols[<number>this.parts[i]];
			} else {
				finalString += this.parts[i];
			}
		}

		for (let i = this.placeholders.length - 1; i >= 0; i--) {
			let placeholder = this.placeholders[i];
			let content = this.placeholderContent[placeholder];
			if (typeof content != 'string') {
				content = content.getTranslatedString();
			}

			let idx = finalString.lastIndexOf(placeholder);

			if (idx == -1) {
				// This might result in a lower quality result (might have extra padding etc), so a last resort.
				placeholder = placeholder.trim().toLowerCase();
				let lower = finalString.toLowerCase();
				idx = lower.lastIndexOf(placeholder);
			}

			if (idx == -1) {
				this.process.addWarning({
					message: `[TextProcessorRowLine] Unable to reinsert placeholder: ${placeholder}`,
					originalSentence: this.originalString,
					currentSentence: finalString,
					placeholders: this.placeholders
				});
			} else {
				finalString =
					finalString.substring(0, idx) +
					content +
					finalString.substring(idx + placeholder.length);
			}
		}

		if (this.isScript) {
			finalString = finalString.replaceAll(
				new RegExp(this.quoteType, 'g'),
				'\\' + this.quoteType
			);
			finalString = this.quoteType + finalString + this.quoteType;
		}

		if (this.isRecoverPadding()) {
			let explodedOriginal = this.originalString.split(/\r?\n/g);
			let explodedFinalString = finalString.split(/\r?\n/g);

			function getLastPad(i: number) {
				while (typeof explodedOriginal[i] == 'undefined' && i > 0) {
					i--;
				}

				if (typeof explodedOriginal[i] == 'undefined') {
					return '';
				} else {
					let line = explodedOriginal[i];
					let padRegExp = new RegExp(`^[${symbolsSpaces}]+`);
					let match = line.match(padRegExp);
					if (match != null) {
						return match[0];
					} else {
						return '';
					}
				}
			}

			for (let i = 0; i < explodedFinalString.length; i++) {
				explodedFinalString[i] = getLastPad(i) + explodedFinalString[i];
			}
			finalString = explodedFinalString.join('\n');
		}

		return finalString;
	}

	public getIsolatePatterns(): Array<TextProcessorPattern> {
		return this.process.getProcessor().getIsolatePatterns();
		//return [/(\()(.+?)(\))/g];
	}

	public getEscapePatterns(): Array<TextProcessorPattern> {
		return this.process.getProcessor().getEscapePatterns();
		//return [/(\\C\[\d+\])+/g];
	}

	public getSplittingPatterns(): Array<TextProcessorPattern> {
		return this.process.getProcessor().getAggressiveSplittingPatterns();
		//return [/( *\r?\n *){2,}/g];
	}

	public isSplittingTranslatable() {
		return this.process.getProcessor().isAggressiveSplittingTranslatable();
		//return false;
	}

	public isSplittingIncludedOnNext() {
		return this.process.getProcessor().isAggressiveSplittingNext();
		//return false;
	}

	public isMergeSequentialSymbols() {
		return this.process.getProcessor().isMergeSequentialSymbols();
		//return true;
	}

	public isEscapePatternPad() {
		return this.process.getProcessor().isEscapePatternPad();
		//return true;
	}

	public isMaintainScripts() {
		return this.process.getProcessor().isMaintainScripts();
		//return true;
	}

	public isRecoverPadding() {
		return this.process.getProcessor().isRecoverPadding();
	}

	public isTrim() {
		return this.process.getProcessor().isTrim();
	}

	public isTrimLines() {
		return this.process.getProcessor().isTrimLines();
	}

	public getLineBreakPatterns() {
		return this.process.getProcessor().getLineBreakPatterns();
		//return [/(\r?\n *\r?\n)/g];
	}

	public getLineBreakReplacement() {
		return this.process.getProcessor().getLineBreakReplacement();
		//return "\n\n";
	}

	public getProtectCornersPatterns() {
		return this.process.getProcessor().getProtectCornersPatterns();
		//return [/(^ *\{\{\d+\}\} *)|( *\{\{\d+\}\} *$)|(^\()|(\)$)/g];
	}

	public getPlaceholderType(): PlaceholderType {
		return this.process.getProcessor().getPlaceholderType();
		//return PlaceholderType.doubleCurlie;
	}
}
