test("Contain References", function() {
	equal(containsReferences('This does not contain a reference.'), false, 'Should not detect a reference.');
	equal(containsReferences('This does not contain a proper [44 reference.'), false, 'Should not detect a reference.');
	equal(containsReferences('This does not contain a proper [...] reference.'), false, 'Should not detect a reference.');
	equal(containsReferences('This does not contain [a] proper reference.'), false, 'Should not detect a reference.');
	equal(containsReferences('This does not contain [1 a] proper reference.'), false, 'Should not detect a reference.');
	equal(containsReferences('This does contain a proper reference [44].'), true, 'Should detect a reference.');
	equal(containsReferences('This does contain a proper reference [wmyer44].'), true, 'Should detect a reference.');
	equal(containsReferences('This does contain multiple references [32, 33, 31].'), true, 'Should detect a reference.');
});

test("Contains Linbreaks", function() {
	equal(containsLinebreak('This consists of one paragraph.'), false, 'Should not detect multi paragraphs.');
	equal(containsLinebreak('This consists of   one paragraph.'), false, 'Should not detect multi paragraphs.');
	equal(containsLinebreak('This consists of \n one paragraph.'), false, 'Should not detect multi paragraphs.');
	equal(containsLinebreak('This consists of \n    one paragraph.'), false, 'Should not detect multi paragraphs.');
	equal(containsLinebreak('This consists of a forced \\\\ paragraph.'), true, 'Should not detect multi paragraphs.');
	equal(containsLinebreak('This consists of not\n\r one paragraph.'), true, 'Should detect multi paragraphs.');
	equal(containsLinebreak('This consists of not\n  \r one paragraph.'), true, 'Should detect multi paragraphs.');
});

test("Starts with Abstract", function() {
	equal(replaceAbstractStart('This abstract consists of one paragraph.'), 'This abstract consists of one paragraph.', 'Output should not be altered.');
	equal(replaceAbstractStart('Abstract This consists of one paragraph.'), 'This consists of one paragraph.', 'Should remove beginning abstract.');
	equal(replaceAbstractStart('Abstract--This is the actual abstract.'), 'This is the actual abstract.', 'Should remove beginning abstract and delimiter.');
});

test("Paragraph ends correctly", function() {
	checkParagraphEndsCorrectly('This ends properly or.');
	equal(result, true, 'Ends correctly');
	checkParagraphEndsCorrectly('This ends properly or!!');
	equal(result, true, 'Ends correctly');
	checkParagraphEndsCorrectly('This ends properly or!?');
	equal(result, true, 'Ends correctly');
	checkParagraphEndsCorrectly('This ends properly not');
	equal(result, true, 'Missing period');
});

// redefinition of called helper functions to testing purposes.
var result;
var addInfoMessage = function(){
	result = false;
};
var removeInfoMessage = function(){
	result = true;
};

test("TeX Syntax", function() {
	equal(checkAndReplaceTeXSyntax('aijsfisjafdjfoi \\textbf{aaa} sfd'), 'aijsfisjafdjfoi aaa sfd', '');
	equal(checkAndReplaceTeXSyntax('An en-Dash--My dash'), 'An en-Dash&ndash;My dash', 'Straight-forward en-dash replacement');
	equal(checkAndReplaceTeXSyntax('An em-Dash---My dash'), 'An em-Dash&mdash;My dash', 'Straight-forward em-dash replacement');
	equal(checkAndReplaceTeXSyntax('Five percent (5\\%)'), 'Five percent (5%)', 'Straight-forward % replacement');
});

test("Tex Math Replacement", function() {
	equal(checkAndReplaceTeXMath('$5+5-2=8$'), '5+5-2=8', 'Trivial math mode replacement.');
	equal(checkAndReplaceTeXMath('\\begin{math}\n5+5-2+3=11\n\\end{math}'), '5+5-2+3=11', 'math environment equivalent');
	equal(checkAndReplaceTeXMath('\\begin{math}\n  5+5-2+3=11\n  \\end{math}'), '5+5-2+3=11', 'math environment equivalent');
	equal(checkAndReplaceTeXMath('\\begin{math}5+5-2+3=11\\end{math}'), '5+5-2+3=11', 'math environment equivalent');
	equal(checkAndReplaceTeXMath('$5+5=\n10$'), '$5+5=\n10$', 'No math mode replacement.');
	equal(checkAndReplaceTeXMath('$\\leftarrow$'), '$\\leftarrow$', 'No math mode replacement.');

});
