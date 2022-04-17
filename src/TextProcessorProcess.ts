import type { TextProcessor } from './TextProcessor';
import { TextProcessorRowLine } from './TextProcessorRowLine';

export class TextProcessorProcess {
	private processor: TextProcessor;
	private lines: Array<TextProcessorRowLine>;
	private internalIndex = 0;
	private warnings: Array<{
		originalSentence: string;
		currentSentence?: string;
		placeholders?: Array<string>;
		message: string;
	}> = [];
	private expectedResponseOrder: Array<number> = [];
	private expectedResponseLength: number = 0;
	private translations: Array<string> = [];
	private noRepeat: boolean;

	constructor(processor: TextProcessor, lines: Array<string>) {
		this.processor = processor;
		this.noRepeat = this.processor.isNoRepeat();
		this.lines = [];
		for (let i = 0; i < lines.length; i++) {
			this.lines.push(new TextProcessorRowLine(this, lines[i]));
		}
	}

	public getProcessor() {
		return this.processor;
	}

	public getTranslatableLines() {
		let toTranslate: Array<string> = [];

		for (let i = 0; i < this.lines.length; i++) {
			toTranslate.push(...this.lines[i].getTranslatableStrings());
		}

		if (this.noRepeat) {
			this.expectedResponseOrder = new Array(toTranslate.length);
			this.expectedResponseLength = toTranslate.length;
			let expectedResponseIndex = 0;
			for (
				let toTranslateIndex = 0;
				toTranslateIndex < toTranslate.length;
				toTranslateIndex++
			) {
				let idx = toTranslate.indexOf(toTranslate[toTranslateIndex]);
				if (idx < toTranslateIndex) {
					this.expectedResponseOrder[expectedResponseIndex++] = idx;
					toTranslate.splice(toTranslateIndex, 1);
					toTranslateIndex--;
					this.expectedResponseLength--;
				} else {
					this.expectedResponseOrder[expectedResponseIndex++] = toTranslateIndex;
				}
			}
		}

		return toTranslate;
	}

	protected applyTranslatedLines(lines: Array<string>) {
		let internalLine: TextProcessorRowLine;
		internalLine = this.lines[this.internalIndex];
		for (let i = 0; i < lines.length; i++) {
			while (internalLine != undefined && internalLine.isDone()) {
				internalLine = this.lines[++this.internalIndex];
			}

			if (internalLine == undefined) {
				console.error('Invalid amount of translations', lines, this);
				throw new Error('Received invalid amount of translations.');
			}

			internalLine.addTranslations(lines[i]);
		}
	}

	/**
	 * Adds translations to inner strings.
	 * It is possible to do it in one pass or multiple, but order and amount is crucial - if a single string is missing or added, it will throw errors. If you return strings in the wrong order, the translation will be inaccurate.
	 * Be careful around your translator.
	 * @param lines Array of translated lines, must be in the same order as getTranslatableLines
	 */
	public setTranslatedLines(...lines: Array<string>) {
		if (this.noRepeat) {
			this.translations.push(...lines);
			if (this.translations.length > this.expectedResponseLength) {
				console.error('Too many translations', this);
				throw new Error('Received too many translations.');
			}
		} else {
			this.applyTranslatedLines(lines);
		}
	}

	public getTranslatedLines(): Array<string> {
		if (this.noRepeat) {
			let recoveredTranslations = new Array(this.expectedResponseOrder.length);
			for (let i = 0; i < this.expectedResponseOrder.length; i++) {
				let idx = this.expectedResponseOrder[i];
				if (typeof this.translations[idx] == 'undefined') {
					console.error('Too few translations', this);
					throw new Error('Received too few translations.');
				}
				recoveredTranslations[i] = this.translations[idx];
			}

			// Delete values
			this.translations = [];
			this.expectedResponseOrder = [];

			this.applyTranslatedLines(recoveredTranslations);
		}
		let lines: Array<string> = [];
		for (let i = 0; i < this.lines.length; i++) {
			lines.push(this.lines[i].getTranslatedString());
		}
		return lines;
	}

	public addWarning(options: {
		message: string;
		originalSentence: string;
		currentSentence?: string;
		placeholders?: Array<string>;
	}) {
		this.warnings.push({
			originalSentence: options.originalSentence,
			currentSentence: options.currentSentence,
			placeholders: options.placeholders,
			message: options.message
		});
	}

	public hasWarnings() {
		return this.warnings.length > 0;
	}

	public getWarnings() {
		return [...this.warnings];
	}
}
