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
    inputText = removeNonPrintableChars(inputText);

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

var removeNonPrintableChars = function(inputText) {
    //From https://github.com/slevithan/XRegExp/blob/master/src/addons/unicode/unicode-categories.js#L28
    var re = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g;

    return inputText.replace(re, "");
}

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
