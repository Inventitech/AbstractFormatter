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

// This files contains helper functions that deal with the HTML.

// global html setup
// activate auto-resizing of textarea
$(document).ready(function(){
    $('#abstractTextarea').autosize();   
});

// refreshes Abstract on textarea change
$('#abstractTextarea').bind('input propertychange', function() {
	refreshPreparedAbstract();
});

var refreshPreparedAbstract = function() {
    var inputText = $('#abstractTextarea').val();
    var processedText = formatText(inputText);
    $('#formattedAbstract').html(processedText);
};

var clearAbstract = function() {
    $('#abstractTextarea').val('').trigger('autosize.resize'); 
    refreshPreparedAbstract();
    $('#formattedAbstract').text('Your formatted abstract from the PDF or LaTeX source!');
};

// Function for dynamic dispatching of toggle text
collapsed = true;
var toggleCollapse = function() {
    collapsed = !collapsed;
    if(collapsed === true) {
    	$('#collapseButton').html('Learn more &raquo;');
    } else {
    	$('#collapseButton').html('&laquo; Learn less');
    }
};


// The following is used for the selection/hover effect of the prepared abstract
// this function is copied from stackOverFlow (http://jsfiddle.net/edelman/KcX6A/1506/)
jQuery.fn.selectText = function(){
    var doc = document
        , element = this[0]
        , range, selection
    ;
    if (doc.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();        
        range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

$(function() {
    $('#prepared').click(function() {
        $('#formattedAbstract').selectText();
    });
});

$('#prepared').hover(
       function(){ $('#formattedAbstract').addClass('active'); },
       function(){ $('#formattedAbstract').removeClass('active'); }
);

// Adds a generic info message in the infoMessages div in the HTML
var addInfoMessage = function(divId, divClasses, message) {
    if($('#' + divId).length === 0) {
    	var insertedDiv = '<div id="' + divId + '" class="' + divClasses + '">' + message + '</div>';
    	if(divClasses.indexOf('danger') > -1) {
    		$('#dangerMessages').append(insertedDiv);
    	} else if(divClasses.indexOf('warning') > -1) {
    		$('#warningMessages').append(insertedDiv);
    	} else {
    		$('#infoMessages').append(insertedDiv);
    	}
    }
};

// removes warning 
var removeInfoMessage = function(divId) {
    $('#' + divId).remove();
};

