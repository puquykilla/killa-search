
/**
* @nombre_sistema se debe nombrar al inicio de cada frase que hablemos
*/
var nombre_sistema = 'luna';
var genero_sistema = 'femenino';
var recognition;
var recognizing = false;

/**
* El Webkit solo es utilizable en googleChrome
*/

if (!('webkitSpeechRecognition' in window)) {
	var msg = "¡API webkitSpeechRecognition no soportada!"; 
	alert(msg);
} else {
	recognition = new webkitSpeechRecognition();
	recognition.lang = "es-VE";
	recognition.continuous = false;
	recognition.interimResults = true;

	recognition.onstart = function() {
		recognizing = true;
		console.log("empezando a escuchar");
	}

	recognition.onresult = function(event) {

		for ( var i = event.resultIndex; i < event.results.length; i++ ) {
			if( event.results[i].isFinal ){
				var palabra = event.results[i][0].transcript;
				document.getElementById("texto").value = palabra;
				Respuesta(palabra);
			}
		}
	}

	recognition.onerror = function(event) {
		console.log(event);
	}

	recognition.onend = function() {
		recognizing = false;
		document.getElementById("hablar").innerHTML = "Hablar";
		console.log("terminó de escuchar, llegó a su fin");
	}
}

/**
* Esta funcion permite que podamos hablarle al sistema
*/
function Hablar() {

	if (recognizing == false) {
		recognition.start();
		recognizing = true;
		document.getElementById("hablar").innerHTML = "Hablando";
	}
}

/**
* Esta funcion permite que el sistema nos de una respuesta leyendo una db en json
*/
function Respuesta(mensaje_entrante) {
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

      	clave = PrepararNombreSistema(clave);

		if (mensaje_entrante === FormatearRespuesta(clave) || mensaje_entrante === clave ) {
			/**
			* @nuevo_valor tendra la respuesta con el nombre del sistema reemplazado
			*/
			valor = PrepararNombreSistema(valor);
			valor = PrepararGeneroSistema(valor);
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
			BuscarWikipedia(mensaje_entrante, respuesta_sistema);
		} else {
			HablarSistema(respuesta_sistema);
		}
	});
}

/**
* Esta funcion formatea la respuesta para adecuarla con el nombre del sistema antes de cada palabra
*/
function FormatearRespuesta(respuesta) {
	var respuesta_formateada;
	return respuesta_formateada = nombre_sistema + ' ' + respuesta;
}

/**
* Funcion que permite colocar el nombre del sistema dentro de las respuestas o claves.
*/
function PrepararNombreSistema(value) {
	return value.replace("nombre_sistema", nombre_sistema);
}

/**
* Funcion que permite colocar el genero del sistema dentro de las respuestas o claves.
*/
function PrepararGeneroSistema(value) {
	return value.replace("genero_sistema", genero_sistema);
}

function HablarSistema(respuesta_sistema) {
	var voz_sistema = new SpeechSynthesisUtterance();
	var vocez = window.speechSynthesis.getVoices();
	voz_sistema.voice = vocez[0];
	voz_sistema.text = respuesta_sistema;
    window.speechSynthesis.speak(voz_sistema);
}

function BuscarWikipedia(mensaje_entrante, respuesta_sistema) {
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
        	HablarSistema(respuesta_sistema);
    	}
    });
}
