/*  Copyright (C) 2014, 2015  Moritz Beller

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

// least sensible length for an abstract. Everything else is just a toy input.
var leastSensibleWords = 10;

// Whether to flatten paragraphs. Default is true.
var flattenParagraphs = true; 

// Invisible, correct UTF marker char at begin and end of document
var utfSpecialMarker = '\ufddf';

// General formatting method calling sub-check functions.
var formatText = function(inputText) {
    inputText = removeLigatures(inputText);
    inputText = introducePseudoHTMLTags(inputText);
    inputText = removeCommentedOutLines(inputText);
    checkMultipleParagraphs(inputText);
    inputText = removeWhitespaces(inputText);

    var plainText = removeHTMLTags(inputText);

    inputText = checkAndReplaceAbstractStart(plainText, inputText);

    var length = checkLength(plainText);
    checkParagraphEndsCorrectly(plainText, length);
    checkNoInvalidQuestionMarks(plainText, length);
    checkReferences(plainText);

    inputText = checkAndReplaceTeXSyntax(inputText);

    return inputText;
};

// Replace ligatures with equivalent standard characters
var removeLigatures = function(inputText) {
    inputText = inputText.replace(//gi, 'fl');
    inputText = inputText.replace(//gi, 'ff');
    inputText = inputText.replace(//gi, 'fi');
    inputText = inputText.replace(//gi, 'ffi');
    return inputText;
};


// Replace < and > with the HTML equivalent
var introducePseudoHTMLTags = function(inputText) {
	inputText = inputText.replace(/</gi, '&lt');
	inputText = inputText.replace(/>/gi, '&gt');
    return inputText;
};

// Remove all HTML tags (possibly introduced by paragraph-ization
var removeHTMLTags = function(inputText) {
	inputText = inputText.replace(/<.*?>/gi, '');
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
        var messageAdded = addInfoMessage(divId, 'alert alert-warning', 'Most abstracts have just one paragraph! <a href="#" id="unflatten">Un-Flatten?</a>');
	if(messageAdded === 0) {
	    $('#unflatten').click(function() {
		flattenParagraphs = !flattenParagraphs;
		refreshPreparedAbstract();
	    });
	}
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
    // trim every line
    inputText = inputText.replace(/^ */gm, '');
    inputText = inputText.replace(/$ */gm, '');
    inputText = inputText.replace(/\r$/, ''); // removes possibly left-over windows linebreaks

    if(!flattenParagraphs) {
	inputText = inputText.replace(/(\S+)\n(\s)*\n/gi, '$1'+utfSpecialMarker+utfSpecialMarker); 
	inputText = inputText.replace(/^/gi, utfSpecialMarker);
	inputText = inputText.replace(/$/gi, utfSpecialMarker);

	inputText = inputText.replace(new RegExp(utfSpecialMarker+"([\\S\\s]+?)"+utfSpecialMarker,"gi"), '<p>$1</p>');
//	inputText = inputText.replace(/\n/gi, ' ');
	inputText = inputText.replace(new RegExp(utfSpecialMarker,"gi"), '');
    }

    inputText = inputText.replace(/(\w+)-\nand /g, '$1- and '); // deals with hyphenation: hyphen- and -> hyphen and
    inputText = inputText.replace(/(\w+)-\nund /g, '$1- und '); // deals with hyphenation: hyphen- and -> hyphen and
    inputText = inputText.replace(/(\w+)-\n(\w+)/g, '$1$2'); // deals with hyphenation: hy-- phen -> hyphen


    // White-space replacements
    inputText = inputText.replace(/\s/gi, ' ');
    inputText = inputText.replace(/\s+/g, ' ');

    inputText = inputText.replace(/^(<p>)?\s+/, '$1'); // removes leading whitespaces
    inputText = inputText.replace(/\s+$/, ''); // removes trailing whitespaces
   
    return inputText;
};

var checkAndReplaceAbstractStart = function(plainText, inputText) {
    if(checkAbstractStart(plainText)) {
	    inputText = replaceAbstractStart(inputText);
    }
    return inputText;
}

var checkAbstractStart = function(inputText) {
    var divId = 'abstractInfo';

    if (startsWithAbstract(inputText)) {
	addInfoMessage(divId, 'alert alert-warning', 'Your abstract begins with the words abstract. I removed them for you.');
	return true;
    } else {	
	removeInfoMessage(divId);
	return false;
    }
};

// Replaces the start of the abstract and removes abstract from its beginning.
var replaceAbstractStart = function(inputText) {
	inputText = inputText.replace(/^(<.*>)*abstract(\W)*/i, '$1');
//	inputText = inputText.replace(/^p>/, '<p>'); // fix possibly broken p tag after removing abstract.	
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


// Checks whether the abstract contains no question marks at the beginning or middle of a word.
var checkNoInvalidQuestionMarks = function(inputText, length) {
    var divId = 'invalidQuestionMarks';
    if ((inputText.match(/[A-Za-z]\?[a-z]/) !== null || inputText.match(/\ \?/) !== null) && length > leastSensibleWords) {
        addInfoMessage(divId, 'alert alert-danger', 'Your abstract contains a question mark in an unexpected place.');
    } else {
        removeInfoMessage(divId);
    }
};

// checks whether abstract contains references. If so, gives a warning.
var checkReferences = function(inputText) {
    var divId = 'checkReferences';
    if (containsReferences(inputText)) {
        addInfoMessage(divId, 'alert alert-danger', 'Your abstract contains references. It should not do that.');
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
    inputText = inputText.replace(/``(.*?)''/g, '&ldquo;$1&rdquo;'); // Double English quotes
    inputText = inputText.replace(/`(.*?)'/g, '&lsquo;$1&rsquo;'); // Single English  quotes

    return inputText;
};

var checkAndReplaceTeXMath = function(inputText) {
    var divId = 'checkTexMath';
    var previousText = inputText;

    inputText = inputText.replace(/\\begin{math}\s*(.*?)\s*\\end{math}/gi, '$1'); // replace math environment to $
    inputText = inputText.replace(/\\cdot/gi, '*'); // math mode replacement: include literally
    inputText = inputText.replace(/\\times/gi, 'x'); // math mode replacement: include literally
    inputText = inputText.replace(/\$([0-9x*+-/><=()^ ]+?)\$/gi, '$1'); // trivial math mode replacement: include literally
    if (inputText.match(/\$.*?\$/gi) != null) {
        // bad mathmode usage
        addInfoMessage(divId, 'alert alert-danger', 'Contains complex TeX math. Publishers do not like this! Is the abstract the right place for it?');
    }
    else if (previousText.match(/\$.*\^.*\$/gi) != null) {
        // bad mathmode usage
        addInfoMessage(divId, 'alert alert-info', 'Contains an exponent. Publishers do not like this, so I replaced it with a circumflex for you.');
    } 
    else {
        removeInfoMessage(divId);
    }

    return inputText;
};
