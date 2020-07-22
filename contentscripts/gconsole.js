var gconsole = (function(console) {
	function convert_args_to_text(args) {
		var messages = []; 
		for (i = 0; i < args.length; i++) {
			if (typeof args[i] == 'string') {
				messages.push(args[i]);
			} else {
				if (args[i] && args[i].message && args[i].stack) { // exceptions
					messages.push(args[i].message + '\n' + args[i].stack);
				} else {
					messages.push(JSON.stringify(args[i]));
				}
			}
		}
		messages = messages.join(' ');
		return messages;
	}
	var gconsole_style = 'background: #eaa12e; color: #fff; font-weight: bold;';
	return {
		error : function() {
			//console.error('%c GS+ ', gconsole_style, convert_args_to_text(arguments));
		},
		warn : function() {
			//console.warn('%c GS+ ', gconsole_style, convert_args_to_text(arguments));
		},
		log : function() {
			//console.log('%c GS+ ', gconsole_style, convert_args_to_text(arguments));
		}
	}
})(window.console);