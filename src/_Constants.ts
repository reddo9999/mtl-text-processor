const privateAreaNumber = 61440; // Were we wrong before? 983041;
const letterNumber = 65;
const ninesLength = 7;

export enum TextProcessorOrderType {
	ESCAPE_SYMBOLS,
	ISOLATE_SENTENCES,
	CUT_CORNERS,
	AGRESSIVE_SPLITTING,
	BREAK_LINES
}

export enum PlaceholderType {
	poleposition = 'poleposition',
	hexPlaceholder = 'hexPlaceholder',
	noEscape = 'noEscape',
	ninesOfRandomness = 'ninesOfRandomness',
	tagPlaceholder = 'tagPlaceholder',
	tagPlaceholderLetter = 'tagPlaceholderLetter',
	closedTagPlaceholder = 'closedTagPlaceholder',
	fullTagPlaceholder = 'fullTagPlaceholder',
	curlie = 'curlie',
	doubleCurlie = 'doubleCurlie',
	curlieLetter = 'curlieLetter',
	doubleCurlieLetter = 'doubleCurlieLetter',
	privateUse = 'privateUse',
	hashtag = 'hashtag',
	hashtagTriple = 'hashtagTriple',
	tournament = 'tournament',
	mvStyle = 'mvStyle',
	wolfStyle = 'wolfStyle',
	percentage = 'percentage',
	mvStyleLetter = 'mvStyleLetter',
	wolfStyleLetter = 'wolfStyleLetter',
	sugoiTranslatorSpecial = 'sugoiTranslatorSpecial',
	sugoiTranslatorSpecial2 = 'sugoiTranslatorSpecial2'
}

export enum PlaceholderTypeNames {
	poleposition = 'Poleposition (e.g. #24)',
	hexPlaceholder = 'Hex Placeholder (e.g. 0xffffff)',
	noEscape = 'No escaping (will translate everything)',
	ninesOfRandomness = 'Closed Nines (e.g. 9123412349)',
	tagPlaceholder = 'Tag Placeholder (e.g. &lt;24&gt;)',
	tagPlaceholderLetter = 'Tag Placeholder with Letters (e.g. &lt;A&gt;',
	closedTagPlaceholder = 'Tag Placeholder Closed Tags (e.g. &lt;24/&gt;)',
	fullTagPlaceholder = 'Tag Placeholder Full XML-style Tag (e.g. &lt;24&gt;&lt;/24&gt;)',
	curlie = 'Curlies (e.g. number enclosed by curly brackets)',
	doubleCurlie = 'Double Curlies (e.g. number enclosed by two curly brackets on each side)',
	curlieLetter = 'Curlies (e.g. letter enclosed by curly brackets)',
	doubleCurlieLetter = 'Double Curlies (e.g. letter enclosed by two curly brackets on each side)',
	privateUse = 'Supplementary Private Use Area-A (👽)',
	hashtag = 'Hashtag (#A)',
	hashtagTriple = 'Triple Hashtag (#ABC)',
	tournament = 'Tournament (e.g. #1, #2, #3)',
	mvStyle = 'MV Message (e.g. %1, %2, %3)',
	wolfStyle = 'Wolf Message (e.g. @1, @2, @3)',
	percentage = 'Actual Percentage (e.g. 1%, 2%)',
	mvStyleLetter = 'MV Message but with Letters (e.g. %A, %B, %C)',
	wolfStyleLetter = 'Wolf Message but with letters (e.g. @A, @B, @C)',
	sugoiTranslatorSpecial = "ivdos' Special (e.g. @#1, @#2)",
	sugoiTranslatorSpecial2 = "ivdos' Special with Letters (e.g. @#A, @#B)"
}

