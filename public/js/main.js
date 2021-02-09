$(document).ready(function() {
	async.series([
		step1,
		step2
	], function() {
		wait_for_setup();
	});
});


// Sometimes this seems to run before the document is ready?
function wait_for_setup() {
	if($('#c0').length==0)
		return setTimeout(wait_for_setup, 10);

	setup();
}


function step2(callback) {
	async.parallel([
		color_picker,
		rainbow_control,
		handle_radio
	], callback);
}


function step1(callback) {
	async.parallel([
		generate_clock,
		get_colors,
		get_rainbow
	], callback);
}


function handle_radio(callback) {
	if(rainbow_enabled) {
		$('#radio-rainbow').click();
	} else {
		$('#radio-color').click();
	}

	// Handle clicky change
	$('input[type="radio"][name="radio-select"]').change(function() {
		if($(this).val()=='rainbow')
			enable_rainbow();
		else
			enable_solid();
	});


	if(typeof callback!='undefined')
		callback();
}


function enable_rainbow() {
	rainbow_enabled = $('#radio-rainbow').is(':checked');
	rainbow_delay = $('#rainbow_delay').val();

	var data = {
		enabled: rainbow_enabled,
		delay: rainbow_delay
	};

	console.log('enable_rainbow', data);

	$.post('/rainbow', data, function(resp) {
		last_minute = -1;
	});
}


function enable_solid() {
	rainbow_enabled = false;
	rainbow_delay = $('#rainbow_delay').val();

	var data = {
		enabled: rainbow_enabled,
		delay: rainbow_delay
	};

	$.post('/rainbow', data, function(resp) {
		$.post('/colors', {r:_r, g:_g, b:_b}, function(resp) {
			last_minute = -1;
		}, 'json');
	}, 'json');
}


function get_colors(callback) {
	$.get('/colors', function(resp) {
		_r = resp[0];
		_g = resp[1];
		_b = resp[2];

		callback();
	});
}


function get_rainbow(callback) {
	$.get('/rainbow', function(resp) {
		rainbow_enabled = resp[0];
		rainbow_delay = resp[1];

		callback();
	});
}


function color_picker(callback) {
	// Handle the color picker
	$('#color').spectrum({
		type: 'component',
		showInput: true,
		allowEmpty: false,
		showPalette: true,
		showAlpha: false,
		palette: ['red', 'green', 'blue'],
		preferredFormat: 'rgb',
		color: 'rgb('+_r+','+_g+','+_b+')',
		change: function(color) {
			_r = Math.round(color._r);
			_g = Math.round(color._g);
			_b = Math.round(color._b);

			if(!rainbow_enabled) {
				$.post('/colors', {r:_r, g:_g, b:_b}, function(resp) {
					last_minute = -1;
				}, 'json');
			}
		}
	});

	callback();
}


function rainbow_control(callback) {
	// Rainbow delay
	$('#rainbow_delay').val(rainbow_delay);

	$('.rainbow-delay').html($('#rainbow_delay').val()+'ms');

	$('#rainbow_delay').change(function() {
		$('.rainbow-delay').html($('#rainbow_delay').val()+'ms');
		enable_rainbow();
	});

	callback();
}


function generate_clock(callback) {
	for(i=0; i<ROWS*COLS-1; i++)
		pixels[i] = 0;

	var c = 0;
	var r = 0;
	var x = 0;
	var str = '<tr>';
	for(var a=0; a<chars.length; a++) {
		str += '<td id="c'+(xyToPixel(c, r))+'">'+chars[a]+'</td>';

		c++; x++;

		if(c>=COLS) {
			str += '</tr><tr>';
			c = 0;
			r++;
		}
	}

	str = str.substring(0, str.length-4);
	document.getElementsByTagName('table')[0].innerHTML = str;


	// Check for a passed hidden word
	if(window.location.search.length>1)
		hidden_word = window.location.search.substr(1);


	// Do the hidden word
	var cells = document.querySelectorAll('td')
	for(var i=0; i<cells.length; i++) {
		if(cells[i].innerHTML==".")
			cells[i].innerHTML = random_letter();
	}

	callback();
}
