/*  Copyright (C) 2016  Moritz Beller

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

// This file performs a basic sentiment analysis using the AFINN-111 list

var sentimentDescription = 'Your <abbr title="Sentiment analysis refers to the use of natural language processing, text analysis and computational linguistics to identify and extract subjective information in source materials (Wikipedia). Here, we report a normalized score that is 0 for neutral abstracts, and more extreme positive or negative depending on the detected sentiment.">sentiment score</abbr> is ';

var displayAndCalculateAffin = function(text) {
    score = computeAfinnScore(text);
    divId = "sentiment";
    
    removeInfoMessage(divId);
    if(score < 0) {
	addInfoMessage(divId, 'alert alert-danger', sentimentDescription + score + '. A score below 0 might convey negative connotation.');
    }
    else {
	addInfoMessage(divId, 'alert alert-success', sentimentDescription + score + '. well done!');
    }
}

var computeAfinnScore = function(text) {
    var words = text.split(/\W/).filter(function(w) { return !(w.length === 0 || !w.trim()); });
    var score = 0;
    for(var i=0; i<words.length; i++) {
	word = words[i].toLowerCase();
	console.log(word)
	if(afinn.hasOwnProperty(word)) {
	    score += afinn[word];
	}
    }
    
    return Math.round(score/words.length*1000)/1000;
}
