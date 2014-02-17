// functions providing abstract formatting

var containsMultipleParagraphs = function (inputText) {
    inputText = inputText.replace(/[\f\t\v\u00A0\u2028\u2029]/gi, '');
    inputText = inputText.replace(/\s+/g, '');
    if(inputText.matches(/\s+/g)) {
        return true;
    }
    return false;
}

var formatText = function (inputText) {
    // White-space replacements
    inputText = inputText.replace(/\s/gi, ' ');
    inputText = inputText.replace(/\s+/g, ' ');
    
    // TeX replacements
    inputText = inputText.replace(/\\\S+{(.*)}/gi, '$1'); // replaces TeX commands like \it{Text}
    inputText = inputText.replace(/\\/gi, '');

    return inputText;
}