/**
* Valida��o de Formul�rios ValidaForm 3.0 por RCDMK - rcdmk@rcdmk.com
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
if ($ != jQuery || $ == undefined) alert("� obrigat�rio o uso de jQuery.\n\nhttp://www.jquery.com");
(function($){
	// Globals
	var VF_TEMPLATE_TEXT = "{-{-text-}-}";
	var errors = [];
	
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
	* Converte uma string em data
	*/
	function strDate(text) {
		var date = null;
		
		if (text && vfValidDate(text)) {
			var pattern = /^((?:[0-2]?[0-9])|(?:3[0-1]))\/((?:0?[0-9])|(?:1[0-2]))\/([0-9]{4})$/;
		
			var matchArray = text.match(pattern);
			
			// se n�o estiver no formato de data, retorna false
			if (matchArray == null) return false; 
			
			day = strNum(matchArray[1]);
			month = strNum(matchArray[2]);
			year = strNum(matchArray[3]);
			
			date = new Date(year, month - 1, day);
		}
		
		return date;
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
	* @param input: o objeto DOM que representa o campo
	*/
	function vfMaxLength(input) {
		var retorno = strNum($(input).attr("maxlength"));
		
		if (isNaN(retorno)) retorno = Number.POSITIVE_INFINITY;
		
		return retorno;
	}
	
	/*
	* Retorna o objeto representando o evento
	* @param e: o objeto event
	*/
	function vfEvent(e) {
		return (!window.event) ? e : window.event;
	}
	
	/*
	* Retorna o c�digo da tecla pressionada, dependendo do tipo do evento
	* da melhor forma para v�rios navegadores
	* @param e: o objeto event
	*/
	function vfKeyCode(e) {
		// selecionando a tecla
		var code;
		var notIE = !window.event;
		
		if (e.type == "keypress") {
			// outros navegadores (para Firefox, somente teclas de texto)
			if (!e.keyCode) {
				// Netscape e alguns outros navegadores
				if (!e.charCode) {
					code = e.wich;
					
				// alguns navegadores (para Firefox, somente teclas de texto)
				} else {
					code = e.charCode;
				}
				
			// IE e Firefox (para Firefox, somente teclas que n�o entram texto como DEL ou TAB)
			} else {
				code = e.keyCode;
			}
			
		// Para outros eventos
		} else {
			code = e.wich || e.keyCode;
		}
		
		return code;
	}
	
	/*
	* Permite o uso de teclas especiais
	* Retorna true se � uma tecla permitida (como CTRL, TAB, etc.),
	* false em outros casos
	*/
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
	* @param pattern: uma string ou express�o regular para selecionar os
	* caracteres permitidos
	* @param event: o objeto evento
	*/
	function vfAllow(pattern, event) {
		// selecionando o evento para internet explorer e outros navegadores
		var e = vfEvent(event);
		
		// Se n�o for uma tecla de a��o
		if (vfFilterActionKeys(e)) return true;
		
		// pega a tecla pressionada
		var code = vfKeyCode(e);
		
		// Testa a tecla com o padr�o passado e retorna
		var pass = pattern.test(String.fromCharCode(code));
		
		if (!pass && e.preventDefault) e.preventDefault();
		
		e.returnValue = pass;
		return pass;
	}
	
	
	/*
	* Remove o padr�o do texto
	* @param text: o texto para ser alterado
	* @pattern: uma string ou express�o regular para remover do texto
	*/
	function vfRemove(text, pattern) {
		return String(text).replace(pattern, "");
	}
	
	
	/*
	* Fun��o principal que valida os campos ao enviar o formul�rio
	* @param event: o objeto event
	*/
	function vfHandleSubmit(event){
		// Pega o evento e inicializa a valida��o
		var e = vfEvent(event);
		var pass = true;
		
		// Zera os erros
		errors = [];
		
		var $this = $(this);
		
		// Impedir valida��o HTML5
		if ($this.has("[novalidate]").length != 1) $this.attr("novalidate","novalidate");
		
		// Remover mensagens deste formul�rio
		$this.find(".vfMessage,.vfError").remove();
		
		
		// ####### data-vf-req #######
		// Tratar textos obrigat�rios
		var inputs = $this.find("input[data-vf-req]:not([type=radio],[type=checkbox],[type=botton],[type==submit],[type=reset],[type=image]),textarea[data-vf-req]");
		vfSimpleRequired(inputs);
		
		// tratar selects obrigat�rios
		var inputs = $this.find("select[data-vf-req]");
		vfSelectBoxes(inputs);
		
		// tratar checkboxes e radios obrigat�rios
		var inputs = $this.find("input:radio[data-vf-req],input:checkbox[data-vf-req]");
		vfRadioAndCheckboxes(inputs);
		
		
		// ####### data-vf-type=email #######
		// Tratar campos de E-MAIL que ainda n�o tem erros
		var inputs = $this.find("input:text[data-vf-type=email],input[type=email]").filter(vfFilterError);
		vfEmails(inputs);
		
		
		// ####### data-vf-type=int #######
		// Tratar campos de n�mero inteiro que ainda n�o tem erros
		var inputs = $this.find("input:text[data-vf-type=int],input:text[data-vf-type=integer]").filter(vfFilterError);
		vfIntegers(inputs);
		
		
		// ####### data-vf-type=decimal #######
		// Tratar campos de n�mero decimal que ainda n�o tem erros
		var inputs = $this.find("input[data-vf-type=decimal],input[data-vf-type=float],input[data-vf-type=money],input[data-vf-type=number]").filter(vfFilterError);
		vfDecimals(inputs);
		
		
		// ####### data-vf-type=date #######
		// Tratar campos de data que ainda n�o tem erros
		var inputs = $this.find("input[data-vf-type=date]").filter(vfFilterError);
		vfDate(inputs);
		
		
		// ####### data-vf-range #######
		// Tratar campos de n�mero e data com faixa de valores
		var inputs = $this.find("input[data-vf-type][data-vf-range-min],input[data-vf-type][data-vf-range-max]").filter(vfFilterError);
		vfRange(inputs);
		
		
		// ####### data-vf-compare #######
		// Tratar campos de n�mero e data com faixa de valores
		var inputs = $this.find("input[data-vf-compare]").filter(vfFilterError);
		vfCompare(inputs);
		
		
		
		// ###### PONTO DE SA�DA ########
		// Se n�o passou, mostra os erros
		if (!pass) vfShowMessages(errors, $this);
		
		e.returnValue = pass;
		return pass;
		
		
		
		// ######### FUN��ES INTERNAS #########
		
		// Valida��o simples de valor obrigat�rio
		function vfSimpleRequired(inputs) {
			var totalInputs = inputs.length;
			
			// Se houver campos para validar
			if (totalInputs > 0) {
				// Limpar marcas dos campos
				vfCleanStatus(inputs);
				
				for (var i = 0; i < totalInputs; i++) {
					var inpt = $(inputs[i]);
					
					if (inpt.val() == "" || inpt.val() == null) {
						pass = false;
						errors.push({obj: inpt, type: "e", template: "� obrigat�rio informar " + VF_TEMPLATE_TEXT + "." });
					}
				}
			}
		}

		// Valida caixas de sele��o obrigat�rias
		function vfSelectBoxes(inputs) {
			var totalInputs = inputs.length;
			
			// Se houver campos para validar
			if (totalInputs > 0) {
				// Limpar marcas dos campos
				vfCleanStatus(inputs);
				
				// Passa por todos
				for (var i = 0; i < totalInputs; i++) {
					var inpt = $(inputs[i]); // Pega o campo atual
					var req = inpt.data("vfReq") || 1;
					
					// se for somente um obrigat�rio, usa a valida��o simples
					var selectedOptions = inpt.find("option[value!='']:selected").length;
					
					// Gera um erro para o campo se tem menos itens selecionados que o brigat�rio
					if (selectedOptions < req) {
						pass = false;
						errors.push({obj: inpt, type: "e", template: "� obrigat�rio selecionar " + (req > 1 ? "pelo menos " + req : "") + " " + VF_TEMPLATE_TEXT + "." });
					}
				}
			}
		}


		// Valida bot�es de radio e caixas de marcar obrigat�rias
		function vfRadioAndCheckboxes(inputs) {
			var totalInputs = inputs.length;
			
			// Se houver campos para validar
			if (totalInputs > 0) {
				// Limpar marcas dos campos
				vfCleanStatus(inputs);
				
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
						// Conta quantos est�o marcados
						groupPass = $this.find("input[name=" + curName + "]:" + groupType + ":checked").length;
						
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
		}

			
		// Valida faixa de valores
		function vfRange(inputs) {
			var totalInputs = inputs.length;
		
			// Se houver campos para validar
			if (totalInputs > 0) {
				// Limpar marcas dos campos
				vfCleanStatus(inputs);
				
				// Passa por todos
				for (var i = 0; i < totalInputs; i++) {
					var inpt = $(inputs[i]); // Pega o campo atual
					var value = inpt.val();
					
					// Se tiver valor
					if (value != "" && value != null) {
						// Pega o tipo, o m�nimo e o m�ximo da faixa
						var rangeType = inpt.attr("data-vf-range") || inpt.attr("data-vf-type");
						var rangeMin = inpt.attr("data-vf-range-min");
						var rangeMax = inpt.attr("data-vf-range-max");
						
						// Se tiver algum valor da faixa
						if ((rangeMin != null && rangeMin != "") || (rangeMax != null && rangeMax != "")) {
							var minIsValid, maxIsValid, valueIsValid, minVal, maxVal;
							
							// Se for faixa de datas
							if (rangeType == "date") {
								minIsValid 		= vfValidDate(rangeMin);
								maxIsValid 		= vfValidDate(rangeMax);
								valueIsValid 	= vfValidDate(value);
								
								rangeMinVal 	= strDate(rangeMin);
								rangeMaxVal 	= strDate(rangeMax);
								value 			= strDate(value);
							
							// Se for faixa de n�meros
							} else {
								minIsValid 		= vfValidDecimal(rangeMin);
								maxIsValid 		= vfValidDecimal(rangeMax);
								valueIsValid 	= vfValidDecimal(value);
								
								rangeMinVal 	= strNum(rangeMin);
								rangeMaxVal		= strNum(rangeMax);
								value 			= strNum(value);
							}
							
							// Se o valor for v�lido e tiver pelo menos um limite v�lido
							if (valueIsValid && (minIsValid || maxIsValid)) {
								// Se tiver os dois limites e estiver fora da faixa, cria um erro
								if (minIsValid && maxIsValid && (value < rangeMinVal || value > rangeMaxVal)) {
									pass = false;
									errors.push({obj: inpt, type: "e", template: "O valor d" + VF_TEMPLATE_TEXT + " precisa estar entre " + rangeMin + " e " + rangeMax + "." });
									
								// Se s� tiver o limite inferior e o valor estiver abaixo, cria o erro
								} else if (minIsValid && value < rangeMinVal) {
									pass = false;
									errors.push({obj: inpt, type: "e", template: "O valor d" + VF_TEMPLATE_TEXT + " precisa ser maior ou igual a " + rangeMin + "." });
								
								// Se s� tiver o limite superior e o valor estiver acima, cria o erro
								} else if (maxIsValid && value > rangeMaxVal) {
									pass = false;
									errors.push({obj: inpt, type: "e", template: "O valor d" + VF_TEMPLATE_TEXT + " precisa ser menor ou igual a " + rangeMax + "." });
								}
							}
						}
					}
				}
			}
		}

		
		// Valida compara��es de campos
		function vfCompare(inputs) {
			var totalInputs = inputs.length;
			
			if (totalInputs > 0) {
				// Limpar marcas dos campos
				vfCleanStatus(inputs);
				
				for (var i = 0; i < totalInputs; i++) {
					var inpt = $(inputs[i]);
					var value = inpt.val();
					
					var compareTo = $("#" + inpt.attr("data-vf-compare"));
					
					if (compareTo.length) {
						if (value != compareTo.val()) {
							pass = false;
							errors.push({obj: inpt, type: "e", template: VF_TEMPLATE_TEXT + " e " + compareTo.attr("data-vf-text") + " n�o batem." });
						}
					}
				}
			}
		}


		// Valida campos de e-mail
		function vfEmails(inputs) {
			var totalInputs = inputs.length;
			
			if (totalInputs > 0) {
				// Limpar marcas dos campos
				vfCleanStatus(inputs);
				
				for (var i = 0; i < totalInputs; i++) {
					var inpt = $(inputs[i]);
					var value = inpt.val();
			
					if (value != "" && value != null) {				
						if (!vfValidEmail(value)) {
							pass = false;
							errors.push({obj: inpt, type: "e", template: VF_TEMPLATE_TEXT + " n�o � inv�lido." });	
						}
					}
				}
			}
		}
		
		// Valida campos de n�mero inteiro
		function vfIntegers(inputs) {
			var totalInputs = inputs.length;
			
			if (totalInputs > 0) {
				// Limpar marcas dos campos
				vfCleanStatus(inputs);
				
				for (var i = 0; i < totalInputs; i++) {
					var inpt = $(inputs[i]);
					var value = inpt.val();
			
					if (value != "" && value != null){
						if (!vfValidInteger(value)) {
							pass = false;
							errors.push({obj: inpt, type: "e", template: VF_TEMPLATE_TEXT + " n�o � um n�mero inteiro v�lido." });
						}
					}
				}
			}
		}
		
		// Valida campos de n�mero decimal
		function vfDecimals(inputs) {
			var totalInputs = inputs.length;
			
			if (totalInputs > 0) {
				// Limpar marcas dos campos
				vfCleanStatus(inputs);
				
				for (var i = 0; i < totalInputs; i++) {
					var inpt = $(inputs[i]);
					var value = inpt.val();
			
					if (value != "" && value != null){
						if (!vfValidDecimal(value)) {
							pass = false;
							errors.push({obj: inpt, type: "e", template: VF_TEMPLATE_TEXT + " n�o � um n�mero v�lido." });
						}
					}
				}
			}
		}
		
		// Valida campos de data
		function vfDate(inputs) {
			var totalInputs = inputs.length;
			
			if (totalInputs > 0) {
				// Limpar marcas dos campos
				vfCleanStatus(inputs);
				
				for (var i = 0; i < totalInputs; i++) {
					var inpt = $(inputs[i]);
					var value = inpt.val();
			
					if (value != "" && value != null){
						if (!vfValidDate(value)) {
							pass = false;
							errors.push({obj: inpt, type: "e", template: VF_TEMPLATE_TEXT + " n�o � uma data v�lida." });
						}
					}
				}
			}
		}
		
	} // Fim da vfHandleSubmit
	
	

	// valida um campo de e-mail ao soltar a tecla
	function vfValidateEmailChange(inpt) {
		inpt = $(inpt);

		var value = inpt.val();
		
		// Se o e-mail vazio ou valido
		if (value == "" || value == null || vfValidEmail(value)) {
			// limpa as mensagens do campo
			vfCleanStatus(inpt);
			return true;
			
		} else {
			// marca o campo como errado
			inpt.addClass("vfFieldError");
			return false;
		}
	}

	// valida um campo de n�meros inteiros ao soltar a tecla
	function vfValidateIntegersChange(inpt) {
		inpt = $(inpt);
		
		var value = inpt.val();
		
		// Se o n�mero � vazio ou v�lido
		if (value == "" || value == null || vfValidInteger(value)) {
			// limpa as mensagens do campo
			vfCleanStatus(inpt);
			return true;
			
		} else {
			// marca o campo como errado
			inpt.addClass("vfFieldError");
			return false;
		}
	}

	// valida um campo de n�meros decimais ao soltar a tecla
	function vfValidateDecimalsChange(inpt) {
		inpt = $(inpt);
		
		var value = inpt.val();
		
		// Se o n�mero � vazio ou v�lido
		if (value == "" || value == null || vfValidDecimal(value)) {
			// limpa as mensagens do campo
			vfCleanStatus(inpt);
			return true;
			
		} else {
			// marca o campo como errado
			inpt.addClass("vfFieldError");
			return false;
		}
	}

	// valida um campo de data ao soltar a tecla
	function vfValidateDatesChange(inpt) {
		inpt = $(inpt);
		
		var value = inpt.val();
		
		// Se o n�mero � vazio ou v�lido
		if (value == "" || value == null || vfValidDate(value)) {
			// limpa as mensagens do campo
			vfCleanStatus(inpt);
			return true;
			
		} else {
			// marca o campo como errado
			inpt.addClass("vfFieldError");
			return false;
		}
	}
	
	
	
	/*
	* Filtra os campos que n�o tem erros
	* Usada como par�metro para o m�todo .filter() do jQuery
	*/
	function vfFilterError() {
		for (var i = 0; i < errors.length; i++) {
			if (errors[i].obj.get(0) == this) return false;
		}
		
		return true;
	}
	
	
	// ####### MANIPULADORES DE EVENTOS ##########
	
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
	}
	
	
	// Aplica as restri��es ao soltar teclas (UP),
	// como valida��o de e-mail
	function vfHandleKeyUp(event) {
		var $this = $(this);
		var dataType = $this.attr("data-vf-type");
		
		// Campos com formato de moeda
		if (dataType == "email" || dataType == "e-mail") {
			vfValidateEmailChange(this);
			
		} else if(dataType == "int" || dataType == "integer") {
			vfValidateIntegersChange(this);
			
		} else if(dataType == "decimal" || dataType == "float" || dataType == "money") {
			vfValidateDecimalsChange(this);
			
		} else if(dataType == "date") {
			vfValidateDatesChange(this);
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
		
		if (e.type == "keypress") {
			return vfHandleKeyPress.call(this, event);
			
		} else if (e.type == "keyup") {
			return vfHandleKeyUp.call(this, event);
		} else {
			return vfHandleKeyDown.call(this, event);
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
	
	
	
	// ####### EXIBI��O DE MENSAGENS ##########
	
	// Exibe as mensagens da valida��o
	function vfShowMessages(messages, form) {
		form = $(form);
		
		var totalMessages = messages.length;
		var sumary = form.find(".vfSumary");
		
		for (var i = 0; i < totalMessages; i++) {
			var message = messages[i];
			var obj = message.obj;
			var type = message.type;
			var template = message.template;
			
			// Monta a base da mensagem
			var messageElement = "<div data-field=\"" + obj.attr("name") + "\" class=\"" + ((type == "e") ? "vfError" : "vfMessage") + "\" style=\"display:none;\">" + vfApplyMessageTemplate(obj.attr("data-vf-text"), template) + "</div>"
			
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
	function vfCleanStatus(fields) {
		var tmp = $(fields);
		
		tmp.removeClass("vfFieldError vfFieldOK");
		
		for(var i = 0; i < tmp.length; i++) {
			tmpItem = $(tmp[i]);
			
			tmpItem.parents("form").find(".vfError[data-field=" + tmpItem.attr("name") + "]");
		}
	}
	
	
	
	// ###### VALIDA��O DE DADOS #######
	
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
		if (email == "" || email == null) return false;

		var isValid = true;
		var atIndex = email.lastIndexOf("@");
		
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
			
			} else if (new RegExp('\\.\\.').test(email)) {
				// e-mail tem pontos consecutivos ..
				isValid = false;
			
			} else if (!new RegExp('^(?:[A-Za-z0-9]+[\\-\\.]?)+\\.[A-Za-z0-9][A-Za-z0-9]+$').test(domainName)) {
				// caractere inv�lido no dom�nio
				isValid = false;
			
			} else if(!new RegExp('^(\\\\.|[A-Za-z0-9!#%&`_=\\/\'*+?^{}|~.-])+').test(localName.replace("\\\\",""))) {
				// caracteres inv�lidos no local a menos que o local esteja entre aspas
				if (!new RegExp('^"(\\\\"|[^"])+"').test(localName.replace("\\\\",""))) isValid = false;
			}/**/
		}
		
		return isValid;
	}

	// valida n�meros inteiros (positivos ou negativos)
	function vfValidInteger(value) {
		if (value == "" || value == null) return false;
		
		return /^-?[0-9]+$/.test(value);
	}
	
	// valida n�meros com casas decimais
	function vfValidDecimal(value) {
		if (value == "" || value == null) return false;

		return /^-?(?:[0-9]{1,3}\.?)*[0-9]{1,3}(?:,[0-9]+)?$/.test(value);
	}

	// valida datas
	function vfValidDate(value) {
		if (value == "" || value == null) return false;
		
		var pattern = /^((?:[0-2]?[0-9])|(?:3[0-1]))\/((?:0?[0-9])|(?:1[0-2]))\/([0-9]{4})$/;
		
		var matchArray = value.match(pattern);
		
		// se n�o estiver no formato de data, retorna false
		if (matchArray == null) return false; 
		
		day = strNum(matchArray[1]);
		month = strNum(matchArray[2]);
		year = strNum(matchArray[3]);
		
		// se o m�s for inv�lido, retorna false
		if (month < 1 || month > 12) return false; 
		
		// se o dia for inv�lido, retorna false
		if (day < 1 || day > 31) return false;
		
		// se n�o for um m�s de 31 dias e o dia for 31, retorna false
		if ((month == 4 || month == 6 || month == 9 || month == 11) && day == 31) return false;
		
		// se for fevereiro
		if (month == 2) {
			 // o ano � bissexto?
			var leap = (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));
			
			// se o dia for maior que 29 ou se o dia for 29 e o ano n�o for bissexto, retorna false
			if (day > 29 || (day == 29 && !leap)) return false;
		}
		
		// se chegou at� aqui � uma data v�lida
		return true;
	}
	
	/**
	* #####   INICIALIZA��O   #####
	**/
	$(document).ready(function() {
		$("form[data-validaform]")
			.live("submit", vfHandleSubmit)
			.find("input,textarea")
				.not("input[type=button],input[type=submit],input[type=image],input[type=reset]")
				.live("keypress keydown keyup", vfHandleInputs);
	});
})(jQuery);
