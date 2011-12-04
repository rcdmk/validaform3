/**
* Valida��o de Formul�rios ValidaForm 3.0 por RCDMK - rcdemk@rcdmk.com
* 
* @date Setembro de 2011
* @author rcdmk - rcdmk@rcdmk.com
* @license Creative Commons Attribuition 3.0
* Pt-BR: http://creativecommons.org/licenses/by/3.0/br/
* EN: http://creativecommons.org/licenses/by/3.0/
* 
* Notas:
* Junto a este pacote h� alguns �cones da cole��o Silk Icons
* por Mark James, dispon�vel em http://www.famfamfam.com/lab/icons/silk/
* sob a licen�a Creative Commons Attribuition 3.0 - http://creativecommons.org/licenses/by/3.0/
**/
//(function($){
// Globals
VF_TEMPLATE_TEXT = "{-{-text-}-}";

if ($ != jQuery || $ == undefined) alert("� obrigat�rio o uso de jQuery.");
	
	/**
	* #####   UTILIDADES   #####
	**/
	/*
	* Remove os espa�os no in�cio e fim da string
	*/
	if (!String.prototype.trim) {
		String.prototype.trim = function() {
			return this.replace(/(^\s+)|(\s+$)/g, "");
		}
	}
	
	/*
	* Inverte a string
	*/
	if (!String.prototype.reverse) {
		String.prototype.reverse = function() {
			var tmp = "";
			var len = this.length;
			
			for (var i = len; i >= 0; i--) {
				tmp += this.substr(i, 1);
			}
			
			return tmp;
		}
	}
	
	/*
	* Converte o texto do campo para mai�sculas
	*/
	function vfToUpper(field) {
		field.value = field.value.toUpperCase();
	}
	
	/*
	* Converte o texto do campo para min�sculas
	*/
	function vfToLower(field) {
		field.value = field.value.toLowerCase();
	}
	
	/*
	* Converte uma string em n�mero
	*/
	function strNum(text) {
		var num = null;
		
		if (text) {
			num = Number(text.replace(/\./ig, '') 	// Remove todos os pontos
					.reverse() 						// Inverte a string
					.replace(/,/, '.') 				// Troca a primeira v�rgula por ponto
					.replace(/,/ig, '') 			// Remove as v�rgulas restantes
					.reverse()); 					// Reverte a string
		}
		
		return num;
	}
	
	/*
	* Converte um n�mero em texto
	*/
	function numStr(number) {
		var texto = "";
		
		if (!isNaN(number)) {
			texto = String(number) 			// Converte em string
					.replace(/,/ig, '') 	// Remove todas as v�rgulas
					.reverse() 				// Inverte a string
					.replace(/\./, ',') 	// Troca o primeiro ponto por v�rgula
					.replace(/\./ig, '') 	// Remove os pontos restantes
					.reverse(); 			// Reverte a string
		}
		
		return texto;
	}
	
	/*
	* Retorna o limite de entrada de texto do campo
	*/
	function vfMaxLength(input) {
		var retorno = strNum($(input).attr("maxlength"));
		
		if (isNaN(retorno)) retorno = Number.POSITIVE_INFINITY;
		
		return retorno;
	}
	
	/*
	* Retorna o objeto representando o evento
	*/
	function vfEvent(e) {
		return (!window.event) ? e : window.event;
	}
	
	/*
	* Retorna o c�digo da tecla pressionada
	*/
	function vfKeyCode(e) {
		// selecionando a tecla
		var code;
		var notIE = !window.event;
		
		if (e.type == "keypress") {
			// outros navegadores (para Firefox, somente para teclas de texto)
			if (!e.keyCode) {
				// Netscape e alguns outros navegadores
				if (!e.charCode) {
					code = e.wich;
					
				// alguns navegadores (para Firefox, somente para teclas de texto)
				} else {
					code = e.charCode;
				}
				
			// IE e Firefox (para Firefox, somente teclas que n�o entram texto como DEL ou TAB)
			} else {
				code = e.keyCode;
				
				// permite usar Setas ou o Delete, sai
				//if (notIE && ((code >= 35 && code <= 40) || code == 46)) return 0;
			}
			
			// permite usar TAB, BASCSPACE, ENTER ou ESC
			//if (code == 8 || code == 9 || code == 13 || code == 27) return 0;
		} else {
			code = e.wich || e.keyCode;
		}
		
		return code;
	}
	
	
	function vfFilterActionKeys(e) {
		var code = vfKeyCode(e);
		var notIE = !window.event;
		
		// Permite Selecionar tudo, Desfazer, Copiar, Colar e Recortar com atalhos de teclado
		if (notIE && (e.ctrlKey && (code == 97 || code == 99 || code == 118 || code == 120 || code == 122))) return true;
		
		if (notIE && e.type == "keypress" && ((code >= 35 && code <= 40) || code == 46))  return true;
		
		if (code == 8 || code == 9 || code == 13 || code == 27) return true;
		
		return false;
	}
	
	/*
	* Restringe a entrada de texto em um campo � uma express�o regular
	* definida
	*/
	function vfAllow(pattern, event) {
		// selecionando o evento para internet explorer e outros navegadores
		var e = vfEvent(event);
		
		var code = vfKeyCode(e);
		
		if (vfFilterActionKeys(e)) return true;
		
		// Testa a tecla com o padr�o passado e retorna
		var pass = pattern.test(String.fromCharCode(code));
		
		if (!pass && e.preventDefault) e.preventDefault();
		
		e.returnValue = pass;
		return pass;
	}
	
	
	// Remove o padr�o do texto
	function vfRemove(text, pattern) {
		return String(text).replace(pattern, "");
	}
	
	
	// Fun�o principal que valida os campos ao enviar o formul�rio
	function vfHandleSubmit(event){
		var e = vfEvent(event);
		var pass = true;
		var errors = [];
		
		var $this = $(this);
		
		// Impedir valida��o HTML5
		if ($this.has("[novalidate]").length != 1) $this.attr("novalidate","novalidate");
		
		// Remover mensagens
		$this.find("div.vfMessage,div.vfError").remove();
		
		
		// ##############
		// Tratar textos e sele��es obrigat�rios
		var inputs = $this.find("input:text[data-vf-req],input:password[data-vf-req],select[data-vf-req],textarea[data-vf-req]");
		var totalInputs = inputs.length;
		
		// Limpar marcas dos campos
		inputs.removeClass("vfFieldError vfFieldOK");
		
		for (var i = 0; i < totalInputs; i++) {
			var inpt = $(inputs[i]);
			
			if (inpt.val() == "" || inpt.val() == null) {
				pass = false;
				errors.push({obj: inpt, type: "e", template: "� obrigat�rio informar " + VF_TEMPLATE_TEXT + "." });
			}
		}
		
		
		// ##############
		// tratar checkboxes e radios obrigat�rios
		inputs = $this.find("input:radio[data-vf-req],input:checkbox[data-vf-req]");
		totalInputs = inputs.length;
		
		// Limpar marcas dos campos
		inputs.has(".vfFieldError,.vfFieldOK").removeClass("vfFieldError vfFieldOK");
		
		// Se houver campos para validar
		if (totalInputs > 0) {
			var lastName = "";
			
			// Passa por todos
			for (var i = 0; i < totalInputs; i++) {
				var inpt = $(inputs[i]); // Pega o campo atual
				var curName = inpt.attr("name"); // Pega o nome do campo
				
				var groupType = inpt.attr("type"); // Pega o tipo do campo
				var groupPass = 0;
				var groupReq = (groupType == "checkbox") ? inpt.data("vfReq") || 1 : 1; // Se for checkbox, pode obrigar selecionar mais de 1
				
				// Evita passar por um grupo mais de uma vez
				if (curName != lastName) {
					// Pega o grupo de campos (checkboxes ou radios)
					var group = $this.find("input[name=" + curName + "]:" + groupType);
					var groupLength = group.length;
					
					// Conta quantos est�o marcados
					for (var j = 0; j < groupLength; j++) {
						if ($(group[j]).is(":checked")) groupPass++;
					}
					
					// Se os marcados forem menos do que o necess�rio
					if (groupPass < groupReq) {
						// Gera um erro para o campo
						pass = false;
						errors.push({obj: inpt, type: "e", template: "� obrigat�rio selecionar " + ((groupType == "checkbox") ? "pelo menos " + groupReq + " " : "") + VF_TEMPLATE_TEXT + "." });
					}
				}
				
				// Marca o nome do campo atual para evitar repetir o grupo
				lastName = inpt.attr("name");
			}
		}
		
		
		// ##############
		// Tratar campos de E-MAIL que ainda n�o tem erros
		var inputs = $this.find("input:text[data-vf-type=email],input[type=email]").filter(vfFilterError);
							
		var totalInputs = inputs.length;
		
		// Limpar marcas dos campos
		inputs.removeClass("vfFieldOK");
		
		for (var i = 0; i < totalInputs; i++) {
			var inpt = $(inputs[i]);
			
			if (!vfValidateEmailChange(inpt)) {
				pass = false;
			}
		}
		
		
		// ##############
		// Se n�o passou, mostra os erros
		if (!pass) vfShowMessages(errors, $this);
		
		e.returnValue = pass;
		return pass;
	
		
		// valida um campo de e-mail
		function vfValidateEmailChange(inpt) {
			if (!vfValidEmail(inpt.val())) {
				errors.push({obj: inpt, type: "e", template: VF_TEMPLATE_TEXT + " informado � inv�lido." });
				return false;
			}
			
			return true;
		}
	
			
		// filtra os campos que n�o tem erros ainda
		function vfFilterError() {
			for (var i = 0; i < errors.length; i++) {
				if (errors[i].obj.get(0) == this) return false;
			}
			
			return true;
		}
	}
	
	
	// Aplica as restri��es ao pressionar teclas (PRESS),
	// como m�scara, restri��o de caracteres, etc
	function vfHandleKeyPress(event) {
		var $this = $(this);
		
		// Campos com m�scara
		if ($this.attr("data-vf-mask")) {
			vfApplyMask($this.get(0), $this.attr("data-vf-mask"), event, $this.attr("data-vf-mask-key"));
		}
		
		// Campos com restri��o de entrada
		if ($this.attr("data-vf-allow")) {
			return vfAllow(new RegExp($(this).attr("data-vf-allow")), event);
		}
		
		if ($this.prop("type") == "textarea" && $this.attr("maxlength") != "") {
			return vfLimitTextarea($this, event);
		}
	}
	
	
	// Aplica as restri��es ao pressionar teclas (DOWN),
	// como formata��o de moeda
	function vfHandleKeyDown(event) {
		var $this = $(this);
		
		// Campos com formato de moeda
		if ($this.attr("data-vf-type") == "money") {
			return vfFormatMoney(this, event);
		}
	}
	
	
	// Respons�vel pela aplica��o dos eventos nos campos
	function vfHandleInputs(event) {
		var e = vfEvent(event);
		
		switch(e.type){
			case "keypress":
				return vfHandleKeyPress.call(this, event);
				break;
			
			case "keydown":
				return vfHandleKeyDown.call(this, event);
				break;
			
			case "keyup":
			case "blur":
				var $this = $(this);
				if ($this.prop("type") == "textarea" && $this.attr("maxlength") != "") {
					return vfLimitTextarea($this, event);
				}
				break;
		} 
	}
	
	
	// Aplica uma m�scara de formado em um campo
	function vfApplyMask(input, mask, event, keyChar) {
		var e = vfEvent(event);
		
		if (vfFilterActionKeys(e)) return true;
		
		var key = (keyChar) ? keyChar : "#";
		
		var position = input.value.length;
		var maskLength = mask.length;
		var maskAtPosition = mask.substr(position, 1);
		
		while(maskAtPosition != key && position < maskLength) {
			input.value += maskAtPosition;
			position++;
			
			maskAtPosition = mask.substr(position, 1);
		}
	}
	
	
	// Aplica formata��o de moeda em um campo
	function vfFormatMoney(input, event) {
		// Pega o evento
		var e = vfEvent(event);
		if (e.type == "keypress") return false;
		
		// Pega a tecla pressionada
		var code = vfKeyCode(e);
		
		// Pega o valor atual do campo
		var value = input.value;
		
		// Se n�o tiver valor, assume zero
		if (value == "") {
			number = 0;
		
		// Se tiver, converte o texto em n�mero
		} else {
			number = strNum(value);
		}
		
		// Se o resultado da convers�o n�o for um n�mero
		// assume zero
		if (isNaN(number)) number = 0;
		
		number = number.toFixed(2); // restringe a 2 casas decimais
		var clean = numStr(number).replace(/\D/ig, ''); // guarda somente os n�meros, sem pontos
		var numKey = (code >= 96 && code <= 105) ? code - 48 : code; // pega o n�mero digitado
		
		// Se for backspace, remove um n�mero do final
		if (code == 8) {
			if (value.length > 3) {
				number = strNum(clean.substring(0, clean.length - 1))/100;
				input.value = numStr(number.toFixed(2));
				return false;
			} else {
				return false;
			}
		
		// Se for alguma outra tecla especial, ignora
		} else	if (vfFilterActionKeys(e)) {
			return true;
		
		// Se for algum n�mero, adiciona ao final se ainda estiver abaixo do limite do campo
		} else if (/[0-9]/.test(numKey) && input.value.length < vfMaxLength(input)) {
			clean += String.fromCharCode(numKey);
		}
		
		// Converte o conjunto em n�mero com duas casas decimais
		number = strNum(clean) / 100;
		input.value = numStr(number.toFixed(2));
		
		return false;
	}
	
	// Supre a falta do attributo maxlength para textareas
	function vfLimitTextarea(element, event) {
		// Pega o evento
		var e = vfEvent(event);
		
		// Pega a tecla pressionada
		var code = vfKeyCode(e);
		
		// Se for alguma outra tecla especial, ignora
		if (vfFilterActionKeys(e)) return true;
		
		// Pega as propriedades
		var maxLength = strNum(element.attr("maxlength"));
		var textLength = element.val().length;
		var pass = true;
		
		// Testa se j� tem o tamanho m�ximo
		pass = textLength < maxLength;
		
		// Remove o texto excedente
		element.val(element.val().substring(0, maxLength));
		
		e.returnValue = pass;
		return pass;
	}
	
	
	// Exibe as mensagens da valida��o
	function vfShowMessages(messages, form) {
		var totalMessages = messages.length;
		var sumary = form.find(".vfSumary");
		
		for (var i = 0; i < totalMessages; i++) {
			var message = messages[i];
			var obj = message.obj;
			var type = message.type;
			var template = message.template;
			
			// Monta a base da mensagem
			var messageElement = "<div class=\"" + ((type == "e") ? "vfError" : "vfMessage") + "\" style=\"display:none;\">" + vfApplyMessageTemplate(obj.attr("data-vf-text"), template) + "</div>"
			
			// Marca o campo
			obj.addClass("vfFieldError");
			
			// Se houver espa�o definido para valida��o, adiciona neste espa�o
			if (sumary.length > 0) {
				sumary.append(messageElement);
				
			// Se n�o, adiciona ao lado do campo
			} else {
				obj.after(messageElement).next().animate({ opacity: "show" }, 250);
			}
			
			obj.bind("change", function () { vfCleanStatus(this) });
		}
		
		// Anima as mensagens no espa�o definido
		if (sumary.length > 0) sumary.find(".vfError,.vfMessage").animate({ opacity: "show" }, 250);
	}
	
	
	// Aplica um modelo no texto
	function vfApplyMessageTemplate(text, template) {
		var ret = template;
		
		ret = ret.replace(VF_TEMPLATE_TEXT, text);
		
		return ret.substr(0, 1).toUpperCase() + ret.substr(1);
	}
	
	
	// Limpa as marca��es
	function vfCleanStatus(field) {
		var tmp = $(field);
		
		tmp.removeClass("vfFieldError vfFieldOK");
	}
	
	
	// Valida e-mails
	/**
	Based on Douglas Lovell "Validate an E-Mail Address with PHP, the Right Way"
	http://www.linuxjournal.com/article/9585?page=0,3
	
	Validate an email address.
	Provide email address (raw input)
	Returns true if the email address has the email 
	address format and the domain exists.
	*/
	function vfValidEmail(email){
		var isValid = true;
		var atIndex = email.lastIndexOf("@");
		
		// Se n�o contiver arroba, sai
		if (atIndex < 1) {
			isValid = false;
			
		} else {
			var domainName = email.substr(atIndex + 1);
			var localName = email.substr(0, atIndex);
			var localLen = localName.length;
			var domainLen = domainName.length;
			
			if (localLen < 1 || localLen > 64) {
				// tamanho do local incorreto
				isValid = false;
			
			} else if (domainLen < 3 || domainLen > 255) {
				// tamanho do dom�nio incorreto
				isValid = false;
			
			} else if (localName[0] == '.' || localName[localLen-1] == '.') {
				// local come�a ou termina com .
				isValid = false;
			
			} else if (new RegExp('\\.\\.').test(localName)) {
				// local tem pontos consecutivos ..
				isValid = false;
			
			} else if (!new RegExp('^(?:[A-Za-z0-9]+[\\-\\.]?)+\\.[A-Za-z0-9][A-Za-z0-9]+$').test(domainName)) {
				// caractere inv�lido no dom�nio
				isValid = false;
			
			} else if (new RegExp('\\.\\.').test(domainName)) {
				// dom�nio tem pontos consecutivos ..
				isValid = false;
			
			} else if(!new RegExp('^(\\\\.|[A-Za-z0-9!#%&`_=\\/\'*+?^{}|~.-])+').test(localName.replace("\\\\",""))) {
				// caracteres inv�lidos no local a menos que o local esteja entre aspas
				if (!new RegExp('^"(\\\\"|[^"])+"').test(localName.replace("\\\\",""))) isValid = false;
			}/**/
		}
		
		return isValid;
	}

	
	/**
	* #####   INICIALIZA��O   #####
	**/
	$(document).ready(function() {
		$("form[data-validaform]")
			.live("submit", vfHandleSubmit)
			.find("input:not(:radio,:checkbox),textarea")
				.on("keypress keydown keyup blur", vfHandleInputs);
	});
//})(jQuery);
