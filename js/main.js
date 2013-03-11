
/* Google stats */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-25000004-1']);
_gaq.push(['_trackPageview']);

(function() {
var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

/*
$(document).ready( function() {
	var socket = io.connect('http://localhost:3000');
	socket.on('message', function (data) {
		console.log(data);
		//socket.emit('my other event', { my: 'data' });
		
		var cmd = data.cmd;
		if (cmd === "reload") {
			console.log("reloading...");
			window.location.reload(true);
		}
	});
});
*/