test( "Test Contain References", function() {
  equal(containsReferences('This does not contain a reference.'), false, 'Should not detect a reference.');
  equal(containsReferences('This does not contain a proper [44 reference.'), false, 'Should not detect a reference.');
  equal(containsReferences('This does not contain a proper [...] reference.'), false, 'Should not detect a reference.');
  equal(containsReferences('This does not contain [a] proper reference.'), false, 'Should not detect a reference.');
  equal(containsReferences('This does not contain [1 a] proper reference.'), false, 'Should not detect a reference.');
  equal(containsReferences('This does contain a proper reference [44].'), true, 'Should detect a reference.');
  equal(containsReferences('This does contain a proper reference [wmyer44].'), true, 'Should detect a reference.');
  equal(containsReferences('This does contain multiple references [32, 33, 31].'), true, 'Should detect a reference.');
});
