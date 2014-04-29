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
	equal(containsLinebreak('This consists of\n one paragraph.'), true, 'Should detect multi paragraphs.');
	equal(containsLinebreak('This consists of\n\r one paragraph.'), true, 'Should detect multi paragraphs.');
});

test("Starts with Abstract", function() {
	equal(replaceAbstractStart('This abstract consists of one paragraph.'), 'This abstract consists of one paragraph.', 'Output should not be altered.');
	equal(replaceAbstractStart('Abstract This consists of one paragraph.'), 'This consists of one paragraph.', 'Should remove beginning abstract.');
	equal(replaceAbstractStart('Abstract--This is the actual abstract.'), 'This is the actual abstract.', 'Should remove beginning abstract and delimiter.');
});