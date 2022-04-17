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

	constructor(processor: TextProcessor, lines: Array<string>) {
		this.processor = processor;
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

		return toTranslate;
	}

	/**
	 * Adds translations to inner strings.
	 * It is possible to do it in one pass or multiple, but order and amount if crucial - if a single string is missing or added, it will lead to issues.
	 * Be careful around your translator.
	 * @param lines Array of translated lines, must be in the same order as getTranslatableLines
	 */
	public setTranslatedLines(...lines: Array<string>) {
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

	public getTranslatedLines(): Array<string> {
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
