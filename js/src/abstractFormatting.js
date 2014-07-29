/*  Copyright (C) 2014  Moritz Beller

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. */

// This file provides the main abstract formatting support.

// Everything else is just a toy input, really.
var leastSensibleWords = 10;


// General formatting method calling sub-check functions.
var formatText = function(inputText) {
	inputText = removePseudoHTMLTags(inputText);
    inputText = removeCommentedOutLines(inputText);
    checkMultipleParagraphs(inputText);
    inputText = removeWhitespaces(inputText);

    inputText = checkAbstractStart(inputText);
    var length = checkLength(inputText);
    checkParagraphEndsCorrectly(inputText, length);
    checkReferences(inputText);

    inputText = checkAndReplaceTeXSyntax(inputText);

    return inputText;
};

// Replace < and > with the HTML equivalent
var removePseudoHTMLTags = function(inputText) {
	inputText = inputText.replace(/</gi, '&lt');
	inputText = inputText.replace(/>/gi, '&gt');
    return inputText;
};


/**
 * Removes any text after a % (commented out in latex)
 * @param {string} inputText - The input text from which to remove comments
 * @return {string} The text free of comments
 */
var removeCommentedOutLines = function(inputText) {
    // Comment at beginning of line
    var commentFreeText = inputText.replace(/^[\t ]*%.*[\n]?/mg, '');
    // At the end of line, starting somewhere in the middle of the line
    commentFreeText = commentFreeText.replace(/[\t ]+%.*?$/mg, '');
    var divId = "commented-lines";
	if (commentFreeText !== inputText) {
		addInfoMessage(divId, 'alert alert-info', 'Removed some latex comments from your abstract.');
	} else {
        removeInfoMessage(divId);
    }

    return commentFreeText;
};

// checks whether abstract contains multiple paragraphs. If so, gives a warning that they'll be flattened.
var checkMultipleParagraphs = function(inputText) {
    var divId = 'multipleParagraphs';
    if (containsLinebreak(inputText)) {
        addInfoMessage(divId, 'alert alert-warning', 'I see multiple paragraphs, or a linebreak. Most abstracts have just one paragraph! ');
    } else {
        removeInfoMessage(divId);
    }
};

// Returns true if abstract has multiple paragraphs, false otherwise.
var containsLinebreak = function(inputText) {
	inputText = inputText.replace(/ /gi, '');
    inputText = inputText.replace(/[\f\t\v\u00A0\u2028\u2029]/gi, '');
    if (inputText.match(/\s{2,}\S+/g) != null || inputText.match(/\\\\/g) != null) {
        return true;
    }
    return false;
};

// Removes all whitespaces in the abstract.
var removeWhitespaces = function(inputText) {
    // White-space replacements
    inputText = inputText.replace(/\s/gi, ' ');
    inputText = inputText.replace(/\s+/g, ' ');
    inputText = inputText.replace(/(\w+)- (\w+)/g, '$1$2'); // deals with hyphenation: hy- phen -> hyphen
    inputText = inputText.replace(/\s+$/, ''); // removes trailing white spaces
    return inputText;
};

var checkAbstractStart = function(inputText) {
    var divId = 'abstractInfo';
    inputText = replaceAbstractStart(inputText);
	if (startsWithAbstract(inputText)) {
		addInfoMessage(divId, 'alert alert-warning', 'Your abstract begins with the words abstract. I removed them for you.');
	} else {
        removeInfoMessage(divId);
    }
	return inputText;
};

// Replaces the start of the abstract and removes abstract from its beginning.
var replaceAbstractStart = function(inputText) {
    if (startsWithAbstract(inputText)) {
        inputText = inputText.replace(/^abstract(\W)*/i, '');
    }
    return inputText;
};

// Returns whether the abstract starts with abstract. If so, adds a warning and returns true (false otherwise).
var startsWithAbstract = function(inputText) {
    if (inputText.match(/^abstract(\W)*/i) != null) {
        return true;
    }
    return false;
};