export let PlaceholderTypeRegExp: { [id: string]: string } = {
	poleposition: '#\\d+',
	hexPlaceholder: '0x[a-fA-F]{4}',
	ninesOfRandomness: '9[\\d]{7}9',
	tagPlaceholder: '<\\d+?>',
	tagPlaceholderLetter: '<[a-zA-Z]+>',
	closedTagPlaceholder: '<\\d+?\\/>',
	fullTagPlaceholder: '<\\d+?><\\/\\d+?>',
	curlie: '{\\d+}',
	doubleCurlie: '{{\\d+}}',
	curlieLetter: '{[a-zA-Z]+}',
	doubleCurlieLetter: '{{[a-zA-Z]+}}',
	privateUse: '[\\uF000-\\uFFFF]',
	hashtag: '#[a-zA-Z]',
	hashtagTriple: '#[a-zA-Z]{3}',
	tournament: '#\\d+',
	mvStyle: '%\\d+',
	wolfStyle: '@\\d+',
	percentage: '\\d+%',
	mvStyleLetter: '%[a-zA-Z]+',
	wolfStyleLetter: '@[a-zA-Z]+',
	sugoiTranslatorSpecial: '@#\\d+',
	sugoiTranslatorSpecial2: '@#[a-zA-Z]+'
};

export let PlaceholderTypeArray = [
	PlaceholderType.poleposition,
	PlaceholderType.hexPlaceholder,
	PlaceholderType.noEscape,
	PlaceholderType.ninesOfRandomness,
	PlaceholderType.tagPlaceholder,
	PlaceholderType.tagPlaceholderLetter,
	PlaceholderType.closedTagPlaceholder,
	PlaceholderType.fullTagPlaceholder,
	PlaceholderType.curlie,
	PlaceholderType.doubleCurlie,
	PlaceholderType.curlieLetter,
	PlaceholderType.doubleCurlieLetter,
	PlaceholderType.privateUse,
	PlaceholderType.hashtag,
	PlaceholderType.hashtagTriple,
	PlaceholderType.tournament,
	PlaceholderType.mvStyle,
	PlaceholderType.mvStyleLetter,
	PlaceholderType.wolfStyle,
	PlaceholderType.wolfStyleLetter,
	PlaceholderType.percentage,
	PlaceholderType.sugoiTranslatorSpecial,
	PlaceholderType.sugoiTranslatorSpecial2
];

export let PlaceholderCreator = {
	poleposition: (count: number, text: string) => {
		return `#${count + 1}${count * 2}`;
	},
	hexPlaceholder: (count: number, text: string) => {
		return `0x${(privateAreaNumber + count).toString(16)}`;
	},
	noEscape: (count: number, text: string) => {
		return text;
	},
	ninesOfRandomness: (count: number, text: string) => {
		return `9${Array.from({ length: ninesLength }, () =>
			Math.floor(Math.random() * 10).toString()
		).join('')}9`;
	},
	tagPlaceholderLetter: (count: number, text: string) => {
		return `<${String.fromCharCode(count + letterNumber)}>`;
	},
	tagPlaceholder: (count: number, text: string) => {
		return `<${count + 1}>`;
	},
	closedTagPlaceholder: (count: number, text: string) => {
		return `<${count + 1}/>`;
	},
	fullTagPlaceholder: (count: number, text: string) => {
		return `<${count + 1}></${count + 1}>`;
	},
	curlie: (count: number, text: string) => {
		return `{${count + 1}}`;
	},
	doubleCurlie: (count: number, text: string) => {
		return `{{${count + 1}}}`;
	},
	curlieLetter: (count: number, text: string) => {
		return `{${String.fromCharCode(count + letterNumber)}}`;
	},
	doubleCurlieLetter: (count: number, text: string) => {
		return `{{${String.fromCharCode(count + letterNumber)}}}`;
	},
	privateUse: (count: number, text: string) => {
		return `${String.fromCodePoint(count + privateAreaNumber)}`;
	},
	hashtag: (count: number, text: string) => {
		return `#${String.fromCharCode(count + letterNumber)}`;
	},
	hashtagTriple: (count: number, text: string) => {
		return `#${String.fromCharCode(count + letterNumber)}${String.fromCharCode(
			count + 1 + letterNumber
		)}${String.fromCharCode(count + 2 + letterNumber)}`;
	},
	tournament: (count: number, text: string) => {
		return `#${count + 1}`;
	},
	mvStyle: (count: number, text: string) => {
		return `%${count + 1}`;
	},
	wolfStyle: (count: number, text: string) => {
		return `@${count + 1}`;
	},
	wolfStyleLetter: (count: number, text: string) => {
		return `@${String.fromCharCode(count + letterNumber)}`;
	},
	percentage: (count: number, text: string) => {
		return `${count + 1}%`;
	},
	mvStyleLetter: (count: number, text: string) => {
		return `%${String.fromCharCode(count + letterNumber)}`;
	},
	sugoiTranslatorSpecial: (count: number, text: string) => {
		return `@#${count + 1}`;
	},
	sugoiTranslatorSpecial2: (count: number, text: string) => {
		return `@#${String.fromCharCode(count + letterNumber)}`;
	}
};

