// ==========================================================================
// Project:   SproutCore WYSIWYG
// Copyright: ©2012 Matygo Educational Incorporated operating as Learndot
// Author:    Joe Gaudet (joe@learndot.com) and contributors (see contributors.txt)
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// /*globals SproutCoreWysiwyg */
sc_require('commands/wysiwyg_command');
sc_require('commands/wysiwyg_picker_command_support');
sc_require('panes/wysiwyg_link_picker_pane');

/**
 * @class
 * 
 * Creates a with the current selection at the url entered by the user via the
 * pickerPane
 * 
 * TODO: Add support for changing the link
 */
SC.WYSIWYGCreateLinkCommand = SC.Object.extend(SC.WYSIWYGCommand, SC.WYSIWYGPickerCommandSupport, {

	commandName: 'link',

	url: '',

	linkText: '',

	title: 'Insert a link',

	keyEquivalent: 'ctrl_l',

	pickerPane: SC.WYSIWYGLinkPickerPane,

	execute: function(original, source, controller) {
		var sel = controller.getSelection(), node = sel.anchorNode;

		if (node.nodeType = Node.TEXT_NODE) {
			node = sel.anchorNode.parentNode;
		}

		if (node.tagName === 'A') {
			this.set('url', node.href);
			this.set('linkText', node.text);
		}
		else {
			this.set('linkText', sel.toString());
		}
		original(source, controller);
	}.enhance(),

	commitCommand: function(original, controller) {
		original(controller);
		var sel = controller.getSelection(), parentNode = sel.anchorNode.parentNode, linkText = this.get('linkText'), url = this.get('url');
		if (url) {
			if (!url.match(/[^:]+:\/\//) && !url.match(/^mailto:/)) {
				url = "http://" + url;
			}

			// if we are dealing with an existing anchor
			// we need to replace it
			if (parentNode.tagName === 'A') {
				parentNode.target = "_blank";
				parentNode.textContent = linkText;
				parentNode.href = url;
				controller.notifyDomValueChange();
			}

			// this is selected text or nothing
			else {
				controller.insertHtmlHtmlAtCaret('<a href="%@" target="_blank" />%@</a>'.fmt(url, linkText));
			}
		}

		// we don't have a url so we probably either
		// canceled or need to unlink
		else {

			// Was a link, removing it now
			if (parentNode.tagName === 'A') {
				$(parentNode).before(parentNode.textContent);
				var parent = parentNode.parentNode;
				parent.removeChild(parentNode);
			}
		}
		this._reset();
	}.enhance(),

	cancelCommand: function(original, controller) {
		original(controller);
		this._reset();
	}.enhance(),

	_reset: function() {
		this.set('url', '');
		this.set('linkText', '');
	}

});
SC.WYSIWYGCommandFactory.registerCommand(SC.WYSIWYGCreateLinkCommand);