// Checks and returns the number of words in the abstract.
var checkLength = function(inputText) {
    var divId = 'lengthWarning';
    var wordsInAbstract = inputText.match(/\b/g);
    var numberOfWords = 0;
    if (wordsInAbstract != null) {
        numberOfWords = inputText.match(/\b/g).length / 2;
    }

    removeInfoMessage(divId);
    if (numberOfWords > leastSensibleWords && numberOfWords < 100) {
        addInfoMessage(divId, 'alert alert-warning', 'Your abstract has fewer than 100 words: ' + numberOfWords + ' words is often considered very short.');
    } else if (numberOfWords > 200 && numberOfWords <= 250) {
        addInfoMessage(divId, 'alert alert-warning', 'Your abstract exceeds 200 words: ' + numberOfWords + ' words is often considered rather long.');
    } else if (numberOfWords > 250 && numberOfWords <= 500) {
        addInfoMessage(divId, 'alert alert-danger', 'Your text exceeds 250 words: ' + numberOfWords + ' words is often considered too long for an article.');
    } else if (numberOfWords > 500) {
        addInfoMessage(divId, 'alert alert-danger', 'Your text exceeds 500 words: ' + numberOfWords + ' words is <strong>generally considered too long.</strong>');
    } else {
        removeInfoMessage(divId);
    }

    return numberOfWords;
};

// Checks whether the abstract ends correctly, with a fullstop, question or exclamation mark.
var checkParagraphEndsCorrectly = function(inputText, length) {
    var divId = 'paragraphEnd';
    if (inputText.match(/[.?!]$/) === null && length > leastSensibleWords) {
        addInfoMessage(divId, 'alert alert-danger', 'Your last sentence does not end in a fullstop, question or exclamation mark!');
    } else {
        removeInfoMessage(divId);
    }
};

// checks whether abstract contains references. If so, gives a warning.
var checkReferences = function(inputText) {
    var divId = 'checkReferences';
    if (containsReferences(inputText)) {
        addInfoMessage(divId, 'alert alert-warning', 'Your abstract contains references. It should not do that.');
    } else {
        removeInfoMessage(divId);
    }
};

// Returns true if the abstract contains references such as [5], or even [5, 55]
var containsReferences = function(inputText) {
    if (inputText.match(/\[((\w)*\d(\w*)?)(, (\w)*\d(\w*)?)*\]/g) != null) {
        return true;
    }
    return false;
};

// Performs some basic TeX replacements
var checkAndReplaceTeXSyntax = function(inputText) {
    var divId = 'latex';

	inputText = checkAndReplaceTeXMath(inputText);
    var notEquivalentlyTransformedInputText = inputText.replace(/\\\S+{(.*?)}/gi, '$1'); // replaces TeX commands like \it{Text}
    nonEquivalentTransformedInputText = notEquivalentlyTransformedInputText.replace(/{\\\S+(.*?)}/gi, '$1'); // replaces TeX commands like {\em Text}
    if (!(notEquivalentlyTransformedInputText === inputText)) {
        addInfoMessage(divId, 'alert alert-info', 'I removed fancy LaTeX styling. Is the abstract the right place for it?');
    } else {
        removeInfoMessage(divId);
    }
    inputText = notEquivalentlyTransformedInputText.replace(/\\\\/gi, '<br />'); // forced TeX line break
    inputText = inputText.replace(/\\/gi, '');
    inputText = inputText.replace(/---/g, '&mdash;');
    inputText = inputText.replace(/--/g, '&ndash;');
    inputText = inputText.replace(/(\S)~(\S)/g, '$1 $2'); // replace bound-together blanks by actual blanks

    return inputText;
};

var checkAndReplaceTeXMath = function(inputText) {
    var divId = 'checkTexMath';

	inputText = inputText.replace(/\\begin{math}\s*(.*?)\s*\\end{math}/gi, '$1'); // replace math environment to $
    inputText = inputText.replace(/\$([0-9*+-/><=() ]+?)?\$/gi, '$1'); // trivial math mode replacement: include literally
    if (inputText.match(/\$.*?\$/gi) != null) {
        // bad mathmode usage
        addInfoMessage(divId, 'alert alert-danger', 'Contains complex TeX math. Is the abstract the right place for it?');
    } else {
        removeInfoMessage(divId);
    }

    return inputText;
};