export const symbolsSpaces = '　 \\t';
export const defaultSymbols = `◆◎★■☆〇□△●♂♀⚤⚢⚨⚣⚩⚧⸸✞☦✝✟♱☥♁✙⚰️⛧♡♥❤♦♣♠•◘○◙♂♀♪♫►◄▲▼↑←↑→↓↓→←↔※＊〽〓♪♫♬♩〇〒〶〠〄ⓍⓁⓎ<>\\-\\+=`;
export const defaultParagraphBreak = `( *　*\\r?\\n(?:\\r?\\n)+ *　*	*)`;
export const defaultPunctuation = `！？。・…‥：；.?!;:`;
export const openerRegExp = `〔〖〘〚〝｢〈《「『【（［\\[\\({＜<｛｟"'´\``;
export const defaultLineStart = `((?:\\r?\\n|^) *　*[${defaultSymbols}${openerRegExp}>\\/\\\\]+)`;
export const closerRegExp = `\\]\\)}〕〗〙〛〞”｣〉》」』】）］＞>｝｠〟⟩"'\`´`;
export const defaultLineEnd = `([${defaultSymbols}${closerRegExp}${defaultPunctuation}]+ *　*(?:$|\\r?\\n))`;
export const rmColorRegExp = `\\\\C\\[.+?\\]`;
export const mvScript = `\\\\*[NV]`;
// RegExp:  not lookbehind: mvScript
//          lookbehind: opener or rmColor
//          match: anything that's not opener nor closer
//          lookahead: closer or rmColor
// Result: look for anything that's not opener or closer that is inside opener or closer and not inside an MVScript
export const defaultIsolateRegexp =
	`(` +
	`(?<!` +
	`${mvScript}` +
	`)` +
	`[${openerRegExp}$]([^${openerRegExp}${closerRegExp}])+[${closerRegExp}]` +
	`)|(` +
	`${rmColorRegExp}.+?${rmColorRegExp}` +
	`)`;

export const defaultSplitRegExp = `((?:\\\\?r?\\\\n)+)|(\\\\[.!])`;

export const defaultSplitEndsRegExp =
	//`(%[A-Z]+$)` + `|` +`(^%[A-Z]+)` + `|` + // %A, not worth cutting
	`(^[ 　\\r\\n]+)|([ 　\\r\\n]+$)` +
	`|` + // white space
	`(^D_TEXT )|(^DW_[A-Z]+ )|(^addLog )|(^ShowInfo )` +
	`|` + // Common plugin calls
	`( *　*(?:(?:if)|(?:en))\(.+?\) *　*$)` +
	`|` + // Common RPG Maker switch check for choices
	`(^[${openerRegExp}${closerRegExp}${defaultSymbols}]+)` +
	`|` + // Quotes at start
	`([${openerRegExp}${closerRegExp}${defaultSymbols}]+$)`; // Quotes at end
