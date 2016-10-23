(function() {
	self.Assistant = function() {
		// We can give the name of the system before any sentence
		var self = this;
		self.system_name = 'Luna',
		self.system_gender = 'femenino',
		self.system_voice = new SpeechSynthesisUtterance(),
		self.system_voice.voice = null,
		self.system_voice.text = null,
		self.recognition,
		self.recognizing = false,

		// This function formats the response to conform with the system name before each word
		self.responseFormat = function(response) {
			var formated_response = null;
			formated_response = self.system_name + ' ' + response;
			formated_response_inverted = response + ' ' + self.system_name;
			return new Array(formated_response.toLowerCase(), formated_response_inverted.toLowerCase()) ;
		},

		// Function that allows you to place the name of the system within the responses or keys.
		self.nameFormat = function(value) {
			return value.replace('system_name', self.system_name);
		},

		// Function that allows you to place the genre system within the responses or keys.
		self.genderFormat = function(value) {
			return value.replace('system_gender', self.system_gender);
		},

		self.speak = function(system_response) {
			self.system_voice.text = system_response;
			window.speechSynthesis.speak(self.system_voice);
		},

		self.wikipediaSearch = function(incoming_message, system_response) {
			var Wikipedia = 'http://es.wikipedia.org/w/api.php';
			$.ajax({
				url: Wikipedia,
				dataType: 'jsonp',
				data: {
					'action': 'opensearch',
					'format': 'json',
					'search': incoming_message
				},
				success: function(data) {
					if (data[2] != '') {
						system_response = data[2];
					}
					self.speak(system_response);
				}
			});
		},

		// This function allows the system to give us a response reading a json db
		self.response = function(incoming_message) {
			var system_response;
			var incoming_message = incoming_message.toLowerCase();
			var JsonDB = 'db.json';
			var response_default = false;

			// Read a json file where are the responses
			$.getJSON( JsonDB, function( data ) {
			  $.each( data.responses, function( key, value ) {
			  	formatted_responses = self.responseFormat(key);
				if (incoming_message === formatted_responses[0] || incoming_message === formatted_responses[1] || incoming_message === key ) {
					value = self.nameFormat(value);
					value = self.genderFormat(value);
					system_response = value;
					response_default = false;
					return false;
				} else {
					response_default = true;
					system_response = data.default;
				}
			  });
			})
			.done( function() {
				// Send voice response
				if (response_default) {
					self.wikipediaSearch(incoming_message, system_response);
				} else {
					self.speak(system_response);
				}
			});
		},
		self.stop = function() {
			window.speechSynthesis.cancel();
		},
		self.pause = function() {
			window.speechSynthesis.pause();
		},
		self.resume = function() {
			window.speechSynthesis.resume();
		}
	}

})();


// The Webkit was tested in GoogleChrome version 54.0.2840.59 (64-bit)
var assistant = new Assistant();
window.speechSynthesis.onvoiceschanged = function() {
	console.log('loading voices');
	var voices = window.speechSynthesis.getVoices();
	assistant.system_voice.voice = voices.filter(function(voice) { return voice.name == 'Monica'; })[0];
}

if (!('webkitSpeechRecognition' in window)) {
	var msg = '¡API webkitSpeechRecognition not supported!';
	alert(msg);
} else {
	assistant.recognition = new webkitSpeechRecognition();
	assistant.recognition.lang = 'es-VE';
	assistant.recognition.continuous = false;
	assistant.recognition.interimResults = true;

	// This callback is called when the system recognition start
	assistant.recognition.onstart = function() {
		console.log('The system is ready and listening.');
	}

	// This callback is called when the system processes words
	assistant.recognition.onresult = function(event) {
		for ( var i = event.resultIndex; i < event.results.length; i++ ) {
			var word = null;
			if( event.results[i].isFinal ){
				word = event.results[i][0].transcript;
				document.getElementById('texto').value = word;
				assistant.response(word);
			} else {
				word += event.results[i][0].transcript;
			}
		}
	}

	// This callback is called when the system throw a error
	assistant.recognition.onerror = function(event) {
		console.log('Speech recognition error detected: ' + event.error);
		console.log('Aditional error information: ' + event.error);
	}

	// This callback is called when the system finishes speaking
	assistant.recognition.onend = function() {
		assistant.recognizing = false;
		document.getElementById('talk').innerHTML = 'talk';
		console.log('The system finished listening.');
	}
}

// variables for system status
var talk_status = false;
var pause_status = false;
var resume_status = false;

// This function allows us to talk to the system
function talk() {
	if (assistant.recognizing == false) {
		assistant.recognition.start();
		assistant.recognizing = true;
		document.getElementById('talk').innerHTML = 'talking';
		talk_status = true;
	}
}

// This function allows us to talk to the system
function stop() {
	if (talk_status === true) {
		console.log('The voice of the system halted.');
		assistant.stop();
		talk_status = false;
		pause_status = false;
		resume_status = false;
	} else {
		console.log('The system is not talking.');
	}
}

// This function allows us pause the voice of system
function pause() {
	if (pause_status === false && talk_status === true) {
		console.log('The voice of the system is paused.');
		assistant.pause();
		pause_status = true;
		resume_status = false;
	} else {
		console.log('The voice of the system is already paused.');
	}
}

// This feature allows the system to resume the voice
function resume() {
	if (resume_status === false && pause_status === true) {
		console.log('The voice of the system is resumed.');
		assistant.resume();
		pause_status = false;
		resume_status = true;
	} else {
		console.log('The voice of the system is already resumed.');
	}
}