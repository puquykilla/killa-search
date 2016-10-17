(function() {
	self.Assistant = function() {
		/**
		* @nombre_sistema se debe nombrar al inicio de cada frase que hablemos
		*/
		this.nombre_sistema = 'luna';
		this.genero_sistema = 'femenino';
		this.recognition;
		this.recognizing = false;
	}

	self.Assistant.prototype = {
		/**
		* Esta funcion formatea la respuesta para adecuarla con el nombre del sistema antes de cada palabra
		*/
		FormatearRespuesta: function(respuesta) {
			var respuesta_formateada;
			return respuesta_formateada = this.nombre_sistema + ' ' + respuesta;
		},
		/**
		* Funcion que permite colocar el nombre del sistema dentro de las respuestas o claves.
		*/
		PrepararNombreSistema: function(value) {
			return value.replace("nombre_sistema", this.nombre_sistema);
		},
		/**
		* Funcion que permite colocar el genero del sistema dentro de las respuestas o claves.
		*/
		PrepararGeneroSistema: function(value) {
			return value.replace("genero_sistema", this.genero_sistema);
		},
		HablarSistema: function(respuesta_sistema) {
			var voz_sistema = new SpeechSynthesisUtterance();
			var vocez = window.speechSynthesis.getVoices();
			voz_sistema.voice = vocez[0];
			voz_sistema.text = respuesta_sistema;
		    window.speechSynthesis.speak(voz_sistema);
		},
		BuscarWikipedia: function(mensaje_entrante, respuesta_sistema) {
			var Wikipedia = "http://es.wikipedia.org/w/api.php";
			$.ajax({
		        url: Wikipedia,
		        dataType: "jsonp",
		        data: {
		            'action': "opensearch",
		            'format': "json",
		            'search': mensaje_entrante
		        },
		        success: function(data) {
		        	if (data[2] != '') {
		            	respuesta_sistema = data[2];
		        	}
		        	this.HablarSistema(respuesta_sistema);
		    	}
		    });
		},
		/**
		* Esta funcion permite que el sistema nos de una respuesta leyendo una db en json
		*/
		Respuesta: function(mensaje_entrante) {
			var respuesta_sistema;
			var mensaje_entrante = mensaje_entrante.toLowerCase();
			var JsonDB = "db.json";
			// var Wikipedia = "https://es.wikipedia.org/w/api.php?action=opensearch&search=" + mensaje_entrante + "&limit=1&namespace=0&format=json";
			var respuesta_default = false;

			/**
			* Leemos un archivo json donde estan las respuestas
			*/
			$.getJSON( JsonDB, function( data ) {
		      $.each( data.respuestas, function( clave, valor ) {

		      	clave = Assistant.prototype.PrepararNombreSistema(clave);

				if (mensaje_entrante === Assistant.prototype.FormatearRespuesta(clave) || mensaje_entrante === clave ) {
					/**
					* @nuevo_valor tendra la respuesta con el nombre del sistema reemplazado
					*/
					valor = Assistant.prototype.PrepararNombreSistema(valor);
					valor = Assistant.prototype.PrepararGeneroSistema(valor);
					respuesta_sistema = valor;
					respuesta_default = false;
					return false;
				} else {
					respuesta_default = true;
					respuesta_sistema = data.default;
				}
		      });
		    })
			.done( function() {
				/**
				* Enviamos repsuesta por voz
				*/
				if (respuesta_default) {
					Assistant.prototype.BuscarWikipedia(mensaje_entrante, respuesta_sistema);
				} else {
					Assistant.prototype.HablarSistema(respuesta_sistema);
				}
			});
		}
	}
})();

/**
* El Webkit fue testeado en googleChrome Versión 54.0.2840.59 (64-bit)
*/
var assistant = new Assistant();
if (!('webkitSpeechRecognition' in window)) {
	var msg = "¡API webkitSpeechRecognition not supported!"; 
	alert(msg);
} else {
	assistant.recognition = new webkitSpeechRecognition();
	assistant.recognition.lang = "es-VE";
	assistant.recognition.continuous = false;
	assistant.recognition.interimResults = true;

	assistant.recognition.onstart = function() {
		console.log("The system is ready and listening.");
	}

	assistant.recognition.onresult = function(event) {
		for ( var i = event.resultIndex; i < event.results.length; i++ ) {
			var palabra
			if( event.results[i].isFinal ){
				palabra = event.results[i][0].transcript;
				document.getElementById("texto").value = palabra;
				assistant.Respuesta(palabra);
			} else {
				palabra += event.results[i][0].transcript;
			}
		}
	}

	assistant.recognition.onerror = function(event) {
		console.log("Speech recognition error detected: " + event.error);
		console.log("Aditional information: " + event.error);
	}

	assistant.recognition.onend = function() {
		assistant.recognizing = false;
		document.getElementById("hablar").innerHTML = "Hablar";
		console.log("terminó de escuchar, llegó a su fin");
	}
}

/**
* Esta funcion permite que podamos hablarle al sistema
*/
function Hablar() {
	if (assistant.recognizing == false) {
		assistant.recognition.start();
		assistant.recognizing = true;
		document.getElementById("hablar").innerHTML = "Hablando";
	}
}
