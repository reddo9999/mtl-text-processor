import { TextProcessor } from '../TextProcessor';
import { PlaceholderType, TextProcessorOrderType } from '../_Constants';

test('Mixed test', () => {
	let processor = new TextProcessor({
		aggressiveSplittingPatterns: [/\|/g],
		isolateSymbolsPatterns: [/\[b\].+?\[\/b\]/g, /("[^"]+?")/g, /\([^()]+?\)/g],
		lineBreakPatterns: [/(?<=[!.?\]"])\r?\n/g],
		lineBreakReplacement: '\n',
		protectCornersPatterns: [
            /(^\[b\])|(\[\/b\]$)/g, 
            /(^[\[\()])|([\]\)]$)/g
        ],
		protectedPatterns: [/\\v\[\d+\]/g],
		placeholderType: PlaceholderType.curlie,
		mergeSequentialPlaceholders: true,
		protectedPatternsPad: false,
		processingOrder: [
			TextProcessorOrderType.BREAK_LINES,
			TextProcessorOrderType.ISOLATE_SENTENCES,
			TextProcessorOrderType.CUT_CORNERS,
			TextProcessorOrderType.ESCAPE_SYMBOLS,
			TextProcessorOrderType.AGGRESSIVE_SPLITTING
		]
	});

	let strings = [
		'[King]',
		'Hello "Hero". I would like you to fetch me some (Grass|Leaf), either is fine.',
		'[b]Do not fail me![/b] \\v[0] is how many I want. You have \\v[2]\\v[1].'
	];

	let process = processor.process(strings.join('\n'));
	let toTranslate = process.getTranslatableLines();

	/* [
        '{6}is how many I want. You have{5}.',
        'King',
        'Hello {1}. I would like you to fetch me some {2}, either is fine.',
        'Hero',
        'Grass',
        'Leaf',
        'Do not fail me!'
      ]*/
	expect(toTranslate.length).toBe(7);

	process.setTranslatedLines(
		'{6} is é an méid atá uaim. Tá {5} agat.',
		'Rí',
		'Dia duit {1}. Ba mhaith liom go dtabharfá {2} chugam, ach tá sé ceart go leor.',
		'Laoch',
		'Féar',
		'Duilleog',
		'Ná teip orm!',
	);

	let translation = process.getTranslatedLines();
	expect(translation.length).toBe(1);

    // TODO: One of the latest changes added a few extra spaces. I wonder how we could fix this. Maybe replace \s{2} with a single one?
	let intendedResult =
		`[Rí]\n` +
		`Dia duit "Laoch". Ba mhaith liom go dtabharfá (Féar|Duilleog) chugam, ach tá sé ceart go leor.\n` +
		`[b]Ná teip orm![/b] \\v[0]  is é an méid atá uaim. Tá  \\v[2]\\v[1] agat.`;

	expect(translation[0]).toBe(intendedResult);
});
