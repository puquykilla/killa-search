(function() {
	self.Assistant = function() {
		// We can give the name of the system before any sentence
		var self = this;
		self.system_name = 'Luna',
		self.system_gender = 'femenino',
		self.recognition,
		self.recognizing = false,

		// This function formats the response to conform with the system name before each word
		self.responseFormat = function(response) {
			var formated_response = null;
			formated_response = self.system_name + ' ' + response;
			return formated_response.toLowerCase();
		},

		// Function that allows you to place the name of the system within the responses or keys.
		self.systemNameFormat = function(value) {
			return value.replace('system_name', self.system_name);
		},

		// Function that allows you to place the genre system within the responses or keys.
		self.genderSystemFormat = function(value) {
			return value.replace('system_gender', self.system_gender);
		},

		self.speak = function(system_response) {
			var system_voice = new SpeechSynthesisUtterance();
			var voices = window.speechSynthesis.getVoices();
			system_voice.voice = voices[0];
			system_voice.text = system_response;
			window.speechSynthesis.speak(system_voice);
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
				if (incoming_message === self.responseFormat(key) || incoming_message === key ) {
					value = self.systemNameFormat(value);
					value = self.genderSystemFormat(value);
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
		}
	}

})();


// The Webkit was tested in GoogleChrome version 54.0.2840.59 (64-bit)
var assistant = new Assistant();
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
		console.log('Aditional information: ' + event.error);
	}

	// This callback is called when the system finishes speaking
	assistant.recognition.onend = function() {
		assistant.recognizing = false;
		document.getElementById('hablar').innerHTML = 'Hablar';
		console.log('The system finished listening.');
	}
}

// This function allows us to talk to the system
function talk() {
	if (assistant.recognizing == false) {
		assistant.recognition.start();
		assistant.recognizing = true;
		document.getElementById('hablar').innerHTML = 'Hablando';
	}
}
